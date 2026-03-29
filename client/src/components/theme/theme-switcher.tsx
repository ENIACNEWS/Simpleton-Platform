import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useTheme, type ThemeMode } from "@/contexts/theme-context";
import { 
  Sun, 
  Moon, 
  Waves, 
  Zap, 
  Palette,
  Circle
} from "lucide-react";

const themeCategories = {
  'Brand': [
    { value: 'simpleton-blue', label: 'Simpleton Maven', icon: Palette, color: '#4A7BC7' },
    { value: 'navy-bronze', label: 'Simpleton Blue Classic', icon: Palette, color: '#1A3F6A' },
  ],
  'Signature': [
    { value: 'midnight-pulse', label: 'Midnight Pulse', icon: Palette, color: '#010137' },
    { value: 'midnight-pulse-inverted', label: 'Midnight Pulse Inverted', icon: Palette, color: '#FFFFFF' },
  ],
  'Parallax Signature': [
    { value: 'parallax-absolute-void', label: 'Absolute Void', icon: Circle, color: '#000000' },
    { value: 'parallax-singularity', label: 'Singularity', icon: Circle, color: '#010101' },
    { value: 'parallax-black-light', label: 'Black Light', icon: Circle, color: '#00001E' },
    { value: 'parallax-retina-burn', label: 'Retina Burn', icon: Zap, color: '#08084A' },
    { value: 'parallax-meltdown', label: 'Meltdown', icon: Zap, color: '#000028' },
    { value: 'parallax-void-star', label: 'Void Star', icon: Circle, color: '#000044' },
    { value: 'parallax-eventide-abyss', label: 'Eventide Abyss', icon: Circle, color: '#23152E' },
    { value: 'parallax-ash', label: 'PARALLAX Ash', icon: Circle, color: '#332B40' },
    { value: 'parallax-martian-glass', label: 'Martian Glass', icon: Circle, color: '#1A1022' },
    { value: 'parallax-neural-purple', label: 'Neural Purple', icon: Zap, color: '#4A00B0' },
    { value: 'parallax-bloodline-glass', label: 'Bloodline Glass', icon: Circle, color: '#7F242C' },
    { value: 'parallax-english-walnut', label: 'English Walnut', icon: Circle, color: '#3F2A1F' },
    { value: 'parallax-ember-walnut', label: 'Ember Walnut', icon: Circle, color: '#5F2A1F' },
    { value: 'parallax-blood-oak', label: 'Blood Oak', icon: Circle, color: '#1A0000' },
    { value: 'parallax-forged-cobalt', label: 'Forged Cobalt', icon: Waves, color: '#1C2A3F' },
    { value: 'parallax-abyss-light', label: 'Abyss Light', icon: Zap, color: '#0A1A46' },
    { value: 'parallax-ocean-trench', label: 'Ocean Trench', icon: Waves, color: '#0A1A2A' },
    { value: 'parallax-living-white', label: 'Living White', icon: Sun, color: '#FAF7F0' },
    { value: 'parallax-dire-wolf', label: 'Dire Wolf', icon: Circle, color: '#282828' },
    { value: 'parallax-ghost-white', label: 'Ghost White', icon: Sun, color: '#F5F0FA' },
    { value: 'parallax-void-sprunk', label: 'Void Sprunk', icon: Zap, color: '#0F5F19' },
    { value: 'parallax-chrome-sapphire', label: 'Chrome Sapphire', icon: Zap, color: '#00AAFF' },
    { value: 'parallax-supernova', label: 'Supernova', icon: Zap, color: '#010058' },
    { value: 'parallax-void-star-deep', label: 'Void Star Deep', icon: Circle, color: '#010044' },
    { value: 'parallax-ember-burn', label: 'Ember Burn', icon: Zap, color: '#03014C' },
  ],
  'Essential': [
    { value: 'light', label: 'Light Mode', icon: Sun, color: '#ffffff' },
  ],
  'Premium Black': [
    { value: 'obsidian-black', label: 'Obsidian Black', icon: Circle, color: '#0B0B0B' },
    { value: 'carbon-black', label: 'Carbon Black', icon: Circle, color: '#0A0A0A' },
    { value: 'void-black', label: 'Void Black', icon: Circle, color: '#000000' },
    { value: 'shadow-black', label: 'Shadow Black', icon: Circle, color: '#0D0D0D' },
    { value: 'midnight-black', label: 'Midnight Black', icon: Circle, color: '#080808' },
    { value: 'eclipse-black', label: 'Eclipse Black', icon: Circle, color: '#050505' },
    { value: 'charcoal-premium', label: 'Charcoal Premium', icon: Circle, color: '#0C0C0C' },
    { value: 'onyx-black', label: 'Onyx Black', icon: Circle, color: '#090909' },
  ],
  'Navy Blue': [
    { value: 'deep-navy', label: 'Deep Navy', icon: Waves, color: '#0B1F3B' },
    { value: 'royal-navy', label: 'Royal Navy', icon: Waves, color: '#001F3F' },
    { value: 'prussian-blue', label: 'Prussian Blue', icon: Waves, color: '#003153' },
    { value: 'admiral-blue', label: 'Admiral Blue', icon: Waves, color: '#0A1A2A' },
    { value: 'sapphire-night', label: 'Sapphire Night', icon: Waves, color: '#0F2027' },
    { value: 'navy-steel', label: 'Navy Steel', icon: Waves, color: '#1B263B' },
    { value: 'cobalt-depth', label: 'Cobalt Depth', icon: Waves, color: '#0E1A40' },
    { value: 'indigo-void', label: 'Indigo Void', icon: Waves, color: '#1A0B3D' },
    { value: 'atlantic-deep', label: 'Atlantic Deep', icon: Waves, color: '#0C1B2A' },
    { value: 'midnight-blue', label: 'Midnight Blue', icon: Waves, color: '#0F172A' },
    { value: 'steel-navy', label: 'Steel Navy', icon: Waves, color: '#1E2A3A' },
  ],
  'Red & Crimson': [
    { value: 'crimson-night', label: 'Crimson Night', icon: Circle, color: '#1A0A0A' },
    { value: 'ruby-depth', label: 'Ruby Depth', icon: Circle, color: '#2D0B0B' },
    { value: 'bordeaux-black', label: 'Bordeaux Black', icon: Circle, color: '#0D0404' },
    { value: 'wine-shadow', label: 'Wine Shadow', icon: Circle, color: '#1F0B0B' },
    { value: 'cherry-void', label: 'Cherry Void', icon: Circle, color: '#0F0606' },
    { value: 'scarlet-premium', label: 'Scarlet Premium', icon: Circle, color: '#140808' },
  ],
  'Green & Forest': [
    { value: 'forest-black', label: 'Forest Black', icon: Circle, color: '#0A1A0A' },
    { value: 'emerald-night', label: 'Emerald Night', icon: Circle, color: '#0B2D0B' },
    { value: 'jade-depth', label: 'Jade Depth', icon: Circle, color: '#040D04' },
    { value: 'pine-shadow', label: 'Pine Shadow', icon: Circle, color: '#0B1F0B' },
    { value: 'moss-premium', label: 'Moss Premium', icon: Circle, color: '#060F06' },
    { value: 'hunter-void', label: 'Hunter Void', icon: Circle, color: '#081408' },
  ],
  'Gold & Yellow': [
    { value: 'golden-night', label: 'Golden Night', icon: Circle, color: '#1A1A0A' },
    { value: 'amber-depth', label: 'Amber Depth', icon: Circle, color: '#2D2D0B' },
    { value: 'bronze-shadow', label: 'Bronze Shadow', icon: Circle, color: '#0D0D04' },
    { value: 'copper-premium', label: 'Copper Premium', icon: Circle, color: '#1F1F0B' },
    { value: 'sunset-void', label: 'Sunset Void', icon: Circle, color: '#0F0F06' },
    { value: 'honey-black', label: 'Honey Black', icon: Circle, color: '#141408' },
  ],
  'Purple & Violet': [
    { value: 'violet-night', label: 'Violet Night', icon: Circle, color: '#1A0A1A' },
    { value: 'purple-depth', label: 'Purple Depth', icon: Circle, color: '#2D0B2D' },
    { value: 'amethyst-void', label: 'Amethyst Void', icon: Circle, color: '#0D040D' },
    { value: 'plum-shadow', label: 'Plum Shadow', icon: Circle, color: '#1F0B1F' },
    { value: 'lavender-black', label: 'Lavender Black', icon: Circle, color: '#0F060F' },
    { value: 'royal-purple', label: 'Royal Purple', icon: Circle, color: '#140814' },
  ],
  'Quantum Future': [
    { value: 'quantum-lime', label: 'Quantum Lime', icon: Zap, color: '#0A0A00' },
    { value: 'quantum-magenta', label: 'Quantum Magenta', icon: Zap, color: '#0A000A' },
    { value: 'quantum-cyan', label: 'Quantum Cyan', icon: Zap, color: '#000A0A' },
    { value: 'quantum-dark', label: 'Quantum Dark', icon: Zap, color: '#000011' },
  ],
  'Futuristic Tech': [
    { value: 'electric-void', label: 'Electric Void', icon: Zap, color: '#0d1b2a' },
    { value: 'midnight-navy', label: 'Midnight Navy', icon: Waves, color: '#0a1625' },
    { value: 'cyber-blue', label: 'Cyber Blue', icon: Zap, color: '#0f1419' },
    { value: 'digital-forest', label: 'Digital Forest', icon: Circle, color: '#0d1a0d' },
    { value: 'cyber-emerald', label: 'Cyber Emerald', icon: Circle, color: '#0a1a0f' },
    { value: 'quantum-mint', label: 'Quantum Mint', icon: Zap, color: '#0d1a1a' },
    { value: 'gunmetal-void', label: 'Gunmetal Void', icon: Circle, color: '#1a1a1a' },
    { value: 'steel-shadow', label: 'Steel Shadow', icon: Circle, color: '#1a1c1e' },
    { value: 'obsidian-core', label: 'Obsidian Core', icon: Circle, color: '#0d0d0d' },
    { value: 'crimson-depth', label: 'Crimson Depth', icon: Circle, color: '#1a0d0d' },
    { value: 'copper-circuit', label: 'Copper Circuit', icon: Circle, color: '#1a110d' },
    { value: 'neon-teal', label: 'Neon Teal', icon: Zap, color: '#0d1a1a' },
    { value: 'carbon-fiber', label: 'Carbon Fiber', icon: Circle, color: '#0d1014' },
    { value: 'titanium-void', label: 'Titanium Void', icon: Circle, color: '#1a1a1c' },
  ],
  'Holographic': [
    { value: 'holographic-silver', label: 'Holographic Silver', icon: Palette, color: '#0C0C0C' },
    { value: 'holographic-gold', label: 'Holographic Gold', icon: Palette, color: '#1A1A00' },
    { value: 'holographic-rainbow', label: 'Holographic Rainbow', icon: Palette, color: '#0A0A0A' },
  ],
  'Neon Cyberpunk': [
    { value: 'neon-pink', label: 'Neon Pink', icon: Zap, color: '#1A0A1A' },
    { value: 'neon-green', label: 'Neon Green', icon: Zap, color: '#0A1A0A' },
    { value: 'neon-blue', label: 'Neon Blue', icon: Zap, color: '#0A0A1A' },
    { value: 'neon-orange', label: 'Neon Orange', icon: Zap, color: '#1A0A00' },
  ],
  'Exotic Rare': [
    { value: 'chartreuse-night', label: 'Chartreuse Night', icon: Circle, color: '#0A0A00' },
    { value: 'vermillion-void', label: 'Vermillion Void', icon: Circle, color: '#0D0400' },
    { value: 'celadon-shadow', label: 'Celadon Shadow', icon: Circle, color: '#020A05' },
  ],
  'Space Age': [
    { value: 'nebula-purple', label: 'Nebula Purple', icon: Circle, color: '#0B0B1A' },
    { value: 'starlight-silver', label: 'Starlight Silver', icon: Circle, color: '#0C0C0C' },
    { value: 'cosmic-blue', label: 'Cosmic Blue', icon: Circle, color: '#000014' },
  ],
  'Bioluminescent': [
    { value: 'bio-green', label: 'Bio Green', icon: Circle, color: '#0A0A0A' },
    { value: 'bio-blue', label: 'Bio Blue', icon: Circle, color: '#0A0A0A' },
    { value: 'bio-purple', label: 'Bio Purple', icon: Circle, color: '#0A0A0A' },
  ],
  'Radioactive': [
    { value: 'uranium-green', label: 'Uranium Green', icon: Circle, color: '#0A0A0A' },
    { value: 'plutonium-glow', label: 'Plutonium Glow', icon: Circle, color: '#0A0A0A' },
    { value: 'radium-light', label: 'Radium Light', icon: Circle, color: '#0A0A0A' },
  ],
  'Exotic Elements': [
    { value: 'xenon-blue', label: 'Xenon Blue', icon: Circle, color: '#0A0A14' },
    { value: 'argon-purple', label: 'Argon Purple', icon: Circle, color: '#0A0A14' },
    { value: 'helium-pink', label: 'Helium Pink', icon: Circle, color: '#14040A' },
  ],
  'Electromagnetic': [
    { value: 'infrared-night', label: 'Infrared Night', icon: Circle, color: '#0A0000' },
    { value: 'ultraviolet-void', label: 'Ultraviolet Void', icon: Circle, color: '#050A14' },
    { value: 'gamma-green', label: 'Gamma Green', icon: Circle, color: '#0A0A0A' },
  ],
  'Energy Beam': [
    { value: 'laser-red', label: 'Laser Red', icon: Zap, color: '#0A0000' },
    { value: 'plasma-blue', label: 'Plasma Blue', icon: Zap, color: '#00000A' },
    { value: 'photon-white', label: 'Photon White', icon: Zap, color: '#0A0A0A' },
  ],
  'Cosmic Phenomena': [
    { value: 'dark-matter', label: 'Dark Matter', icon: Circle, color: '#000000' },
    { value: 'antimatter-void', label: 'Antimatter Void', icon: Circle, color: '#050505' },
    { value: 'wormhole-black', label: 'Wormhole Black', icon: Circle, color: '#000000' },
    { value: 'supernova-gold', label: 'Supernova Gold', icon: Circle, color: '#0A0A00' },
    { value: 'blackhole-depth', label: 'Blackhole Depth', icon: Circle, color: '#000000' },
    { value: 'quasar-light', label: 'Quasar Light', icon: Circle, color: '#000011' },
  ],
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  // Find current theme from all categories
  const currentTheme = Object.values(themeCategories)
    .flat()
    .find(option => option.value === theme);
  const CurrentIcon = currentTheme?.icon || Palette;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
        >
          <CurrentIcon size={16} />
          <span className="hidden sm:inline">{currentTheme?.label}</span>
          <div 
            className="w-3 h-3 rounded-full border border-white/20 hidden sm:block"
            style={{ backgroundColor: currentTheme?.color }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 max-h-96 overflow-y-auto bg-gray-800 border-gray-700"
      >
        {Object.entries(themeCategories).map(([categoryName, themes]) => (
          <div key={categoryName}>
            <DropdownMenuLabel className="text-xs text-gray-400 font-semibold px-3 py-2">
              {categoryName}
            </DropdownMenuLabel>
            {themes.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTheme(option.value as ThemeMode)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-700 ${
                    theme === option.value ? 'bg-gray-700' : ''
                  }`}
                >
                  <Icon size={16} />
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{option.label}</div>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: option.color }}
                  />
                  {theme === option.value && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="bg-gray-700" />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}