import { useState } from "react";
import { Play, Pause, RotateCcw, BookOpen, Calculator, Zap, Brain, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TutorialDemo } from "@/components/tutorial-demo";
import { cn } from "@/lib/utils";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: "Calculator" | "Features" | "SCRAP" | "AI" | "Memory";
  icon: React.ReactNode;
  steps: TutorialStep[];
  featured?: boolean;
}

interface TutorialStep {
  title: string;
  description: string;
  action: string;
  duration: number;
}

const tutorials: Tutorial[] = [
  {
    id: "basic-calculator",
    title: "Master the Calculator Interface",
    description: "Learn how to use the Simpleton precious metals calculator with professional-grade precision",
    duration: "4:30",
    difficulty: "Beginner",
    category: "Calculator",
    icon: <Calculator className="w-5 h-5" />,
    featured: true,
    steps: [
      {
        title: "Understanding the Display",
        description: "Learn about the LED display system with live market pricing",
        action: "Explore the main display showing current metal values",
        duration: 45
      },
      {
        title: "Metal Selection",
        description: "How to switch between Gold, Silver, Platinum with authentic metallic gradients",
        action: "Click through different metals and see live price updates",
        duration: 60
      },
      {
        title: "Karat Selection",
        description: "Using the ergonomically designed karat buttons sized by frequency",
        action: "Try different karat selections: 14K, 18K, 10K, .925 silver",
        duration: 75
      },
      {
        title: "Weight Input & Units",
        description: "Master weight input and unit conversion between grams and troy ounces",
        action: "Input weights and switch between measurement units",
        duration: 90
      }
    ]
  },
  {
    id: "scrap-batch-processing",
    title: "SCRAP Batch Calculator",
    description: "Mixed-lot processing system - calculate multiple scrap pieces simultaneously",
    duration: "6:15",
    difficulty: "Intermediate",
    category: "SCRAP",
    icon: <Zap className="w-5 h-5" />,
    featured: true,
    steps: [
      {
        title: "Opening SCRAP Mode",
        description: "Access the purple SCRAP button for batch processing",
        action: "Click the SCRAP button to enter batch mode",
        duration: 30
      },
      {
        title: "Adding Multiple Items",
        description: "Learn to add mixed scrap pieces: '5g of 14K + 3g of 18K + 2g of 10K'",
        action: "Add various scrap pieces to see live batch totals",
        duration: 120
      },
      {
        title: "Managing Your Batch",
        description: "Remove individual items and clear entire batches efficiently",
        action: "Practice batch management with real-time value updates",
        duration: 90
      },
      {
        title: "Real-World Applications",
        description: "Professional dealer workflows for estate jewelry and mixed lots",
        action: "Simulate actual scrap buying scenarios",
        duration: 135
      }
    ]
  },
  {
    id: "custom-rates-autofill",
    title: "Mathematical Price Interpolation System",
    description: "Auto-Fill feature using linear regression algorithms for price estimation",
    duration: "5:45",
    difficulty: "Advanced",
    category: "Features",
    icon: <Brain className="w-5 h-5" />,
    steps: [
      {
        title: "Accessing Custom Rates",
        description: "Open the professional custom rates modal interface",
        action: "Navigate to Custom Rates settings",
        duration: 45
      },
      {
        title: "Understanding Auto-Fill",
        description: "How mathematical interpolation calculates missing prices based on purity percentages",
        action: "See the algorithm work with sample price inputs",
        duration: 120
      },
      {
        title: "Setting Base Prices",
        description: "Input minimum 2 gold prices to establish mathematical relationships",
        action: "Practice setting foundation prices for interpolation",
        duration: 90
      },
      {
        title: "Mathematical Results",
        description: "Watch as missing prices are calculated using metallurgical science",
        action: "Execute Auto-Fill and see instant mathematical completion",
        duration: 90
      }
    ]
  },
  {
    id: "memory-system",
    title: "Advanced Memory & State Persistence",
    description: "Master the comprehensive memory system that saves all calculator states",
    duration: "3:20",
    difficulty: "Intermediate",
    category: "Memory",
    icon: <BookOpen className="w-5 h-5" />,
    steps: [
      {
        title: "Automatic State Saving",
        description: "How the calculator remembers your settings across browser sessions",
        action: "See memory system save display, metal selection, and custom rates",
        duration: 60
      },
      {
        title: "Custom Price Memory",
        description: "Advanced backup and recall system for custom pricing configurations",
        action: "Practice backup creation and previous rate recall",
        duration: 90
      },
      {
        title: "Memory Reset Functions",
        description: "When and how to reset memory for fresh calculator states",
        action: "Learn proper memory management techniques",
        duration: 50
      }
    ]
  },
  {
    id: "ai-integration",
    title: "Simplicity AI Integration",
    description: "Master the AI assistant with broad knowledge and image analysis capabilities",
    duration: "7:30",
    difficulty: "Advanced",
    category: "AI",
    icon: <Gem className="w-5 h-5" />,
    featured: true,
    steps: [
      {
        title: "Accessing the AI Assistant",
        description: "Open the Simplicity AI assistant from any page",
        action: "Navigate to AI assistant and explore the interface",
        duration: 45
      },
      {
        title: "Simpleton Vision™",
        description: "Upload images for AI-powered visual analysis",
        action: "Practice image upload and analysis workflow",
        duration: 150
      },
      {
        title: "Expert Knowledge Base",
        description: "Ask questions about precious metals, diamonds, watches, and any topic",
        action: "Explore the comprehensive knowledge capabilities",
        duration: 120
      },
      {
        title: "AI Visual Assessment",
        description: "Learn how the AI provides preliminary observations on uploaded items. For informational purposes only — professional authentication recommended for all transactions.",
        action: "See the AI analyze materials, manufacturing details, and visual indicators",
        duration: 135
      }
    ]
  },
  {
    id: "fractional-calculations",
    title: "Fractional Ounce Calculations",
    description: "Master fractional coin calculations with the fractional button",
    duration: "4:00",
    difficulty: "Beginner",
    category: "Calculator",
    icon: <Calculator className="w-5 h-5" />,
    steps: [
      {
        title: "Fractional Button Usage",
        description: "Access common fractional sizes: 1/2 oz, 1/4 oz, 1/10 oz, 1/100 oz",
        action: "Cycle through fractional options and see automatic unit switching",
        duration: 60
      },
      {
        title: "Automatic Mode Switching",
        description: "How the calculator switches to troy ounce mode automatically",
        action: "Watch seamless mode transitions for fractional calculations",
        duration: 75
      },
      {
        title: "Real Coin Applications",
        description: "Calculate values for American Eagles, Maple Leafs, and fractional gold coins",
        action: "Practice with common fractional coin products",
        duration: 105
      }
    ]
  }
];

export default function Tutorials() {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Calculator", "Features", "SCRAP", "AI", "Memory"];
  
  const filteredTutorials = selectedCategory === "All" 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory);

  const getDifficultyColor = (difficulty: Tutorial["difficulty"]) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    }
  };

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const nextStep = () => {
    if (selectedTutorial && currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(((currentStep + 1) / selectedTutorial.steps.length) * 100);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProgress((currentStep - 1) / (selectedTutorial?.steps.length || 1) * 100);
    }
  };

  const resetTutorial = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  if (selectedTutorial) {
    const currentStepData = selectedTutorial.steps[currentStep];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-8 quantum-scroll-area quantum-content-wrapper">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => setSelectedTutorial(null)}
              variant="outline"
              className="mb-4 border-white/20 text-white hover:bg-white/10"
            >
              ← Back to Tutorials
            </Button>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                {selectedTutorial.icon}
                <h1 className="text-2xl font-bold">{selectedTutorial.title}</h1>
                <Badge className={getDifficultyColor(selectedTutorial.difficulty)}>
                  {selectedTutorial.difficulty}
                </Badge>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Step {currentStep + 1} of {selectedTutorial.steps.length}</span>
                <span>{selectedTutorial.duration} total</span>
              </div>
            </div>
          </div>

          {/* Tutorial Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Demo Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step Display */}
              <Card className="bg-black/50 backdrop-blur-sm border-white/20 text-white">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-black" />
                      ) : (
                        <Play className="w-6 h-6 text-black ml-1" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
                      <p className="text-gray-300">{currentStepData.description}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Practice Action:</h4>
                    <p className="text-blue-100">{currentStepData.action}</p>
                  </div>
                </div>
              </Card>

              {/* Interactive Demo */}
              <TutorialDemo 
                tutorialType={
                  selectedTutorial.id === "basic-calculator" ? "basic" :
                  selectedTutorial.id === "scrap-batch-processing" ? "scrap" :
                  selectedTutorial.id === "custom-rates-autofill" ? "custom-rates" :
                  selectedTutorial.id === "fractional-calculations" ? "fractional" :
                  "basic"
                }
              />

              {/* Navigation Controls */}
              <Card className="bg-black/50 backdrop-blur-sm border-white/20 text-white">
                <div className="p-6">
                  <div className="flex gap-2">
                    <Button
                      onClick={previousStep}
                      disabled={currentStep === 0}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    
                    <Button
                      onClick={nextStep}
                      disabled={currentStep === selectedTutorial.steps.length - 1}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      {currentStep === selectedTutorial.steps.length - 1 ? "Complete" : "Next Step"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Steps Sidebar */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Tutorial Steps</h3>
              
              {selectedTutorial.steps.map((step, index) => (
                <Card
                  key={index}
                  className={cn(
                    "p-4 cursor-pointer transition-all border-white/20",
                    index === currentStep
                      ? "bg-yellow-500/20 border-yellow-400 text-white"
                      : index < currentStep
                      ? "bg-green-500/20 border-green-400 text-white"
                      : "bg-white/5 text-gray-300"
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                      index === currentStep
                        ? "bg-yellow-400 text-black"
                        : index < currentStep
                        ? "bg-green-400 text-black"
                        : "bg-white/20"
                    )}>
                      {index + 1}
                    </div>
                    <h4 className="font-medium">{step.title}</h4>
                  </div>
                  
                  <p className="text-sm opacity-80">{step.description}</p>
                  
                  <div className="mt-2 text-xs opacity-60">
                    {step.duration}s
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white revolutionary-scroll-container">
      <div className="container mx-auto px-4 py-8 quantum-scroll-area quantum-content-wrapper">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Advanced Video Tutorials
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Master every feature of the <span className="simpleton-brand">Simpleton</span>™ calculator with step-by-step interactive demonstrations
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={cn(
                selectedCategory === category
                  ? "bg-yellow-500 text-black hover:bg-yellow-600"
                  : "border-white/20 text-white hover:bg-white/10"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Tutorials */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials
              .filter(tutorial => tutorial.featured)
              .map((tutorial) => (
                <Card
                  key={tutorial.id}
                  className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all cursor-pointer text-white"
                  onClick={() => startTutorial(tutorial)}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {tutorial.icon}
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                      <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                        Featured
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3">{tutorial.title}</h3>
                    <p className="text-gray-300 mb-4">{tutorial.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{tutorial.duration}</span>
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        Start Tutorial
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* All Tutorials */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTutorials.map((tutorial) => (
              <Card
                key={tutorial.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all cursor-pointer text-white"
                onClick={() => startTutorial(tutorial)}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {tutorial.icon}
                    <Badge className={getDifficultyColor(tutorial.difficulty)}>
                      {tutorial.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">
                      {tutorial.category}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{tutorial.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{tutorial.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{tutorial.duration}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Start Tutorial
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}