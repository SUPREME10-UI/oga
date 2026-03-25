import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  X,
  Hammer,
  Briefcase,
  SlidersHorizontal,
  Star,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobCard from "../components/common/JobCard";

function ArtisanGridCard({ artisan }) {
  const name = artisan.name || artisan.businessName || "Artisan";
  const profession = artisan.profession || (artisan.skills?.[0]) || "Skilled Worker";
  const avatarUrl = artisan.photoURL || artisan.photo || artisan.image || artisan.avatarUrl;
  const location = artisan.location || artisan.city || "";
  const isVerified = artisan.isVerified || artisan.verified;
  const isAvailable = artisan.isAvailable !== false;
  const rating = Number(artisan.rating || artisan.avgRating || 0);
  const reviewCount = artisan.reviewCount || artisan.totalReviews || 0;
  const hourlyRate = artisan.hourlyRate || artisan.rate;

  return (
    <Card className="card-hover overflow-hidden border border-border group">
      {/* Cover */}
      <div className="relative h-28 craft-gradient">
        <div className="absolute inset-0 bg-black/20" />
        {/* Availability badge */}
        <div className="absolute top-2 right-2">
          <Badge
            className={`text-xs ${
              isAvailable
                ? "bg-green-500 text-white available-badge"
                : "bg-gray-500 text-white"
            }`}
          >
            {isAvailable ? "Available" : "Busy"}
          </Badge>
        </div>
        {/* Avatar */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-14 h-14 rounded-full border-3 border-white shadow-lg bg-white overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center craft-gradient text-white font-bold text-xl">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-9 pb-4 px-4">
        {/* Name */}
        <div className="flex items-center gap-1 mb-0.5">
          <h3 className="font-semibold text-foreground truncate text-base">{name}</h3>
          {isVerified && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
        </div>
        <p className="text-sm text-muted-foreground mb-2">{profession}</p>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 star-filled fill-current" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
        </div>

        {/* Rate + button */}
        <div className="flex items-center justify-between mt-auto">
          {hourlyRate ? (
            <span className="text-sm font-semibold text-primary">GH₵{hourlyRate}/hr</span>
          ) : (
            <span className="text-xs text-muted-foreground">Rate on request</span>
          )}
          <Button asChild size="sm" className="text-xs px-3">
            <Link to={`/profile/${artisan.id}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Explore() {
  const { labourers, jobs } = useData();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";

  const [activeTab, setActiveTab] = useState("labourers");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedProfession, setSelectedProfession] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Only show labourer-type users in the artisan tab
  const artisans = Array.isArray(labourers)
    ? labourers.filter((u) => u && u.type === "labourer")
    : [];

  const professionsList = [
    "all",
    ...new Set(artisans.map((l) => l.profession).filter(Boolean)),
  ];
  const locationsList = [
    "all",
    ...new Set(
      [
        ...artisans.map((l) => l.location),
        ...(Array.isArray(jobs) ? jobs.map((j) => j?.location) : []),
      ].filter(Boolean)
    ),
  ];

  const filteredArtisans = artisans.filter((l) => {
    const searchMatch =
      !searchQuery ||
      (l.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (l.profession?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const profMatch = selectedProfession === "all" || l.profession === selectedProfession;
    const locMatch = selectedLocation === "all" || l.location === selectedLocation;
    return searchMatch && profMatch && locMatch;
  });

  const filteredJobs = Array.isArray(jobs)
    ? jobs.filter((job) => {
        if (!job) return false;
        const searchMatch =
          !searchQuery ||
          (job.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (job.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        const profMatch =
          selectedProfession === "all" ||
          (job.category?.toLowerCase() || "") === selectedProfession.toLowerCase();
        const locMatch = selectedLocation === "all" || job.location === selectedLocation;
        return searchMatch && profMatch && locMatch;
      })
    : [];

  const currentData = activeTab === "labourers" ? filteredArtisans : filteredJobs;
  const hasActiveFilters =
    searchQuery || selectedProfession !== "all" || selectedLocation !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedProfession("all");
    setSelectedLocation("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="hero-gradient py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-3 tracking-tight">
            Find Skilled Artisans &amp; Jobs
          </h1>
          <p className="text-white/60 mb-8 text-lg">
            Connect with verified professionals across Ghana
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "labourers"
                  ? "Search by name, skill or profession..."
                  : "Search jobs by title..."
              }
              className="pl-12 pr-10 h-14 text-base rounded-xl bg-white border-0 shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Filter bar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
            <TabsList>
              <TabsTrigger value="labourers" className="gap-2">
                <Hammer className="w-4 h-4" /> Artisans
                <Badge variant="secondary" className="ml-1 text-xs h-5">
                  {filteredArtisans.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="jobs" className="gap-2">
                <Briefcase className="w-4 h-4" /> Jobs
                <Badge variant="secondary" className="ml-1 text-xs h-5">
                  {filteredJobs.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2 flex-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>

            {showFilters && (
              <>
                <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                  <SelectTrigger className="w-44 h-9 text-sm">
                    <SelectValue placeholder="All Professions" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionsList.map((prof) => (
                      <SelectItem key={prof} value={prof}>
                        {prof === "all" ? "All Professions" : prof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-44 h-9 text-sm">
                    <SelectValue placeholder="Any Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationsList.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc === "all" ? "Any Location" : loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentData.length > 0 ? (
          <div
            className={`grid gap-5 ${
              activeTab === "labourers"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {activeTab === "labourers"
              ? filteredArtisans.map((item) => (
                  <ArtisanGridCard key={item.id} artisan={item} />
                ))
              : filteredJobs.map((item) => <JobCard key={item.id} job={item} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {activeTab === "labourers" ? (
              <Hammer className="w-16 h-16 text-primary/20 mb-4" />
            ) : (
              <Briefcase className="w-16 h-16 text-primary/20 mb-4" />
            )}
            <h3 className="text-xl font-semibold font-serif mb-2">
              {hasActiveFilters
                ? "No results match your filters"
                : `No ${activeTab === "labourers" ? "artisans" : "jobs"} listed yet`}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {hasActiveFilters
                ? "Try adjusting your search or removing some filters."
                : "Check back soon — new listings are added regularly."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
