import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Lightbulb, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  Target,
  Gem,
  CreditCard,
  FileCheck,
  Scissors,
  Palette,
  Search,
  Weight,
  Zap,
  Microscope,
  Award,
  Beaker,
  Hexagon,
  Layers,
  Info,
  TrendingUp
} from "lucide-react";

export function DiamondEducation() {
  return (
    <div className="diamond-education space-y-8">
      {/* Professional Diamond Education Tabs */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Gem className="h-8 w-8 text-blue-400" />
          <h2 className="text-4xl font-bold">Professional Diamond Education</h2>
          <Badge className="bg-blue-600 text-white">GIA Standards</Badge>
        </div>
        <p className="text-yellow-300 text-lg">
          Master the fundamentals of diamond grading with GIA-level professionalism. 
          Learn to evaluate the 4 C's, understand certification, and distinguish between natural and synthetic diamonds.
        </p>
      </div>

      <Tabs defaultValue="4cs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 glass-morphism">
          <TabsTrigger value="4cs">The 4 C's</TabsTrigger>
          <TabsTrigger value="laser">Laser Inscriptions</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="lab-grown">Lab-Grown Diamonds</TabsTrigger>
          <TabsTrigger value="simulants">Diamond Simulants</TabsTrigger>
          <TabsTrigger value="tips">Professional Tips</TabsTrigger>
        </TabsList>

        {/* The 4 C's Tab */}
        <TabsContent value="4cs" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Cut */}
            <Card className="glass-morphism p-6">
              <div className="flex items-center gap-3 mb-4">
                <Scissors className="h-6 w-6 text-blue-400" />
                <h3 className="text-2xl font-bold">Cut - The Most Important C</h3>
              </div>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>GIA Cut Grades</AlertTitle>
                  <AlertDescription>
                    Cut is the only C influenced by human craftsmanship and has the greatest impact on diamond beauty.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  {/* Excellent Cut */}
                  <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
                          {/* Perfect cut diamond with maximum light return */}
                          <polygon
                            points="40,8 65,28 40,72 15,28"
                            fill="url(#excellentGradient)"
                            stroke="#10B981"
                            strokeWidth="1.5"
                            className="animate-pulse"
                          />
                          {/* Table facet - perfectly proportioned */}
                          <polygon
                            points="40,8 50,18 40,28 30,18"
                            fill="#FFFFFF"
                            opacity="0.95"
                          />
                          {/* Crown facets - excellent proportions */}
                          <polygon points="30,18 15,28 25,22" fill="#F0F9FF" opacity="0.8" />
                          <polygon points="50,18 65,28 55,22" fill="#F0F9FF" opacity="0.8" />
                          {/* Pavilion - perfect light return */}
                          <polygon points="25,35 40,60 35,40" fill="#E0F2FE" opacity="0.7" />
                          <polygon points="55,35 40,60 45,40" fill="#E0F2FE" opacity="0.7" />
                          
                          <defs>
                            <radialGradient id="excellentGradient" cx="50%" cy="40%" r="60%">
                              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                              <stop offset="50%" stopColor="#F0F9FF" stopOpacity="0.7" />
                              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.5" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-green-400 text-lg">Excellent</span>
                          <Badge className="bg-green-600">Premium</Badge>
                        </div>
                        <p className="text-sm text-green-300">Maximum fire and brilliance. Reflects nearly all light entering the diamond.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Very Good Cut */}
                  <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
                          {/* Very good cut diamond with high light return */}
                          <polygon
                            points="40,10 63,30 40,70 17,30"
                            fill="url(#veryGoodGradient)"
                            stroke="#3B82F6"
                            strokeWidth="1.5"
                          />
                          {/* Table facet - very good proportions */}
                          <polygon
                            points="40,10 48,20 40,30 32,20"
                            fill="#FFFFFF"
                            opacity="0.85"
                          />
                          {/* Crown facets - very good proportions */}
                          <polygon points="32,20 17,30 27,24" fill="#F0F9FF" opacity="0.7" />
                          <polygon points="48,20 63,30 53,24" fill="#F0F9FF" opacity="0.7" />
                          {/* Pavilion - high light return */}
                          <polygon points="27,35 40,58 35,42" fill="#E0F2FE" opacity="0.6" />
                          <polygon points="53,35 40,58 45,42" fill="#E0F2FE" opacity="0.6" />
                          
                          <defs>
                            <radialGradient id="veryGoodGradient" cx="50%" cy="40%" r="60%">
                              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                              <stop offset="50%" stopColor="#F0F9FF" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.4" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-blue-400 text-lg">Very Good</span>
                          <Badge className="bg-blue-600">High Quality</Badge>
                        </div>
                        <p className="text-sm text-blue-300">Exceptional brilliance and fire. Reflects most light.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Good Cut */}
                  <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
                          {/* Good cut diamond with moderate light return */}
                          <polygon
                            points="40,12 61,32 40,68 19,32"
                            fill="url(#goodGradient)"
                            stroke="#EAB308"
                            strokeWidth="1.5"
                          />
                          {/* Table facet - good proportions */}
                          <polygon
                            points="40,12 46,22 40,32 34,22"
                            fill="#FFFFFF"
                            opacity="0.7"
                          />
                          {/* Crown facets - good proportions */}
                          <polygon points="34,22 19,32 29,26" fill="#F0F9FF" opacity="0.5" />
                          <polygon points="46,22 61,32 51,26" fill="#F0F9FF" opacity="0.5" />
                          {/* Pavilion - moderate light return */}
                          <polygon points="29,38 40,56 37,44" fill="#E0F2FE" opacity="0.4" />
                          <polygon points="51,38 40,56 43,44" fill="#E0F2FE" opacity="0.4" />
                          
                          <defs>
                            <radialGradient id="goodGradient" cx="50%" cy="40%" r="60%">
                              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                              <stop offset="50%" stopColor="#F9FAFB" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#F3F4F6" stopOpacity="0.3" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-yellow-400 text-lg">Good</span>
                          <Badge className="bg-yellow-600">Good Value</Badge>
                        </div>
                        <p className="text-sm text-yellow-300">Good brilliance and fire. Reflects some light.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fair Cut */}
                  <div className="p-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
                          {/* Fair cut diamond with limited light return */}
                          <polygon
                            points="40,14 59,34 40,66 21,34"
                            fill="url(#fairGradient)"
                            stroke="#F97316"
                            strokeWidth="1.5"
                          />
                          {/* Table facet - fair proportions */}
                          <polygon
                            points="40,14 44,24 40,34 36,24"
                            fill="#FFFFFF"
                            opacity="0.5"
                          />
                          {/* Crown facets - fair proportions */}
                          <polygon points="36,24 21,34 31,28" fill="#F9FAFB" opacity="0.3" />
                          <polygon points="44,24 59,34 49,28" fill="#F9FAFB" opacity="0.3" />
                          {/* Pavilion - limited light return */}
                          <polygon points="31,40 40,54 38,46" fill="#F3F4F6" opacity="0.2" />
                          <polygon points="49,40 40,54 42,46" fill="#F3F4F6" opacity="0.2" />
                          
                          <defs>
                            <radialGradient id="fairGradient" cx="50%" cy="40%" r="60%">
                              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                              <stop offset="50%" stopColor="#F9FAFB" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#F3F4F6" stopOpacity="0.2" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-orange-400 text-lg">Fair</span>
                          <Badge className="bg-orange-600">Limited</Badge>
                        </div>
                        <p className="text-sm text-orange-300">Limited brilliance and fire. Reflects limited light.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Poor Cut */}
                  <div className="p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="relative">
                        <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
                          {/* Poor cut diamond with minimal light return */}
                          <polygon
                            points="40,16 57,36 40,64 23,36"
                            fill="url(#poorGradient)"
                            stroke="#DC2626"
                            strokeWidth="1.5"
                          />
                          {/* Table facet - poor proportions */}
                          <polygon
                            points="40,16 42,26 40,36 38,26"
                            fill="#FFFFFF"
                            opacity="0.3"
                          />
                          {/* Crown facets - poor proportions */}
                          <polygon points="38,26 23,36 33,30" fill="#F9FAFB" opacity="0.2" />
                          <polygon points="42,26 57,36 47,30" fill="#F9FAFB" opacity="0.2" />
                          {/* Pavilion - minimal light return */}
                          <polygon points="33,42 40,52 39,48" fill="#F3F4F6" opacity="0.1" />
                          <polygon points="47,42 40,52 41,48" fill="#F3F4F6" opacity="0.1" />
                          
                          <defs>
                            <radialGradient id="poorGradient" cx="50%" cy="40%" r="60%">
                              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
                              <stop offset="50%" stopColor="#F9FAFB" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#F3F4F6" stopOpacity="0.1" />
                            </radialGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-red-400 text-lg">Poor</span>
                          <Badge className="bg-red-600">Avoid</Badge>
                        </div>
                        <p className="text-sm text-red-300">Little brilliance and fire. Reflects minimal light.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">Cut Quality Factors:</h4>
                  <ul className="text-sm space-y-1 text-blue-300">
                    <li>• Proportions (table size, crown angle, pavilion depth)</li>
                    <li>• Polish (surface finish quality)</li>
                    <li>• Symmetry (precision of facet alignment)</li>
                    <li>• Girdle thickness (affects durability)</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Color */}
            <Card className="glass-morphism p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="h-6 w-6 text-purple-400" />
                <h3 className="text-2xl font-bold">Color - The GIA D-Z Scale</h3>
              </div>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Color Grading</AlertTitle>
                  <AlertDescription>
                    Color is graded face-down against white background under standardized lighting conditions.
                  </AlertDescription>
                </Alert>
                
                {/* Individual Diamond Color Display */}
                <div className="space-y-6">
                  {/* Colorless Section */}
                  <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-white text-black">Colorless</Badge>
                      <span className="text-sm text-gray-300">D-E-F Range</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {/* D Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FFFFFF"
                              stroke="#E5E7EB"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#FAFAFA"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg">D</div>
                        <div className="text-xs text-gray-400">Absolutely Colorless</div>
                      </div>
                      
                      {/* E Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FEFEFE"
                              stroke="#E5E7EB"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#F9F9F9"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg">E</div>
                        <div className="text-xs text-gray-400">Colorless</div>
                      </div>
                      
                      {/* F Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FDFDFD"
                              stroke="#E5E7EB"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#F8F8F8"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg">F</div>
                        <div className="text-xs text-gray-400">Colorless</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Near Colorless Section */}
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-yellow-600">Near Colorless</Badge>
                      <span className="text-sm text-yellow-300">G-H-I-J Range</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {/* G Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FFFFFB"
                              stroke="#FCD34D"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#FFFEF7"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg text-yellow-400">G</div>
                        <div className="text-xs text-yellow-300">Near Colorless</div>
                      </div>
                      
                      {/* H Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FFFFF8"
                              stroke="#FCD34D"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#FFFEF4"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg text-yellow-400">H</div>
                        <div className="text-xs text-yellow-300">Near Colorless</div>
                      </div>
                      
                      {/* I Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FFFFF5"
                              stroke="#FCD34D"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#FFFEF1"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg text-yellow-400">I</div>
                        <div className="text-xs text-yellow-300">Near Colorless</div>
                      </div>
                      
                      {/* J Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FFFFF2"
                              stroke="#FCD34D"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#FFFEEE"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg text-yellow-400">J</div>
                        <div className="text-xs text-yellow-300">Near Colorless</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Faint Section */}
                  <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-orange-600">Faint</Badge>
                      <span className="text-sm text-orange-300">K-L-M Range</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {/* K Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FFFFEF"
                              stroke="#FB923C"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#FFFEEB"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg text-orange-400">K</div>
                        <div className="text-xs text-orange-300">Faint Yellow</div>
                      </div>
                      
                      {/* L Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FFFFEC"
                              stroke="#FB923C"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#FFFEE8"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg text-orange-400">L</div>
                        <div className="text-xs text-orange-300">Faint Yellow</div>
                      </div>
                      
                      {/* M Color Diamond */}
                      <div className="text-center">
                        <div className="relative mb-2">
                          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto">
                            <polygon
                              points="30,5 50,25 30,55 10,25"
                              fill="#FFFFE9"
                              stroke="#FB923C"
                              strokeWidth="1"
                              className="drop-shadow-lg"
                            />
                            <polygon
                              points="30,5 40,15 30,25 20,15"
                              fill="#FFFEE5"
                              opacity="0.9"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-lg text-orange-400">M</div>
                        <div className="text-xs text-orange-300">Faint Yellow</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">Professional Tip:</h4>
                  <p className="text-sm text-purple-300">
                    G-H color offers the best value. Face-up, they appear colorless but cost significantly less than D-F grades.
                  </p>
                </div>
              </div>
            </Card>

            {/* Clarity */}
            <Card className="glass-morphism p-6">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-6 w-6 text-green-400" />
                <h3 className="text-2xl font-bold">Clarity - Internal Perfection</h3>
              </div>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Clarity Grading</AlertTitle>
                  <AlertDescription>
                    Clarity is graded under 10x magnification by trained gemologists in standardized conditions.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold">FL - IF</span>
                      <Badge className="bg-white text-black">Flawless</Badge>
                    </div>
                    <p className="text-sm text-gray-300">FL: No inclusions or blemishes. IF: No inclusions, minor blemishes.</p>
                  </div>
                  
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-blue-400">VVS1 - VVS2</span>
                      <Badge className="bg-blue-600">Very Very Slightly Included</Badge>
                    </div>
                    <p className="text-sm text-blue-300">Extremely difficult inclusions for skilled graders to see under 10x.</p>
                  </div>
                  
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-green-400">VS1 - VS2</span>
                      <Badge className="bg-green-600">Very Slightly Included</Badge>
                    </div>
                    <p className="text-sm text-green-300">Minor inclusions difficult to somewhat easy to see under 10x.</p>
                  </div>
                  
                  <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-yellow-400">SI1 - SI2</span>
                      <Badge className="bg-yellow-600">Slightly Included</Badge>
                    </div>
                    <p className="text-sm text-yellow-300">Inclusions noticeable under 10x. SI1 usually eye-clean.</p>
                  </div>
                  
                  <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-red-400">I1 - I2 - I3</span>
                      <Badge className="bg-red-600">Included</Badge>
                    </div>
                    <p className="text-sm text-red-300">Inclusions obvious under 10x and may affect brilliance and durability.</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">Sweet Spot:</h4>
                  <p className="text-sm text-green-300">
                    VS2 - SI1 offers the best value. Usually eye-clean but significantly less expensive than VVS grades.
                  </p>
                </div>
              </div>
            </Card>

            {/* Carat Weight */}
            <Card className="glass-morphism p-6">
              <div className="flex items-center gap-3 mb-4">
                <Weight className="h-6 w-6 text-orange-400" />
                <h3 className="text-2xl font-bold">Carat Weight - Precise Measurement</h3>
              </div>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Carat Weight Standards</AlertTitle>
                  <AlertDescription>
                    One carat equals 200 milligrams. Weight is measured to the fifth decimal place (0.00000).
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="p-3 bg-orange-900/20 rounded-lg border border-orange-500/20">
                    <h4 className="font-semibold text-orange-400 mb-2">Carat Weight Categories:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>• Under 0.50ct: Melee</div>
                      <div>• 0.50-0.99ct: Mid-size</div>
                      <div>• 1.00-1.99ct: One carat</div>
                      <div>• 2.00ct+: Large stones</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <h4 className="font-semibold text-blue-400 mb-2">Price Impact:</h4>
                    <p className="text-sm text-blue-300">
                      Price increases exponentially with carat weight. A 2ct diamond costs much more than 2x a 1ct diamond of similar quality.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                    <h4 className="font-semibold text-purple-400 mb-2">Magic Numbers:</h4>
                    <p className="text-sm text-purple-300">
                      0.50ct, 0.75ct, 1.00ct, 1.50ct, 2.00ct+ carry price premiums. Consider 0.95ct instead of 1.00ct for value.
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">Professional Tip:</h4>
                  <p className="text-sm text-green-300">
                    Total carat weight (TCW) in multi-stone pieces is different from individual stone weights. Always ask for breakdown.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Laser Inscriptions Tab */}
        <TabsContent value="laser" className="space-y-6">
          <Card className="glass-morphism p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="h-8 w-8 text-yellow-400" />
              <h3 className="text-3xl font-bold">Laser Inscriptions & Identification</h3>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Alert>
                  <Microscope className="h-4 w-4" />
                  <AlertTitle>What are Laser Inscriptions?</AlertTitle>
                  <AlertDescription>
                    Microscopic alphanumeric codes laser-engraved on the diamond's girdle for identification and authentication.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                    <h4 className="font-semibold text-yellow-400 mb-2">GIA Report Numbers</h4>
                    <p className="text-sm text-yellow-300">
                      GIA inscribes report numbers on diamonds 1 carat and larger. Visible under 10x magnification.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <h4 className="font-semibold text-blue-400 mb-2">Custom Inscriptions</h4>
                    <p className="text-sm text-blue-300">
                      Personal messages, dates, or symbols can be laser-inscribed. Popular for engagement rings and special occasions.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                    <h4 className="font-semibold text-green-400 mb-2">Security Features</h4>
                    <p className="text-sm text-green-300">
                      Helps prevent diamond switching, aids insurance claims, and provides definitive identification.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <h4 className="font-semibold text-purple-400 mb-3">Inscription Guidelines:</h4>
                  <ul className="text-sm space-y-2 text-purple-300">
                    <li>• Maximum 25 characters including spaces</li>
                    <li>• Located on girdle (diamond's edge)</li>
                    <li>• Invisible to naked eye</li>
                    <li>• Does not affect diamond value</li>
                    <li>• Cannot be removed without re-cutting</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                  <h4 className="font-semibold text-red-400 mb-3">Important Notes:</h4>
                  <ul className="text-sm space-y-2 text-red-300">
                    <li>• Laser inscriptions are permanent</li>
                    <li>• Professional verification required</li>
                    <li>• Check inscription matches certificate</li>
                    <li>• Some vintage stones lack inscriptions</li>
                  </ul>
                </div>
                
                <Alert className="bg-orange-900/20 border-orange-500/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Verification</AlertTitle>
                  <AlertDescription>
                    Always verify laser inscriptions match the grading report. Use professional-grade 10x loupe or microscope.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Performance Analysis Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="glass-morphism p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <h3 className="text-3xl font-bold">Diamond Performance Analysis</h3>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Light Performance</AlertTitle>
                  <AlertDescription>
                    How a diamond interacts with light determines its beauty. Three key factors: Brilliance, Fire, and Scintillation.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                    <h4 className="font-semibold text-white mb-2">Brilliance</h4>
                    <p className="text-sm text-gray-300">
                      White light reflected from the diamond's surface and interior. Measured by light return percentage.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <h4 className="font-semibold text-blue-400 mb-2">Fire (Dispersion)</h4>
                    <p className="text-sm text-blue-300">
                      White light separated into rainbow colors. Higher refractive index creates more fire.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                    <h4 className="font-semibold text-green-400 mb-2">Scintillation</h4>
                    <p className="text-sm text-green-300">
                      Sparkle created by light and dark patterns when diamond or viewer moves. Creates "life" in the stone.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                  <h4 className="font-semibold text-yellow-400 mb-2">Ideal Performance Range:</h4>
                  <ul className="text-sm space-y-1 text-yellow-300">
                    <li>• Table: 54-57%</li>
                    <li>• Depth: 59-62.5%</li>
                    <li>• Crown Angle: 34-35°</li>
                    <li>• Pavilion Angle: 40.6-41.8°</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <h4 className="font-semibold text-purple-400 mb-3">Advanced Grading Tools:</h4>
                  <ul className="text-sm space-y-2 text-purple-300">
                    <li>• <strong>ASET:</strong> Angular Spectrum Evaluation Tool</li>
                    <li>• <strong>Ideal-Scope:</strong> Light leakage detection</li>
                    <li>• <strong>Hearts & Arrows:</strong> Symmetry viewer</li>
                    <li>• <strong>Sarin/OGI:</strong> Proportion measurement</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                  <h4 className="font-semibold text-orange-400 mb-3">Performance Factors:</h4>
                  <ul className="text-sm space-y-2 text-orange-300">
                    <li>• <strong>Proportions:</strong> Most critical for performance</li>
                    <li>• <strong>Polish:</strong> Affects surface brilliance</li>
                    <li>• <strong>Symmetry:</strong> Impacts light uniformity</li>
                    <li>• <strong>Fluorescence:</strong> Can affect appearance</li>
                  </ul>
                </div>
                
                <Alert className="bg-blue-900/20 border-blue-500/20">
                  <Award className="h-4 w-4" />
                  <AlertTitle>Professional Insight</AlertTitle>
                  <AlertDescription>
                    A well-cut diamond of lower color/clarity often looks better than a poorly cut diamond of higher grades.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Lab-Grown Diamonds Tab */}
        <TabsContent value="lab-grown" className="space-y-6">
          <Card className="glass-morphism p-8">
            <div className="flex items-center gap-3 mb-6">
              <Beaker className="h-8 w-8 text-green-400" />
              <h3 className="text-3xl font-bold">Lab-Grown Diamonds vs Natural</h3>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Alert>
                  <Hexagon className="h-4 w-4" />
                  <AlertTitle>What Are Lab-Grown Diamonds?</AlertTitle>
                  <AlertDescription>
                    Real diamonds created in laboratories using advanced technology. Identical chemical, physical, and optical properties to natural diamonds.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                    <h4 className="font-semibold text-green-400 mb-2">HPHT Method</h4>
                    <p className="text-sm text-green-300">
                      High Pressure, High Temperature. Mimics natural diamond formation conditions using extreme pressure and heat.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <h4 className="font-semibold text-blue-400 mb-2">CVD Method</h4>
                    <p className="text-sm text-blue-300">
                      Chemical Vapor Deposition. Uses carbon-rich gas in vacuum chamber to grow diamond layer by layer.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                    <h4 className="font-semibold text-purple-400 mb-2">Identical Properties</h4>
                    <p className="text-sm text-purple-300">
                      Same hardness (10 on Mohs scale), refractive index, and brilliance as natural diamonds.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                  <h4 className="font-semibold text-orange-400 mb-3">Key Differences:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-orange-500/20">
                          <th className="text-left p-2">Aspect</th>
                          <th className="text-left p-2">Natural</th>
                          <th className="text-left p-2">Lab-Grown</th>
                        </tr>
                      </thead>
                      <tbody className="text-orange-300">
                        <tr>
                          <td className="p-2 font-medium">Formation Time</td>
                          <td className="p-2">Billions of years</td>
                          <td className="p-2">Weeks to months</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Price</td>
                          <td className="p-2">Higher</td>
                          <td className="p-2">60-70% less</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Rarity</td>
                          <td className="p-2">Limited supply</td>
                          <td className="p-2">Unlimited supply</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Resale Value</td>
                          <td className="p-2">Retains value</td>
                          <td className="p-2">Lower resale</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                  <h4 className="font-semibold text-red-400 mb-3">Identification:</h4>
                  <ul className="text-sm space-y-2 text-red-300">
                    <li>• Requires advanced equipment to distinguish</li>
                    <li>• GIA reports clearly state "Laboratory Grown"</li>
                    <li>• Different fluorescence patterns</li>
                    <li>• Microscopic growth patterns differ</li>
                  </ul>
                </div>
                
                <Alert className="bg-yellow-900/20 border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Disclosure</AlertTitle>
                  <AlertDescription>
                    Lab-grown diamonds must be disclosed as such. They are not "synthetic" or "imitation" - they are real diamonds.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Diamond Simulants Tab */}
        <TabsContent value="simulants" className="space-y-6">
          <Card className="glass-morphism p-8">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="h-8 w-8 text-red-400" />
              <h3 className="text-3xl font-bold">Diamond Simulants & Imitations</h3>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>What Are Diamond Simulants?</AlertTitle>
                  <AlertDescription>
                    Materials that look like diamonds but have different chemical, physical, and optical properties. Not real diamonds.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <h4 className="font-semibold text-blue-400 mb-2">Cubic Zirconia (CZ)</h4>
                    <div className="text-sm text-blue-300 space-y-1">
                      <p>• Hardness: 8.5 (vs Diamond 10)</p>
                      <p>• Higher fire, but less brilliance</p>
                      <p>• Heavier than diamond</p>
                      <p>• Price: $1-10 per carat</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                    <h4 className="font-semibold text-green-400 mb-2">Moissanite</h4>
                    <div className="text-sm text-green-300 space-y-1">
                      <p>• Hardness: 9.25 (closest to diamond)</p>
                      <p>• Double refraction (creates doubling)</p>
                      <p>• More fire than diamond</p>
                      <p>• Price: $50-600 per carat</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                    <h4 className="font-semibold text-purple-400 mb-2">White Sapphire</h4>
                    <div className="text-sm text-purple-300 space-y-1">
                      <p>• Hardness: 9 (durable)</p>
                      <p>• Less brilliance than diamond</p>
                      <p>• Natural gemstone</p>
                      <p>• Price: $100-1000 per carat</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                  <h4 className="font-semibold text-orange-400 mb-3">Other Simulants:</h4>
                  <div className="space-y-2 text-sm text-orange-300">
                    <div className="flex justify-between">
                      <span>Glass (Crystal)</span>
                      <span>Hardness: 5.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quartz</span>
                      <span>Hardness: 7</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rutile</span>
                      <span>Hardness: 6-6.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Synthetic Spinel</span>
                      <span>Hardness: 8</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                  <h4 className="font-semibold text-red-400 mb-3">Identification Tests:</h4>
                  <ul className="text-sm space-y-2 text-red-300">
                    <li>• <strong>Thermal Conductivity:</strong> Diamond conducts heat</li>
                    <li>• <strong>Refractive Index:</strong> Diamond has specific RI</li>
                    <li>• <strong>Dispersion:</strong> Diamond has moderate fire</li>
                    <li>• <strong>Birefringence:</strong> Diamond is singly refractive</li>
                    <li>• <strong>Hardness:</strong> Diamond is hardest natural material</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                  <h4 className="font-semibold text-yellow-400 mb-3">Professional Testing:</h4>
                  <ul className="text-sm space-y-2 text-yellow-300">
                    <li>• Diamond tester (thermal/electrical)</li>
                    <li>• Loupe examination</li>
                    <li>• Moissanite tester</li>
                    <li>• Spectroscopy</li>
                    <li>• Certified gemologist evaluation</li>
                  </ul>
                </div>
                
                <Alert className="bg-green-900/20 border-green-500/20">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Protection</AlertTitle>
                  <AlertDescription>
                    Always buy from reputable dealers with proper certification. GIA, AGS, or other recognized labs provide authentication.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Professional Tips Tab */}
        <TabsContent value="tips" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-morphism p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-6 w-6 text-yellow-400" />
                <h3 className="text-2xl font-bold">Professional Buying Tips</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                  <h4 className="font-semibold text-green-400 mb-2">Budget Allocation</h4>
                  <p className="text-sm text-green-300 mb-2">Recommended budget distribution:</p>
                  <ul className="text-sm text-green-300 space-y-1">
                    <li>• Cut Quality: 40% (most important)</li>
                    <li>• Carat Weight: 30% (size preference)</li>
                    <li>• Color: 20% (visual impact)</li>
                    <li>• Clarity: 10% (least visible)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold text-blue-400 mb-2">Certification Hierarchy</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">GIA (Gemological Institute)</span>
                      <Badge className="bg-blue-600">Gold Standard</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">AGS (American Gem Society)</span>
                      <Badge className="bg-blue-600">Excellent</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">SSEF, Gübelin</span>
                      <Badge className="bg-green-600">Premium</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">EGL, GSI</span>
                      <Badge className="bg-yellow-600">Acceptable</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <h4 className="font-semibold text-purple-400 mb-2">Value Optimization</h4>
                  <ul className="text-sm text-purple-300 space-y-1">
                    <li>• Buy just under carat weights (0.95ct vs 1.00ct)</li>
                    <li>• Choose G-H color for best value</li>
                    <li>• SI1 clarity often eye-clean</li>
                    <li>• Prioritize Excellent cut grade</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="glass-morphism p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-6 w-6 text-red-400" />
                <h3 className="text-2xl font-bold">Red Flags to Avoid</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                  <h4 className="font-semibold text-red-400 mb-2">Certification Issues</h4>
                  <ul className="text-sm text-red-300 space-y-1">
                    <li>• No certification from recognized lab</li>
                    <li>• Certification doesn't match stone</li>
                    <li>• Outdated or suspicious certificates</li>
                    <li>• Seller won't provide certificate</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                  <h4 className="font-semibold text-orange-400 mb-2">Pricing Red Flags</h4>
                  <ul className="text-sm text-orange-300 space-y-1">
                    <li>• Price too good to be true</li>
                    <li>• No return policy</li>
                    <li>• Pressure to buy immediately</li>
                    <li>• Unclear pricing structure</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                  <h4 className="font-semibold text-yellow-400 mb-2">Quality Issues</h4>
                  <ul className="text-sm text-yellow-300 space-y-1">
                    <li>• Chips, cracks, or damage</li>
                    <li>• Poor cut proportions</li>
                    <li>• Visible inclusions affecting brilliance</li>
                    <li>• Fluorescence issues (rare but possible)</li>
                  </ul>
                </div>

                <Alert className="bg-red-900/20 border-red-500/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Final Verification</AlertTitle>
                  <AlertDescription>
                    Always have expensive diamonds independently appraised and verified by a certified gemologist before final purchase.
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}