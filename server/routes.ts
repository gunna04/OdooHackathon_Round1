import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSkillSchema, insertUserSkillSchema, insertAvailabilitySchema, insertSwapRequestSchema, insertMessageSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Stats endpoint (public)
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Skills endpoints
  app.get('/api/skills', async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      
      // Check if skill already exists
      const existingSkill = await storage.getSkillByName(skillData.name);
      if (existingSkill) {
        return res.json(existingSkill);
      }
      
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(400).json({ message: "Failed to create skill" });
    }
  });

  // User skills endpoints
  app.get('/api/users/:userId/skills', async (req, res) => {
    try {
      const { userId } = req.params;
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Failed to fetch user skills" });
    }
  });

  app.post('/api/user-skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userSkillData = insertUserSkillSchema.parse({
        ...req.body,
        userId,
      });
      
      const userSkill = await storage.createUserSkill(userSkillData);
      res.status(201).json(userSkill);
    } catch (error) {
      console.error("Error creating user skill:", error);
      res.status(400).json({ message: "Failed to create user skill" });
    }
  });

  app.delete('/api/user-skills/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUserSkill(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user skill:", error);
      res.status(500).json({ message: "Failed to delete user skill" });
    }
  });

  // User search endpoint
  app.get('/api/users/search', async (req, res) => {
    try {
      const { query, proficiency, location, skillType, page = '1', limit = '20' } = req.query;
      
      const searchParams = {
        query: query as string,
        proficiency: proficiency ? (proficiency as string).split(',') : undefined,
        location: location as string,
        skillType: skillType as 'offered' | 'wanted',
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      };
      
      const result = await storage.searchUsers(searchParams);
      res.json(result);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Availability endpoints
  app.get('/api/users/:userId/availability', async (req, res) => {
    try {
      const { userId } = req.params;
      const availability = await storage.getUserAvailability(userId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching user availability:", error);
      res.status(500).json({ message: "Failed to fetch user availability" });
    }
  });

  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const availabilityData = insertAvailabilitySchema.parse({
        ...req.body,
        userId,
      });
      
      const availability = await storage.createAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error creating availability:", error);
      res.status(400).json({ message: "Failed to create availability" });
    }
  });

  app.delete('/api/availability/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAvailability(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting availability:", error);
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // Swap requests endpoints
  app.get('/api/swap-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swapRequests = await storage.getSwapRequests(userId);
      res.json(swapRequests);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      res.status(500).json({ message: "Failed to fetch swap requests" });
    }
  });

  app.get('/api/swap-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const swapRequest = await storage.getSwapRequest(parseInt(id));
      
      if (!swapRequest) {
        return res.status(404).json({ message: "Swap request not found" });
      }
      
      res.json(swapRequest);
    } catch (error) {
      console.error("Error fetching swap request:", error);
      res.status(500).json({ message: "Failed to fetch swap request" });
    }
  });

  app.post('/api/swap-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swapRequestData = insertSwapRequestSchema.parse({
        ...req.body,
        requesterId: userId,
      });
      
      const swapRequest = await storage.createSwapRequest(swapRequestData);
      res.status(201).json(swapRequest);
    } catch (error) {
      console.error("Error creating swap request:", error);
      res.status(400).json({ message: "Failed to create swap request" });
    }
  });

  app.patch('/api/swap-requests/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = z.object({ status: z.string() }).parse(req.body);
      
      const updatedSwapRequest = await storage.updateSwapRequestStatus(parseInt(id), status);
      res.json(updatedSwapRequest);
    } catch (error) {
      console.error("Error updating swap request status:", error);
      res.status(400).json({ message: "Failed to update swap request status" });
    }
  });

  // Messages endpoints
  app.get('/api/swap-requests/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getSwapRequestMessages(parseInt(id));
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Failed to create message" });
    }
  });

  // Reviews endpoints
  app.get('/api/users/:userId/reviews', async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  // Update user profile
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = z.object({
        bio: z.string().optional(),
        location: z.string().optional(),
        profileVisible: z.boolean().optional(),
      }).parse(req.body);
      
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.upsertUser({
        ...currentUser,
        ...updateData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(400).json({ message: "Failed to update user profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
