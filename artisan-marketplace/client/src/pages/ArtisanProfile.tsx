import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle,
  Heart,
  MessageCircle,
  Calendar,
  Clock,
  Hammer,
  Award,
  ChevronLeft,
  Share2,
  Languages,
} from "lucide-react";

export default function ArtisanProfile() {
  const { id } = useParams<{ id: string }>();
  const artisanId = Number(id);
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: artisan, isLoading } = trpc.artisans.getById.useQuery({ id: artisanId });
  const { data: reviews } = trpc.reviews.byArtisan.useQuery({ artisanId });
  const { data: isFav } = trpc.favorites.check.useQuery(
    { artisanId },
    { enabled: isAuthenticated }
  );
  const { data: categories } = trpc.categories.list.useQuery();

  const utils = trpc.useUtils();
  const toggleFav = trpc.favorites.toggle.useMutation({
    onSuccess: (isFavorited) => {
      utils.favorites.check.invalidate({ artisanId });
      toast.success(isFavorited ? "Added to favorites" : "Removed from favorites");
    },
  });

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.byArtisan.invalidate({ artisanId });
      utils.artisans.getById.invalidate({ id: artisanId });
      setReviewComment("");
      setReviewRating(5);
      toast.success("Review submitted!");
    },
    onError: (e) => toast.error(e.message),
  });

  const getConvo = trpc.chat.getOrCreateConversation.useMutation({
    onSuccess: (convo) => navigate(`/chat/${convo.id}`),
    onError: () => toast.error("Failed to start chat"),
  });

  const categoryName = categories?.find((c) => c.id === artisan?.categoryId)?.name;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="container py-16 text-center">
        <Hammer className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Artisan not found</h2>
        <Button asChild>
          <Link href="/search">Browse Artisans</Link>
        </Button>
      </div>
    );
  }

  const portfolio = (artisan.portfolioImages ?? []) as string[];
  const services = (artisan.services ?? []) as string[];
  const languages = (artisan.languages ?? ["English"]) as string[];

  return (
    <div className="bg-background min-h-screen">
      {/* Cover */}
      <div className="relative h-56 md:h-72 bg-gradient-to-br from-amber-100 to-orange-200">
        {artisan.coverUrl && (
          <img src={artisan.coverUrl} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 text-white hover:bg-white/20"
          onClick={() => history.back()}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast.success("Link copied!");
          }}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="container">
        {/* Profile header */}
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-primary/10 overflow-hidden flex-shrink-0">
              {artisan.avatarUrl ? (
                <img src={artisan.avatarUrl} alt={artisan.profession} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-3xl font-bold">
                  {artisan.profession.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold font-serif text-foreground">
                  {artisan.businessName ?? artisan.profession}
                </h1>
                {artisan.isVerified && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
                <Badge
                  className={
                    artisan.isAvailable
                      ? "bg-green-100 text-green-700 available-badge"
                      : "bg-gray-100 text-gray-500"
                  }
                >
                  {artisan.isAvailable ? "Available" : "Currently Busy"}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-2">{artisan.profession}</p>
              {categoryName && <Badge variant="secondary">{categoryName}</Badge>}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFav.mutate({ artisanId })}
                    className={isFav ? "text-red-500 border-red-200" : ""}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${isFav ? "fill-current" : ""}`} />
                    {isFav ? "Saved" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => getConvo.mutate({ artisanId })}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" /> Message
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/book/${artisanId}`}>
                      <Calendar className="w-4 h-4 mr-1" /> Book Now
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <a href={getLoginUrl()}>Sign In to Book</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 pb-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about">
              <TabsList className="mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio ({portfolio.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews?.length ?? 0})</TabsTrigger>
              </TabsList>

              {/* About tab */}
              <TabsContent value="about">
                {artisan.bio && (
                  <Card className="mb-4">
                    <CardContent className="pt-5">
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-muted-foreground leading-relaxed">{artisan.bio}</p>
                    </CardContent>
                  </Card>
                )}

                {services.length > 0 && (
                  <Card className="mb-4">
                    <CardContent className="pt-5">
                      <h3 className="font-semibold mb-3">Services Offered</h3>
                      <div className="flex flex-wrap gap-2">
                        {services.map((s) => (
                          <Badge key={s} variant="secondary">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Portfolio tab */}
              <TabsContent value="portfolio">
                {portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {portfolio.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Hammer className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No portfolio images yet</p>
                  </div>
                )}
              </TabsContent>

              {/* Reviews tab */}
              <TabsContent value="reviews">
                {/* Write review */}
                {isAuthenticated && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base">Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <Label className="text-sm mb-2 block">Your Rating</Label>
                        <StarRating
                          rating={reviewRating}
                          interactive
                          onChange={setReviewRating}
                          size="lg"
                        />
                      </div>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="mb-3"
                        rows={3}
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          createReview.mutate({
                            artisanId,
                            rating: reviewRating,
                            comment: reviewComment || undefined,
                          })
                        }
                        disabled={createReview.isPending}
                      >
                        {createReview.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Review list */}
                <div className="space-y-4">
                  {(reviews ?? []).map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                              U
                            </div>
                            <div>
                              <p className="text-sm font-medium">Customer</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        {review.ownerReply && (
                          <div className="mt-3 pl-3 border-l-2 border-primary/30">
                            <p className="text-xs font-medium text-primary mb-1">Artisan Reply</p>
                            <p className="text-sm text-muted-foreground">{review.ownerReply}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(reviews ?? []).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>No reviews yet. Be the first!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Rating summary */}
            <Card>
              <CardContent className="pt-5">
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold font-serif text-foreground">
                    {(artisan.avgRating ?? 0).toFixed(1)}
                  </p>
                  <StarRating rating={artisan.avgRating ?? 0} size="md" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {artisan.totalReviews ?? 0} reviews
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-foreground">{artisan.totalBookings ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Jobs Done</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <p className="text-lg font-bold text-foreground">{artisan.yearsExperience ?? 0}+</p>
                    <p className="text-xs text-muted-foreground">Years Exp.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact info */}
            <Card>
              <CardContent className="pt-5 space-y-3">
                <h3 className="font-semibold">Contact Info</h3>
                {artisan.phone && (
                  <a href={`tel:${artisan.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                    {artisan.phone}
                  </a>
                )}
                {artisan.email && (
                  <a href={`mailto:${artisan.email}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                    {artisan.email}
                  </a>
                )}
                {(artisan.city || artisan.state) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    {[artisan.city, artisan.state, artisan.country].filter(Boolean).join(", ")}
                  </div>
                )}
                {artisan.website && (
                  <a href={artisan.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Globe className="w-4 h-4 text-primary" />
                    Website
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            {(artisan.priceMin || artisan.priceMax) && (
              <Card>
                <CardContent className="pt-5">
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <p className="text-2xl font-bold text-primary">
                    {artisan.priceMin && artisan.priceMax
                      ? `GH₵${Number(artisan.priceMin).toLocaleString()} – GH₵${Number(artisan.priceMax).toLocaleString()}`
                      : artisan.priceMin
                      ? `From GH₵${Number(artisan.priceMin).toLocaleString()}`
                      : `Up to GH₵${Number(artisan.priceMax).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Per job (negotiable)</p>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Languages</h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Book CTA */}
            {isAuthenticated && (
              <Button asChild className="w-full" size="lg">
                <Link href={`/book/${artisanId}`}>
                  <Calendar className="w-4 h-4 mr-2" /> Book This Artisan
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Image lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>;
}
