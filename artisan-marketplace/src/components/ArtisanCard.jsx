import { Link } from "react-router-dom";
import { MapPin, Star, CheckCircle, Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ArtisanCard({ artisan, categoryName }) {
  // Map Firebase labourer properties to the expected UI model
  const name = artisan.name || artisan.businessName || "Artisan";
  const profession = artisan.profession || (artisan.skills && artisan.skills.length > 0 ? artisan.skills[0] : "Labourer");
  const avatarUrl = artisan.photoURL || artisan.photo || artisan.avatarUrl;
  const coverUrl = artisan.coverUrl;
  const isAvailable = artisan.isAvailable !== false; // default true unless explicitly false
  const isVerified = artisan.isVerified || artisan.verified;
  
  // Try to extract location
  const locationText = artisan.location 
    ? typeof artisan.location === 'string' ? artisan.location : artisan.location.address
    : [artisan.city, artisan.state].filter(Boolean).join(", ");

  const avgRating = Number(artisan.avgRating || artisan.rating || 0);
  const totalReviews = artisan.totalReviews || artisan.reviewsCount || 0;
  
  const priceMin = artisan.hourlyRate || artisan.rate || artisan.priceMin;
  const priceMax = artisan.priceMax;

  return (
    <Card className="card-hover overflow-hidden border border-border">
      {/* Cover / Avatar */}
      <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Hammer className="w-10 h-10 text-primary/30" />
          </div>
        )}
        {/* Availability badge */}
        <div className="absolute top-2 right-2">
          <Badge
            className={`text-xs ${
              isAvailable
                ? "bg-green-500 text-white available-badge"
                : "bg-gray-400 text-white"
            }`}
          >
            {isAvailable ? "Available" : "Busy"}
          </Badge>
        </div>
        {/* Avatar */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 rounded-full border-2 border-white bg-primary/10 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profession} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
                {profession.charAt(0)}
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
              {name}
            </h3>
            {isVerified && (
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{profession}</p>
          {categoryName && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {categoryName}
            </Badge>
          )}
        </div>

        {/* Location */}
        {locationText && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 star-filled fill-current" />
          <span className="text-sm font-medium">{Number(avgRating || 0).toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({totalReviews} reviews)</span>
        </div>

        {/* Price */}
        {(priceMin || priceMax) && (
          <p className="text-xs text-muted-foreground mb-3">
            {priceMin && priceMax
              ? `GH₵${Number(priceMin).toLocaleString()} – GH₵${Number(priceMax).toLocaleString()}`
              : priceMin
              ? `GH₵${Number(priceMin).toLocaleString()}/hr`
              : `Up to GH₵${Number(priceMax).toLocaleString()}`}
          </p>
        )}

        <Button asChild size="sm" className="w-full">
          <Link to={`/profile/${artisan.id}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
