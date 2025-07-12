import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import UserProfileCard from "@/components/user-profile-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [skillType, setSkillType] = useState("");
  const [level, setLevel] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users/search", { q: searchQuery, location, skillType, level }],
    enabled: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will automatically refetch due to key change
  };

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'location':
        setLocation("");
        break;
      case 'skillType':
        setSkillType("");
        break;
      case 'level':
        setLevel("");
        break;
    }
    setActiveFilters(prev => prev.filter(f => f !== filterType));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setLocation("");
    setSkillType("");
    setLevel("");
    setActiveFilters([]);
  };

  // Update active filters when filters change
  useState(() => {
    const filters = [];
    if (location) filters.push('location');
    if (skillType) filters.push('skillType');
    if (level) filters.push('level');
    setActiveFilters(filters);
  });

  return (
    <div className="min-h-screen bg-[var(--platform-bg)]">
      <Navigation />
      
      <main className="pt-16">
        {/* Header Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Skills</h1>
              <p className="text-lg text-gray-600">Find experts in any field and connect for skill exchanges</p>
            </div>

            {/* Search Interface */}
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Skills
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="e.g., Photoshop, Excel, Guitar..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Location</SelectItem>
                          <SelectItem value="New York">New York</SelectItem>
                          <SelectItem value="San Francisco">San Francisco</SelectItem>
                          <SelectItem value="London">London</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Filters */}
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {location && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Location: {location}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeFilter('location')}
                          />
                        </Badge>
                      )}
                      {skillType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Type: {skillType}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeFilter('skillType')}
                          />
                        </Badge>
                      )}
                      {level && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Level: {level}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeFilter('level')}
                          />
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </Button>
                    </div>
                  )}

                  {/* Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Select value={skillType} onValueChange={setSkillType}>
                      <SelectTrigger className="w-auto">
                        <Filter className="h-4 w-4 mr-1" />
                        <SelectValue placeholder="Skill Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="offered">Skills Offered</SelectItem>
                        <SelectItem value="wanted">Skills Wanted</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="w-auto">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button type="submit" variant="outline">
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Found {users.length} {users.length === 1 ? 'result' : 'results'}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <UserProfileCard key={user.id} user={user} />
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or explore different skills.
                  </p>
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
