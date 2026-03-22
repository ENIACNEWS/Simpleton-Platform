import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/layout/navigation";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Calendar, Brain, Trash2, AlertTriangle, Bell, ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserMemory {
  id: number;
  category: string;
  fact: string;
  confidence: number;
  createdAt: string;
}

interface PriceAlertData {
  id: number;
  assetType: string;
  assetName: string;
  targetPrice: string;
  direction: string;
  status: string;
  priceAtCreation: string | null;
  triggeredAt: string | null;
  triggeredPrice: string | null;
  createdAt: string;
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "memory" | "alerts">("profile");
  const [clearConfirm, setClearConfirm] = useState(false);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlertAsset, setNewAlertAsset] = useState("gold");
  const [newAlertDirection, setNewAlertDirection] = useState("above");
  const [newAlertPrice, setNewAlertPrice] = useState("");

  const { data: memoriesData, isLoading: memoriesLoading } = useQuery<{ memories: UserMemory[] }>({
    queryKey: ['/api/user/memories'],
    enabled: activeTab === 'memory',
    retry: false,
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/user/memories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/memories'] });
      toast({ title: 'Memory removed' });
    },
  });

  const clearAllMemoriesMutation = useMutation({
    mutationFn: () => apiRequest('/api/user/memories', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/memories'] });
      setClearConfirm(false);
      toast({ title: 'All memories cleared' });
    },
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery<PriceAlertData[]>({
    queryKey: ['/api/price-alerts'],
    enabled: activeTab === 'alerts',
    retry: false,
  });

  const createAlertMutation = useMutation({
    mutationFn: () => apiRequest('/api/price-alerts', {
      method: 'POST',
      body: JSON.stringify({
        assetType: newAlertAsset,
        assetName: newAlertAsset.charAt(0).toUpperCase() + newAlertAsset.slice(1),
        targetPrice: newAlertPrice,
        direction: newAlertDirection,
        status: 'active',
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/price-alerts'] });
      setShowNewAlert(false);
      setNewAlertPrice('');
      toast({ title: 'Price alert created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/price-alerts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/price-alerts'] });
      toast({ title: 'Alert removed' });
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      return apiRequest("/api/auth/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Success",
        description: "Password updated successfully!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-yellow-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-8">Account Settings</h1>
          
          {/* Profile Header */}
          <Card className="mb-8 bg-primary-900/50 border-gold/20">
            <CardContent className="flex items-center space-x-4 p-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-2xl">
                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-yellow-400">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-yellow-300/70">{user.email}</p>
                <p className="text-yellow-300/50 text-sm mt-1">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              onClick={() => setActiveTab("profile")}
              className={activeTab === "profile" 
                ? "bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900" 
                : "text-yellow-400 hover:text-yellow-300"}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant={activeTab === "security" ? "default" : "ghost"}
              onClick={() => setActiveTab("security")}
              className={activeTab === "security" 
                ? "bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900" 
                : "text-yellow-400 hover:text-yellow-300"}
            >
              <Lock className="h-4 w-4 mr-2" />
              Security
            </Button>
            <Button
              variant={activeTab === "memory" ? "default" : "ghost"}
              onClick={() => setActiveTab("memory")}
              className={activeTab === "memory" 
                ? "bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900" 
                : "text-yellow-400 hover:text-yellow-300"}
            >
              <Brain className="h-4 w-4 mr-2" />
              Simplicity Memory
            </Button>
            <Button
              variant={activeTab === "alerts" ? "default" : "ghost"}
              onClick={() => setActiveTab("alerts")}
              className={activeTab === "alerts" 
                ? "bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900" 
                : "text-yellow-400 hover:text-yellow-300"}
            >
              <Bell className="h-4 w-4 mr-2" />
              Price Alerts
            </Button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card className="bg-primary-900/50 border-gold/20">
              <CardHeader>
                <CardTitle className="text-yellow-400">Profile Information</CardTitle>
                <CardDescription className="text-yellow-300/70">
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-yellow-400">First Name</Label>
                      <Input
                        id="firstName"
                        {...profileForm.register("firstName")}
                        className="bg-primary-800/50 border-gold/20 text-yellow-100"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-yellow-400">Last Name</Label>
                      <Input
                        id="lastName"
                        {...profileForm.register("lastName")}
                        className="bg-primary-800/50 border-gold/20 text-yellow-100"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-yellow-400">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register("email")}
                      className="bg-primary-800/50 border-gold/20 text-yellow-100"
                      placeholder="john.doe@example.com"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900 hover:opacity-90"
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card className="bg-primary-900/50 border-gold/20">
              <CardHeader>
                <CardTitle className="text-yellow-400">Change Password</CardTitle>
                <CardDescription className="text-yellow-300/70">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-yellow-400">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register("currentPassword")}
                      className="bg-primary-800/50 border-gold/20 text-yellow-100"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-yellow-400">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register("newPassword")}
                      className="bg-primary-800/50 border-gold/20 text-yellow-100"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-yellow-400">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                      className="bg-primary-800/50 border-gold/20 text-yellow-100"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900 hover:opacity-90"
                  >
                    {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          {/* Memory Tab */}
          {activeTab === "memory" && (
            <Card className="bg-primary-900/50 border-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-yellow-400 flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Simplicity Memory
                    </CardTitle>
                    <CardDescription className="text-yellow-300/70 mt-1">
                      Facts Simplicity has learned about you from your conversations. These are used to personalize your experience.
                    </CardDescription>
                  </div>
                  {(memoriesData?.memories?.length ?? 0) > 0 && (
                    <div>
                      {clearConfirm ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-400">Are you sure?</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => clearAllMemoriesMutation.mutate()}
                            disabled={clearAllMemoriesMutation.isPending}
                          >
                            Yes, clear all
                          </Button>
                          <Button size="sm" variant="ghost" className="text-yellow-400" onClick={() => setClearConfirm(false)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                          onClick={() => setClearConfirm(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear all
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {memoriesLoading ? (
                  <div className="text-yellow-400/60 text-sm py-8 text-center">Loading memories...</div>
                ) : !memoriesData?.memories?.length ? (
                  <div className="text-center py-12">
                    <Brain className="h-12 w-12 text-yellow-400/20 mx-auto mb-3" />
                    <p className="text-yellow-300/50 text-sm">No memories yet.</p>
                    <p className="text-yellow-300/30 text-xs mt-1">
                      Simplicity will learn about your preferences as you chat.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memoriesData.memories.map((mem) => (
                      <div
                        key={mem.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg bg-primary-800/40 border border-gold/10 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="text-xs bg-yellow-900/40 text-yellow-400 border border-yellow-700/30 capitalize">
                              {mem.category}
                            </Badge>
                            <span className="text-yellow-300/30 text-xs">
                              {Math.round(mem.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-yellow-100/80 text-sm leading-relaxed">{mem.fact}</p>
                          <p className="text-yellow-300/30 text-xs mt-1">
                            {new Date(mem.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/60 hover:text-red-400 shrink-0 mt-1"
                          onClick={() => deleteMemoryMutation.mutate(mem.id)}
                          disabled={deleteMemoryMutation.isPending}
                          title="Remove memory"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <p className="text-yellow-300/30 text-xs pt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Removing a memory won't affect Simplicity's ability to learn new ones.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "alerts" && (
            <Card className="bg-primary-900/50 border-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-yellow-400 flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Price Alerts
                    </CardTitle>
                    <CardDescription className="text-yellow-300/50">
                      Get notified when precious metals hit your target price. Checked every 5 minutes.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowNewAlert(!showNewAlert)}
                    className="bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900 hover:brightness-110"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Alert
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showNewAlert && (
                  <div className="mb-6 p-4 rounded-lg bg-primary-800/60 border border-gold/20">
                    <h4 className="text-yellow-400 text-sm font-medium mb-3">Create Price Alert</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-yellow-300/70 text-xs mb-1 block">Asset</Label>
                        <Select value={newAlertAsset} onValueChange={setNewAlertAsset}>
                          <SelectTrigger className="bg-primary-900/60 border-gold/20 text-yellow-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="palladium">Palladium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-yellow-300/70 text-xs mb-1 block">Direction</Label>
                        <Select value={newAlertDirection} onValueChange={setNewAlertDirection}>
                          <SelectTrigger className="bg-primary-900/60 border-gold/20 text-yellow-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Goes above</SelectItem>
                            <SelectItem value="below">Drops below</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-yellow-300/70 text-xs mb-1 block">Target Price ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 2500.00"
                          value={newAlertPrice}
                          onChange={(e) => setNewAlertPrice(e.target.value)}
                          className="bg-primary-900/60 border-gold/20 text-yellow-100 placeholder:text-yellow-300/30"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => createAlertMutation.mutate()}
                        disabled={!newAlertPrice || createAlertMutation.isPending}
                        className="bg-gradient-to-r from-gold via-yellow-400 to-gold text-yellow-900 hover:brightness-110"
                      >
                        {createAlertMutation.isPending ? 'Creating...' : 'Create Alert'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-yellow-400"
                        onClick={() => setShowNewAlert(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {alertsLoading ? (
                  <div className="text-yellow-400/60 text-sm py-8 text-center">Loading alerts...</div>
                ) : !alertsData?.length ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-yellow-400/20 mx-auto mb-3" />
                    <p className="text-yellow-300/50 text-sm">No price alerts set.</p>
                    <p className="text-yellow-300/30 text-xs mt-1">
                      Create an alert above, or tell Simplicity "alert me when gold hits $3,000."
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alertsData.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-lg border group ${
                          alert.status === 'triggered'
                            ? 'bg-green-950/30 border-green-500/30'
                            : 'bg-primary-800/40 border-gold/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            alert.status === 'triggered' ? 'bg-green-500/20' : 'bg-yellow-500/10'
                          }`}>
                            {alert.direction === 'above' ? (
                              <ArrowUp className={`h-4 w-4 ${alert.status === 'triggered' ? 'text-green-400' : 'text-yellow-400'}`} />
                            ) : (
                              <ArrowDown className={`h-4 w-4 ${alert.status === 'triggered' ? 'text-green-400' : 'text-yellow-400'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-100 font-medium text-sm capitalize">
                                {alert.assetName || alert.assetType}
                              </span>
                              <Badge className={`text-xs ${
                                alert.status === 'triggered'
                                  ? 'bg-green-900/40 text-green-400 border-green-700/30'
                                  : 'bg-yellow-900/40 text-yellow-400 border-yellow-700/30'
                              }`}>
                                {alert.status}
                              </Badge>
                            </div>
                            <p className="text-yellow-300/60 text-xs mt-0.5">
                              {alert.direction === 'above' ? 'Alert when above' : 'Alert when below'}{' '}
                              <span className="text-yellow-200 font-medium">
                                ${Number(alert.targetPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              {alert.priceAtCreation && (
                                <span className="text-yellow-300/40 ml-2">
                                  (was ${Number(alert.priceAtCreation).toLocaleString(undefined, { minimumFractionDigits: 2 })} at creation)
                                </span>
                              )}
                            </p>
                            {alert.status === 'triggered' && alert.triggeredAt && (
                              <p className="text-green-400/70 text-xs mt-0.5">
                                Triggered at ${Number(alert.triggeredPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                {' '}on {new Date(alert.triggeredAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/60 hover:text-red-400 shrink-0"
                          onClick={() => deleteAlertMutation.mutate(alert.id)}
                          disabled={deleteAlertMutation.isPending}
                          title="Remove alert"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <p className="text-yellow-300/30 text-xs pt-2 flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      Alerts are checked against live spot prices every 5 minutes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}