import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 
  | 'navy-bronze'
  | 'simpleton-blue'
  | 'light'
  | 'obsidian-black'
  | 'carbon-black'
  | 'void-black'
  | 'shadow-black'
  | 'midnight-black'
  | 'deep-navy'
  | 'royal-navy'
  | 'prussian-blue'
  | 'admiral-blue'
  | 'sapphire-night'
  | 'navy-steel'
  | 'cobalt-depth'
  | 'indigo-void'
  | 'atlantic-deep'
  | 'midnight-blue'
  | 'quantum-dark'
  | 'eclipse-black'
  | 'charcoal-premium'
  | 'steel-navy'
  | 'onyx-black'
  | 'crimson-night'
  | 'ruby-depth'
  | 'bordeaux-black'
  | 'wine-shadow'
  | 'cherry-void'
  | 'scarlet-premium'
  | 'forest-black'
  | 'emerald-night'
  | 'jade-depth'
  | 'pine-shadow'
  | 'moss-premium'
  | 'hunter-void'
  | 'golden-night'
  | 'amber-depth'
  | 'bronze-shadow'
  | 'copper-premium'
  | 'sunset-void'
  | 'honey-black'
  | 'violet-night'
  | 'purple-depth'
  | 'amethyst-void'
  | 'plum-shadow'
  | 'lavender-black'
  | 'royal-purple'
  | 'orange-night'
  | 'flame-depth'
  | 'burnt-shadow'
  | 'tangerine-void'
  | 'peach-black'
  | 'coral-premium'
  | 'pink-night'
  | 'rose-depth'
  | 'magenta-void'
  | 'fuchsia-shadow'
  | 'salmon-black'
  | 'blush-premium'
  | 'teal-night'
  | 'cyan-depth'
  | 'turquoise-void'
  | 'aqua-shadow'
  | 'mint-black'
  | 'seafoam-premium'
  | 'brown-night'
  | 'chocolate-depth'
  | 'coffee-void'
  | 'mahogany-shadow'
  | 'sienna-black'
  | 'russet-premium'
  | 'silver-night'
  | 'platinum-depth'
  | 'mercury-void'
  | 'steel-shadow'
  | 'graphite-black'
  | 'titanium-premium'
  | 'arctic-night'
  | 'glacier-depth'
  | 'frost-void'
  | 'ice-shadow'
  | 'pearl-black'
  | 'crystal-premium'
  | 'quantum-lime'
  | 'quantum-magenta'
  | 'quantum-cyan'
  | 'electric-void'
  | 'midnight-navy'
  | 'cyber-blue'
  | 'digital-forest'
  | 'cyber-emerald'
  | 'quantum-mint'
  | 'gunmetal-void'
  | 'steel-shadow'
  | 'obsidian-core'
  | 'crimson-depth'
  | 'copper-circuit'
  | 'neon-teal'
  | 'carbon-fiber'
  | 'titanium-void'
  | 'holographic-silver'
  | 'holographic-gold'
  | 'holographic-rainbow'
  | 'neon-pink'
  | 'neon-green'
  | 'neon-blue'
  | 'neon-orange'
  | 'chartreuse-night'
  | 'vermillion-void'
  | 'celadon-shadow'
  | 'chromium-depth'
  | 'iridium-night'
  | 'palladium-void'
  | 'nebula-purple'
  | 'starlight-silver'
  | 'cosmic-blue'
  | 'bio-green'
  | 'bio-blue'
  | 'bio-purple'
  | 'uranium-green'
  | 'plutonium-glow'
  | 'radium-light'
  | 'xenon-blue'
  | 'argon-purple'
  | 'helium-pink'
  | 'infrared-night'
  | 'ultraviolet-void'
  | 'gamma-green'
  | 'laser-red'
  | 'plasma-blue'
  | 'photon-white'
  | 'dark-matter'
  | 'antimatter-void'
  | 'wormhole-black'
  | 'supernova-gold'
  | 'blackhole-depth'
  | 'quasar-light'
  | 'midnight-pulse'
  | 'midnight-pulse-inverted'
  | 'parallax-absolute-void'
  | 'parallax-singularity'
  | 'parallax-black-light'
  | 'parallax-retina-burn'
  | 'parallax-meltdown'
  | 'parallax-void-star'
  | 'parallax-eventide-abyss'
  | 'parallax-ash'
  | 'parallax-martian-glass'
  | 'parallax-neural-purple'
  | 'parallax-bloodline-glass'
  | 'parallax-english-walnut'
  | 'parallax-ember-walnut'
  | 'parallax-blood-oak'
  | 'parallax-forged-cobalt'
  | 'parallax-abyss-light'
  | 'parallax-ocean-trench'
  | 'parallax-living-white'
  | 'parallax-dire-wolf'
  | 'parallax-ghost-white'
  | 'parallax-void-sprunk'
  | 'parallax-chrome-sapphire'
  | 'parallax-supernova'
  | 'parallax-void-star-deep'
  | 'parallax-ember-burn';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('simpleton-theme');
    // Migrate old defaults to current brand default
    if (!savedTheme || savedTheme === 'deep-navy' || savedTheme === 'simpleton-blue') return 'navy-bronze';
    return savedTheme as ThemeMode;
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes from both root and body
    const allThemes = ['navy-bronze', 'simpleton-blue', 'light', 'obsidian-black', 'carbon-black', 'void-black', 'shadow-black', 'midnight-black', 'deep-navy', 'royal-navy', 'prussian-blue', 'admiral-blue', 'sapphire-night', 'navy-steel', 'cobalt-depth', 'indigo-void', 'atlantic-deep', 'midnight-blue', 'quantum-dark', 'eclipse-black', 'charcoal-premium', 'steel-navy', 'onyx-black', 'crimson-night', 'ruby-depth', 'bordeaux-black', 'wine-shadow', 'cherry-void', 'scarlet-premium', 'forest-black', 'emerald-night', 'jade-depth', 'pine-shadow', 'moss-premium', 'hunter-void', 'golden-night', 'amber-depth', 'bronze-shadow', 'copper-premium', 'sunset-void', 'honey-black', 'violet-night', 'purple-depth', 'amethyst-void', 'plum-shadow', 'lavender-black', 'royal-purple', 'orange-night', 'flame-depth', 'burnt-shadow', 'tangerine-void', 'peach-black', 'coral-premium', 'pink-night', 'rose-depth', 'magenta-void', 'fuchsia-shadow', 'salmon-black', 'blush-premium', 'teal-night', 'cyan-depth', 'turquoise-void', 'aqua-shadow', 'mint-black', 'seafoam-premium', 'brown-night', 'chocolate-depth', 'coffee-void', 'mahogany-shadow', 'sienna-black', 'russet-premium', 'silver-night', 'platinum-depth', 'mercury-void', 'steel-shadow', 'graphite-black', 'titanium-premium', 'arctic-night', 'glacier-depth', 'frost-void', 'ice-shadow', 'pearl-black', 'crystal-premium', 'quantum-lime', 'quantum-magenta', 'quantum-cyan', 'electric-void', 'midnight-navy', 'cyber-blue', 'digital-forest', 'cyber-emerald', 'quantum-mint', 'gunmetal-void', 'steel-shadow', 'obsidian-core', 'crimson-depth', 'copper-circuit', 'neon-teal', 'carbon-fiber', 'titanium-void', 'holographic-silver', 'holographic-gold', 'holographic-rainbow', 'neon-pink', 'neon-green', 'neon-blue', 'neon-orange', 'chartreuse-night', 'vermillion-void', 'celadon-shadow', 'chromium-depth', 'iridium-night', 'palladium-void', 'nebula-purple', 'starlight-silver', 'cosmic-blue', 'bio-green', 'bio-blue', 'bio-purple', 'uranium-green', 'plutonium-glow', 'radium-light', 'xenon-blue', 'argon-purple', 'helium-pink', 'infrared-night', 'ultraviolet-void', 'gamma-green', 'laser-red', 'plasma-blue', 'photon-white', 'dark-matter', 'antimatter-void', 'wormhole-black', 'supernova-gold', 'blackhole-depth', 'quasar-light', 'midnight-pulse', 'midnight-pulse-inverted', 'parallax-absolute-void', 'parallax-singularity', 'parallax-black-light', 'parallax-retina-burn', 'parallax-meltdown', 'parallax-void-star', 'parallax-eventide-abyss', 'parallax-ash', 'parallax-martian-glass', 'parallax-neural-purple', 'parallax-bloodline-glass', 'parallax-english-walnut', 'parallax-ember-walnut', 'parallax-blood-oak', 'parallax-forged-cobalt', 'parallax-abyss-light', 'parallax-ocean-trench', 'parallax-living-white', 'parallax-dire-wolf', 'parallax-ghost-white', 'parallax-void-sprunk', 'parallax-chrome-sapphire', 'parallax-supernova', 'parallax-void-star-deep', 'parallax-ember-burn'];
    allThemes.forEach(themeClass => {
      root.classList.remove(themeClass);
      body.classList.remove(themeClass);
    });
    
    // Add current theme class to both root and body
    root.classList.add(theme);
    body.classList.add(theme);
    
    root.style.setProperty('--simpleton-brand', theme === 'simpleton-blue' ? '#FFFFFF' : '#2E5090');

    switch (theme) {
      case 'light':
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--foreground', '#000000');
        root.style.setProperty('--primary', '#0066cc');
        root.style.setProperty('--card', '#f8f9fa');
        break;
      
      // PREMIUM BLACK THEMES
      case 'obsidian-black':
        root.style.setProperty('--background', '#0B0B0B');
        root.style.setProperty('--foreground', '#E6E6E6');
        root.style.setProperty('--primary', '#FFD700');
        root.style.setProperty('--card', 'rgba(20, 20, 20, 0.9)');
        break;
      case 'carbon-black':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#F0F0F0');
        root.style.setProperty('--primary', '#00D4FF');
        root.style.setProperty('--card', 'rgba(25, 25, 25, 0.85)');
        break;
      case 'void-black':
        root.style.setProperty('--background', '#000000');
        root.style.setProperty('--foreground', '#FFFFFF');
        root.style.setProperty('--primary', '#FF6B6B');
        root.style.setProperty('--card', 'rgba(15, 15, 15, 0.95)');
        break;
      case 'shadow-black':
        root.style.setProperty('--background', '#0D0D0D');
        root.style.setProperty('--foreground', '#EDEDED');
        root.style.setProperty('--primary', '#9D4EDD');
        root.style.setProperty('--card', 'rgba(22, 22, 22, 0.9)');
        break;
      case 'midnight-black':
        root.style.setProperty('--background', '#080808');
        root.style.setProperty('--foreground', '#F5F5F5');
        root.style.setProperty('--primary', '#4ECDC4');
        root.style.setProperty('--card', 'rgba(18, 18, 18, 0.92)');
        break;
      case 'eclipse-black':
        root.style.setProperty('--background', '#050505');
        root.style.setProperty('--foreground', '#F8F8F8');
        root.style.setProperty('--primary', '#FF9F43');
        root.style.setProperty('--card', 'rgba(12, 12, 12, 0.96)');
        break;
      case 'charcoal-premium':
        root.style.setProperty('--background', '#0C0C0C');
        root.style.setProperty('--foreground', '#EEEEEE');
        root.style.setProperty('--primary', '#6C5CE7');
        root.style.setProperty('--card', 'rgba(28, 28, 28, 0.88)');
        break;
      case 'onyx-black':
        root.style.setProperty('--background', '#090909');
        root.style.setProperty('--foreground', '#F2F2F2');
        root.style.setProperty('--primary', '#00BFA5');
        root.style.setProperty('--card', 'rgba(21, 21, 21, 0.93)');
        break;
      
      // PREMIUM NAVY BLUE THEMES
      case 'navy-bronze':
        root.style.setProperty('--background', '#1A3F6A');
        root.style.setProperty('--foreground', '#FFFFFF');
        root.style.setProperty('--primary', '#CD7F32');
        root.style.setProperty('--card', 'rgba(26, 63, 106, 0.73)');
        root.style.setProperty('--accent', '#E8943A');
        root.style.setProperty('--border', '#CD7F32');
        break;
      case 'simpleton-blue':
        root.style.setProperty('--background', '#2E5090');
        root.style.setProperty('--foreground', '#FFFFFF');
        root.style.setProperty('--primary', '#F5A623');
        root.style.setProperty('--card', 'rgba(30, 58, 130, 0.60)');
        root.style.setProperty('--accent', '#F97316');
        root.style.setProperty('--border', '#F5A623');
        break;
      case 'deep-navy':
        root.style.setProperty('--background', '#0B1F3B');
        root.style.setProperty('--foreground', '#FFFFFF');
        root.style.setProperty('--primary', '#D4AF37');
        root.style.setProperty('--card', 'rgba(30, 42, 71, 0.6)');
        break;
      case 'royal-navy':
        root.style.setProperty('--background', '#001F3F');
        root.style.setProperty('--foreground', '#F0F8FF');
        root.style.setProperty('--primary', '#FFD700');
        root.style.setProperty('--card', 'rgba(10, 31, 63, 0.7)');
        break;
      case 'prussian-blue':
        root.style.setProperty('--background', '#003153');
        root.style.setProperty('--foreground', '#E6F3FF');
        root.style.setProperty('--primary', '#FF6B35');
        root.style.setProperty('--card', 'rgba(15, 49, 83, 0.65)');
        break;
      case 'admiral-blue':
        root.style.setProperty('--background', '#0A1A2A');
        root.style.setProperty('--foreground', '#F5F8FA');
        root.style.setProperty('--primary', '#FFA500');
        root.style.setProperty('--card', 'rgba(20, 36, 52, 0.8)');
        break;
      case 'sapphire-night':
        root.style.setProperty('--background', '#0F2027');
        root.style.setProperty('--foreground', '#E8F4F8');
        root.style.setProperty('--primary', '#4ECDC4');
        root.style.setProperty('--card', 'rgba(25, 45, 65, 0.75)');
        break;
      case 'navy-steel':
        root.style.setProperty('--background', '#1B263B');
        root.style.setProperty('--foreground', '#F0F4F8');
        root.style.setProperty('--primary', '#06FFA5');
        root.style.setProperty('--card', 'rgba(35, 50, 75, 0.7)');
        break;
      case 'cobalt-depth':
        root.style.setProperty('--background', '#0E1A40');
        root.style.setProperty('--foreground', '#E6EEFF');
        root.style.setProperty('--primary', '#FF4757');
        root.style.setProperty('--card', 'rgba(25, 40, 80, 0.72)');
        break;
      case 'indigo-void':
        root.style.setProperty('--background', '#1A0B3D');
        root.style.setProperty('--foreground', '#F0E6FF');
        root.style.setProperty('--primary', '#FFA726');
        root.style.setProperty('--card', 'rgba(35, 25, 70, 0.68)');
        break;
      case 'atlantic-deep':
        root.style.setProperty('--background', '#0C1B2A');
        root.style.setProperty('--foreground', '#E8F0F8');
        root.style.setProperty('--primary', '#26C6DA');
        root.style.setProperty('--card', 'rgba(22, 37, 52, 0.78)');
        break;
      case 'midnight-blue':
        root.style.setProperty('--background', '#0F172A');
        root.style.setProperty('--foreground', '#F1F5F9');
        root.style.setProperty('--primary', '#3B82F6');
        root.style.setProperty('--card', 'rgba(15, 23, 42, 0.8)');
        break;
      case 'steel-navy':
        root.style.setProperty('--background', '#1E2A3A');
        root.style.setProperty('--foreground', '#F2F6FA');
        root.style.setProperty('--primary', '#FF8A65');
        root.style.setProperty('--card', 'rgba(40, 55, 75, 0.74)');
        break;
      
      // SPECIAL QUANTUM THEME
      case 'quantum-dark':
        root.style.setProperty('--background', '#000011');
        root.style.setProperty('--foreground', '#00FFFF');
        root.style.setProperty('--primary', '#00FFFF');
        root.style.setProperty('--card', 'rgba(0, 34, 68, 0.6)');
        break;
      
      // PREMIUM RED THEMES
      case 'crimson-night':
        root.style.setProperty('--background', '#1A0A0A');
        root.style.setProperty('--foreground', '#FFE6E6');
        root.style.setProperty('--primary', '#FF4444');
        root.style.setProperty('--card', 'rgba(40, 20, 20, 0.85)');
        break;
      case 'ruby-depth':
        root.style.setProperty('--background', '#2D0B0B');
        root.style.setProperty('--foreground', '#FFEBEB');
        root.style.setProperty('--primary', '#DC143C');
        root.style.setProperty('--card', 'rgba(55, 25, 25, 0.8)');
        break;
      case 'bordeaux-black':
        root.style.setProperty('--background', '#0D0404');
        root.style.setProperty('--foreground', '#F5E6E6');
        root.style.setProperty('--primary', '#8B0000');
        root.style.setProperty('--card', 'rgba(28, 12, 12, 0.9)');
        break;
      case 'wine-shadow':
        root.style.setProperty('--background', '#1F0B0B');
        root.style.setProperty('--foreground', '#F8E8E8');
        root.style.setProperty('--primary', '#722F37');
        root.style.setProperty('--card', 'rgba(45, 22, 22, 0.87)');
        break;
      case 'cherry-void':
        root.style.setProperty('--background', '#0F0606');
        root.style.setProperty('--foreground', '#F2E8E8');
        root.style.setProperty('--primary', '#DE3163');
        root.style.setProperty('--card', 'rgba(32, 18, 18, 0.92)');
        break;
      case 'scarlet-premium':
        root.style.setProperty('--background', '#140808');
        root.style.setProperty('--foreground', '#FFECEC');
        root.style.setProperty('--primary', '#FF2400');
        root.style.setProperty('--card', 'rgba(38, 20, 20, 0.88)');
        break;
      
      // PREMIUM GREEN THEMES
      case 'forest-black':
        root.style.setProperty('--background', '#0A1A0A');
        root.style.setProperty('--foreground', '#E6FFE6');
        root.style.setProperty('--primary', '#00FF44');
        root.style.setProperty('--card', 'rgba(20, 40, 20, 0.85)');
        break;
      case 'emerald-night':
        root.style.setProperty('--background', '#0B2D0B');
        root.style.setProperty('--foreground', '#EBFFEB');
        root.style.setProperty('--primary', '#50C878');
        root.style.setProperty('--card', 'rgba(25, 55, 25, 0.8)');
        break;
      case 'jade-depth':
        root.style.setProperty('--background', '#040D04');
        root.style.setProperty('--foreground', '#E6F5E6');
        root.style.setProperty('--primary', '#00A86B');
        root.style.setProperty('--card', 'rgba(12, 28, 12, 0.9)');
        break;
      case 'pine-shadow':
        root.style.setProperty('--background', '#0B1F0B');
        root.style.setProperty('--foreground', '#E8F8E8');
        root.style.setProperty('--primary', '#1B4332');
        root.style.setProperty('--card', 'rgba(22, 45, 22, 0.87)');
        break;
      case 'moss-premium':
        root.style.setProperty('--background', '#060F06');
        root.style.setProperty('--foreground', '#E8F2E8');
        root.style.setProperty('--primary', '#2D5016');
        root.style.setProperty('--card', 'rgba(18, 32, 18, 0.92)');
        break;
      case 'hunter-void':
        root.style.setProperty('--background', '#081408');
        root.style.setProperty('--foreground', '#ECFFEC');
        root.style.setProperty('--primary', '#355E3B');
        root.style.setProperty('--card', 'rgba(20, 38, 20, 0.88)');
        break;
      
      // PREMIUM YELLOW/GOLD THEMES
      case 'golden-night':
        root.style.setProperty('--background', '#1A1A0A');
        root.style.setProperty('--foreground', '#FFFFE6');
        root.style.setProperty('--primary', '#FFD700');
        root.style.setProperty('--card', 'rgba(40, 40, 20, 0.85)');
        break;
      case 'amber-depth':
        root.style.setProperty('--background', '#2D2D0B');
        root.style.setProperty('--foreground', '#FFFFEB');
        root.style.setProperty('--primary', '#FFBF00');
        root.style.setProperty('--card', 'rgba(55, 55, 25, 0.8)');
        break;
      case 'bronze-shadow':
        root.style.setProperty('--background', '#0D0D04');
        root.style.setProperty('--foreground', '#F5F5E6');
        root.style.setProperty('--primary', '#CD7F32');
        root.style.setProperty('--card', 'rgba(28, 28, 12, 0.9)');
        break;
      case 'copper-premium':
        root.style.setProperty('--background', '#1F1F0B');
        root.style.setProperty('--foreground', '#F8F8E8');
        root.style.setProperty('--primary', '#B87333');
        root.style.setProperty('--card', 'rgba(45, 45, 22, 0.87)');
        break;
      case 'sunset-void':
        root.style.setProperty('--background', '#0F0F06');
        root.style.setProperty('--foreground', '#F2F2E8');
        root.style.setProperty('--primary', '#FF8C00');
        root.style.setProperty('--card', 'rgba(32, 32, 18, 0.92)');
        break;
      case 'honey-black':
        root.style.setProperty('--background', '#141408');
        root.style.setProperty('--foreground', '#FFFFEC');
        root.style.setProperty('--primary', '#FFC30B');
        root.style.setProperty('--card', 'rgba(38, 38, 20, 0.88)');
        break;
      
      // PREMIUM PURPLE/VIOLET THEMES
      case 'violet-night':
        root.style.setProperty('--background', '#1A0A1A');
        root.style.setProperty('--foreground', '#FFE6FF');
        root.style.setProperty('--primary', '#9932CC');
        root.style.setProperty('--card', 'rgba(40, 20, 40, 0.85)');
        break;
      case 'purple-depth':
        root.style.setProperty('--background', '#2D0B2D');
        root.style.setProperty('--foreground', '#FFEBFF');
        root.style.setProperty('--primary', '#8A2BE2');
        root.style.setProperty('--card', 'rgba(55, 25, 55, 0.8)');
        break;
      case 'amethyst-void':
        root.style.setProperty('--background', '#0D040D');
        root.style.setProperty('--foreground', '#F5E6F5');
        root.style.setProperty('--primary', '#9966CC');
        root.style.setProperty('--card', 'rgba(28, 12, 28, 0.9)');
        break;
      case 'plum-shadow':
        root.style.setProperty('--background', '#1F0B1F');
        root.style.setProperty('--foreground', '#F8E8F8');
        root.style.setProperty('--primary', '#DDA0DD');
        root.style.setProperty('--card', 'rgba(45, 22, 45, 0.87)');
        break;
      case 'lavender-black':
        root.style.setProperty('--background', '#0F060F');
        root.style.setProperty('--foreground', '#F2E8F2');
        root.style.setProperty('--primary', '#E6E6FA');
        root.style.setProperty('--card', 'rgba(32, 18, 32, 0.92)');
        break;
      case 'royal-purple':
        root.style.setProperty('--background', '#140814');
        root.style.setProperty('--foreground', '#FFECFF');
        root.style.setProperty('--primary', '#7851A9');
        root.style.setProperty('--card', 'rgba(38, 20, 38, 0.88)');
        break;
      
      // FUTURISTIC QUANTUM THEMES
      case 'quantum-lime':
        root.style.setProperty('--background', '#0A0A00');
        root.style.setProperty('--foreground', '#CCFF00');
        root.style.setProperty('--primary', '#CCFF00');
        root.style.setProperty('--card', 'rgba(40, 40, 10, 0.85)');
        break;
      case 'quantum-magenta':
        root.style.setProperty('--background', '#0A000A');
        root.style.setProperty('--foreground', '#FF00FF');
        root.style.setProperty('--primary', '#FF00FF');
        root.style.setProperty('--card', 'rgba(40, 10, 40, 0.85)');
        break;
      case 'quantum-cyan':
        root.style.setProperty('--background', '#000A0A');
        root.style.setProperty('--foreground', '#00FFFF');
        root.style.setProperty('--primary', '#00FFFF');
        root.style.setProperty('--card', 'rgba(10, 40, 40, 0.85)');
        break;
      
      // HOLOGRAPHIC THEMES
      case 'holographic-silver':
        root.style.setProperty('--background', '#0C0C0C');
        root.style.setProperty('--foreground', '#C0C0C0');
        root.style.setProperty('--primary', '#C0C0C0');
        root.style.setProperty('--card', 'rgba(30, 30, 30, 0.9)');
        break;
      case 'holographic-gold':
        root.style.setProperty('--background', '#1A1A00');
        root.style.setProperty('--foreground', '#FFD700');
        root.style.setProperty('--primary', '#FFD700');
        root.style.setProperty('--card', 'rgba(50, 50, 10, 0.85)');
        break;
      case 'holographic-rainbow':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#FFFFFF');
        root.style.setProperty('--primary', '#FF69B4');
        root.style.setProperty('--card', 'rgba(25, 25, 25, 0.9)');
        break;
      
      // NEON CYBERPUNK THEMES
      case 'neon-pink':
        root.style.setProperty('--background', '#1A0A1A');
        root.style.setProperty('--foreground', '#FF1493');
        root.style.setProperty('--primary', '#FF69B4');
        root.style.setProperty('--card', 'rgba(40, 20, 40, 0.85)');
        break;
      case 'neon-green':
        root.style.setProperty('--background', '#0A1A0A');
        root.style.setProperty('--foreground', '#00FF00');
        root.style.setProperty('--primary', '#39FF14');
        root.style.setProperty('--card', 'rgba(20, 40, 20, 0.85)');
        break;
      case 'neon-blue':
        root.style.setProperty('--background', '#0A0A1A');
        root.style.setProperty('--foreground', '#0080FF');
        root.style.setProperty('--primary', '#1B03A3');
        root.style.setProperty('--card', 'rgba(20, 20, 40, 0.85)');
        break;
      case 'neon-orange':
        root.style.setProperty('--background', '#1A0A00');
        root.style.setProperty('--foreground', '#FF4500');
        root.style.setProperty('--primary', '#FF6600');
        root.style.setProperty('--card', 'rgba(40, 20, 10, 0.85)');
        break;
      
      // EXOTIC RARE COLORS
      case 'chartreuse-night':
        root.style.setProperty('--background', '#0A0A00');
        root.style.setProperty('--foreground', '#DFFF00');
        root.style.setProperty('--primary', '#7FFF00');
        root.style.setProperty('--card', 'rgba(20, 20, 5, 0.9)');
        break;
      case 'vermillion-void':
        root.style.setProperty('--background', '#0D0400');
        root.style.setProperty('--foreground', '#FF4500');
        root.style.setProperty('--primary', '#E34234');
        root.style.setProperty('--card', 'rgba(25, 12, 5, 0.92)');
        break;
      case 'celadon-shadow':
        root.style.setProperty('--background', '#020A05');
        root.style.setProperty('--foreground', '#ACE1AF');
        root.style.setProperty('--primary', '#9FE2BF');
        root.style.setProperty('--card', 'rgba(10, 25, 15, 0.88)');
        break;
      
      // SPACE-AGE THEMES
      case 'nebula-purple':
        root.style.setProperty('--background', '#0B0B1A');
        root.style.setProperty('--foreground', '#DA70D6');
        root.style.setProperty('--primary', '#9370DB');
        root.style.setProperty('--card', 'rgba(25, 25, 50, 0.85)');
        break;
      case 'starlight-silver':
        root.style.setProperty('--background', '#0C0C0C');
        root.style.setProperty('--foreground', '#F8F8FF');
        root.style.setProperty('--primary', '#C0C0C0');
        root.style.setProperty('--card', 'rgba(30, 30, 30, 0.9)');
        break;
      case 'cosmic-blue':
        root.style.setProperty('--background', '#000014');
        root.style.setProperty('--foreground', '#4169E1');
        root.style.setProperty('--primary', '#0047AB');
        root.style.setProperty('--card', 'rgba(10, 10, 40, 0.88)');
        break;
      
      // BIOLUMINESCENT THEMES
      case 'bio-green':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#00FF7F');
        root.style.setProperty('--primary', '#39FF14');
        root.style.setProperty('--card', 'rgba(20, 25, 20, 0.9)');
        break;
      case 'bio-blue':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#00BFFF');
        root.style.setProperty('--primary', '#1E90FF');
        root.style.setProperty('--card', 'rgba(20, 20, 25, 0.9)');
        break;
      case 'bio-purple':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#9932CC');
        root.style.setProperty('--primary', '#8A2BE2');
        root.style.setProperty('--card', 'rgba(25, 20, 25, 0.9)');
        break;
      
      // RADIOACTIVE THEMES
      case 'uranium-green':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#00FF00');
        root.style.setProperty('--primary', '#32CD32');
        root.style.setProperty('--card', 'rgba(20, 30, 20, 0.9)');
        break;
      case 'plutonium-glow':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#FFFF00');
        root.style.setProperty('--primary', '#FFD700');
        root.style.setProperty('--card', 'rgba(30, 30, 20, 0.9)');
        break;
      case 'radium-light':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#F0F8FF');
        root.style.setProperty('--primary', '#E0E0E0');
        root.style.setProperty('--card', 'rgba(25, 25, 25, 0.9)');
        break;
      
      // EXOTIC ELEMENT THEMES
      case 'xenon-blue':
        root.style.setProperty('--background', '#0A0A14');
        root.style.setProperty('--foreground', '#4169E1');
        root.style.setProperty('--primary', '#0080FF');
        root.style.setProperty('--card', 'rgba(20, 20, 40, 0.9)');
        break;
      case 'argon-purple':
        root.style.setProperty('--background', '#0A0A14');
        root.style.setProperty('--foreground', '#9370DB');
        root.style.setProperty('--primary', '#8A2BE2');
        root.style.setProperty('--card', 'rgba(25, 20, 40, 0.9)');
        break;
      case 'helium-pink':
        root.style.setProperty('--background', '#14040A');
        root.style.setProperty('--foreground', '#FF69B4');
        root.style.setProperty('--primary', '#FF1493');
        root.style.setProperty('--card', 'rgba(40, 15, 25, 0.9)');
        break;
      
      // ELECTROMAGNETIC SPECTRUM THEMES
      case 'infrared-night':
        root.style.setProperty('--background', '#0A0000');
        root.style.setProperty('--foreground', '#FF4500');
        root.style.setProperty('--primary', '#DC143C');
        root.style.setProperty('--card', 'rgba(25, 5, 5, 0.9)');
        break;
      case 'ultraviolet-void':
        root.style.setProperty('--background', '#050A14');
        root.style.setProperty('--foreground', '#6A0DAD');
        root.style.setProperty('--primary', '#4B0082');
        root.style.setProperty('--card', 'rgba(15, 25, 40, 0.9)');
        break;
      case 'gamma-green':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#00FF00');
        root.style.setProperty('--primary', '#32CD32');
        root.style.setProperty('--card', 'rgba(20, 30, 20, 0.9)');
        break;
      
      // ENERGY THEMES
      case 'laser-red':
        root.style.setProperty('--background', '#0A0000');
        root.style.setProperty('--foreground', '#FF0000');
        root.style.setProperty('--primary', '#DC143C');
        root.style.setProperty('--card', 'rgba(25, 5, 5, 0.9)');
        break;
      case 'plasma-blue':
        root.style.setProperty('--background', '#00000A');
        root.style.setProperty('--foreground', '#0080FF');
        root.style.setProperty('--primary', '#1E90FF');
        root.style.setProperty('--card', 'rgba(5, 5, 25, 0.9)');
        break;
      case 'photon-white':
        root.style.setProperty('--background', '#0A0A0A');
        root.style.setProperty('--foreground', '#FFFFFF');
        root.style.setProperty('--primary', '#F0F8FF');
        root.style.setProperty('--card', 'rgba(25, 25, 25, 0.9)');
        break;
      
      // COSMIC PHENOMENA THEMES
      case 'dark-matter':
        root.style.setProperty('--background', '#000000');
        root.style.setProperty('--foreground', '#4B0082');
        root.style.setProperty('--primary', '#9370DB');
        root.style.setProperty('--card', 'rgba(15, 15, 15, 0.95)');
        break;
      case 'antimatter-void':
        root.style.setProperty('--background', '#050505');
        root.style.setProperty('--foreground', '#FF00FF');
        root.style.setProperty('--primary', '#FF1493');
        root.style.setProperty('--card', 'rgba(20, 20, 20, 0.92)');
        break;
      case 'wormhole-black':
        root.style.setProperty('--background', '#000000');
        root.style.setProperty('--foreground', '#00FFFF');
        root.style.setProperty('--primary', '#1E90FF');
        root.style.setProperty('--card', 'rgba(10, 10, 10, 0.98)');
        break;
      case 'supernova-gold':
        root.style.setProperty('--background', '#0A0A00');
        root.style.setProperty('--foreground', '#FFD700');
        root.style.setProperty('--primary', '#FFA500');
        root.style.setProperty('--card', 'rgba(30, 30, 10, 0.9)');
        break;
      case 'blackhole-depth':
        root.style.setProperty('--background', '#000000');
        root.style.setProperty('--foreground', '#FFFFFF');
        root.style.setProperty('--primary', '#696969');
        root.style.setProperty('--card', 'rgba(5, 5, 5, 0.98)');
        break;
      case 'quasar-light':
        root.style.setProperty('--background', '#000011');
        root.style.setProperty('--foreground', '#FFFFFF');
        root.style.setProperty('--primary', '#00FFFF');
        root.style.setProperty('--card', 'rgba(10, 10, 30, 0.9)');
        break;
      case 'midnight-pulse':
        root.style.setProperty('--background', '#FFFFFF');
        root.style.setProperty('--foreground', '#010137');
        root.style.setProperty('--primary', '#010137');
        root.style.setProperty('--card', 'rgba(1, 1, 55, 0.05)');
        root.style.setProperty('--border', 'rgba(55, 55, 1, 0.18)');
        break;
      case 'midnight-pulse-inverted':
        root.style.setProperty('--background', '#010137');
        root.style.setProperty('--foreground', '#FFFFFF');
        root.style.setProperty('--primary', '#FFFFFF');
        root.style.setProperty('--card', 'rgba(255, 255, 255, 0.06)');
        root.style.setProperty('--border', 'rgba(55, 55, 1, 0.35)');
        break;

      case 'parallax-absolute-void':
        root.style.setProperty('--background', '#000000');
        root.style.setProperty('--foreground', '#F0F0F0');
        root.style.setProperty('--primary', '#AAAAAA');
        root.style.setProperty('--card', '#1A1A1A');
        root.style.setProperty('--accent', '#808080');
        root.style.setProperty('--border', '#333333');
        break;
      case 'parallax-singularity':
        root.style.setProperty('--background', '#010101');
        root.style.setProperty('--foreground', '#F0F0F0');
        root.style.setProperty('--primary', '#CCCCCC');
        root.style.setProperty('--card', '#1A1A1A');
        root.style.setProperty('--accent', '#999999');
        root.style.setProperty('--border', '#333333');
        break;
      case 'parallax-black-light':
        root.style.setProperty('--background', '#00001E');
        root.style.setProperty('--foreground', '#B0D0FF');
        root.style.setProperty('--primary', '#4080FF');
        root.style.setProperty('--card', '#0A1A2A');
        root.style.setProperty('--accent', '#70A0FF');
        root.style.setProperty('--border', '#1A3A5A');
        break;
      case 'parallax-retina-burn':
        root.style.setProperty('--background', '#08084A');
        root.style.setProperty('--foreground', '#C0D0FF');
        root.style.setProperty('--primary', '#7A9EFF');
        root.style.setProperty('--card', '#101A5A');
        root.style.setProperty('--accent', '#9ABEFF');
        root.style.setProperty('--border', '#2A3A7A');
        break;
      case 'parallax-meltdown':
        root.style.setProperty('--background', '#000028');
        root.style.setProperty('--foreground', '#C0E0FF');
        root.style.setProperty('--primary', '#6080FF');
        root.style.setProperty('--card', '#0A1A38');
        root.style.setProperty('--accent', '#80A0FF');
        root.style.setProperty('--border', '#1A3A68');
        break;
      case 'parallax-void-star':
        root.style.setProperty('--background', '#000044');
        root.style.setProperty('--foreground', '#C0D0FF');
        root.style.setProperty('--primary', '#6688FF');
        root.style.setProperty('--card', '#101A54');
        root.style.setProperty('--accent', '#88AAFF');
        root.style.setProperty('--border', '#2A3A74');
        break;
      case 'parallax-eventide-abyss':
        root.style.setProperty('--background', '#23152E');
        root.style.setProperty('--foreground', '#E0D0E0');
        root.style.setProperty('--primary', '#BFA3CF');
        root.style.setProperty('--card', '#2A1D33');
        root.style.setProperty('--accent', '#A78BFA');
        root.style.setProperty('--border', '#3E2A4A');
        break;
      case 'parallax-ash':
        root.style.setProperty('--background', '#332B40');
        root.style.setProperty('--foreground', '#E0D0E0');
        root.style.setProperty('--primary', '#C0B0D0');
        root.style.setProperty('--card', '#3A324A');
        root.style.setProperty('--accent', '#B09AC0');
        root.style.setProperty('--border', '#4A3A5A');
        break;
      case 'parallax-martian-glass':
        root.style.setProperty('--background', '#1A1022');
        root.style.setProperty('--foreground', '#E0C0E0');
        root.style.setProperty('--primary', '#C090C0');
        root.style.setProperty('--card', '#221A2A');
        root.style.setProperty('--accent', '#B080B0');
        root.style.setProperty('--border', '#322A3A');
        break;
      case 'parallax-neural-purple':
        root.style.setProperty('--background', '#4A00B0');
        root.style.setProperty('--foreground', '#F0E0FF');
        root.style.setProperty('--primary', '#D0A0FF');
        root.style.setProperty('--card', '#5A1AC0');
        root.style.setProperty('--accent', '#E0B0FF');
        root.style.setProperty('--border', '#7A3AD0');
        break;
      case 'parallax-bloodline-glass':
        root.style.setProperty('--background', '#7F242C');
        root.style.setProperty('--foreground', '#FFD0D0');
        root.style.setProperty('--primary', '#FF9999');
        root.style.setProperty('--card', '#8F2A32');
        root.style.setProperty('--accent', '#FFB0B0');
        root.style.setProperty('--border', '#A03A42');
        break;
      case 'parallax-english-walnut':
        root.style.setProperty('--background', '#3F2A1F');
        root.style.setProperty('--foreground', '#F0E0C0');
        root.style.setProperty('--primary', '#D2B48C');
        root.style.setProperty('--card', '#4F3A2F');
        root.style.setProperty('--accent', '#E0C090');
        root.style.setProperty('--border', '#5F4A3F');
        break;
      case 'parallax-ember-walnut':
        root.style.setProperty('--background', '#5F2A1F');
        root.style.setProperty('--foreground', '#FFE0C0');
        root.style.setProperty('--primary', '#FFB07C');
        root.style.setProperty('--card', '#6F3A2F');
        root.style.setProperty('--accent', '#FFC090');
        root.style.setProperty('--border', '#7F4A3F');
        break;
      case 'parallax-blood-oak':
        root.style.setProperty('--background', '#1A0000');
        root.style.setProperty('--foreground', '#FFC0C0');
        root.style.setProperty('--primary', '#FF8080');
        root.style.setProperty('--card', '#2A1010');
        root.style.setProperty('--accent', '#FFA0A0');
        root.style.setProperty('--border', '#3A2020');
        break;
      case 'parallax-forged-cobalt':
        root.style.setProperty('--background', '#1C2A3F');
        root.style.setProperty('--foreground', '#C0D0F0');
        root.style.setProperty('--primary', '#8090C0');
        root.style.setProperty('--card', '#2A3A4F');
        root.style.setProperty('--accent', '#A0B0E0');
        root.style.setProperty('--border', '#3A4A6F');
        break;
      case 'parallax-abyss-light':
        root.style.setProperty('--background', '#0A1A46');
        root.style.setProperty('--foreground', '#C0D0FF');
        root.style.setProperty('--primary', '#7080FF');
        root.style.setProperty('--card', '#1A2A56');
        root.style.setProperty('--accent', '#90A0FF');
        root.style.setProperty('--border', '#2A3A76');
        break;
      case 'parallax-ocean-trench':
        root.style.setProperty('--background', '#0A1A2A');
        root.style.setProperty('--foreground', '#C0E0F0');
        root.style.setProperty('--primary', '#70B0FF');
        root.style.setProperty('--card', '#1A2A3A');
        root.style.setProperty('--accent', '#90C0FF');
        root.style.setProperty('--border', '#2A3A4A');
        break;
      case 'parallax-living-white':
        root.style.setProperty('--background', '#FAF7F0');
        root.style.setProperty('--foreground', '#2A2A2A');
        root.style.setProperty('--primary', '#6B4F7F');
        root.style.setProperty('--card', '#FFFFFF');
        root.style.setProperty('--accent', '#8A6B9A');
        root.style.setProperty('--border', '#D0D0D0');
        break;
      case 'parallax-dire-wolf':
        root.style.setProperty('--background', '#282828');
        root.style.setProperty('--foreground', '#F0F0F0');
        root.style.setProperty('--primary', '#AAAAAA');
        root.style.setProperty('--card', '#383838');
        root.style.setProperty('--accent', '#C0C0C0');
        root.style.setProperty('--border', '#505050');
        break;
      case 'parallax-ghost-white':
        root.style.setProperty('--background', '#F5F0FA');
        root.style.setProperty('--foreground', '#2A2A2A');
        root.style.setProperty('--primary', '#8A6B8A');
        root.style.setProperty('--card', '#FFFFFF');
        root.style.setProperty('--accent', '#A07FA0');
        root.style.setProperty('--border', '#D0D0D0');
        break;
      case 'parallax-void-sprunk':
        root.style.setProperty('--background', '#0F5F19');
        root.style.setProperty('--foreground', '#E0FFC0');
        root.style.setProperty('--primary', '#B0FF70');
        root.style.setProperty('--card', '#1F6F29');
        root.style.setProperty('--accent', '#C0FF90');
        root.style.setProperty('--border', '#2F7F39');
        break;
      case 'parallax-chrome-sapphire':
        root.style.setProperty('--background', '#00AAFF');
        root.style.setProperty('--foreground', '#1A1A1A');
        root.style.setProperty('--primary', '#0066CC');
        root.style.setProperty('--card', '#20BAFF');
        root.style.setProperty('--accent', '#0080FF');
        root.style.setProperty('--border', '#1090E0');
        break;
      case 'parallax-supernova':
        root.style.setProperty('--background', '#010058');
        root.style.setProperty('--foreground', '#C0D0FF');
        root.style.setProperty('--primary', '#8090FF');
        root.style.setProperty('--card', '#111A68');
        root.style.setProperty('--accent', '#A0B0FF');
        root.style.setProperty('--border', '#212A78');
        break;
      case 'parallax-void-star-deep':
        root.style.setProperty('--background', '#010044');
        root.style.setProperty('--foreground', '#C0D0FF');
        root.style.setProperty('--primary', '#6688FF');
        root.style.setProperty('--card', '#111A54');
        root.style.setProperty('--accent', '#88AAFF');
        root.style.setProperty('--border', '#212A64');
        break;
      case 'parallax-ember-burn':
        root.style.setProperty('--background', '#03014C');
        root.style.setProperty('--foreground', '#C0D0FF');
        root.style.setProperty('--primary', '#7A8EFF');
        root.style.setProperty('--card', '#131A5C');
        root.style.setProperty('--accent', '#9AAEFF');
        root.style.setProperty('--border', '#232A6C');
        break;
    }
    
    localStorage.setItem('simpleton-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};