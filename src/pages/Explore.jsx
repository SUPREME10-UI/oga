import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import ArtisanCard from "../components/ArtisanCard";
import JobCard from "../components/common/JobCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Explore() {
  const { labourers, jobs } = useData();
  const navigate = useNavigate();
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

  // Extract unique professions and locations for filters (safely)
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

  // Filter artisans
  const filteredArtisans = artisans.filter((labourer) => {
    const searchMatch =
      !searchQuery ||
      (labourer.name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (labourer.profession?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );
    const profMatch =
      selectedProfession === "all" ||
      labourer.profession === selectedProfession;
    const locMatch =
      selectedLocation === "all" || labourer.location === selectedLocation;
    return searchMatch && profMatch && locMatch;
  });

  // Filter jobs
  const filteredJobs = Array.isArray(jobs)
    ? jobs.filter((job) => {
        if (!job) return false;
        const searchMatch =
          !searchQuery ||
          (job.title?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (job.description?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          );
        const profMatch =
          selectedProfession === "all" ||
          (job.category?.toLowerCase() || "") ===
            selectedProfession.toLowerCase();
        const locMatch =
          selectedLocation === "all" || job.location === selectedLocation;
        return searchMatch && profMatch && locMatch;
      })
    : [];

  const currentData =
    activeTab === "labourers" ? filteredArtisans : filteredJobs;
  const hasActiveFilters =
    searchQuery || selectedProfession !== "all" || selectedLocation !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedProfession("all");
    setSelectedLocation("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Search Header ── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold font-serif text-white mb-3">
            Find Skilled Artisans & Jobs
          </h1>
          <p className="text-slate-400 mb-8">
            Connect with verified professionals across Ghana
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "labourers"
                  ? "Search artisans by name or skill..."
                  : "Search jobs by title or description..."
              }
              className="pl-12 pr-4 h-14 text-base rounded-xl bg-white border-0 shadow-lg"
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

      {/* ── Tabs & Filters ── */}
      <div className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val);
            }}
            className="flex-shrink-0"
          >
            <TabsList>
              <TabsTrigger value="labourers" className="gap-2">
                <Hammer className="w-4 h-4" />
                Artisans
              </TabsTrigger>
              <TabsTrigger value="jobs" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Jobs
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
              {hasActiveFilters && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full bg-primary text-primary-foreground">
                  !
                </Badge>
              )}
            </Button>

            {showFilters && (
              <>
                <Select
                  value={selectedProfession}
                  onValueChange={setSelectedProfession}
                >
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

                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
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
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground ml-auto flex-shrink-0">
            <span className="font-semibold text-foreground">
              {currentData.length}
            </span>{" "}
            {activeTab === "labourers" ? "artisans" : "jobs"} found
          </p>
        </div>
      </div>

      {/* ── Results Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentData.length > 0 ? (
          <div
            className={`grid gap-6 ${
              activeTab === "labourers"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {currentData.map((item) =>
              activeTab === "labourers" ? (
                <ArtisanCard key={item.id} artisan={item} />
              ) : (
                <JobCard key={item.id} job={item} />
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {activeTab === "labourers" ? (
              <Hammer className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
            ) : (
              <Briefcase className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
            )}
            <h3 className="text-xl font-semibold mb-2">
              {hasActiveFilters ? "No results match your filters" : `No ${activeTab === "labourers" ? "artisans" : "jobs"} listed yet`}
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
