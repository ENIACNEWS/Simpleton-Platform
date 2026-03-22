import { useState } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { DiamondCalculator } from "@/components/calculator/diamond-calculator";
import { DiamondEducation } from "@/components/diamonds/diamond-education";
import { DiamondPricing } from "@/components/diamonds/diamond-pricing";
import { DiamondGrading } from "@/components/diamonds/diamond-grading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIAssistant } from "@/components/ai-assistant";
import { NewsTicker } from "@/components/news/news-ticker";
import { Diamond, TrendingUp, BookOpen, Calculator, Newspaper } from "lucide-react";

export default function Diamonds() {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary-950 text-white diamond-excellence-page">
      <Navigation onAIToggle={() => setIsAIOpen(true)} />
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-4 animate-slide-up">
            <div className="flex justify-center mb-6">
              <Diamond className="h-16 w-16 text-blue-400" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-heading font-bold leading-tight">
              Diamond <span className="text-blue-400">Excellence</span> Center
            </h1>
            <p className="text-xl text-yellow-300 max-w-3xl mx-auto">
              Professional diamond grading, pricing, and certification tools. Master the 4Cs, understand market pricing, and make informed diamond investments.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="news" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 glass-morphism">
              <TabsTrigger value="news" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                News & Ticker
              </TabsTrigger>
              <TabsTrigger value="grading" className="flex items-center gap-2">
                <Diamond className="h-4 w-4" />
                Grading Scales
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Education
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Market Pricing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="space-y-6">
              {/* Beta Testing Notice */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 border-l-4 border-blue-400 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-100">
                      <span className="font-bold text-red-400">BETA</span> testing please email feedback to, <span className="font-semibold">INTEL@SIMPLETONAPP.COM</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Diamond News Ticker */}
              <div className="py-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 rounded-lg">
                <div className="max-w-7xl mx-auto">
                  <NewsTicker category="diamonds" />
                </div>
              </div>

              {/* Advanced Cyberpunk Diamond News Section */}
              <div className="py-16 bg-black relative overflow-hidden rounded-xl">
                {/* Holographic Grid Background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                  }} />
                </div>

                {/* Scanning Beams */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse" 
                       style={{ left: '20%', animationDelay: '0s', animationDuration: '4s' }} />
                  <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-pulse" 
                       style={{ left: '60%', animationDelay: '2s', animationDuration: '4s' }} />
                  <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-pulse" 
                       style={{ left: '80%', animationDelay: '1s', animationDuration: '4s' }} />
                </div>

                {/* Corner Holographic Effects */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-transparent blur-xl animate-pulse" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/30 to-transparent blur-xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/30 to-transparent blur-xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-400/30 to-transparent blur-xl animate-pulse" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                      💎 DIAMOND-FEED::LIVE
                    </h2>
                    <p className="text-xl text-gray-300 mb-6">
                      [ GEMOLOGICAL INTELLIGENCE NETWORK ]
                    </p>
                  </div>

                  {/* Cyberpunk Diamond News Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Diamond News Article 1 */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                          <span className="text-cyan-400 text-sm font-mono">RAPAPORT</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                          Lab-grown diamonds capture 15% market share in Q4
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Synthetic diamond market continues rapid growth, capturing significant market share from natural diamonds in jewelry sector.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">8 minutes ago</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            <span className="text-yellow-400 text-xs">NEUTRAL</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diamond News Article 2 */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-purple-400 rounded-full mr-3 animate-pulse" />
                          <span className="text-purple-400 text-sm font-mono">IDEX</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                          Natural diamond prices remain stable despite market shifts
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          International diamond exchange reports steady pricing for natural diamonds amid growing lab-grown competition.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">20 minutes ago</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            <span className="text-yellow-400 text-xs">NEUTRAL</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diamond News Article 3 */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-pink-500/30 rounded-xl p-6 hover:border-pink-400/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-pink-400 rounded-full mr-3 animate-pulse" />
                          <span className="text-pink-400 text-sm font-mono">JCK MAGAZINE</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-pink-400 transition-colors">
                          GIA processing delays affect diamond certifications
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Gemological Institute of America experiences processing delays, impacting diamond certification timelines worldwide.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">30 minutes ago</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                            <span className="text-red-400 text-xs">NEGATIVE</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diamond News Article 4 */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse" />
                          <span className="text-blue-400 text-sm font-mono">NATIONAL JEWELER</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                          Holiday retail demand drives diamond jewelry sales up 8%
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Strong holiday shopping season boosts diamond jewelry sales, with engagement rings leading growth categories.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">40 minutes ago</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-xs">POSITIVE</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diamond News Article 5 */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse" />
                          <span className="text-green-400 text-sm font-mono">RAPAPORT</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-green-400 transition-colors">
                          Rapaport updates pricing methodology for lab-grown diamonds
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Major pricing guide implements new methodology for lab-grown diamond valuations, reflecting market maturity.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">50 minutes ago</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            <span className="text-yellow-400 text-xs">NEUTRAL</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diamond News Article 6 */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 bg-purple-400 rounded-full mr-3 animate-pulse" />
                          <span className="text-purple-400 text-sm font-mono">DIAMOND INTELLIGENCE</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                          De Beers announces new synthetic diamond detection technology
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Advanced detection technology improves ability to distinguish between natural and synthetic diamonds in trade.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">70 minutes ago</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            <span className="text-yellow-400 text-xs">NEUTRAL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="grading" className="space-y-6">
              <DiamondGrading />
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <DiamondEducation />
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <DiamondPricing />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}