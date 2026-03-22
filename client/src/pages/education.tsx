import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { LearningPaths } from "@/components/education/learning-paths";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Education() {
  return (
    <div className="min-h-screen bg-primary-950 text-white">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-primary-950 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-heading font-bold mb-6">
              <span className="text-gold">Precious Metals</span> Education Center
            </h1>
            <p className="text-xl text-yellow-300 max-w-4xl mx-auto mb-8">
              Comprehensive educational resources to build your precious metals knowledge. 
              From beginner fundamentals to advanced market analysis and identification techniques.
            </p>
            
            {/* Education Overview */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="glass-morphism rounded-xl p-6">
                <div className="text-3xl font-bold text-gold mb-2">3</div>
                <div className="text-sm text-yellow-400">Learning Paths</div>
              </div>
              <div className="glass-morphism rounded-xl p-6">
                <div className="text-3xl font-bold text-silver mb-2">6</div>
                <div className="text-sm text-yellow-400">Topic Areas</div>
              </div>
              <div className="glass-morphism rounded-xl p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">Free</div>
                <div className="text-sm text-yellow-400">All Content</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <LearningPaths />

      {/* Popular Topics */}
      <section className="py-16 bg-primary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Popular Topics</h2>
            <p className="text-lg text-yellow-300">Most searched educational content by our community</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Authentication Topic */}
            <Card className="glass-morphism border-white/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-shield-alt text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Gold Authentication</h3>
                    <Badge className="bg-red-500/20 text-red-400 text-xs">Expert Level</Badge>
                  </div>
                </div>
                <p className="text-yellow-400 text-sm mb-4">
                  Learn to identify authentic gold coins and bullion. Understand testing methods, 
                  visual inspection techniques, and common counterfeits.
                </p>
                <div className="flex justify-between items-center text-xs text-yellow-500 mb-4">
                  <span>Guides</span>
                  <span>Reference Materials</span>
                </div>
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            {/* Market Analysis Topic */}
            <Card className="glass-morphism border-white/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Market Analysis</h3>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">Intermediate</Badge>
                  </div>
                </div>
                <p className="text-yellow-400 text-sm mb-4">
                  Understanding precious metals markets, price trends, economic indicators, 
                  and investment strategies for portfolio optimization.
                </p>
                <div className="flex justify-between items-center text-xs text-yellow-500 mb-4">
                  <span>Guides</span>
                  <span>Reference Materials</span>
                </div>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            {/* Coin Grading Topic */}
            <Card className="glass-morphism border-white/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-eye text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Coin Grading</h3>
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs">Beginner</Badge>
                  </div>
                </div>
                <p className="text-yellow-400 text-sm mb-4">
                  Learn the Sheldon Scale, evaluate coin conditions, 
                  understand grading standards, and recognize value factors.
                </p>
                <div className="flex justify-between items-center text-xs text-yellow-500 mb-4">
                  <span>Guides</span>
                  <span>Reference Materials</span>
                </div>
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            {/* Investment Strategies Topic */}
            <Card className="glass-morphism border-white/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-piggy-bank text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Investment Strategies</h3>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Intermediate</Badge>
                  </div>
                </div>
                <p className="text-yellow-400 text-sm mb-4">
                  Build effective precious metals portfolios, understand dollar-cost averaging, 
                  storage options, and tax implications.
                </p>
                <div className="flex justify-between items-center text-xs text-yellow-500 mb-4">
                  <span>Guides</span>
                  <span>Reference Materials</span>
                </div>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            {/* Historical Context Topic */}
            <Card className="glass-morphism border-white/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-scroll text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Historical Context</h3>
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Beginner</Badge>
                  </div>
                </div>
                <p className="text-yellow-400 text-sm mb-4">
                  Explore the history of precious metals, significant coin series, 
                  mint marks, and the evolution of currency systems.
                </p>
                <div className="flex justify-between items-center text-xs text-yellow-500 mb-4">
                  <span>Guides</span>
                  <span>Reference Materials</span>
                </div>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900">
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            {/* Testing Methods Topic */}
            <Card className="glass-morphism border-white/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-vial text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Testing Methods</h3>
                    <Badge className="bg-orange-500/20 text-orange-400 text-xs">Expert Level</Badge>
                  </div>
                </div>
                <p className="text-yellow-400 text-sm mb-4">
                  Advanced testing techniques including acid tests, electronic testing, 
                  magnet tests, and professional equipment usage.
                </p>
                <div className="flex justify-between items-center text-xs text-yellow-500 mb-4">
                  <span>Guides</span>
                  <span>Reference Materials</span>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About the Content */}
      <section className="py-16 bg-primary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glass-morphism border-white/20">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">About This Content</h2>
                <p className="text-yellow-300 max-w-2xl mx-auto">
                  Educational content on <span className="simpleton-brand">Simpleton</span> is based on industry-standard references 
                  including GIA grading standards, US Mint specifications, and established precious 
                  metals purity standards. This content is for educational purposes only and should not 
                  be considered investment advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
