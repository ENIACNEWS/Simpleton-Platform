import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Settings,
  Info,
  Camera,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProseRenderer } from "@/components/ui/prose-renderer";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string; // Base64 image data
  imageFile?: File; // Original file for display
}

interface ExpertPersona {
  id: string;
  name: string;
  specialty: string;
  description: string;
  gradient: string;
  systemPrompt: string;
  expertise: string[];
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  expertPersona?: ExpertPersona;
}

export function AIAssistant({ isOpen, onClose, expertPersona }: AIAssistantProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  // Generate welcome message based on expert persona
  const getWelcomeMessage = () => {
    if (expertPersona) {
      return `Hello! I'm ${expertPersona.name}, your dedicated ${expertPersona.specialty} reference assistant. I have extensive knowledge of ${expertPersona.specialty.toLowerCase()} and would be delighted to share it with you. 

I can analyze photos for visual identification, provide preliminary valuations, explain historical significance, identify makers and markings, assess condition and quality, and answer any questions you might have about ${expertPersona.specialty.toLowerCase()}. 

My specialties include: ${expertPersona.expertise.slice(0, 5).join(', ')}${expertPersona.expertise.length > 5 ? ', and many others' : ''}. 

Whether you're looking to buy, sell, collect, or simply learn, I'm here to help. Note: All assessments are for informational purposes only — professional authentication is recommended for all transactions. What would you like me to examine or discuss today?`;
    }
    return "Hello! I'm Simplicity, your AI assistant. I can help with precious metals, diamonds, luxury watches, coins, and much more. Upload photos for visual analysis and preliminary assessments, or ask me anything you'd like to learn about. Note: All assessments are for informational purposes only — professional authentication is recommended for all transactions. What would you like to explore today?";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: getWelcomeMessage(),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if API key is configured
  useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => setIsConfigured(data.configured))
      .catch(() => setIsConfigured(false));
  }, []);

  // Compress image if too large
  const compressImage = (file: File, maxSizeKB: number = 4000): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 2048px on longest side)
        let { width, height } = img;
        const maxDimension = 2048;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Start with high quality and reduce until under size limit
        let quality = 0.9;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Keep reducing quality until under 4MB
        while (compressedDataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) { // 1.37 accounts for base64 overhead
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(compressedDataUrl);
      };
      
      const reader = new FileReader();
      reader.onload = () => img.src = reader.result as string;
      reader.readAsDataURL(file);
    });
  };

  // Handle image selection
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Compress image if needed
      const imageData = await compressImage(file);
      setImagePreview(imageData);
      
      // Auto-analyze image with Simpleton™
      if (isConfigured && isVisionMode) {
        // Create user message showing image was uploaded
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: "Analyze this precious metals image",
          timestamp: new Date(),
          image: imageData,
          imageFile: file
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Auto-send for analysis
        sendMessage.mutate({
          message: "Analyze this precious metals image. Identify any coins, bullion, jewelry, or precious metal items. Provide details about metal type, purity, condition, potential value, and any other relevant information.",
          image: imageData.split(',')[1] // Extract base64 without data URL prefix
        });
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  // Toggle vision mode
  const toggleVisionMode = () => {
    setIsVisionMode(!isVisionMode);
    if (!isVisionMode) {
      // Clear image when disabling vision mode
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const sendMessage = useMutation({
    mutationFn: async ({ message, image }: { message: string; image?: string }) => {
      // Strip data URL prefix if present to send only base64 data
      let imageData = image;
      if (image && image.includes(',')) {
        imageData = image.split(',')[1];
      }
      
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        image: imageData,
        history: messages.slice(-10), // Send last 10 messages for context
        systemPrompt: expertPersona?.systemPrompt // Include expert persona if available
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error: any) => {
      let errorContent = "I'm having trouble right now. Let me help you understand what happened.";
      
      // Check for specific error types
      if (error?.message?.includes("image exceeds") || error?.message?.includes("5 MB")) {
        errorContent = "Your image is too large for analysis. The maximum size is 5MB. Try using a smaller image or I can help you compress it if you'd like.";
      } else if (error?.message?.includes("invalid_request_error")) {
        errorContent = "There was an issue with your request. If you uploaded an image, try using a different format (JPEG or PNG work best).";
      } else if (error?.message?.includes("429") || error?.message?.includes("rate_limit")) {
        errorContent = "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else if (!isConfigured) {
        errorContent = "I need an API key to work properly. Please make sure the Anthropic API key is configured.";
      }
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || sendMessage.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim() || (selectedImage ? "Requesting Simpleton Vision™ analysis..." : ""),
      timestamp: new Date(),
      image: imagePreview || undefined,
      imageFile: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    if (isConfigured) {
      sendMessage.mutate({
        message: input.trim() || (selectedImage ? "What can you tell me about this image?" : ""),
        image: imagePreview?.split(',')[1] // Extract base64 without data:image/jpeg;base64, prefix
      });
      
      // Clear image after sending
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      // Show setup instructions
      const setupMessage: Message = {
        id: Date.now().toString() + "-setup",
        role: "assistant",
        content: "The AI assistant is not configured yet. To enable this feature, an Anthropic API key is needed. Please contact the site administrator to set this up, or if you're the owner, add your ANTHROPIC_API_KEY to enable this feature.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, setupMessage]);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900/95 via-blue-800/95 to-blue-700/95 backdrop-blur-xl">
      <Card className="w-full h-full bg-transparent border-none shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-8 w-8 text-gold" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Simplicity AI</h3>
              <p className="text-sm text-white/80">Your AI Assistant • Powered by Simplicity</p>
            </div>
          </div>
        <div className="flex items-center gap-1">
          {!isConfigured && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Info className="h-4 w-4 text-yellow-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>API key required for full functionality</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={isVisionMode ? "default" : "ghost"}
                  onClick={toggleVisionMode}
                  className={cn(
                    "h-8 w-8",
                    isVisionMode && "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  )}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Simpleton Vision™ - Image Analysis System</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages area */}
          <div className="flex-1 h-[calc(100vh-180px)] relative overflow-hidden revolutionary-scroll-container">
            <div 
              ref={scrollAreaRef}
              className="h-full p-4 overflow-y-auto overflow-x-hidden quantum-scroll-area"
            >
              <div className="space-y-4 pb-4 quantum-content-wrapper">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 animate-fade-in",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-yellow-400/30 flex items-center justify-center shadow-lg">
                        <Bot className="h-5 w-5 text-gold drop-shadow-md" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl p-4 shadow-xl transition-all duration-300 hover:scale-[1.02]",
                        message.role === "user"
                          ? "bg-gradient-to-r from-gold/30 to-yellow-400/30 border border-gold/50 backdrop-blur-md"
                          : "bg-white/20 border border-white/30 backdrop-blur-md"
                      )}
                    >
                      {message.image && (
                        <img 
                          src={message.image} 
                          alt="Uploaded image" 
                          className="mb-3 rounded-lg max-w-full"
                          style={{ maxHeight: '300px' }}
                        />
                      )}
                      <div className="text-base leading-relaxed text-white font-medium tracking-wide">
                        {message.role === "user" ? (
                          <span className="whitespace-pre-wrap">{message.content}</span>
                        ) : (
                          <ProseRenderer content={message.content} />
                        )}
                      </div>
                      <p className="text-xs mt-2 text-white/90 font-light">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gold to-yellow-400 flex items-center justify-center shadow-lg">
                        <User className="h-5 w-5 text-yellow-900 drop-shadow-md" />
                      </div>
                    )}
                  </div>
                ))}
                {sendMessage.isPending && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-yellow-400/30 flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-gold animate-pulse drop-shadow-md" />
                    </div>
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gold rounded-full animate-bounce shadow-sm" />
                          <div className="w-2 h-2 bg-gold rounded-full animate-bounce delay-100 shadow-sm" />
                          <div className="w-2 h-2 bg-gold rounded-full animate-bounce delay-200 shadow-sm" />
                        </div>
                        <span className="text-white font-medium">
                          {isVisionMode || selectedImage ? "Simpleton Active" : "Simplicity AI thinking..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Scroll shadows for depth */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-blue-900/50 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-900/50 to-transparent pointer-events-none" />
          </div>

          {/* Fixed Input Area */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gold shadow-2xl z-50">
            {/* Vision Mode Banner */}
            {isVisionMode && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5" />
                  <span className="font-semibold">Simpleton Vision™ Active</span>
                  <span className="text-sm opacity-90">Upload any image for AI-powered visual analysis and preliminary assessment</span>
                </div>
                {imagePreview && (
                  <div className="flex items-center gap-2">
                    <img 
                      src={imagePreview} 
                      alt="Selected" 
                      className="h-12 w-12 object-cover rounded"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="h-6 w-6 hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-3 items-center max-w-none">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {/* Vision mode upload button */}
                {isVisionMode && (
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                )}
                
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isVisionMode 
                    ? "Upload any image for AI-powered analysis..." 
                    : "Ask me about precious metals, diamonds, watches, coins, or anything else..."
                  }
                  disabled={sendMessage.isPending}
                  className="flex-1 h-12 px-4 rounded-xl border-2 border-gold/50 focus:border-gold focus:outline-none transition-all duration-300 text-base font-semibold shadow-lg"
                  style={{
                    color: '#000000',
                    backgroundColor: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || sendMessage.isPending}
                  className="h-12 w-12 bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900 hover:opacity-90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex-shrink-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
      </Card>
    </div>
  );
}