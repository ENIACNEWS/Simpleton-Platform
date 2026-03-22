import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Mail, Star, Send, CheckCircle, Home } from "lucide-react";

interface FeedbackForm {
  name: string;
  email: string;
  category: string;
  rating: string;
  subject: string;
  message: string;
}

export default function Feedback() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<FeedbackForm>({
    name: "",
    email: "",
    category: "",
    rating: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async (feedbackData: FeedbackForm) => {
      const response = await apiRequest("POST", "/api/feedback/submit", feedbackData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSubmitted(true);
        setForm({
          name: "",
          email: "",
          category: "",
          rating: "",
          subject: "",
          message: ""
        });
        toast({
          title: "Feedback Sent Successfully!",
          description: "Thank you for your feedback. We'll review it and get back to you soon.",
        });
      } else {
        toast({
          title: "Error Sending Feedback",
          description: data.message || "Please try again later.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Feedback",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.category || !form.message) {
      toast({
        title: "Please Fill All Required Fields",
        description: "Name, email, category, and message are required.",
        variant: "destructive",
      });
      return;
    }
    submitFeedback.mutate(form);
  };

  const updateForm = (field: keyof FeedbackForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
              <p className="text-gray-300 mb-6">
                Your feedback has been sent successfully. We appreciate you taking the time to help us improve <span className="simpleton-brand">Simpleton</span>™.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setLocation("/")}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Send Another Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            <MessageSquare className="w-10 h-10 inline-block mr-3 text-blue-400" />
            Feedback & Support
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Help us improve <span className="simpleton-brand">Simpleton</span>™. Your feedback drives our development priorities and helps us serve you better.
          </p>
        </div>

        {/* Feedback Categories */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="py-6">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Feature Requests</h3>
              <p className="text-sm text-gray-300">
                Suggest new features or improvements to existing functionality
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="py-6">
              <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Bug Reports</h3>
              <p className="text-sm text-gray-300">
                Report issues or problems you've encountered
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="py-6">
              <Mail className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">General Feedback</h3>
              <p className="text-sm text-gray-300">
                Share your overall experience and suggestions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Form */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Send Your Feedback</CardTitle>
            <CardDescription>
              We read every message and use your feedback to improve our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
              </div>

              {/* Category and Rating */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white">Category *</Label>
                  <Select value={form.category} onValueChange={(value) => updateForm("category", value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature-request">Feature Request</SelectItem>
                      <SelectItem value="bug-report">Bug Report</SelectItem>
                      <SelectItem value="general-feedback">General Feedback</SelectItem>
                      <SelectItem value="api-support">API Support</SelectItem>
                      <SelectItem value="billing">Billing & Pricing</SelectItem>
                      <SelectItem value="ui-ux">User Interface</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rating" className="text-white">Overall Rating</Label>
                  <Select value={form.rating} onValueChange={(value) => updateForm("rating", value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Rate your experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                      <SelectItem value="2">⭐⭐ Poor</SelectItem>
                      <SelectItem value="1">⭐ Very Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject" className="text-white">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Brief description of your feedback"
                  value={form.subject}
                  onChange={(e) => updateForm("subject", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-white">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide detailed feedback. For bug reports, include steps to reproduce the issue."
                  value={form.message}
                  onChange={(e) => updateForm("message", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submitFeedback.isPending}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitFeedback.isPending ? "Sending..." : "Send Feedback"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8 bg-slate-800/50 border-slate-700">
          <CardContent className="py-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-white mb-3">Response Time</h3>
                <p className="text-gray-300 text-sm mb-4">
                  We typically respond to feedback within 24-48 hours. For urgent issues, please include "URGENT" in your subject line.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    ✓ Feature Requests: 2-3 days
                  </Badge>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    ✓ Bug Reports: 24 hours
                  </Badge>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    ✓ General Feedback: 48 hours
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white mb-3">What Happens Next?</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Your feedback is reviewed by our development team
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Feature requests are added to our roadmap
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    Bug fixes are prioritized and implemented
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    You receive updates on progress via email
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}