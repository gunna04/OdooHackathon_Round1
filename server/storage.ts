import {
  users,
  skills,
  userSkills,
  availability,
  swapRequests,
  messages,
  reviews,
  type User,
  type UpsertUser,
  type Skill,
  type UserSkill,
  type Availability,
  type SwapRequest,
  type Message,
  type Review,
  type InsertSkill,
  type InsertUserSkill,
  type InsertAvailability,
  type InsertSwapRequest,
  type InsertMessage,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Skill operations
  getSkills(): Promise<Skill[]>;
  getSkillByName(name: string): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  
  // User skill operations
  getUserSkills(userId: string): Promise<(UserSkill & { skill: Skill })[]>;
  createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  deleteUserSkill(id: number): Promise<void>;
  
  // User search and filtering
  searchUsers(params: {
    query?: string;
    proficiency?: string[];
    location?: string;
    skillType?: 'offered' | 'wanted';
    limit?: number;
    offset?: number;
  }): Promise<{
    users: (User & {
      offeredSkills: (UserSkill & { skill: Skill })[];
      wantedSkills: (UserSkill & { skill: Skill })[];
      avgRating?: number;
    })[];
    total: number;
  }>;
  
  // Availability operations
  getUserAvailability(userId: string): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  deleteAvailability(id: number): Promise<void>;
  
  // Swap request operations
  getSwapRequests(userId: string): Promise<(SwapRequest & {
    requester: User;
    receiver: User;
    offeredSkill: Skill;
    requestedSkill: Skill;
  })[]>;
  getSwapRequest(id: number): Promise<(SwapRequest & {
    requester: User;
    receiver: User;
    offeredSkill: Skill;
    requestedSkill: Skill;
    messages: (Message & { sender: User })[];
  }) | undefined>;
  createSwapRequest(swapRequest: InsertSwapRequest): Promise<SwapRequest>;
  updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest>;
  
  // Message operations
  getSwapRequestMessages(swapRequestId: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getUserReviews(userId: string): Promise<(Review & { reviewer: User })[]>;
  
  // Statistics
  getStats(): Promise<{
    activeUsers: number;
    skillsOffered: number;
    successfulSwaps: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
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

  // Skill operations
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(asc(skills.name));
  }

  async getSkillByName(name: string): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.name, name));
    return skill;
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  // User skill operations
  async getUserSkills(userId: string): Promise<(UserSkill & { skill: Skill })[]> {
    const results = await db
      .select()
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId));
    
    return results.map(result => ({
      ...result.user_skills,
      skill: result.skills
    }));
  }

  async createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    const [newUserSkill] = await db.insert(userSkills).values(userSkill).returning();
    return newUserSkill;
  }

  async deleteUserSkill(id: number): Promise<void> {
    await db.delete(userSkills).where(eq(userSkills.id, id));
  }

  // User search and filtering
  async searchUsers(params: {
    query?: string;
    proficiency?: string[];
    location?: string;
    skillType?: 'offered' | 'wanted';
    limit?: number;
    offset?: number;
  }): Promise<{
    users: (User & {
      offeredSkills: (UserSkill & { skill: Skill })[];
      wantedSkills: (UserSkill & { skill: Skill })[];
      avgRating?: number;
    })[];
    total: number;
  }> {
    const { query, proficiency, location, skillType, limit = 20, offset = 0 } = params;
    
    // Build the base query
    let whereConditions = [eq(users.profileVisible, true)];
    
    if (location) {
      whereConditions.push(ilike(users.location, `%${location}%`));
    }
    
    // If searching by skill, join with userSkills
    if (query || proficiency?.length) {
      const skillConditions = [];
      
      if (query) {
        skillConditions.push(ilike(skills.name, `%${query}%`));
      }
      
      if (proficiency?.length) {
        skillConditions.push(sql`${userSkills.proficiency} = ANY(${proficiency})`);
      }
      
      if (skillType) {
        skillConditions.push(eq(userSkills.isOffered, skillType === 'offered'));
      }
      
      const usersWithSkills = await db
        .selectDistinct({ id: users.id })
        .from(users)
        .innerJoin(userSkills, eq(users.id, userSkills.userId))
        .innerJoin(skills, eq(userSkills.skillId, skills.id))
        .where(and(...whereConditions, ...skillConditions));
      
      const userIds = usersWithSkills.map(u => u.id);
      if (userIds.length === 0) {
        return { users: [], total: 0 };
      }
      
      whereConditions.push(sql`${users.id} = ANY(${userIds})`);
    }
    
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...whereConditions));
    
    // Get users
    const foundUsers = await db
      .select()
      .from(users)
      .where(and(...whereConditions))
      .limit(limit)
      .offset(offset)
      .orderBy(asc(users.firstName));
    
    // Get skills for each user
    const usersWithSkills = await Promise.all(
      foundUsers.map(async (user) => {
        const allUserSkills = await db
          .select()
          .from(userSkills)
          .innerJoin(skills, eq(userSkills.skillId, skills.id))
          .where(eq(userSkills.userId, user.id));
        
        const offeredSkills = allUserSkills
          .filter(us => us.user_skills.isOffered)
          .map(us => ({
            ...us.user_skills,
            skill: us.skills
          }));
        
        const wantedSkills = allUserSkills
          .filter(us => !us.user_skills.isOffered)
          .map(us => ({
            ...us.user_skills,
            skill: us.skills
          }));
        
        // Calculate average rating
        const userReviews = await db
          .select({ rating: reviews.rating })
          .from(reviews)
          .where(eq(reviews.revieweeId, user.id));
        
        const avgRating = userReviews.length > 0
          ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
          : undefined;
        
        return {
          ...user,
          offeredSkills,
          wantedSkills,
          avgRating,
        };
      })
    );
    
    return {
      users: usersWithSkills,
      total: totalResult.count,
    };
  }

  // Availability operations
  async getUserAvailability(userId: string): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(eq(availability.userId, userId))
      .orderBy(asc(availability.dayOfWeek), asc(availability.startTime));
  }

  async createAvailability(availabilityData: InsertAvailability): Promise<Availability> {
    const [newAvailability] = await db.insert(availability).values(availabilityData).returning();
    return newAvailability;
  }

  async deleteAvailability(id: number): Promise<void> {
    await db.delete(availability).where(eq(availability.id, id));
  }

  // Swap request operations
  async getSwapRequests(userId: string): Promise<(SwapRequest & {
    requester: User;
    receiver: User;
    offeredSkill: Skill;
    requestedSkill: Skill;
  })[]> {
    const results = await db
      .select()
      .from(swapRequests)
      .where(or(
        eq(swapRequests.requesterId, userId),
        eq(swapRequests.receiverId, userId)
      ))
      .orderBy(desc(swapRequests.createdAt));

    const enrichedResults = await Promise.all(
      results.map(async (swapRequest) => {
        const [requester] = await db.select().from(users).where(eq(users.id, swapRequest.requesterId));
        const [receiver] = await db.select().from(users).where(eq(users.id, swapRequest.receiverId));
        const [offeredSkill] = await db.select().from(skills).where(eq(skills.id, swapRequest.offeredSkillId));
        const [requestedSkill] = await db.select().from(skills).where(eq(skills.id, swapRequest.requestedSkillId));

        return {
          ...swapRequest,
          requester,
          receiver,
          offeredSkill,
          requestedSkill,
        };
      })
    );

    return enrichedResults;
  }

  async getSwapRequest(id: number): Promise<(SwapRequest & {
    requester: User;
    receiver: User;
    offeredSkill: Skill;
    requestedSkill: Skill;
    messages: (Message & { sender: User })[];
  }) | undefined> {
    const [swapRequest] = await db
      .select()
      .from(swapRequests)
      .where(eq(swapRequests.id, id));
    
    if (!swapRequest) return undefined;
    
    const [requester] = await db.select().from(users).where(eq(users.id, swapRequest.requesterId));
    const [receiver] = await db.select().from(users).where(eq(users.id, swapRequest.receiverId));
    const [offeredSkill] = await db.select().from(skills).where(eq(skills.id, swapRequest.offeredSkillId));
    const [requestedSkill] = await db.select().from(skills).where(eq(skills.id, swapRequest.requestedSkillId));
    
    const swapMessages = await db
      .select()
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.swapRequestId, id))
      .orderBy(asc(messages.createdAt));
    
    const mappedMessages = swapMessages.map(msg => ({
      ...msg.messages,
      sender: msg.users
    }));
    
    return {
      ...swapRequest,
      requester,
      receiver,
      offeredSkill,
      requestedSkill,
      messages: mappedMessages,
    };
  }

  async createSwapRequest(swapRequest: InsertSwapRequest): Promise<SwapRequest> {
    const [newSwapRequest] = await db.insert(swapRequests).values(swapRequest).returning();
    return newSwapRequest;
  }

  async updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest> {
    const [updatedSwapRequest] = await db
      .update(swapRequests)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(swapRequests.id, id))
      .returning();
    return updatedSwapRequest;
  }

  // Message operations
  async getSwapRequestMessages(swapRequestId: number): Promise<(Message & { sender: User })[]> {
    const results = await db
      .select()
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.swapRequestId, swapRequestId))
      .orderBy(asc(messages.createdAt));
    
    return results.map(result => ({
      ...result.messages,
      sender: result.users
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getUserReviews(userId: string): Promise<(Review & { reviewer: User })[]> {
    const results = await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
    
    return results.map(result => ({
      ...result.reviews,
      reviewer: result.users
    }));
  }

  // Statistics
  async getStats(): Promise<{
    activeUsers: number;
    skillsOffered: number;
    successfulSwaps: number;
  }> {
    const [activeUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.profileVisible, true));
    
    const [skillsOfferedResult] = await db
      .select({ count: count() })
      .from(userSkills)
      .where(eq(userSkills.isOffered, true));
    
    const [successfulSwapsResult] = await db
      .select({ count: count() })
      .from(swapRequests)
      .where(eq(swapRequests.status, 'completed'));
    
    return {
      activeUsers: activeUsersResult.count,
      skillsOffered: skillsOfferedResult.count,
      successfulSwaps: successfulSwapsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
