import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  BarChart3, 
  Clock, 
  Flag, 
  Download, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Shield,
  TrendingUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: allSwapRequests } = useQuery({
    queryKey: ["/api/admin/swap-requests"],
    enabled: !!user?.isAdmin,
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/admin/reports"],
    enabled: !!user?.isAdmin,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  const handleApproveReport = (reportId: number) => {
    updateReportMutation.mutate({ reportId, status: "resolved" });
  };

  const handleRejectReport = (reportId: number) => {
    updateReportMutation.mutate({ reportId, status: "reviewed" });
  };

  const handleDownloadReports = () => {
    toast({
      title: "Download Started",
      description: "Your activity report is being generated...",
    });
    // In a real app, this would trigger a CSV download
  };

  const handleBroadcastMessage = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Broadcast messaging will be available in the next update.",
    });
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
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

              {/* Admin Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleBroadcastMessage}
                    >
                      <MessageSquare className="mr-3 h-4 w-4 text-primary" />
                      Send Platform Announcement
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleDownloadReports}
                    >
                      <Download className="mr-3 h-4 w-4 text-primary" />
                      Download Activity Reports
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
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
                    >
                      <Shield className="mr-3 h-4 w-4 text-primary" />
                      Manage Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Reports Table */}
            {reports && reports.length > 0 && (
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
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
