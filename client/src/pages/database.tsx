import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { PremiumCoinDatabase } from "@/components/database/premium-coin-database";
import { PricingHistoryChart } from "@/components/database/pricing-history-chart";
import { CoinComparisonTool } from "@/components/database/coin-comparison-tool";
import { CoinPortfolioTracker } from "@/components/database/coin-portfolio-tracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsTicker } from "@/components/news/news-ticker";

export default function Database() {
  return (
    <div className="min-h-screen bg-primary-950 text-white">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-primary-950 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-heading font-bold mb-6">
              Comprehensive <span className="text-gold">Coin Database</span>
            </h1>
            <p className="text-xl text-yellow-300 max-w-4xl mx-auto mb-8">
              Explore our extensive database of US gold and silver coins with complete specifications, 
              historical context, metal content analysis, and current market valuations. Professional-grade 
              data for collectors, dealers, and investors.
            </p>
            
            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="glass-morphism rounded-xl p-6">
                <div className="w-12 h-12 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-coins text-yellow-900 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Complete Specifications</h3>
                <p className="text-sm text-yellow-400">Weight, purity, diameter, mintage, and historical data for every coin</p>
              </div>
              
              <div className="glass-morphism rounded-xl p-6">
                <div className="w-12 h-12 silver-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-search text-yellow-900 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
                <p className="text-sm text-yellow-400">Filter by metal type, year range, mint mark, and custom criteria</p>
              </div>
              
              <div className="glass-morphism rounded-xl p-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calculator text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Live Melt Values</h3>
                <p className="text-sm text-yellow-400">Real-time metal value calculations based on current market prices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Database Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Tabs defaultValue="coins" className="space-y-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 glass-morphism">
            <TabsTrigger value="coins" className="text-sm data-[state=active]:bg-gold data-[state=active]:text-yellow-900">
              🪙 All Coins
            </TabsTrigger>
            <TabsTrigger value="comparison" className="text-sm data-[state=active]:bg-gold data-[state=active]:text-yellow-900">
              ⚖️ Compare
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-sm data-[state=active]:bg-gold data-[state=active]:text-yellow-900">
              💼 Portfolio
            </TabsTrigger>
            <TabsTrigger value="prices" className="text-sm data-[state=active]:bg-gold data-[state=active]:text-yellow-900">
              📈 Prices
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="coins">
            <PremiumCoinDatabase />
          </TabsContent>
          
          <TabsContent value="comparison">
            <CoinComparisonTool />
          </TabsContent>
          
          <TabsContent value="portfolio">
            <CoinPortfolioTracker />
          </TabsContent>
          
          <TabsContent value="prices" className="space-y-8">
            <PricingHistoryChart />
          </TabsContent>
        </Tabs>
      </div>

      {/* Beta Testing Notice */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 border-l-4 border-blue-400 p-4 mx-4 mb-6 rounded-lg">
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

      {/* Coin News Ticker */}
      <div className="py-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <NewsTicker category="coins" />
        </div>
      </div>

      {/* Advanced Cyberpunk Coin News Section */}
      <div className="py-16 bg-black relative overflow-hidden">
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
          <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse" 
               style={{ left: '80%', animationDelay: '1s', animationDuration: '4s' }} />
        </div>

        {/* Corner Holographic Effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-transparent blur-xl animate-pulse" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/30 to-transparent blur-xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-400/30 to-transparent blur-xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-400/30 to-transparent blur-xl animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              🪙 COIN-FEED::LIVE
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              [ NUMISMATIC INTELLIGENCE NETWORK ]
            </p>
          </div>

          {/* Cyberpunk Coin News Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Coin News Article 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                  <span className="text-cyan-400 text-sm font-mono">HERITAGE AUCTIONS</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  1933 Double Eagle coin sells for record $18.9 million at auction
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Historic auction sets new world record for most expensive coin ever sold, highlighting rare coin market strength.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">6 minutes ago</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs">POSITIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coin News Article 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/90 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-purple-400 rounded-full mr-3 animate-pulse" />
                  <span className="text-purple-400 text-sm font-mono">PCGS</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  PCGS coin grading services expand authentication technology
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Advanced authentication technology improves counterfeit detection and grading accuracy for collectors worldwide.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">25 minutes ago</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs">POSITIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coin News Article 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/90 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse" />
                  <span className="text-blue-400 text-sm font-mono">US MINT</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  US Mint announces 2024 American Silver Eagle production numbers
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Official production figures reveal strong demand for silver eagles as precious metals investment continues growing.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">15 minutes ago</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-yellow-400 text-xs">NEUTRAL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coin News Article 4 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-pink-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/90 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse" />
                  <span className="text-green-400 text-sm font-mono">HERITAGE AUCTIONS</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-green-400 transition-colors">
                  Morgan Silver Dollar values surge 12% in collector market
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Strong collector demand drives Morgan Silver Dollar prices to new highs across all grades and date ranges.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">35 minutes ago</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs">POSITIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coin News Article 5 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/90 backdrop-blur-sm border border-pink-500/30 rounded-xl p-6 hover:border-pink-400/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-pink-400 rounded-full mr-3 animate-pulse" />
                  <span className="text-pink-400 text-sm font-mono">NUMISMATIC NEWS</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-pink-400 transition-colors">
                  Rare 1916-D Mercury Dime discovered in estate collection
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Incredible discovery of key date Mercury Dime in pristine condition creates excitement in numismatic community.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">45 minutes ago</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs">POSITIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coin News Article 6 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-green-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse" />
                  <span className="text-cyan-400 text-sm font-mono">CLASSICAL NUMISMATIC</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  Ancient Roman coins fetch $2.3M at international auction
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Historic collection of ancient Roman coins achieves record prices, demonstrating strong international demand.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">85 minutes ago</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs">POSITIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
