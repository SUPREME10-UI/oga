import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import ArtisanCard from "@/components/ArtisanCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X, Hammer } from "lucide-react";

export default function SearchPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    params.get("categoryId") ? Number(params.get("categoryId")) : undefined
  );
  const [minRating, setMinRating] = useState(0);
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>();
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: artisans, isLoading } = trpc.artisans.list.useQuery({
    categoryId,
    search: query || undefined,
    minRating: minRating > 0 ? minRating : undefined,
    isAvailable,
    limit: 50,
  });

  const categoryMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));

  const sorted = [...(artisans ?? [])].sort((a, b) => {
    if (sortBy === "rating") return (b.avgRating ?? 0) - (a.avgRating ?? 0);
    if (sortBy === "reviews") return (b.totalReviews ?? 0) - (a.totalReviews ?? 0);
    return 0;
  });

  const clearFilters = () => {
    setQuery("");
    setCategoryId(undefined);
    setMinRating(0);
    setIsAvailable(undefined);
  };

  const activeFilterCount = [
    categoryId !== undefined,
    minRating > 0,
    isAvailable !== undefined,
  ].filter(Boolean).length;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif text-foreground mb-1">Find Artisans</h1>
        <p className="text-muted-foreground text-sm">
          {isLoading ? "Searching..." : `${sorted.length} artisans found`}
        </p>
      </div>

      {/* Search bar + filter toggle */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, profession, or city..."
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Category</Label>
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
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={isAvailable === true}
              onCheckedChange={(c) => setIsAvailable(c ? true : undefined)}
            />
            <Label className="text-sm font-medium">Available Only</Label>
          </div>

          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="w-4 h-4 mr-1" /> Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categoryId && (
            <Badge variant="secondary" className="gap-1">
              {categoryMap[categoryId] ?? "Category"}
              <button onClick={() => setCategoryId(undefined)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {minRating}+ Stars
              <button onClick={() => setMinRating(0)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {isAvailable && (
            <Badge variant="secondary" className="gap-1">
              Available Now
              <button onClick={() => setIsAvailable(undefined)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map((artisan) => (
            <ArtisanCard
              key={artisan.id}
              artisan={artisan}
              categoryName={artisan.categoryId ? categoryMap[artisan.categoryId] : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Hammer className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No artisans found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
