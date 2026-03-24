import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useBrain } from "@/lib/brain-context";
import { AskBrain } from "@/components/brain/AskBrain";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  MapPin,
  Phone,
  Globe,
  Star,
  Shield,
  ShieldAlert,
  AlertTriangle,
  ChevronLeft,
  MessageSquare,
  CheckCircle,
  XCircle,
  Store,
  Clock,
  ArrowLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
} from "lucide-react";
import { SimpletonLogo } from "@/components/ui/simpleton-logo";
import type { ListedBusiness, BusinessReview, BusinessComplaint } from "@shared/schema";

const CATEGORIES = [
  { value: "pawn_shop", label: "Pawn Shop" },
  { value: "gold_buyer", label: "Gold Buyer" },
  { value: "jeweler", label: "Jeweler" },
  { value: "dealer", label: "Dealer" },
  { value: "coin_shop", label: "Coin Shop" },
  { value: "watch_dealer", label: "Watch Dealer" },
];

function getCategoryLabel(val: string) {
  return CATEGORIES.find(c => c.value === val)?.label || val;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${cls} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
      ))}
    </div>
  );
}

function InteractiveStarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)} className="focus:outline-none">
          <Star className={`w-6 h-6 transition-colors ${i <= value ? "fill-amber-400 text-amber-400" : "text-slate-600 hover:text-amber-300"}`} />
        </button>
      ))}
    </div>
  );
}

function BusinessCard({ business, avgRating, reviewCount, onClick, isAdmin, onToggleVerify }: {
  business: ListedBusiness & { googleRating?: string | null; googleReviewCount?: number | null; simpletonVerified?: boolean; userRating?: number; userReviewCount?: number };
  avgRating: number;
  reviewCount: number;
  onClick: () => void;
  isAdmin?: boolean;
  onToggleVerify?: (id: number, current: boolean) => void;
}) {
  const isApproved = business.status === "approved";
  const isBlacklisted = business.status === "blacklisted";
  const googleRating = business.googleRating ? parseFloat(business.googleRating) : 0;
  const googleCount = business.googleReviewCount || 0;
  const simpletonRating = business.userRating || 0;
  const simpletonCount = business.userReviewCount || 0;

  return (
    <Card
      className="cursor-pointer hover:border-slate-600 transition-all bg-slate-900/60 border-slate-700/50"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-white font-semibold text-lg truncate">{business.name}</h3>
              {business.simpletonVerified && (
                <Badge className="shrink-0 border-0 px-2 py-0.5 flex items-center gap-1.5" style={{ background: "rgba(10,29,63,0.85)", color: "#60a5fa" }}>
                  <img src="/simpleton-logo.jpeg" alt="S" className="w-4 h-4 rounded-sm" />
                  <span className="simpleton-brand">Simpleton</span> Verified
                </Badge>
              )}
              {isApproved && !business.simpletonVerified && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                  <CheckCircle className="w-3 h-3 mr-1" /> Approved
                </Badge>
              )}
              {isBlacklisted && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 shrink-0">
                  <XCircle className="w-3 h-3 mr-1" /> Do Not Go
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-sm flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {business.address}, {business.city}, {business.state} {business.zip}
            </p>
            {business.phone && (
              <p className="text-slate-400 text-sm flex items-center gap-1 mb-1">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                {business.phone}
              </p>
            )}
            {(business as any).hours && (
              <p className="text-slate-500 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                {(business as any).hours}
              </p>
            )}
          </div>
          <Badge variant="outline" className="border-slate-600 text-slate-300 shrink-0 ml-2">
            {getCategoryLabel(business.category)}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-slate-400 text-sm">
                {avgRating > 0 ? avgRating.toFixed(1) : "No ratings"} ({reviewCount} total)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {googleCount > 0 && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Google {googleRating.toFixed(1)} ({googleCount})
                </span>
              )}
              {simpletonCount > 0 && (
                <span className="flex items-center gap-1">
                  <img src="/simpleton-logo.jpeg" alt="S" className="w-3 h-3 rounded-sm" /> Simpleton {simpletonRating.toFixed(1)} ({simpletonCount})
                </span>
              )}
            </div>
          </div>
          {isAdmin && onToggleVerify && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2 border-0 disabled:opacity-50"
              style={business.simpletonVerified ? { background: "#0a1d3f", color: "#60a5fa" } : { background: "transparent", border: "1px solid #334155", color: "#94a3b8" }}
              disabled={false}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVerify(business.id, !!business.simpletonVerified);
              }}
            >
              {business.simpletonVerified ? "Unverify" : "Verify"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BusinessDetail({ businessId, onBack }: { businessId: number; onBack: () => void }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [complaintText, setComplaintText] = useState("");
  const [complaintSeverity, setComplaintSeverity] = useState("low");
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  const { data: business, isError: businessError } = useQuery<ListedBusiness>({
    queryKey: [`/api/simpletons-list/business/${businessId}`],
  });

  const { data: reviews = [] } = useQuery<(BusinessReview & { username: string })[]>({
    queryKey: [`/api/simpletons-list/reviews/${businessId}`],
  });

  const { data: complaints = [] } = useQuery<BusinessComplaint[]>({
    queryKey: [`/api/simpletons-list/complaints/${businessId}`],
    enabled: isAuthenticated,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/simpletons-list/reviews", {
        businessId,
        rating: reviewRating,
        reviewText,
      });
    },
    onSuccess: () => {
      toast({ title: "Review submitted", description: "Thank you for your feedback." });
      setReviewText("");
      setReviewRating(0);
      queryClient.invalidateQueries({ queryKey: [`/api/simpletons-list/reviews/${businessId}`] });
      queryClient.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("/api/simpletons-list") });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const submitComplaint = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/simpletons-list/complaints", {
        businessId,
        complaintText,
        severity: complaintSeverity,
      });
    },
    onSuccess: () => {
      toast({ title: "Complaint filed", description: "Your complaint has been submitted for investigation." });
      setComplaintText("");
      setShowComplaintForm(false);
      queryClient.invalidateQueries({ queryKey: [`/api/simpletons-list/complaints/${businessId}`] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (businessError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">Failed to load business details.</p>
        <button onClick={onBack} className="text-amber-400 hover:underline">Back to Directory</button>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isApproved = business.status === "approved";
  const isBlacklisted = business.status === "blacklisted";
  const simpletonAvg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const googleRating = (business as any).googleRating ? parseFloat((business as any).googleRating) : 0;
  const googleCount = (business as any).googleReviewCount || 0;
  const totalReviews = googleCount + reviews.length;
  const combinedRating = totalReviews > 0
    ? ((googleRating * googleCount) + (simpletonAvg * reviews.length)) / totalReviews
    : 0;

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="outline"
        className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
      </Button>

      <Card className="bg-slate-900/60 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{business.name}</h2>
                {(business as any).simpletonVerified && (
                  <Badge className="border-0 px-3 py-1 flex items-center gap-2 text-sm" style={{ background: "#0a1d3f", color: "#60a5fa" }}>
                    <img src="/simpleton-logo.jpeg" alt="S" className="w-5 h-5 rounded-sm" />
                    <span className="simpleton-brand">Simpleton</span> Verified
                  </Badge>
                )}
                {isApproved && !(business as any).simpletonVerified && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Shield className="w-3.5 h-3.5 mr-1" /> Simpleton Approved
                  </Badge>
                )}
                {isBlacklisted && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Do Not Go
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="border-slate-600 text-slate-300 mb-3">
                {getCategoryLabel(business.category)}
              </Badge>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(combinedRating)} size="lg" />
                <span className="text-white font-semibold text-lg">{combinedRating > 0 ? combinedRating.toFixed(1) : "N/A"}</span>
              </div>
              <p className="text-slate-400 text-sm">{totalReviews} total {totalReviews === 1 ? "review" : "reviews"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{business.address}, {business.city}, {business.state} {business.zip}</span>
            </div>
            {business.phone && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-slate-500" />
                <a href={`tel:${business.phone}`} className="hover:text-amber-400 transition-colors">{business.phone}</a>
              </div>
            )}
            {(business as any).hours && (
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{(business as any).hours}</span>
              </div>
            )}
            {business.website && (
              <div className="flex items-center gap-2 text-slate-300">
                <Globe className="w-4 h-4 text-slate-500" />
                <a href={business.website.startsWith("http") ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors truncate">{business.website}</a>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Google Reviews</span>
              </div>
              {googleCount > 0 ? (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(googleRating)} />
                  <span className="text-white text-sm font-semibold">{googleRating.toFixed(1)}</span>
                  <span className="text-slate-400 text-xs">({googleCount} {googleCount === 1 ? "review" : "reviews"})</span>
                </div>
              ) : (
                <p className="text-slate-500 text-xs">No Google reviews available</p>
              )}
              {(business as any).lastGoogleSync && (
                <p className="text-slate-600 text-xs mt-1">Updated {new Date((business as any).lastGoogleSync).toLocaleDateString()}</p>
              )}
            </div>

            <div className="p-3 rounded-lg border" style={{ background: "rgba(10,29,63,0.3)", borderColor: "rgba(10,29,63,0.5)" }}>
              <div className="flex items-center gap-2 mb-1">
                <img src="/simpleton-logo.jpeg" alt="S" className="w-4 h-4 rounded-sm" />
                <span className="text-sm font-medium" style={{ color: "#60a5fa" }}>Simpleton Reviews</span>
              </div>
              {reviews.length > 0 ? (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(simpletonAvg)} />
                  <span className="text-white text-sm font-semibold">{simpletonAvg.toFixed(1)}</span>
                  <span className="text-slate-400 text-xs">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                </div>
              ) : (
                <p className="text-slate-500 text-xs">No Simpleton reviews yet. Be the first!</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <img src="/simpleton-logo.jpeg" alt="S" className="w-5 h-5 rounded-sm" />
            <span style={{ color: "#60a5fa" }}>Simpleton Reviews</span>
            <span className="text-slate-400 font-normal text-sm">({reviews.length})</span>
          </h3>

          {isAuthenticated && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-slate-300 font-medium">Leave a Review</p>
                <InteractiveStarRating value={reviewRating} onChange={setReviewRating} />
                <Textarea
                  placeholder="Share your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white min-h-[80px]"
                />
                <Button
                  onClick={() => submitReview.mutate()}
                  disabled={!reviewText.trim() || reviewRating === 0 || submitReview.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                  size="sm"
                >
                  {submitReview.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </CardContent>
            </Card>
          )}

          {reviews.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No reviews yet. Be the first to leave a review.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <Card key={r.id} className="bg-slate-800/30 border-slate-700/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} />
                        <span className="text-slate-400 text-xs">{r.username}</span>
                      </div>
                      <span className="text-slate-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{r.reviewText}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Complaints
            </h3>
            {isAuthenticated && !showComplaintForm && (
              <Button
                onClick={() => setShowComplaintForm(true)}
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                File a Complaint
              </Button>
            )}
          </div>

          {showComplaintForm && (
            <Card className="bg-slate-800/50 border-red-500/20">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-red-400 font-medium">File a Complaint</p>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Severity</label>
                  <Select value={complaintSeverity} onValueChange={setComplaintSeverity}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Describe the issue in detail..."
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => submitComplaint.mutate()}
                    disabled={!complaintText.trim() || submitComplaint.isPending}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    {submitComplaint.isPending ? "Filing..." : "Submit Complaint"}
                  </Button>
                  <Button
                    onClick={() => setShowComplaintForm(false)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {complaints.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No complaints filed for this business.</p>
          ) : (
            <div className="space-y-3">
              {complaints.map(c => (
                <Card key={c.id} className="bg-slate-800/30 border-slate-700/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={
                        c.investigationStatus === "resolved" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        c.investigationStatus === "investigating" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                        c.investigationStatus === "confirmed" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-slate-700/50 text-slate-400 border-slate-600/30"
                      }>
                        <Clock className="w-3 h-3 mr-1" />
                        {c.investigationStatus === "pending" ? "Pending Review" :
                         c.investigationStatus === "investigating" ? "Under Investigation" :
                         c.investigationStatus === "resolved" ? "Resolved" :
                         "Confirmed"}
                      </Badge>
                      <Badge variant="outline" className={
                        c.severity === "critical" ? "border-red-500 text-red-400" :
                        c.severity === "high" ? "border-orange-500 text-orange-400" :
                        c.severity === "medium" ? "border-amber-500 text-amber-400" :
                        "border-slate-500 text-slate-400"
                      }>
                        {c.severity}
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm">{c.complaintText}</p>
                    {c.resolutionNotes && (
                      <div className="mt-2 p-2 rounded bg-slate-900/50 border border-slate-700/30">
                        <p className="text-xs text-slate-400 mb-1">Resolution:</p>
                        <p className="text-slate-300 text-sm">{c.resolutionNotes}</p>
                      </div>
                    )}
                    <p className="text-slate-500 text-xs mt-2">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Button>
      </div>
    </div>
  );
}

export default function SimpletonsListPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const isAdmin = user && (user.id === 1 || (user as any).role === "admin");
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchZip, setSearchZip] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("highest");
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [onlineSearchQuery, setOnlineSearchQuery] = useState("");
  const [onlineResults, setOnlineResults] = useState<any[]>([]);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", description: "Your browser does not support location detection.", variant: "destructive" });
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const geoData = await geoRes.json();
          const city = geoData.city || geoData.locality || "";
          const state = geoData.principalSubdivisionCode?.replace("US-", "") || "";
          if (city) setSearchCity(city);
          if (state) setSearchState(state);
          setSearchZip("");
          setLocationDetected(true);
          setLocationLoading(false);
          toast({ title: "Location detected", description: `Showing pawn shops near ${city}${state ? ", " + state : ""}` });
          setTimeout(() => {
            queryClient.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("/api/simpletons-list") });
          }, 100);
        } catch (err) {
          setLocationLoading(false);
          toast({ title: "Location error", description: "Could not determine your city. Please search manually.", variant: "destructive" });
        }
      },
      (error) => {
        setLocationLoading(false);
        let msg = "Could not detect your location.";
        if (error.code === 1) msg = "Location access denied. Please allow location in your browser settings.";
        else if (error.code === 2) msg = "Location unavailable. Please try again or search manually.";
        else if (error.code === 3) msg = "Location request timed out. Please try again.";
        toast({ title: "Location error", description: msg, variant: "destructive" });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const searchParams = new URLSearchParams();
  if (searchCity) searchParams.set("city", searchCity);
  if (searchState) searchParams.set("state", searchState);
  if (searchZip) searchParams.set("zip", searchZip);
  if (filterCategory && filterCategory !== "all") searchParams.set("category", filterCategory);
  searchParams.set("sort", sortOrder);
  const queryString = searchParams.toString();

  const { data: businessesData = [], isLoading } = useQuery<(ListedBusiness & { avgRating: number; reviewCount: number; simpletonVerified?: boolean })[]>({
    queryKey: [`/api/simpletons-list?${queryString}`],
  });

  const toggleVerify = useMutation({
    mutationFn: async ({ id, current }: { id: number; current: boolean }) => {
      await apiRequest("PATCH", `/api/admin/businesses/${id}`, { simpletonVerified: !current });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("/api/simpletons-list") });
      toast({ title: "Verification updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const onlineSearch = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("POST", "/api/simpletons-list/search-online", { query });
      return res.json();
    },
    onSuccess: (data: any) => {
      setOnlineResults(data.results || []);
      if (!data.results?.length) {
        toast({ title: "No results", description: "No pawn shops found for that search. Try a different name or location." });
      }
    },
    onError: (err: any) => {
      toast({ title: "Search failed", description: err.message, variant: "destructive" });
    },
  });

  const addFromSearch = useMutation({
    mutationFn: async (shop: any) => {
      await apiRequest("POST", "/api/simpletons-list/suggest", shop);
    },
    onSuccess: () => {
      toast({ title: "Submitted", description: "This pawn shop has been submitted for review. We will add it once verified." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const approved = businessesData.filter(b => b.status === "approved");
  const blacklisted = businessesData.filter(b => b.status === "blacklisted");

  const { updateAwareness } = useBrain();
  useEffect(() => {
    if (selectedBusinessId !== null) {
      const biz = businessesData.find(b => b.id === selectedBusinessId);
      if (biz) {
        updateAwareness({
          directory: {
            viewingBusiness: {
              name: biz.name,
              category: biz.category,
              city: biz.city || "",
              state: biz.state || "",
              rating: biz.avgRating,
            },
          },
        });
      }
    } else {
      updateAwareness({
        directory: { searchQuery: searchCity || searchState || searchZip || undefined },
      });
    }
  }, [selectedBusinessId, businessesData, searchCity, searchState, searchZip]);

  if (selectedBusinessId !== null) {
    return (
      <div className="min-h-screen" style={{ background: "#080c14" }}>
        <Navigation />
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
          <BusinessDetail businessId={selectedBusinessId} onBack={() => setSelectedBusinessId(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#080c14" }}>
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Store className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Simpleton's List</h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto mb-3">
            Vetted and verified pawn shops, gold buyers, jewelers, and dealers.
            Find trusted businesses or avoid the ones that didn't make the cut.
          </p>
          <AskBrain question="What should I look for when choosing a dealer on Simpleton's List?" label="Ask Simplicity about dealers" />
        </div>

        <Card className="bg-slate-900/40 border-slate-700/50 mb-8">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
              <Input
                placeholder="City"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white"
              />
              <Input
                placeholder="State (e.g. TX)"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value.toUpperCase())}
                className="bg-slate-800/50 border-slate-600 text-white"
                maxLength={2}
              />
              <Input
                placeholder="ZIP Code"
                value={searchZip}
                onChange={(e) => setSearchZip(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white"
                maxLength={5}
              />
              <Button
                onClick={detectLocation}
                disabled={locationLoading}
                variant="outline"
                className={locationDetected 
                  ? "border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300" 
                  : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"}
              >
                {locationLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Locating...</span>
                  </div>
                ) : (
                  <>
                    <Navigation2 className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">{locationDetected ? "Located" : "Near Me"}</span>
                  </>
                )}
              </Button>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  queryClient.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("/api/simpletons-list") });
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
              <p className="text-slate-400 text-sm">
                {businessesData.length} {businessesData.length === 1 ? "business" : "businesses"} found
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "highest" ? "lowest" : "highest")}
                className="text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                {sortOrder === "highest" ? (
                  <><ArrowDown className="w-4 h-4 mr-1.5" /> Highest Rated First</>
                ) : (
                  <><ArrowUp className="w-4 h-4 mr-1.5" /> Lowest Rated First</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={() => {
              if (!isAuthenticated) {
                toast({ title: "Sign in required", description: "Please sign in to search and suggest pawn shops.", variant: "destructive" });
                return;
              }
              setShowSearchPanel(!showSearchPanel);
              if (showSearchPanel) {
                setOnlineResults([]);
                setOnlineSearchQuery("");
              }
            }}
            variant="outline"
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
          >
            {showSearchPanel ? <><X className="w-4 h-4 mr-2" /> Close Search</> : <><Search className="w-4 h-4 mr-2" /> Can't find a shop? Search online</>}
          </Button>
        </div>

        {showSearchPanel && (
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                Search for Pawn Shops Online
              </CardTitle>
              <p className="text-slate-400 text-sm">Search by name, city, or state to find real pawn shops and add them to our directory.</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder='e.g. "pawn shops in Houston TX" or "Gold Exchange Miami"'
                  value={onlineSearchQuery}
                  onChange={(e) => setOnlineSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && onlineSearchQuery.trim().length >= 3) {
                      onlineSearch.mutate(onlineSearchQuery);
                    }
                  }}
                  className="bg-slate-800/50 border-slate-600 text-white flex-1"
                />
                <Button
                  onClick={() => onlineSearch.mutate(onlineSearchQuery)}
                  disabled={onlineSearch.isPending || onlineSearchQuery.trim().length < 3}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  {onlineSearch.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    <><Search className="w-4 h-4 mr-2" /> Search</>
                  )}
                </Button>
              </div>

              {onlineResults.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-slate-400 text-sm">{onlineResults.length} result{onlineResults.length !== 1 ? "s" : ""} found</p>
                  {onlineResults.map((shop: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{shop.name}</p>
                        <p className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {shop.address}, {shop.city}, {shop.state} {shop.zip}
                        </p>
                        {shop.phone && (
                          <p className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {shop.phone}
                          </p>
                        )}
                        {shop.hours && (
                          <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            {shop.hours}
                          </p>
                        )}
                        {shop.googleRating && (
                          <p className="text-slate-500 text-xs mt-0.5">
                            <Star className="w-3 h-3 inline mr-1 text-amber-400" />
                            {shop.googleRating} rating
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addFromSearch.mutate(shop)}
                        disabled={addFromSearch.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {onlineSearch.isPending && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Searching for real pawn shops online...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {approved.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Simpleton Approved</h2>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{approved.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approved.map(b => (
                <BusinessCard
                  key={b.id}
                  business={b}
                  avgRating={b.avgRating}
                  reviewCount={b.reviewCount}
                  onClick={() => setSelectedBusinessId(b.id)}
                  isAdmin={!!isAdmin}
                  onToggleVerify={(id, current) => toggleVerify.mutate({ id, current })}
                />
              ))}
            </div>
          </div>
        )}

        {blacklisted.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Do Not Go</h2>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{blacklisted.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blacklisted.map(b => (
                <BusinessCard
                  key={b.id}
                  business={b}
                  avgRating={b.avgRating}
                  reviewCount={b.reviewCount}
                  onClick={() => setSelectedBusinessId(b.id)}
                  isAdmin={!!isAdmin}
                  onToggleVerify={(id, current) => toggleVerify.mutate({ id, current })}
                />
              ))}
            </div>
          </div>
        )}

        {approved.length === 0 && blacklisted.length === 0 && (
          <div className="text-center py-16">
            <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No businesses found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search filters or check back soon as we add more listings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
