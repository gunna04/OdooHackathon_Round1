import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, User, TrendingUp, Users, Star } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Get recent activity and stats
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

  const { data: recentSwaps } = useQuery({
    queryKey: ["/api/swap-requests"],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/swap-requests", {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const recentSwapsList = recentSwaps?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-[var(--platform-bg)]">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {getGreeting()}, {user.firstName || 'there'}!
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
                Ready to discover new skills or share your expertise today?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/search">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-50">
                    <Search className="mr-2 w-4 h-4" />
                    Find Skills
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    <User className="mr-2 w-4 h-4" />
                    Update Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats & Actions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{user.skills?.filter((s: any) => s.type === 'offered').length || 0}</h3>
                  <p className="text-gray-600">Skills Offered</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{recentSwapsList.length}</h3>
                  <p className="text-gray-600">Active Swaps</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
                  <p className="text-gray-600">Average Rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/search">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Search className="w-8 h-8 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Browse Skills</h3>
                      <p className="text-gray-600">Find experts and request skill exchanges</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/inbox">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <MessageCircle className="w-8 h-8 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Check Messages</h3>
                      <p className="text-gray-600">Manage your swap requests and conversations</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/profile">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <User className="w-8 h-8 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Update Profile</h3>
                      <p className="text-gray-600">Manage your skills and availability</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Recent Activity</h2>
              <Link href="/inbox">
                <Button variant="outline">View All</Button>
              </Link>
            </div>

            {recentSwapsList.length > 0 ? (
              <div className="space-y-4">
                {recentSwapsList.map((swap: any) => (
                  <Card key={swap.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <img
                            className="w-12 h-12 rounded-full object-cover"
                            src={swap.requester.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                            alt={`${swap.requester.firstName}'s profile`}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {swap.requesterId === user.id ? swap.receiver.firstName : swap.requester.firstName} {swap.requesterId === user.id ? swap.receiver.lastName : swap.requester.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {swap.requesterId === user.id ? 'You requested' : 'Requested'} a skill swap
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(swap.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={swap.status === 'pending' ? 'secondary' : swap.status === 'accepted' ? 'default' : 'destructive'}>
                          {swap.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-gray-600 mb-6">Start by browsing skills or updating your profile</p>
                  <Link href="/search">
                    <Button>Browse Skills</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Admin Quick Access (if admin) */}
        {user.isAdmin && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
                <Link href="/admin">
                  <Button>Full Dashboard</Button>
                </Link>
              </div>

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Active Swaps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeSwaps}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Pending Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalReports}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
