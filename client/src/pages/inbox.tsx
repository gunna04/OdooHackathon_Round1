import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import SwapRequestCard from "@/components/swap-request-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, CheckCircle, Star, Inbox } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { SwapRequestWithDetails } from "@shared/schema";

type FilterType = "all" | "pending" | "active" | "completed";

export default function InboxPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { data: swapRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["/api/swap-requests"],
    enabled: !!user,
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: string }) => {
      await apiRequest("PUT", `/api/swap-requests/${requestId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swap-requests"] });
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
        description: "Failed to update request. Please try again.",
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

  if (!user) return null;

  const requests = swapRequests || [];
  
  // Filter requests based on active filter
  const filteredRequests = requests.filter((request: SwapRequestWithDetails) => {
    switch (activeFilter) {
      case "pending":
        return request.status === "pending";
      case "active":
        return request.status === "accepted";
      case "completed":
        return request.status === "completed";
      default:
        return true;
    }
  });

  const getFilterCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter((r: SwapRequestWithDetails) => r.status === "pending").length,
      active: requests.filter((r: SwapRequestWithDetails) => r.status === "accepted").length,
      completed: requests.filter((r: SwapRequestWithDetails) => r.status === "completed").length,
    };
  };

  const filterCounts = getFilterCounts();

  const handleAcceptRequest = (requestId: number) => {
    updateStatusMutation.mutate({ requestId, status: "accepted" });
  };

  const handleRejectRequest = (requestId: number) => {
    updateStatusMutation.mutate({ requestId, status: "rejected" });
  };

  const handleCompleteRequest = (requestId: number) => {
    updateStatusMutation.mutate({ requestId, status: "completed" });
  };

  return (
    <div className="min-h-screen bg-[var(--platform-bg)]">
      <Navigation />
      
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Inbox</h1>
              <p className="text-lg text-gray-600">Manage your swap requests and conversations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <Button
                        variant={activeFilter === "all" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveFilter("all")}
                      >
                        <Inbox className="mr-2 h-4 w-4" />
                        All Messages ({filterCounts.all})
                      </Button>
                      <Button
                        variant={activeFilter === "pending" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveFilter("pending")}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Pending ({filterCounts.pending})
                      </Button>
                      <Button
                        variant={activeFilter === "active" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveFilter("active")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Active Swaps ({filterCounts.active})
                      </Button>
                      <Button
                        variant={activeFilter === "completed" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveFilter("completed")}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Completed ({filterCounts.completed})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Message List */}
              <div className="lg:col-span-3">
                {isLoadingRequests ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          </div>
                          <div className="h-16 bg-gray-200 rounded mb-4"></div>
                          <div className="flex justify-between">
                            <div className="h-8 bg-gray-200 rounded w-24"></div>
                            <div className="h-8 bg-gray-200 rounded w-32"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredRequests.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRequests.map((request: SwapRequestWithDetails) => (
                      <SwapRequestCard
                        key={request.id}
                        request={request}
                        currentUserId={user.id}
                        onAccept={() => handleAcceptRequest(request.id)}
                        onReject={() => handleRejectRequest(request.id)}
                        onComplete={() => handleCompleteRequest(request.id)}
                        isLoading={updateStatusMutation.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activeFilter === "all" 
                          ? "No messages yet" 
                          : `No ${activeFilter} requests`
                        }
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {activeFilter === "all"
                          ? "Start by browsing skills and sending swap requests to other users."
                          : `You don't have any ${activeFilter} requests at the moment.`
                        }
                      </p>
                      <Button onClick={() => window.location.href = '/search'}>
                        Browse Skills
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
