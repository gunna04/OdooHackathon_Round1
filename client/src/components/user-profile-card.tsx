import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Star, Clock, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { UserWithSkills } from "@shared/schema";

interface UserProfileCardProps {
  user: UserWithSkills;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState<number | null>(null);
  const [selectedWantedSkill, setSelectedWantedSkill] = useState<number | null>(null);

  // Check if this is the current user's profile
  const isCurrentUser = currentUser?.id === user.id;

  const sendRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      await apiRequest("POST", "/api/swap-requests", requestData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Swap request sent successfully!",
      });
      setIsRequestDialogOpen(false);
      setRequestMessage("");
      setSelectedOfferedSkill(null);
      setSelectedWantedSkill(null);
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
        description: "Failed to send swap request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const offeredSkills = user.skills.filter(skill => skill.type === 'offered');
  const wantedSkills = user.skills.filter(skill => skill.type === 'wanted');

  const getOnlineStatus = () => {
    // In a real app, this would be based on actual online status
    const statuses = ['online', 'away', 'offline'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      status,
      color: status === 'online' ? 'bg-green-400' : status === 'away' ? 'bg-yellow-400' : 'bg-gray-400',
      text: status === 'online' ? 'Online' : status === 'away' ? 'Away' : 'Offline'
    };
  };

  const getAvailabilityText = () => {
    if (!user.availability || user.availability.length === 0) {
      return "Availability not set";
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const availableDays = user.availability.map(slot => dayNames[slot.dayOfWeek]);
    
    if (availableDays.length === 7) {
      return "Available daily";
    } else if (availableDays.includes('Saturday') || availableDays.includes('Sunday')) {
      return "Available weekends";
    } else {
      return "Available weekdays";
    }
  };

  const getRating = () => {
    // In a real app, this would come from actual reviews
    return {
      rating: 4.8,
      count: 15
    };
  };

  const handleSendRequest = () => {
    if (!requestMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message for your swap request.",
        variant: "destructive",
      });
      return;
    }

    const requestData = {
      receiverId: user.id,
      message: requestMessage,
      offeredSkillId: selectedOfferedSkill,
      requestedSkillId: selectedWantedSkill,
    };

    sendRequestMutation.mutate(requestData);
  };

  const onlineStatus = getOnlineStatus();
  const rating = getRating();

  return (
    <Card className="profile-card hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <img
              className="w-16 h-16 rounded-full object-cover"
              src={user.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face`}
              alt={`${user.firstName}'s profile`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            {user.location && (
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {user.location}
              </p>
            )}
            <div className="flex items-center mt-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(rating.rating) ? 'fill-current' : ''}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                {rating.rating} ({rating.count})
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 ${onlineStatus.color} rounded-full`}></div>
            <span className="text-xs text-gray-500 ml-1">{onlineStatus.text}</span>
          </div>
        </div>

        {user.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{user.bio}</p>
        )}

        {offeredSkills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Offered</h4>
            <div className="flex flex-wrap gap-1">
              {offeredSkills.slice(0, 3).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="skill-chip bg-green-100 text-green-800 text-xs">
                  {skill.name}
                </Badge>
              ))}
              {offeredSkills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{offeredSkills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {wantedSkills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Wanted</h4>
            <div className="flex flex-wrap gap-1">
              {wantedSkills.slice(0, 3).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="skill-chip bg-blue-100 text-blue-800 text-xs">
                  {skill.name}
                </Badge>
              ))}
              {wantedSkills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{wantedSkills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {getAvailabilityText()}
          </div>
          {isCurrentUser ? (
            <Button size="sm" variant="outline" disabled>
              <MessageSquare className="w-3 h-3 mr-1" />
              Your Profile
            </Button>
          ) : (
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Request Swap
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Request Swap with {user.firstName}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your message
                    </label>
                    <Textarea
                      placeholder="Introduce yourself and explain what you'd like to learn and teach..."
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsRequestDialogOpen(false)}
                      disabled={sendRequestMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendRequest}
                      disabled={sendRequestMutation.isPending}
                    >
                      {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
