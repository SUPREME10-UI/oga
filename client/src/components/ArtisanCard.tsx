import { Link } from "wouter";
import { MapPin, Star, CheckCircle, Clock, Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Artisan } from "../../../drizzle/schema";

interface ArtisanCardProps {
  artisan: Artisan;
  categoryName?: string;
}

export default function ArtisanCard({ artisan, categoryName }: ArtisanCardProps) {
  return (
    <Card className="card-hover overflow-hidden border border-border">
      {/* Cover / Avatar */}
      <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100">
        {artisan.coverUrl ? (
          <img src={artisan.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Hammer className="w-10 h-10 text-primary/30" />
          </div>
        )}
        {/* Availability badge */}
        <div className="absolute top-2 right-2">
          <Badge
            className={`text-xs ${
              artisan.isAvailable
                ? "bg-green-500 text-white available-badge"
                : "bg-gray-400 text-white"
            }`}
          >
            {artisan.isAvailable ? "Available" : "Busy"}
          </Badge>
        </div>
        {/* Avatar */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 rounded-full border-2 border-white bg-primary/10 overflow-hidden">
            {artisan.avatarUrl ? (
              <img src={artisan.avatarUrl} alt={artisan.profession} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
                {artisan.profession.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-8 pb-4 px-4">
        {/* Name & profession */}
        <div className="mb-2">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-foreground truncate">
              {artisan.businessName ?? artisan.profession}
            </h3>
            {artisan.isVerified && (
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{artisan.profession}</p>
          {categoryName && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {categoryName}
            </Badge>
          )}
        </div>

        {/* Location */}
        {(artisan.city || artisan.state) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            <span>{[artisan.city, artisan.state].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 star-filled fill-current" />
          <span className="text-sm font-medium">{(artisan.avgRating ?? 0).toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({artisan.totalReviews ?? 0} reviews)</span>
        </div>

        {/* Price */}
        {(artisan.priceMin || artisan.priceMax) && (
          <p className="text-xs text-muted-foreground mb-3">
            {artisan.priceMin && artisan.priceMax
              ? `GH₵${Number(artisan.priceMin).toLocaleString()} – GH₵${Number(artisan.priceMax).toLocaleString()}`
              : artisan.priceMin
              ? `From GH₵${Number(artisan.priceMin).toLocaleString()}`
              : `Up to GH₵${Number(artisan.priceMax).toLocaleString()}`}
          </p>
        )}

        <Button asChild size="sm" className="w-full">
          <Link href={`/artisan/${artisan.id}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
