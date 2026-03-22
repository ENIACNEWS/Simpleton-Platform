import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bot, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { ProseRenderer } from "@/components/ui/prose-renderer";

interface RolexAnalysisResponse {
  analysis: string;
  confidence: number;
  recommendations: string[];
  consistency_score: number;
  condition_grade: string;
  estimated_value_range?: string;
  red_flags?: string[];
  next_steps?: string[];
}

interface RolexAIAssistantProps {
  className?: string;
}

export function RolexAIAssistant({ className }: RolexAIAssistantProps) {
  const [activeTab, setActiveTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RolexAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Photo Upload State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // General Analysis Form State
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [movement, setMovement] = useState('');
  const [condition, setCondition] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [modelNumber, setModelNumber] = useState('');

  // Movement Expertise State
  const [movementCaliber, setMovementCaliber] = useState('');
  const [movementResult, setMovementResult] = useState<string | null>(null);

  // Authentication Analysis State
  const [caseback, setCaseback] = useState('');
  const [dial, setDial] = useState('');
  const [bracelet, setBracelet] = useState('');
  const [authMovement, setAuthMovement] = useState('');
  const [other, setOther] = useState('');

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 8 - imageFiles.length); // Max 8 images
    setImageFiles(prev => [...prev, ...newFiles]);

    // Convert to base64 for preview and API
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setUploadedImages(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGeneralAnalysis = async () => {
    if (!analysisQuery.trim() && uploadedImages.length === 0) {
      setError('Please provide a description or upload photos for analysis');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/rolex-ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: analysisQuery,
          movement: movement || undefined,
          condition: condition || undefined,
          serialNumber: serialNumber || undefined,
          modelNumber: modelNumber || undefined,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.analysis);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Failed to connect to AI assistant');
      console.error('Rolex AI Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovementExpertise = async () => {
    if (!movementCaliber.trim()) {
      setError('Please specify a movement caliber');
      return;
    }

    setLoading(true);
    setError(null);
    setMovementResult(null);

    try {
      const response = await fetch('/api/rolex-ai/movement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caliber: movementCaliber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMovementResult(data.expertise);
      } else {
        setError(data.error || 'Movement analysis failed');
      }
    } catch (err) {
      setError('Failed to connect to movement expert');
      console.error('Movement AI Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async () => {
    const features = { caseback, dial, bracelet, movement: authMovement, other };
    const hasFeatures = Object.values(features).some(value => Boolean(value?.trim()));

    if (!hasFeatures && uploadedImages.length === 0) {
      setError('Please describe at least one feature or upload photos for authentication analysis');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/rolex-ai/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...features,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.analysis);
      } else {
        setError(data.error || 'Authentication analysis failed');
      }
    } catch (err) {
      setError('Failed to connect to authentication expert');
      console.error('Authentication AI Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setMovementResult(null);
    setError(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    const lowerGrade = grade.toLowerCase();
    if (lowerGrade.includes('excellent') || lowerGrade.includes('mint')) return 'text-green-600';
    if (lowerGrade.includes('very good') || lowerGrade.includes('good')) return 'text-blue-600';
    if (lowerGrade.includes('fair')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="border-gold/20 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-400" />
            <div>
              <CardTitle className="text-xl text-white">Simplicity — Rolex Intelligence</CardTitle>
              <CardDescription className="text-gray-300">
                Simplicity knows every Rolex reference, caliber, and market trend ever produced. Ask anything.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="analyze" className="text-white data-[state=active]:bg-blue-600">
                General Analysis
              </TabsTrigger>
              <TabsTrigger value="movement" className="text-white data-[state=active]:bg-blue-600">
                Movement Expert
              </TabsTrigger>
              <TabsTrigger value="authenticate" className="text-white data-[state=active]:bg-blue-600">
                Authentication
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Describe your Rolex or ask a question *
                  </label>
                  <Textarea
                    placeholder="E.g., 'I have a Submariner with some scratches on the case. The movement seems to be running slow. Can you help me assess its condition and authenticity?'"
                    value={analysisQuery}
                    onChange={(e) => setAnalysisQuery(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Movement (if known)
                    </label>
                    <Input
                      placeholder="e.g., Caliber 3135"
                      value={movement}
                      onChange={(e) => setMovement(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Condition
                    </label>
                    <Input
                      placeholder="e.g., Used, Excellent"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Serial Number (optional)
                    </label>
                    <Input
                      placeholder="e.g., 16610LV"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Model Number (optional)
                    </label>
                    <Input
                      placeholder="e.g., 116610"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div className="border-t border-slate-600 pt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Photos for Analysis (Optional - Max 8 photos)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="bg-slate-800/50 border-slate-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Upload clear photos of the watch, movement, caseback, dial, bracelet, and any specific details
                  </p>
                  
                  {/* Image Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded border border-slate-600"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleGeneralAnalysis}
                  disabled={loading || (!analysisQuery.trim() && uploadedImages.length === 0)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Analyze Rolex
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="movement" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Movement Caliber *
                  </label>
                  <Input
                    placeholder="e.g., 3135, 3230, 3255, 7135"
                    value={movementCaliber}
                    onChange={(e) => setMovementCaliber(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Enter the caliber number for technical expertise and specifications
                  </p>
                </div>

                <Button
                  onClick={handleMovementExpertise}
                  disabled={loading || !movementCaliber.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consulting Expert...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Get Movement Expertise
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="authenticate" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Caseback Description
                    </label>
                    <Textarea
                      placeholder="Describe the caseback: engravings, markings, condition..."
                      value={caseback}
                      onChange={(e) => setCaseback(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dial Description
                    </label>
                    <Textarea
                      placeholder="Describe the dial: color, markers, text, condition..."
                      value={dial}
                      onChange={(e) => setDial(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bracelet Description
                    </label>
                    <Textarea
                      placeholder="Describe the bracelet: type, condition, clasp details..."
                      value={bracelet}
                      onChange={(e) => setBracelet(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Movement Observations
                    </label>
                    <Textarea
                      placeholder="Describe movement details: rotor, bridges, markings..."
                      value={authMovement}
                      onChange={(e) => setAuthMovement(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Other Observations
                    </label>
                    <Textarea
                      placeholder="Any other details that might help with authentication..."
                      value={other}
                      onChange={(e) => setOther(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder-gray-400"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Photo Upload Section for Authentication */}
                <div className="border-t border-slate-600 pt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Authentication Photos (Recommended - Max 8 photos)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="bg-slate-800/50 border-slate-600 text-white file:bg-green-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    For best authentication results, upload photos of: caseback, dial, movement, bracelet, crown, serial numbers, and any suspect areas
                  </p>
                  
                  {/* Image Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded border border-slate-600"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleAuthentication}
                  disabled={loading || (![caseback, dial, bracelet, authMovement, other].some(v => v.trim()) && uploadedImages.length === 0)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Authenticate Rolex
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-red-300 font-medium">Error</span>
              </div>
              <p className="text-red-200 mt-1">{error}</p>
            </div>
          )}

          {movementResult && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Movement Expertise</h3>
                <Button onClick={clearResults} variant="outline" size="sm" className="text-gray-300">
                  Clear
                </Button>
              </div>
              <Card className="bg-slate-800/50 border-slate-600">
                <CardContent className="pt-4">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-200"><ProseRenderer content={movementResult} /></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
                <Button onClick={clearResults} variant="outline" size="sm" className="text-gray-300">
                  Clear
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Confidence and Authenticity Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}%
                        </div>
                        <div className="text-sm text-gray-400">Confidence Score</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getConfidenceColor(result.consistency_score)}`}>
                          {result.consistency_score}%
                        </div>
                        <div className="text-sm text-gray-400">Consistency Score</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Condition Grade and Value Range */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getGradeColor(result.condition_grade)}`}>
                          {result.condition_grade}
                        </div>
                        <div className="text-sm text-gray-400">Condition Grade</div>
                      </div>
                    </CardContent>
                  </Card>
                  {result.estimated_value_range && (
                    <Card className="bg-slate-800/50 border-slate-600">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gold">
                            {result.estimated_value_range}
                          </div>
                          <div className="text-sm text-gray-400">Est. Value Range</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Analysis */}
                <Card className="bg-slate-800/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Professional Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-200 whitespace-pre-wrap">{result.analysis}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-200">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Red Flags */}
                {result.red_flags && result.red_flags.length > 0 && (
                  <Card className="bg-red-900/20 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-red-300 text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Red Flags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.red_flags.map((flag, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="text-red-200">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps */}
                {result.next_steps && result.next_steps.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {result.next_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs mt-1 flex-shrink-0">
                              {index + 1}
                            </Badge>
                            <span className="text-gray-200">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}