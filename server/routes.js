import { createServer } from 'http';
import User from './models/User.js';
import SwapRequest from './models/SwapRequest.js';
import Review from './models/Review.js';
import { setupAuth, isAuthenticated } from './replitAuth.js';

// Middleware to check admin status
const isAdmin = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const userId = req.user?.claims?.sub;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await User.findOne({ replitId: userId });
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};

async function registerRoutes(app) {
  // Auth middleware setup
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await User.findOne({ replitId: userId });
      
      if (!user) {
        // Create user if doesn't exist
        user = new User({
          replitId: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url
        });
        await user.save();
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User search endpoint
  app.get('/api/users/search', async (req, res) => {
    try {
      const { query = '', skillType = 'all', proficiency, location, limit = 20 } = req.query;
      
      let searchCondition = { profileVisible: true };
      
      if (query) {
        const searchRegex = new RegExp(query, 'i');
        if (skillType === 'offered') {
          searchCondition['skills.offered.name'] = searchRegex;
        } else if (skillType === 'wanted') {
          searchCondition['skills.wanted.name'] = searchRegex;
        } else {
          searchCondition.$or = [
            { 'skills.offered.name': searchRegex },
            { 'skills.wanted.name': searchRegex },
            { location: searchRegex }
          ];
        }
      }
      
      if (proficiency && proficiency !== 'all') {
        if (skillType === 'offered') {
          searchCondition['skills.offered.proficiency'] = proficiency;
        } else if (skillType === 'wanted') {
          searchCondition['skills.wanted.proficiency'] = proficiency;
        }
      }
      
      if (location) {
        searchCondition.location = new RegExp(location, 'i');
      }
      
      const users = await User.find(searchCondition)
        .limit(parseInt(limit))
        .select('-__v')
        .lean();
      
      res.json({ users, total: users.length });
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // User profile endpoints
  app.get('/api/users/:userId', async (req, res) => {
    try {
      const user = await User.findOne({ replitId: req.params.userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/users/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const user = await User.findOneAndUpdate(
        { replitId: userId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(400).json({ message: "Failed to update user profile" });
    }
  });

  // Make admin endpoint
  app.post('/api/users/make-admin', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const user = await User.findOneAndUpdate(
        { replitId: userId },
        { $set: { isAdmin: true } },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Admin privileges granted", user });
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ message: "Failed to grant admin privileges" });
    }
  });

  // Swap Request endpoints
  app.get('/api/swap-requests', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await User.findOne({ replitId: userId });
      
      const swapRequests = await SwapRequest.find({
        $or: [
          { requester: user._id },
          { receiver: user._id }
        ]
      })
      .populate('requester receiver', 'firstName lastName profileImageUrl')
      .sort({ createdAt: -1 });
      
      res.json(swapRequests);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      res.status(500).json({ message: "Failed to fetch swap requests" });
    }
  });

  app.post('/api/swap-requests', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const requester = await User.findOne({ replitId: userId });
      const receiver = await User.findOne({ replitId: req.body.receiverId });
      
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      const swapRequest = new SwapRequest({
        requester: requester._id,
        receiver: receiver._id,
        offeredSkill: req.body.offeredSkill,
        requestedSkill: req.body.requestedSkill,
        message: req.body.message
      });
      
      await swapRequest.save();
      await swapRequest.populate('requester receiver', 'firstName lastName profileImageUrl');
      
      res.status(201).json(swapRequest);
    } catch (error) {
      console.error("Error creating swap request:", error);
      res.status(400).json({ message: "Failed to create swap request" });
    }
  });

  app.patch('/api/swap-requests/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const swapRequest = await SwapRequest.findByIdAndUpdate(
        req.params.id,
        { $set: { status } },
        { new: true }
      ).populate('requester receiver', 'firstName lastName profileImageUrl');
      
      if (!swapRequest) {
        return res.status(404).json({ message: "Swap request not found" });
      }
      
      res.json(swapRequest);
    } catch (error) {
      console.error("Error updating swap request:", error);
      res.status(400).json({ message: "Failed to update swap request status" });
    }
  });

  // Admin endpoints
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await User.find({}).sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/swap-requests', isAdmin, async (req, res) => {
    try {
      const swapRequests = await SwapRequest.find({})
        .populate('requester receiver', 'firstName lastName profileImageUrl email')
        .sort({ createdAt: -1 });
      res.json(swapRequests);
    } catch (error) {
      console.error("Error fetching all swap requests:", error);
      res.status(500).json({ message: "Failed to fetch swap requests" });
    }
  });

  app.patch('/api/admin/users/:userId/ban', isAdmin, async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { replitId: req.params.userId },
        { $set: { profileVisible: false } },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User banned successfully" });
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.get('/api/admin/export/:type', isAdmin, async (req, res) => {
    try {
      const { type } = req.params;
      let csvData = '';
      
      if (type === 'users') {
        const users = await User.find({});
        csvData = 'ID,Email,Name,Location,Skills Offered,Skills Wanted,Created\n';
        csvData += users.map(user => 
          `${user.replitId},"${user.email || ''}","${user.firstName} ${user.lastName}","${user.location || ''}","${user.skills.offered.map(s => s.name).join(';')}","${user.skills.wanted.map(s => s.name).join(';')}","${user.createdAt}"`
        ).join('\n');
      } else if (type === 'swaps') {
        const swaps = await SwapRequest.find({}).populate('requester receiver');
        csvData = 'ID,Requester,Receiver,Offered Skill,Requested Skill,Status,Created\n';
        csvData += swaps.map(swap => 
          `${swap._id},"${swap.requester.firstName} ${swap.requester.lastName}","${swap.receiver.firstName} ${swap.receiver.lastName}","${swap.offeredSkill.name}","${swap.requestedSkill.name}","${swap.status}","${swap.createdAt}"`
        ).join('\n');
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Stats endpoint
  app.get('/api/stats', async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({ profileVisible: true });
      const totalSkillsOffered = await User.aggregate([
        { $match: { profileVisible: true } },
        { $project: { skillCount: { $size: "$skills.offered" } } },
        { $group: { _id: null, total: { $sum: "$skillCount" } } }
      ]);
      const completedSwaps = await SwapRequest.countDocuments({ status: 'completed' });
      
      res.json({
        activeUsers: totalUsers,
        skillsOffered: totalSkillsOffered[0]?.total || 0,
        successfulSwaps: completedSwaps
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

export { registerRoutes };