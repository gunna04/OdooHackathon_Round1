import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Flag, 
  MessageSquare, 
  Download, 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Ban,
  UserCheck,
  Settings,
  FileText,
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserX
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isUserModerationDialogOpen, setIsUserModerationDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);

  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    type: "info",
    expiresAt: ""
  });

  const [userModerationForm, setUserModerationForm] = useState({
    action: "warn",
    reason: "",
    duration: ""
  });

  const [skillModerationForm, setSkillModerationForm] = useState({
    action: "flag",
    reason: ""
  });

  // Queries
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/stats", {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      return await res.json();
    },
  });

  const { data: allSwapRequests } = useQuery({
    queryKey: ["/api/admin/swap-requests"],
    enabled: !!user?.isAdmin,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/swap-requests", {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      return await res.json();
    },
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/admin/reports"],
    enabled: !!user?.isAdmin,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/reports", {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      return await res.json();
    },
  });

  const { data: announcements } = useQuery({
    queryKey: ["/api/admin/announcements"],
    enabled: !!user?.isAdmin,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/announcements", {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      return await res.json();
    },
  });

  const { data: allUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/users", {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      return await res.json();
    },
  });

  // Mutations
  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: number; status: string }) => {
      await apiRequest("PUT", `/api/admin/reports/${reportId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (announcementData: any) => {
      await apiRequest("POST", "/api/admin/announcements", announcementData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement created successfully!",
      });
      setIsAnnouncementDialogOpen(false);
      setAnnouncementForm({ title: "", message: "", type: "info", expiresAt: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const moderateUserMutation = useMutation({
    mutationFn: async ({ userId, moderationData }: { userId: string; moderationData: any }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/moderate`, moderationData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User moderated successfully!",
      });
      setIsUserModerationDialogOpen(false);
      setUserModerationForm({ action: "warn", reason: "", duration: "" });
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to moderate user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const moderateSkillMutation = useMutation({
    mutationFn: async ({ skillId, moderationData }: { skillId: number; moderationData: any }) => {
      await apiRequest("POST", `/api/admin/skills/${skillId}/moderate`, moderationData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Skill moderated successfully!",
      });
      setSkillModerationForm({ action: "flag", reason: "" });
      setSelectedSkill(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to moderate skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check admin access
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Debug information
  console.log('Admin page debug:', {
    isLoading,
    isAuthenticated,
    user: user ? { id: user.id, email: user.email, isAdmin: user.isAdmin } : null
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Not Logged In</h2>
          <p className="text-gray-600">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have admin privileges.</p>
          <p className="text-sm text-gray-500 mt-2">User: {user.email}</p>
          <p className="text-sm text-gray-500">Admin status: {user.isAdmin ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  const handleApproveReport = (reportId: number) => {
    updateReportMutation.mutate({ reportId, status: "resolved" });
  };

  const handleRejectReport = (reportId: number) => {
    updateReportMutation.mutate({ reportId, status: "reviewed" });
  };

  const handleDownloadActivityReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reports/activity/download', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activity-report.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Complete",
          description: "Activity report downloaded successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download activity report.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAnnouncement = () => {
    if (!announcementForm.title || !announcementForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const announcementData = {
      ...announcementForm,
      expiresAt: announcementForm.expiresAt || null,
    };

    createAnnouncementMutation.mutate(announcementData);
  };

  const handleModerateUser = () => {
    if (!selectedUser || !userModerationForm.reason) {
    toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const moderationData = {
      ...userModerationForm,
      duration: userModerationForm.duration ? parseInt(userModerationForm.duration) : null,
    };

    moderateUserMutation.mutate({ userId: selectedUser.id, moderationData });
  };

  const handleModerateSkill = () => {
    if (!selectedSkill || !skillModerationForm.reason) {
    toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
    });
      return;
    }

    moderateSkillMutation.mutate({ skillId: selectedSkill.id, moderationData: skillModerationForm });
  };

  const getRecentActivity = () => {
    const activities = [];
    
    if (allSwapRequests) {
      const recent = allSwapRequests.slice(0, 4);
      activities.push(...recent.map((swap: any) => ({
        type: swap.status === 'completed' ? 'swap_completed' : 'swap_created',
        message: swap.status === 'completed' 
          ? `Swap completed: ${swap.requester.firstName} ↔ ${swap.receiver.firstName}`
          : `New swap request: ${swap.requester.firstName} → ${swap.receiver.firstName}`,
        time: new Date(swap.createdAt).toLocaleString(),
        color: swap.status === 'completed' ? 'blue' : 'green'
      })));
    }

    if (reports) {
      const recentReports = reports.slice(0, 2);
      activities.push(...recentReports.map((report: any) => ({
        type: 'report',
        message: `Content reported: ${report.contentType}`,
        time: new Date(report.createdAt).toLocaleString(),
        color: 'red'
      })));
    }

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);
  };

  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-[var(--platform-bg)]">
      <Navigation />
      
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
              <p className="text-lg text-gray-600">Monitor platform activity and manage users</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="content">Content Moderation</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Swaps</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.activeSwaps || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.pendingReviews || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <Flag className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Reports</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats?.totalReports || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.color === 'green' ? 'bg-green-400' :
                            activity.color === 'blue' ? 'bg-blue-400' :
                            activity.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                          <span className="text-sm text-gray-900">{activity.message}</span>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>

                  {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                        <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <Megaphone className="mr-3 h-4 w-4 text-primary" />
                      Send Platform Announcement
                    </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Create Announcement</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                  id="title"
                                  value={announcementForm.title}
                                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                  placeholder="Announcement title"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                  id="message"
                                  value={announcementForm.message}
                                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                                  placeholder="Announcement message"
                                  rows={4}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={announcementForm.type} onValueChange={(value) => setAnnouncementForm({ ...announcementForm, type: value })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="alert">Alert</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                                <Input
                                  id="expiresAt"
                                  type="datetime-local"
                                  value={announcementForm.expiresAt}
                                  onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCreateAnnouncement} disabled={createAnnouncementMutation.isPending}>
                                {createAnnouncementMutation.isPending ? "Creating..." : "Create"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                          onClick={handleDownloadActivityReport}
                    >
                      <Download className="mr-3 h-4 w-4 text-primary" />
                      Download Activity Reports
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                          onClick={() => setActiveTab("content")}
                      disabled={!reports || reports.length === 0}
                    >
                      <Flag className="mr-3 h-4 w-4 text-primary" />
                      Review Flagged Content
                      {reports && reports.length > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {reports.length}
                        </Badge>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                          onClick={() => setActiveTab("users")}
                    >
                      <Shield className="mr-3 h-4 w-4 text-primary" />
                      Manage Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
              </TabsContent>

              {/* User Management Tab */}
              <TabsContent value="users" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Monitor user activity and take moderation actions when necessary.
                      </p>
                      
                      {allUsers && allUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {allUsers.map((user: any) => (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <img
                                        className="w-8 h-8 rounded-full object-cover"
                                        src={user.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face`}
                                        alt={`${user.firstName}'s profile`}
                                      />
                                      <div>
                                        <div className="font-medium">
                                          {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          Joined {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">{user.email}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">{user.location || 'Not set'}</div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={user.isAdmin ? "default" : "secondary"}>
                                      {user.isAdmin ? "Admin" : "User"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {user.isPublic ? "Public" : "Private"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setIsUserModerationDialogOpen(true);
                                        }}
                                      >
                                        <Shield className="h-3 w-3 mr-1" />
                                        Moderate
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          // View user details
                                          toast({
                                            title: "User Details",
                                            description: `Viewing details for ${user.firstName} ${user.lastName}`,
                                          });
                                        }}
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                          <p className="text-gray-600">
                            No users are currently registered on the platform.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* User Moderation Dialog */}
                <Dialog open={isUserModerationDialogOpen} onOpenChange={setIsUserModerationDialogOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Moderate User</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {selectedUser && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium">Moderating: {selectedUser.firstName} {selectedUser.lastName}</p>
                          <p className="text-xs text-gray-500">{selectedUser.email}</p>
                        </div>
                      )}
                      <div className="grid gap-2">
                        <Label htmlFor="action">Action</Label>
                        <Select value={userModerationForm.action} onValueChange={(value) => setUserModerationForm({ ...userModerationForm, action: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="warn">Warning</SelectItem>
                            <SelectItem value="suspend">Suspend</SelectItem>
                            <SelectItem value="ban">Ban</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                          id="reason"
                          value={userModerationForm.reason}
                          onChange={(e) => setUserModerationForm({ ...userModerationForm, reason: e.target.value })}
                          placeholder="Reason for moderation action"
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duration (days, leave empty for permanent)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={userModerationForm.duration}
                          onChange={(e) => setUserModerationForm({ ...userModerationForm, duration: e.target.value })}
                          placeholder="e.g., 7 for 7 days"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsUserModerationDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleModerateUser} disabled={moderateUserMutation.isPending}>
                        {moderateUserMutation.isPending ? "Moderating..." : "Apply Action"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              {/* Content Moderation Tab */}
              <TabsContent value="content" className="space-y-8">
            {/* Pending Reports Table */}
                {reports && reports.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Content Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reporter</TableHead>
                          <TableHead>Content Type</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Reported</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report: any) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div className="text-sm font-medium text-gray-900">
                                Report #{report.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {report.reporterId}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {report.contentType}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {report.reason}
                            </TableCell>
                            <TableCell>
                              {new Date(report.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveReport(report.id)}
                                  disabled={updateReportMutation.isPending}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectReport(report.id)}
                                  disabled={updateReportMutation.isPending}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Reports</h3>
                      <p className="text-gray-600">
                        All content has been reviewed. Check back later for new reports.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Announcements Tab */}
              <TabsContent value="announcements" className="space-y-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Platform Announcements</CardTitle>
                    <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          New Announcement
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create Announcement</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={announcementForm.title}
                              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                              placeholder="Announcement title"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                              id="message"
                              value={announcementForm.message}
                              onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                              placeholder="Announcement message"
                              rows={4}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={announcementForm.type} onValueChange={(value) => setAnnouncementForm({ ...announcementForm, type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="alert">Alert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                            <Input
                              id="expiresAt"
                              type="datetime-local"
                              value={announcementForm.expiresAt}
                              onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateAnnouncement} disabled={createAnnouncementMutation.isPending}>
                            {createAnnouncementMutation.isPending ? "Creating..." : "Create"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {announcements && announcements.length > 0 ? (
                      <div className="space-y-4">
                        {announcements.map((announcement: any) => (
                          <div key={announcement.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold">{announcement.title}</h3>
                                  <Badge variant={announcement.type === 'alert' ? 'destructive' : announcement.type === 'warning' ? 'secondary' : 'default'}>
                                    {announcement.type}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-2">{announcement.message}</p>
                                <p className="text-sm text-gray-500">
                                  Created: {new Date(announcement.createdAt).toLocaleString()}
                                  {announcement.expiresAt && (
                                    <span> • Expires: {new Date(announcement.expiresAt).toLocaleString()}</span>
                                  )}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements</h3>
                        <p className="text-gray-600">
                          Create your first platform announcement to keep users informed.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Generate and download comprehensive reports of platform activity.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Activity Report</h3>
                                <p className="text-sm text-gray-600">Complete platform activity data</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full mt-4" 
                              onClick={handleDownloadActivityReport}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download JSON
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Analytics Report</h3>
                                <p className="text-sm text-gray-600">User engagement metrics</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full mt-4"
                              disabled
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Coming Soon
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </div>
  );
}
