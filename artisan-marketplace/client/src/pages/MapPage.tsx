import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  X,
  MapPin,
  Star,
  CheckCircle,
  Hammer,
  Navigation,
  ChevronLeft,
} from "lucide-react";
import type { Artisan } from "../../../drizzle/schema";

export default function MapPage() {
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: artisans } = trpc.artisans.list.useQuery({
    categoryId,
    search: searchQuery || undefined,
    minRating: minRating > 0 ? minRating : undefined,
    isAvailable,
    limit: 100,
  });

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          if (mapRef.current) {
            mapRef.current.setCenter(loc);
            mapRef.current.setZoom(13);
          }
        },
        () => {}
      );
    }
  };

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Default center: Accra, Ghana
    map.setCenter({ lat: 5.6037, lng: -0.1870 });
    map.setZoom(12);
  }, []);

  // Place markers when artisans or map changes
  useEffect(() => {
    if (!mapRef.current || !artisans) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    artisans.forEach((artisan) => {
      if (!artisan.latitude || !artisan.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: artisan.latitude, lng: artisan.longitude },
        map: mapRef.current!,
        title: artisan.profession,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: artisan.isAvailable ? "#D97706" : "#9CA3AF",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding:8px;min-width:180px;font-family:Inter,sans-serif">
            <p style="font-weight:600;margin:0 0 4px">${artisan.businessName ?? artisan.profession}</p>
            <p style="color:#6B7280;font-size:12px;margin:0 0 4px">${artisan.profession}</p>
            <p style="color:#6B7280;font-size:12px;margin:0 0 8px">${[artisan.city, artisan.state].filter(Boolean).join(", ")}</p>
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:8px">
              <span style="color:#D97706">★</span>
              <span style="font-size:12px">${(artisan.avgRating ?? 0).toFixed(1)} (${artisan.totalReviews ?? 0})</span>
            </div>
            <a href="/artisan/${artisan.id}" style="background:#D97706;color:white;padding:4px 12px;border-radius:6px;font-size:12px;text-decoration:none;display:inline-block">View Profile</a>
          </div>
        `,
      });

      marker.addListener("click", () => {
        setSelectedArtisan(artisan);
        infoWindow.open(mapRef.current!, marker);
      });

      markersRef.current.push(marker);
    });
  }, [artisans]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <div
        className={`${
          showFilters ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } absolute md:relative z-20 w-80 h-full bg-white border-r border-border flex flex-col transition-transform duration-300`}
      >
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Find Artisans</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowFilters(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artisans..."
              className="pl-9"
            />
          </div>

          {/* Category filter */}
          <Select
            value={categoryId?.toString() ?? "all"}
            onValueChange={(v) => setCategoryId(v === "all" ? undefined : Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(categories ?? []).map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Min Rating: {minRating > 0 ? `${minRating}+` : "Any"}
            </Label>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={[minRating]}
              onValueChange={([v]) => setMinRating(v)}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Available Only</Label>
            <Switch
              checked={isAvailable === true}
              onCheckedChange={(checked) => setIsAvailable(checked ? true : undefined)}
            />
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-3">
              {artisans?.length ?? 0} artisans found
            </p>
            <div className="space-y-2">
              {(artisans ?? []).map((artisan) => (
                <div
                  key={artisan.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedArtisan?.id === artisan.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-accent/50"
                  }`}
                  onClick={() => {
                    setSelectedArtisan(artisan);
                    if (artisan.latitude && artisan.longitude && mapRef.current) {
                      mapRef.current.setCenter({ lat: artisan.latitude, lng: artisan.longitude });
                      mapRef.current.setZoom(15);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {artisan.avatarUrl ? (
                        <img src={artisan.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                      ) : (
                        <Hammer className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium truncate">
                          {artisan.businessName ?? artisan.profession}
                        </p>
                        {artisan.isVerified && (
                          <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{artisan.profession}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 star-filled fill-current" />
                          <span className="text-xs">{(artisan.avgRating ?? 0).toFixed(1)}</span>
                        </div>
                        {artisan.city && (
                          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <MapPin className="w-2.5 h-2.5" />
                            {artisan.city}
                          </div>
                        )}
                        <Badge
                          className={`text-xs px-1 py-0 h-4 ${
                            artisan.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {artisan.isAvailable ? "Available" : "Busy"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(artisans ?? []).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Hammer className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No artisans found</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Map Area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        {/* Mobile filter toggle */}
        <Button
          className="absolute top-3 left-3 z-10 md:hidden shadow-md"
          size="sm"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="w-4 h-4 mr-1" />
          Filters
          {(artisans?.length ?? 0) > 0 && (
            <Badge className="ml-1 bg-white text-primary text-xs px-1 py-0">
              {artisans?.length}
            </Badge>
          )}
        </Button>

        {/* GPS button */}
        <Button
          className="absolute top-3 right-3 z-10 shadow-md"
          size="sm"
          variant="secondary"
          onClick={getUserLocation}
        >
          <Navigation className="w-4 h-4 mr-1" />
          My Location
        </Button>

        <MapView onMapReady={handleMapReady} className="w-full h-full" />

        {/* Selected artisan card */}
        {selectedArtisan && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)] z-10">
            <Card className="shadow-xl border border-border">
              <CardContent className="p-4">
                <button
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedArtisan(null)}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {selectedArtisan.avatarUrl ? (
                      <img src={selectedArtisan.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      <Hammer className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold">{selectedArtisan.businessName ?? selectedArtisan.profession}</p>
                      {selectedArtisan.isVerified && <CheckCircle className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedArtisan.profession}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 star-filled fill-current" />
                        <span className="text-sm">{(selectedArtisan.avgRating ?? 0).toFixed(1)}</span>
                      </div>
                      <Badge className={selectedArtisan.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                        {selectedArtisan.isAvailable ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button asChild className="flex-1" size="sm">
                    <Link href={`/artisan/${selectedArtisan.id}`}>View Profile</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/book/${selectedArtisan.id}`}>Book Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
