import {
  users,
  skills,
  availability,
  swapRequests,
  reviews,
  reports,
  type User,
  type UpsertUser,
  type InsertSkill,
  type Skill,
  type InsertAvailability,
  type Availability,
  type InsertSwapRequest,
  type SwapRequest,
  type InsertReview,
  type Review,
  type InsertReport,
  type Report,
  type UserWithSkills,
  type SwapRequestWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, ilike, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserWithSkills(id: string): Promise<UserWithSkills | undefined>;
  searchUsers(query: string, filters?: { location?: string; skillType?: string; level?: string }): Promise<UserWithSkills[]>;
  
  // Skills operations
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, updates: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number, userId: string): Promise<boolean>;
  getUserSkills(userId: string): Promise<Skill[]>;
  
  // Availability operations
  setUserAvailability(userId: string, availabilitySlots: InsertAvailability[]): Promise<Availability[]>;
  getUserAvailability(userId: string): Promise<Availability[]>;
  
  // Swap requests operations
  createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest>;
  getSwapRequest(id: number): Promise<SwapRequestWithDetails | undefined>;
  updateSwapRequestStatus(id: number, status: string, userId: string): Promise<SwapRequest | undefined>;
  getUserSwapRequests(userId: string): Promise<SwapRequestWithDetails[]>;
  getAllSwapRequests(): Promise<SwapRequestWithDetails[]>;
  
  // Reviews operations
  createReview(review: InsertReview): Promise<Review>;
  getSwapRequestReviews(swapRequestId: number): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  
  // Reports operations
  createReport(report: InsertReport): Promise<Report>;
  getPendingReports(): Promise<Report[]>;
  updateReportStatus(id: number, status: string): Promise<Report | undefined>;
  
  // Admin operations
  getActivityStats(): Promise<{
    totalUsers: number;
    activeSwaps: number;
    pendingReviews: number;
    totalReports: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserWithSkills(id: string): Promise<UserWithSkills | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const userSkills = await this.getUserSkills(id);
    const userAvailability = await this.getUserAvailability(id);

    return {
      ...user,
      skills: userSkills,
      availability: userAvailability,
    };
  }

  async searchUsers(
    query: string,
    filters?: { location?: string; skillType?: string; level?: string }
  ): Promise<UserWithSkills[]> {
    let whereConditions = [eq(users.isPublic, true)];

    if (filters?.location) {
      whereConditions.push(ilike(users.location, `%${filters.location}%`));
    }

    const baseUsers = await db
      .select()
      .from(users)
      .where(and(...whereConditions))
      .orderBy(desc(users.updatedAt)); // Show recently active users first

    const usersWithSkills = await Promise.all(
      baseUsers.map(async (user) => {
        const userSkills = await this.getUserSkills(user.id);
        const userAvailability = await this.getUserAvailability(user.id);

        // If no query, show all users with skills (active users)
        let matchesQuery = true;
        
        // If there's a search query, filter by skill names and bio
        if (query && query.trim() !== '') {
          matchesQuery = userSkills.some(skill => 
            skill.name.toLowerCase().includes(query.toLowerCase())
          ) || user.bio?.toLowerCase().includes(query.toLowerCase()) || false;
        }

        // Apply skill type filter
        if (filters?.skillType && filters.skillType !== 'all') {
          matchesQuery = matchesQuery && userSkills.some(skill => skill.type === filters.skillType);
        }

        // Apply level filter
        if (filters?.level && filters.level !== 'all') {
          matchesQuery = matchesQuery && userSkills.some(skill => skill.level === filters.level);
        }

        // Only show users who have at least one skill (active users)
        const isActiveUser = userSkills.length > 0;

        return (matchesQuery && isActiveUser) ? {
          ...user,
          skills: userSkills,
          availability: userAvailability,
        } : null;
      })
    );

    return usersWithSkills.filter(user => user !== null) as UserWithSkills[];
  }

  // Skills operations
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async updateSkill(id: number, updates: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [updatedSkill] = await db
      .update(skills)
      .set(updates)
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  async deleteSkill(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(skills)
      .where(and(eq(skills.id, id), eq(skills.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getUserSkills(userId: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.userId, userId));
  }

  // Availability operations
  async setUserAvailability(userId: string, availabilitySlots: InsertAvailability[]): Promise<Availability[]> {
    // Delete existing availability
    await db.delete(availability).where(eq(availability.userId, userId));
    
    // Insert new availability slots
    if (availabilitySlots.length > 0) {
      return await db.insert(availability).values(availabilitySlots).returning();
    }
    return [];
  }

  async getUserAvailability(userId: string): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(eq(availability.userId, userId))
      .orderBy(asc(availability.dayOfWeek), asc(availability.startTime));
  }

  // Swap requests operations
  async createSwapRequest(request: InsertSwapRequest): Promise<SwapRequest> {
    const [newRequest] = await db.insert(swapRequests).values(request).returning();
    return newRequest;
  }

  async getSwapRequest(id: number): Promise<SwapRequestWithDetails | undefined> {
    const [request] = await db
      .select({
        swapRequest: swapRequests,
        requester: users,
      })
      .from(swapRequests)
      .leftJoin(users, eq(swapRequests.requesterId, users.id))
      .where(eq(swapRequests.id, id));

    if (!request) return undefined;

    // Get receiver info
    const [receiver] = await db
      .select()
      .from(users)
      .where(eq(users.id, request.swapRequest.receiverId));

    // Get skills info
    let offeredSkill, requestedSkill;
    if (request.swapRequest.offeredSkillId) {
      [offeredSkill] = await db
        .select()
        .from(skills)
        .where(eq(skills.id, request.swapRequest.offeredSkillId));
    }
    if (request.swapRequest.requestedSkillId) {
      [requestedSkill] = await db
        .select()
        .from(skills)
        .where(eq(skills.id, request.swapRequest.requestedSkillId));
    }

    // Get reviews
    const requestReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.swapRequestId, id));

    return {
      ...request.swapRequest,
      requester: request.requester!,
      receiver: receiver!,
      offeredSkill,
      requestedSkill,
      reviews: requestReviews,
    };
  }

  async updateSwapRequestStatus(id: number, status: string, userId: string): Promise<SwapRequest | undefined> {
    const [updatedRequest] = await db
      .update(swapRequests)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(swapRequests.id, id),
          or(
            eq(swapRequests.requesterId, userId),
            eq(swapRequests.receiverId, userId)
          )
        )
      )
      .returning();
    return updatedRequest;
  }

  async getUserSwapRequests(userId: string): Promise<SwapRequestWithDetails[]> {
    const requests = await db
      .select()
      .from(swapRequests)
      .where(
        or(
          eq(swapRequests.requesterId, userId),
          eq(swapRequests.receiverId, userId)
        )
      )
      .orderBy(desc(swapRequests.createdAt));

    return await Promise.all(
      requests.map(async (request) => {
        const details = await this.getSwapRequest(request.id);
        return details!;
      })
    );
  }

  async getAllSwapRequests(): Promise<SwapRequestWithDetails[]> {
    const requests = await db
      .select()
      .from(swapRequests)
      .orderBy(desc(swapRequests.createdAt));

    return await Promise.all(
      requests.map(async (request) => {
        const details = await this.getSwapRequest(request.id);
        return details!;
      })
    );
  }

  // Reviews operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getSwapRequestReviews(swapRequestId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.swapRequestId, swapRequestId));
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  // Reports operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getPendingReports(): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.status, "pending"))
      .orderBy(desc(reports.createdAt));
  }

  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }

  // Admin operations
  async getActivityStats(): Promise<{
    totalUsers: number;
    activeSwaps: number;
    pendingReviews: number;
    totalReports: number;
  }> {
    const [userCount] = await db
      .select({ count: count() })
      .from(users);

    const [activeSwapCount] = await db
      .select({ count: count() })
      .from(swapRequests)
      .where(eq(swapRequests.status, "accepted"));

    const [pendingReviewCount] = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, "pending"));

    const [reportCount] = await db
      .select({ count: count() })
      .from(reports);

    return {
      totalUsers: userCount.count,
      activeSwaps: activeSwapCount.count,
      pendingReviews: pendingReviewCount.count,
      totalReports: reportCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
