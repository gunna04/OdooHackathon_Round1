import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuthRoutes, authenticateToken, requireAdmin } from "./auth";
import { z } from "zod";
import {
  insertSkillSchema,
  insertAvailabilitySchema,
  insertSwapRequestSchema,
  insertReviewSchema,
  insertReportSchema,
  insertAnnouncementSchema,
  insertUserModerationSchema,
  insertSkillModerationSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuthRoutes(app);

  // User routes
  app.put('/api/users/profile', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const { bio, location, isPublic } = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        bio,
        location,
        isPublic,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/users/search', async (req, res) => {
    try {
      const { q, location, skillType, level } = req.query;
      const query = q as string || '';
      const filters = {
        location: location as string,
        skillType: skillType as string,
        level: level as string,
      };
      
      const users = await storage.searchUsers(query, filters);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Skills routes
  app.post('/api/skills', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const skillData = insertSkillSchema.parse({ ...req.body, userId });
      
      const skill = await storage.createSkill(skillData);
      res.json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(400).json({ message: "Failed to create skill" });
    }
  });

  app.delete('/api/skills/:id', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const skillId = parseInt(req.params.id);
      
      const success = await storage.deleteSkill(skillId, userId);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Skill not found" });
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Availability routes
  app.put('/api/availability', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const availabilitySlots = req.body.map((slot: any) => 
        insertAvailabilitySchema.parse({ ...slot, userId })
      );
      
      const availability = await storage.setUserAvailability(userId, availabilitySlots);
      res.json(availability);
    } catch (error) {
      console.error("Error updating availability:", error);
      res.status(400).json({ message: "Failed to update availability" });
    }
  });

  // Swap request routes
  app.post('/api/swap-requests', authenticateToken, async (req: any, res) => {
    try {
      const requesterId = req.user.userId;
      const requestData = insertSwapRequestSchema.parse({ ...req.body, requesterId });
      
      const swapRequest = await storage.createSwapRequest(requestData);
      res.json(swapRequest);
    } catch (error) {
      console.error("Error creating swap request:", error);
      res.status(400).json({ message: "Failed to create swap request" });
    }
  });

  app.get('/api/swap-requests', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const swapRequests = await storage.getUserSwapRequests(userId);
      res.json(swapRequests);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      res.status(500).json({ message: "Failed to fetch swap requests" });
    }
  });

  app.put('/api/swap-requests/:id/status', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedRequest = await storage.updateSwapRequestStatus(requestId, status, userId);
      if (updatedRequest) {
        res.json(updatedRequest);
      } else {
        res.status(404).json({ message: "Swap request not found" });
      }
    } catch (error) {
      console.error("Error updating swap request:", error);
      res.status(500).json({ message: "Failed to update swap request" });
    }
  });

  // Review routes
  app.post('/api/reviews', authenticateToken, async (req: any, res) => {
    try {
      const reviewerId = req.user.userId;
      const reviewData = insertReviewSchema.parse({ ...req.body, reviewerId });
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/reviews/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getActivityStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/swap-requests', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const swapRequests = await storage.getAllSwapRequests();
      res.json(swapRequests);
    } catch (error) {
      console.error("Error fetching all swap requests:", error);
      res.status(500).json({ message: "Failed to fetch swap requests" });
    }
  });

  app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const reports = await storage.getPendingReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/reports/:id', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedReport = await storage.updateReportStatus(reportId, status);
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  // User moderation routes
  app.post('/api/admin/users/:id/moderate', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const moderatorId = req.user.userId;
      const moderationData = insertUserModerationSchema.parse({ ...req.body, userId, createdBy: moderatorId });
      
      const moderation = await storage.moderateUser(moderationData);
      res.json(moderation);
    } catch (error) {
      console.error("Error moderating user:", error);
      res.status(400).json({ message: "Failed to moderate user" });
    }
  });

  app.get('/api/admin/users/:id/moderation-history', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const history = await storage.getUserModerationHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching user moderation history:", error);
      res.status(500).json({ message: "Failed to fetch moderation history" });
    }
  });

  app.get('/api/admin/users/:id/is-banned', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const isBanned = await storage.isUserBanned(userId);
      res.json({ isBanned });
    } catch (error) {
      console.error("Error checking user ban status:", error);
      res.status(500).json({ message: "Failed to check ban status" });
    }
  });

  // Skill moderation routes
  app.post('/api/admin/skills/:id/moderate', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const moderatorId = req.user.userId;
      const moderationData = insertSkillModerationSchema.parse({ ...req.body, skillId, createdBy: moderatorId });
      
      const moderation = await storage.moderateSkill(moderationData);
      res.json(moderation);
    } catch (error) {
      console.error("Error moderating skill:", error);
      res.status(400).json({ message: "Failed to moderate skill" });
    }
  });

  app.get('/api/admin/skills/:id/moderation-history', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const history = await storage.getSkillModerationHistory(skillId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching skill moderation history:", error);
      res.status(500).json({ message: "Failed to fetch moderation history" });
    }
  });

  // Announcement routes
  app.post('/api/admin/announcements', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const createdBy = req.user.userId;
      const announcementData = insertAnnouncementSchema.parse({ ...req.body, createdBy });
      
      const announcement = await storage.createAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(400).json({ message: "Failed to create announcement" });
    }
  });

  app.get('/api/admin/announcements', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.put('/api/admin/announcements/:id', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedAnnouncement = await storage.updateAnnouncement(id, req.body);
      if (updatedAnnouncement) {
        res.json(updatedAnnouncement);
      } else {
        res.status(404).json({ message: "Announcement not found" });
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/admin/announcements/:id', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAnnouncement(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Announcement not found" });
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Activity report route
  app.get('/api/admin/reports/activity/download', authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const report = await storage.generateActivityReport();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="activity-report.json"');
      res.json(report);
    } catch (error) {
      console.error("Error generating activity report:", error);
      res.status(500).json({ message: "Failed to generate activity report" });
    }
  });

  // Report routes
  app.post('/api/reports', authenticateToken, async (req: any, res) => {
    try {
      const reporterId = req.user.userId;
      const reportData = insertReportSchema.parse({ ...req.body, reporterId });
      
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(400).json({ message: "Failed to create report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
