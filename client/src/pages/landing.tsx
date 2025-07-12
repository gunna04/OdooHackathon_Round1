import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Users, 
  Search, 
  MessageCircle, 
  Shield, 
  Star,
  CheckCircle,
  Zap,
  Globe,
  Heart,
  TrendingUp,
  Clock,
  Award
} from "lucide-react";

export default function Landing() {
  const skills = [
    { name: "Web Development", users: 234, color: "bg-blue-500" },
    { name: "Data Science", users: 189, color: "bg-green-500" },
    { name: "Design", users: 156, color: "bg-purple-500" },
    { name: "Marketing", users: 143, color: "bg-pink-500" },
    { name: "Photography", users: 98, color: "bg-yellow-500" },
    { name: "Languages", users: 312, color: "bg-indigo-500" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      skill: "Web Developer → UX Designer",
      quote: "I traded my coding skills for design expertise. Amazing experience!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      skill: "Photographer → Marketing",
      quote: "Found the perfect mentor who needed my photography skills.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      skill: "Chef → Language Teacher",
      quote: "Cooking lessons for Spanish tutoring - perfect match!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillSwap
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:bg-gray-100"
                onClick={() => window.location.href = '/api/login'}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                onClick={() => window.location.href = '/api/login'}
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Join 1,000+ skill swappers worldwide
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 leading-tight">
                Trade Skills,<br />
                Grow Together
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl">
                The world's most exciting platform for skill exchange. Learn something new while teaching what you love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl transform hover:scale-105 transition-all"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Start Swapping Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                >
                  Watch Demo
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  Free to join
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-1" />
                  2 min setup
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-purple-500 mr-1" />
                  Verified users
                </div>
              </div>
            </div>
            
            {/* Skills Animation */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {skills.map((skill, index) => (
                  <Card key={index} className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className={`w-3 h-3 ${skill.color} rounded-full mb-2`}></div>
                      <h3 className="font-semibold text-gray-900 mb-1">{skill.name}</h3>
                      <p className="text-sm text-gray-600">{skill.users} users</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
              Simple Process, Amazing Results
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands discovering new skills through our proven exchange system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">1. Create Profile</h3>
                <p className="text-gray-600 leading-relaxed">
                  List your expertise and what you're excited to learn. Set your schedule and preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">2. Find Matches</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our smart algorithm connects you with perfect skill exchange partners nearby or online.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">3. Start Swapping</h3>
                <p className="text-gray-600 leading-relaxed">
                  Send requests, plan sessions, and begin your exciting skill exchange journey together.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">4. Grow & Share</h3>
                <p className="text-gray-600 leading-relaxed">
                  Rate experiences and build your reputation in our thriving skill-sharing community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600">Real people, real skill exchanges, real growth</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.skill}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Skill Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community today and discover the joy of learning through teaching.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl transform hover:scale-105 transition-all text-lg px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started for Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-blue-100 text-sm mt-4">
            No credit card required • Join in under 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold">SkillSwap</h3>
              </div>
              <p className="text-gray-400">
                Connecting passionate learners and skilled teachers worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>How it works</li>
                <li>Success stories</li>
                <li>Community</li>
                <li>Safety</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help center</li>
                <li>Contact us</li>
                <li>Trust & safety</li>
                <li>Terms of service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Newsletter</li>
                <li>Social media</li>
                <li>Blog</li>
                <li>Partner with us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
