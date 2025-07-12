import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import SkillInput from "@/components/skill-input";
import AvailabilityScheduler from "@/components/availability-scheduler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, User, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { UserWithSkills } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [offeredSkills, setOfferedSkills] = useState<Array<{name: string, level: string}>>([]);
  const [wantedSkills, setWantedSkills] = useState<Array<{name: string, level: string}>>([]);
  const [availability, setAvailability] = useState<Array<{dayOfWeek: number, startTime: string, endTime: string}>>([]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setLocation(user.location || "");
      setIsPublic(user.isPublic ?? true);
      
      const offered = user.skills?.filter(s => s.type === 'offered').map(s => ({
        name: s.name,
        level: s.level
      })) || [];
      
      const wanted = user.skills?.filter(s => s.type === 'wanted').map(s => ({
        name: s.name,
        level: s.level
      })) || [];
      
      setOfferedSkills(offered);
      setWantedSkills(wanted);
      setAvailability(user.availability || []);
    }
  }, [user]);

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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/users/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSkillsMutation = useMutation({
    mutationFn: async (skills: Array<{name: string, level: string, type: string}>) => {
      // Delete existing skills first, then add new ones
      if (user?.skills) {
        await Promise.all(
          user.skills.map(skill => 
            apiRequest("DELETE", `/api/skills/${skill.id}`)
          )
        );
      }
      
      // Add new skills
      await Promise.all(
        skills.map(skill => 
          apiRequest("POST", "/api/skills", skill)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to update skills. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (availabilityData: any) => {
      await apiRequest("PUT", "/api/availability", availabilityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    if (!user) return;

    try {
      // Update profile
      await updateProfileMutation.mutateAsync({ bio, location, isPublic });
      
      // Update skills
      const allSkills = [
        ...offeredSkills.map(s => ({ ...s, type: 'offered' })),
        ...wantedSkills.map(s => ({ ...s, type: 'wanted' }))
      ];
      await updateSkillsMutation.mutateAsync(allSkills);
      
      // Update availability
      await updateAvailabilityMutation.mutateAsync(availability);
      
    } catch (error) {
      // Error handling is done in individual mutations
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const isSaving = updateProfileMutation.isPending || updateSkillsMutation.isPending || updateAvailabilityMutation.isPending;

  return (
    <div className="min-h-screen bg-[var(--platform-bg)]">
      <Navigation />
      
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Manage Your Profile</h1>
              <p className="text-lg text-gray-600">Keep your skills and availability up to date</p>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Profile Photo & Basic Info */}
                  <div className="lg:col-span-1">
                    <div className="text-center">
                      <img
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                        src={user.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face`}
                        alt="Profile Picture"
                      />
                      <Button variant="outline" size="sm" className="mb-6">
                        <Camera className="mr-2 w-4 h-4" />
                        Change Photo
                      </Button>
                      
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">Profile Visibility</span>
                          <Switch
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                          />
                        </div>
                        <p className="text-xs text-gray-600">
                          Public profiles are discoverable by other users
                        </p>
                      </Card>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          value={`${user.firstName || ''} ${user.lastName || ''}`.trim()}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Name is managed by your account</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., San Francisco, CA"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <Textarea
                        rows={3}
                        placeholder="Tell others about yourself and your expertise..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>

                    {/* Skills Offered */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Skills You Offer
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {offeredSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {skill.name} ({skill.level})
                          </Badge>
                        ))}
                      </div>
                      <SkillInput
                        onSkillAdd={(skill) => setOfferedSkills(prev => [...prev, skill])}
                        onSkillRemove={(index) => setOfferedSkills(prev => prev.filter((_, i) => i !== index))}
                        placeholder="Add a skill you can teach..."
                      />
                    </div>

                    {/* Skills Wanted */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Skills You Want to Learn
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {wantedSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                      <SkillInput
                        onSkillAdd={(skill) => setWantedSkills(prev => [...prev, { name: skill.name, level: 'any' }])}
                        onSkillRemove={(index) => setWantedSkills(prev => prev.filter((_, i) => i !== index))}
                        placeholder="Add a skill you want to learn..."
                        hideLevel={true}
                      />
                    </div>

                    {/* Availability Scheduler */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Availability
                      </label>
                      <AvailabilityScheduler
                        availability={availability}
                        onChange={setAvailability}
                      />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end space-x-4 pt-6">
                      <Button variant="outline" disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
