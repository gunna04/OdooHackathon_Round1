import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (supports both local auth and OAuth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"), // Hashed password for local auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  location: varchar("location"),
  isPublic: boolean("is_public").default(true),
  isAdmin: boolean("is_admin").default(false),
  authProvider: varchar("auth_provider").default("local"), // 'local', 'google', etc.
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  level: varchar("level").notNull(), // 'beginner', 'intermediate', 'expert'
  type: varchar("type").notNull(), // 'offered' or 'wanted'
  createdAt: timestamp("created_at").defaultNow(),
});

export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time").notNull(), // "HH:MM"
  endTime: varchar("end_time").notNull(), // "HH:MM"
  createdAt: timestamp("created_at").defaultNow(),
});

export const swapRequests = pgTable("swap_requests", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  offeredSkillId: integer("offered_skill_id").references(() => skills.id),
  requestedSkillId: integer("requested_skill_id").references(() => skills.id),
  message: text("message"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
  proposedTime: timestamp("proposed_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  swapRequestId: integer("swap_request_id").notNull().references(() => swapRequests.id, { onDelete: "cascade" }),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportedUserId: varchar("reported_user_id").references(() => users.id, { onDelete: "cascade" }),
  contentType: varchar("content_type").notNull(), // 'profile', 'skill', 'bio'
  contentId: varchar("content_id"),
  reason: varchar("reason").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'reviewed', 'resolved'
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull().default("info"), // 'info', 'warning', 'alert'
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const userModeration = pgTable("user_moderation", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // 'warn', 'suspend', 'ban'
  reason: text("reason").notNull(),
  duration: integer("duration"), // days, null for permanent
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const skillModeration = pgTable("skill_moderation", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // 'flag', 'reject', 'approve'
  reason: text("reason"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  skills: many(skills),
  availability: many(availability),
  sentSwapRequests: many(swapRequests, { relationName: "requester" }),
  receivedSwapRequests: many(swapRequests, { relationName: "receiver" }),
  givenReviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "reviewee" }),
  reports: many(reports, { relationName: "reporter" }),
  reportedContent: many(reports, { relationName: "reported" }),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  user: one(users, {
    fields: [skills.userId],
    references: [users.id],
  }),
  offeredSwapRequests: many(swapRequests, { relationName: "offeredSkill" }),
  requestedSwapRequests: many(swapRequests, { relationName: "requestedSkill" }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  user: one(users, {
    fields: [availability.userId],
    references: [users.id],
  }),
}));

export const swapRequestsRelations = relations(swapRequests, ({ one, many }) => ({
  requester: one(users, {
    fields: [swapRequests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  receiver: one(users, {
    fields: [swapRequests.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  offeredSkill: one(skills, {
    fields: [swapRequests.offeredSkillId],
    references: [skills.id],
    relationName: "offeredSkill",
  }),
  requestedSkill: one(skills, {
    fields: [swapRequests.requestedSkillId],
    references: [skills.id],
    relationName: "requestedSkill",
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  swapRequest: one(swapRequests, {
    fields: [reviews.swapRequestId],
    references: [swapRequests.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: "reviewee",
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  reportedUser: one(users, {
    fields: [reports.reportedUserId],
    references: [users.id],
    relationName: "reported",
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

export const userModerationRelations = relations(userModeration, ({ one }) => ({
  user: one(users, {
    fields: [userModeration.userId],
    references: [users.id],
  }),
  moderator: one(users, {
    fields: [userModeration.createdBy],
    references: [users.id],
  }),
}));

export const skillModerationRelations = relations(skillModeration, ({ one }) => ({
  skill: one(skills, {
    fields: [skillModeration.skillId],
    references: [skills.id],
  }),
  moderator: one(users, {
    fields: [skillModeration.createdBy],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
});

export const createUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
  authProvider: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
  createdAt: true,
});

export const insertSwapRequestSchema = createInsertSchema(swapRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertUserModerationSchema = createInsertSchema(userModeration).omit({
  id: true,
  createdAt: true,
});

export const insertSkillModerationSchema = createInsertSchema(skillModeration).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;
export type InsertSwapRequest = z.infer<typeof insertSwapRequestSchema>;
export type SwapRequest = typeof swapRequests.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertUserModeration = z.infer<typeof insertUserModerationSchema>;
export type UserModeration = typeof userModeration.$inferSelect;
export type InsertSkillModeration = z.infer<typeof insertSkillModerationSchema>;
export type SkillModeration = typeof skillModeration.$inferSelect;

// Extended types for API responses
export type UserWithSkills = User & {
  skills: Skill[];
  availability: Availability[];
};

export type SwapRequestWithDetails = SwapRequest & {
  requester: User;
  receiver: User;
  offeredSkill?: Skill;
  requestedSkill?: Skill;
  reviews: Review[];
};
