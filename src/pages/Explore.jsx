import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useData } from "../context/DataContext";
import { MapView } from "../components/Map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  X,
  MapPin,
  Star,
  CheckCircle,
  Hammer,
  Navigation,
  Briefcase
} from "lucide-react";
import ArtisanCard from "../components/ArtisanCard";
import JobCard from "../components/common/JobCard";

// Mock coordinates for demonstration based on common locations
const LOCATION_COORDS = {
  "Accra": { lat: 5.6037, lng: -0.1870 },
  "Kumasi": { lat: 6.6884, lng: -1.6244 },
  "Tema": { lat: 5.6698, lng: -0.0166 },
  "Tamale": { lat: 9.4008, lng: -0.8393 },
  "Takoradi": { lat: 4.9016, lng: -1.7831 },
};

export default function Explore() {
  const { labourers, jobs } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to parse query from URL if passed
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";

  const [activeTab, setActiveTab] = useState("labourers"); // 'labourers' or 'jobs'
  const [selectedItem, setSelectedItem] = useState(null); // Selected artisan or job for map
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedProfession, setSelectedProfession] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Extract unique professions and locations for filters
  const professions = ["all", ...new Set(labourers.map(l => l.profession).filter(Boolean))];
  const locationsList = ["all", ...new Set([
    ...labourers.map(l => l.location),
    ...jobs.map(j => j.location)
  ].filter(Boolean))];

  // Filter Data
  const filteredLabourers = labourers.filter((labourer) => {
    const searchMatch = !searchQuery || 
      (labourer.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (labourer.profession?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    const profMatch = selectedProfession === "all" || labourer.profession === selectedProfession;
    const locMatch = selectedLocation === "all" || labourer.location === selectedLocation;
    
    return searchMatch && profMatch && locMatch;
  });

  const filteredJobs = jobs.filter((job) => {
    const searchMatch = !searchQuery || 
      (job.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (job.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    // Attempt relaxed category match for profession filter
    const profMatch = selectedProfession === "all" || 
      (job.category?.toLowerCase() || "") === selectedProfession.toLowerCase();
    
    const locMatch = selectedLocation === "all" || job.location === selectedLocation;
    
    return searchMatch && profMatch && locMatch;
  });

  const currentData = activeTab === "labourers" ? filteredLabourers : filteredJobs;

  // Center map on user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (mapRef.current) {
            mapRef.current.setCenter(loc);
            mapRef.current.setZoom(13);
          }
        },
        () => alert("Unable to retrieve your location.")
      );
    }
  };

  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
    // Default center: Accra
    map.setCenter({ lat: 5.6037, lng: -0.1870 });
    map.setZoom(12);
  }, []);

  // Place markers on map (If API Key works and we load AdvancedMarkerElement or standard Marker)
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps?.Marker) return;

    // Clear existing
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    currentData.forEach((item, index) => {
      // Mock coordinates if exact lat/lng is missing
      const baseCoords = LOCATION_COORDS[item.location] || { lat: 5.6037, lng: -0.1870 };
      // Add slight jitter so markers in same city don't completely overlap
      const jitterLat = (Math.random() - 0.5) * 0.05;
      const jitterLng = (Math.random() - 0.5) * 0.05;
      
      const position = {
        lat: item.latitude || (baseCoords.lat + jitterLat),
        lng: item.longitude || (baseCoords.lng + jitterLng)
      };

      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        title: activeTab === "labourers" ? item.name : item.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: activeTab === "labourers" ? "#D97706" : "#2563EB", // Orange vs Blue
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        setSelectedItem(item);
        mapRef.current.panTo(position);
        mapRef.current.setZoom(14);
      });

      markersRef.current.push(marker);
    });
  }, [currentData, activeTab]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <div
        className={`fixed md:relative z-20 w-80 max-w-[85vw] md:max-w-md h-full bg-white border-r border-border flex flex-col transition-transform duration-300 shadow-2xl md:shadow-none ${
          showFilters ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-border bg-secondary/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg font-serif">Directory</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowFilters(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => {
            setActiveTab(val);
            setSelectedItem(null);
          }} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="labourers">Artisans</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="pl-9 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Profession" />
                </SelectTrigger>
                <SelectContent>
                  {professions.map((prof) => (
                    <SelectItem key={prof} value={prof}>
                      {prof === "all" ? "All Professions" : prof}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locationsList.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc === "all" ? "Any Location" : loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(searchQuery || selectedProfession !== "all" || selectedLocation !== "all") && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs h-8 text-muted-foreground"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProfession("all");
                  setSelectedLocation("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {currentData.length} {activeTab} found
          </p>
          
          <div className="space-y-4">
            {currentData.length > 0 ? (
              currentData.map((item) => (
                <div 
                  key={item.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedItem?.id === item.id ? "ring-2 ring-primary ring-offset-2 rounded-xl" : ""
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  {activeTab === "labourers" ? (
                    <ArtisanCard artisan={item} />
                  ) : (
                    <JobCard job={item} />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-4 bg-white rounded-xl border border-dashed border-border flex flex-col items-center">
                {activeTab === "labourers" ? (
                  <Hammer className="w-10 h-10 text-muted-foreground opacity-20 mb-3" />
                ) : (
                  <Briefcase className="w-10 h-10 text-muted-foreground opacity-20 mb-3" />
                )}
                <h3 className="font-semibold text-foreground">No {activeTab} found</h3>
                <p className="text-sm text-muted-foreground mt-1 text-balance">
                  Try adjusting your filters or searching for something else.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Map Area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 relative bg-slate-100 hidden md:block">
        {/* Mobile filter toggle */}
        <Button
          className="absolute top-4 left-4 z-10 md:hidden shadow-lg"
          size="sm"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Show List
          {currentData.length > 0 && (
            <Badge className="ml-2 bg-white text-primary text-xs px-1.5 py-0">
              {currentData.length}
            </Badge>
          )}
        </Button>

        {/* GPS button */}
        <Button
          className="absolute top-4 right-4 z-10 shadow-lg bg-white text-foreground hover:bg-slate-50"
          size="sm"
          variant="outline"
          onClick={getUserLocation}
        >
          <Navigation className="w-4 h-4 mr-2 text-primary" />
          My Location
        </Button>

        <MapView onMapReady={handleMapReady} className="w-full h-full" />
      </div>

      {/* Mobile Map View Button (only shows when sidebar is open on small screens) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <Button 
          className="shadow-xl rounded-full px-6" 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Show Map
            </>
          ) : (
            <>
              <Filter className="w-4 h-4 mr-2" />
              Show List Filters
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
