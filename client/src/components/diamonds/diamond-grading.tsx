import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Diamond, Palette, Eye, Ruler, Weight } from "lucide-react";

export function DiamondGrading() {
  const colorScale = [
    { grade: 'D', category: 'Colorless', description: 'Absolutely colorless. The highest color grade.', color: 'rgba(255,255,255,0.95)', border: 'rgba(200,220,255,0.4)' },
    { grade: 'E', category: 'Colorless', description: 'Colorless. Only minute traces of color detected by expert.', color: 'rgba(255,254,250,0.92)', border: 'rgba(200,215,250,0.35)' },
    { grade: 'F', category: 'Colorless', description: 'Colorless. Slight color detected by expert only.', color: 'rgba(255,253,245,0.90)', border: 'rgba(200,210,240,0.3)' },
    { grade: 'G', category: 'Near Colorless', description: 'Near colorless. Color noticeable when compared to higher grades.', color: 'rgba(255,251,235,0.88)', border: 'rgba(220,210,180,0.35)' },
    { grade: 'H', category: 'Near Colorless', description: 'Near colorless. Color slightly detectable when compared.', color: 'rgba(255,248,220,0.86)', border: 'rgba(220,200,160,0.35)' },
    { grade: 'I', category: 'Near Colorless', description: 'Near colorless. Slightly detectable color.', color: 'rgba(255,245,205,0.84)', border: 'rgba(220,195,140,0.35)' },
    { grade: 'J', category: 'Near Colorless', description: 'Near colorless. Color slightly detectable.', color: 'rgba(255,240,190,0.82)', border: 'rgba(220,190,130,0.35)' },
    { grade: 'K', category: 'Faint', description: 'Noticeable color.', color: 'rgba(255,235,170,0.80)', border: 'rgba(220,185,110,0.4)' },
    { grade: 'L', category: 'Faint', description: 'Noticeable color.', color: 'rgba(255,228,150,0.78)', border: 'rgba(210,175,100,0.4)' },
    { grade: 'M', category: 'Faint', description: 'Noticeable color.', color: 'rgba(255,220,130,0.76)', border: 'rgba(200,165,90,0.4)' },
    { grade: 'N-Z', category: 'Very Light to Light', description: 'Noticeable color. Not offered by most retailers.', color: 'rgba(255,210,100,0.74)', border: 'rgba(190,155,70,0.45)' }
  ];

  // GIA Clarity Scale
  const clarityScale = [
    { grade: 'FL', name: 'Flawless', description: 'No inclusions or blemishes visible under 10x magnification', rarity: 'Extremely Rare' },
    { grade: 'IF', name: 'Internally Flawless', description: 'No inclusions visible under 10x magnification', rarity: 'Very Rare' },
    { grade: 'VVS1', name: 'Very Very Slightly Included 1', description: 'Inclusions difficult for expert to see under 10x', rarity: 'Rare' },
    { grade: 'VVS2', name: 'Very Very Slightly Included 2', description: 'Inclusions difficult to see under 10x', rarity: 'Rare' },
    { grade: 'VS1', name: 'Very Slightly Included 1', description: 'Inclusions are minor and difficult to see under 10x', rarity: 'High Quality' },
    { grade: 'VS2', name: 'Very Slightly Included 2', description: 'Inclusions are minor and somewhat easy to see under 10x', rarity: 'High Quality' },
    { grade: 'SI1', name: 'Slightly Included 1', description: 'Inclusions noticeable under 10x', rarity: 'Good Value' },
    { grade: 'SI2', name: 'Slightly Included 2', description: 'Inclusions easily noticeable under 10x', rarity: 'Good Value' },
    { grade: 'I1', name: 'Included 1', description: 'Inclusions obvious under 10x and may affect brilliance', rarity: 'Budget' },
    { grade: 'I2-I3', name: 'Included 2-3', description: 'Inclusions obvious and affect brilliance', rarity: 'Budget' }
  ];

  // Cut Grades
  const cutGrades = [
    { grade: 'Excellent', description: 'Maximum fire and brilliance. Reflects nearly all light.', percentage: '3%' },
    { grade: 'Very Good', description: 'Exceptional brilliance. Reflects most light.', percentage: '15%' },
    { grade: 'Good', description: 'Good brilliance. Reflects much light.', percentage: '25%' },
    { grade: 'Fair', description: 'Adequate brilliance. Some light escapes.', percentage: '35%' },
    { grade: 'Poor', description: 'Little brilliance. Most light escapes.', percentage: '22%' }
  ];

  // Diamond Shapes
  const diamondShapes = [
    { name: 'Round', popularity: '75%', description: 'Maximum brilliance and fire' },
    { name: 'Princess', popularity: '5%', description: 'Square with pointed corners' },
    { name: 'Cushion', popularity: '5%', description: 'Square with rounded corners' },
    { name: 'Oval', popularity: '4%', description: 'Elongated with brilliant facets' },
    { name: 'Emerald', popularity: '3%', description: 'Rectangular with step cuts' },
    { name: 'Pear', popularity: '2%', description: 'Teardrop shape' },
    { name: 'Marquise', popularity: '2%', description: 'Football-shaped with points' },
    { name: 'Radiant', popularity: '2%', description: 'Rectangular with trimmed corners' },
    { name: 'Asscher', popularity: '1%', description: 'Square emerald cut' },
    { name: 'Heart', popularity: '1%', description: 'Heart-shaped romantic cut' }
  ];

  return (
    <div className="space-y-8">
      {/* Color Scale */}
      <Card className="glass-morphism p-8">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl font-bold">Diamond Color Scale</h2>
        </div>
        <p className="text-yellow-300 mb-6">
          Diamond color is graded on a scale from D (colorless) to Z (light yellow or brown). 
          The less color, the higher the grade and value.
        </p>
        <div className="grid gap-3">
          {colorScale.map((item) => (
            <div key={item.grade} className="flex items-center gap-4 p-4 rounded-xl bg-black/30 hover:bg-black/40 transition-all duration-200">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
                   style={{ background: item.color, border: `2px solid ${item.border}`, boxShadow: `inset 0 1px 8px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.3)` }}>
                <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-lg">{item.grade}</span>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
                <p className="text-sm text-yellow-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Clarity Scale */}
      <Card className="glass-morphism p-8">
        <div className="flex items-center gap-3 mb-6">
          <Eye className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl font-bold">Diamond Clarity Scale</h2>
        </div>
        <p className="text-yellow-300 mb-6">
          Clarity refers to the absence of inclusions and blemishes. The GIA Clarity Scale contains 11 grades, 
          with most diamonds falling into the VS or SI categories.
        </p>
        <div className="grid gap-4">
          {clarityScale.map((clarity) => (
            <div key={clarity.grade} className="flex items-center gap-4 p-4 rounded-lg bg-black/30 hover:bg-black/40 transition-colors">
              <div className="w-20 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl font-bold">
                {clarity.grade}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-lg">{clarity.name}</span>
                  <Badge variant={clarity.rarity.includes('Rare') ? 'default' : 'secondary'}>
                    {clarity.rarity}
                  </Badge>
                </div>
                <p className="text-sm text-yellow-400">{clarity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cut Grades */}
      <Card className="glass-morphism p-8">
        <div className="flex items-center gap-3 mb-6">
          <Diamond className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl font-bold">Diamond Cut Grades</h2>
        </div>
        <p className="text-yellow-300 mb-6">
          Cut is the most important of the 4Cs. It determines how well a diamond interacts with light 
          to create brilliance, fire, and scintillation.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cutGrades.map((cut) => (
            <Card key={cut.grade} className="p-6 bg-black/30 border-gold/20">
              <h3 className="text-xl font-semibold mb-2 text-gold">{cut.grade}</h3>
              <p className="text-sm text-yellow-400 mb-3">{cut.description}</p>
              <div className="text-xs text-yellow-500">Market share: {cut.percentage}</div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Diamond Shapes */}
      <Card className="glass-morphism p-8">
        <div className="flex items-center gap-3 mb-6">
          <Ruler className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl font-bold">Diamond Shapes</h2>
        </div>
        <p className="text-yellow-300 mb-6">
          While shape doesn't affect grade, it significantly impacts appearance and price. 
          Round diamonds are the most popular and typically the most expensive.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diamondShapes.map((shape) => (
            <Card key={shape.name} className="p-4 bg-black/30 border-blue-400/20">
              <h3 className="text-lg font-semibold mb-1">{shape.name}</h3>
              <p className="text-sm text-yellow-400 mb-2">{shape.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-500">Popularity</span>
                <Badge variant="outline">{shape.popularity}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Carat Weight */}
      <Card className="glass-morphism p-8">
        <div className="flex items-center gap-3 mb-6">
          <Weight className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl font-bold">Carat Weight</h2>
        </div>
        <p className="text-yellow-300 mb-6">
          Carat is the unit of measurement for diamond weight. One carat equals 200 milligrams. 
          Price increases exponentially with carat weight.
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { weight: '0.25ct', mm: '4.1mm', desc: 'Quarter Carat' },
            { weight: '0.50ct', mm: '5.2mm', desc: 'Half Carat' },
            { weight: '1.00ct', mm: '6.5mm', desc: 'One Carat' },
            { weight: '2.00ct', mm: '8.2mm', desc: 'Two Carat' }
          ].map((carat) => (
            <Card key={carat.weight} className="p-6 bg-black/30 border-gold/20 text-center">
              <div className="text-3xl font-bold text-gold mb-2">{carat.weight}</div>
              <div className="text-sm text-yellow-400 mb-1">{carat.desc}</div>
              <div className="text-xs text-yellow-500">≈ {carat.mm} diameter</div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}