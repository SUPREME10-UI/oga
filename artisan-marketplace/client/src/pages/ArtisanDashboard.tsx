import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Hammer,
  Star,
  Calendar,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  Plus,
  X,
} from "lucide-react";
import PortfolioUploader from "@/components/PortfolioUploader";

export default function ArtisanDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  const { data: artisan, isLoading } = trpc.artisans.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: bookings } = trpc.bookings.artisanBookings.useQuery(undefined, { enabled: !!artisan });
  const { data: reviews } = trpc.reviews.byArtisan.useQuery(
    { artisanId: artisan?.id ?? 0 },
    { enabled: !!artisan }
  );

  const utils = trpc.useUtils();

  const toggleAvail = trpc.artisans.toggleAvailability.useMutation({
    onSuccess: (res) => {
      utils.artisans.getMyProfile.invalidate();
      toast.success(res.isAvailable ? "You are now available" : "You are now marked as busy");
    },
  });

  const updateArtisan = trpc.artisans.update.useMutation({
    onSuccess: () => {
      utils.artisans.getMyProfile.invalidate();
      toast.success("Profile updated!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateBooking = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      utils.bookings.artisanBookings.invalidate();
      toast.success("Booking updated");
    },
  });

  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPriceMin, setEditPriceMin] = useState("");
  const [editPriceMax, setEditPriceMax] = useState("");
  const [newService, setNewService] = useState("");
  const [editServices, setEditServices] = useState<string[]>([]);
  const [editPortfolioImages, setEditPortfolioImages] = useState<string[]>([]);
  const [editInit, setEditInit] = useState(false);

  if (artisan && !editInit) {
    setEditBio(artisan.bio ?? "");
    setEditPhone(artisan.phone ?? "");
    setEditCity(artisan.city ?? "");
    setEditPriceMin(artisan.priceMin ?? "");
    setEditPriceMax(artisan.priceMax ?? "");
    setEditServices((artisan.services as string[]) ?? []);
    setEditPortfolioImages((artisan.portfolioImages as string[]) ?? []);
    setEditInit(true);
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <Hammer className="w-16 h-16 mx-auto text-primary/30 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-3">Artisan Dashboard</h2>
        <p className="text-muted-foreground mb-6">Sign in to access your dashboard</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In</a>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="container py-16 text-center">
        <Hammer className="w-16 h-16 mx-auto text-primary/30 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-3">Not Registered as Artisan</h2>
        <p className="text-muted-foreground mb-6">Create your artisan profile to start receiving bookings</p>
        <Button asChild>
          <Link href="/register-artisan">Register Now</Link>
        </Button>
      </div>
    );
  }

  const pendingBookings = (bookings ?? []).filter((b) => b.status === "pending");
  const completedBookings = (bookings ?? []).filter((b) => b.status === "completed");
  const avgRating = artisan.avgRating ?? 0;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Artisan Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.name}
            {artisan.status === "pending" && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-700">Pending Approval</Badge>
            )}
            {artisan.status === "approved" && (
              <Badge className="ml-2 bg-green-100 text-green-700">Approved</Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Available</span>
          <Switch
            checked={artisan.isAvailable}
            onCheckedChange={() => toggleAvail.mutate()}
            disabled={toggleAvail.isPending}
          />
          <Button asChild variant="outline" size="sm">
            <Link href={`/artisan/${artisan.id}`}>View Public Profile</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: bookings?.length ?? 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending", value: pendingBookings.length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Completed", value: completedBookings.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Avg Rating", value: avgRating.toFixed(1), icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="mb-6">
          <TabsTrigger value="bookings">Bookings ({bookings?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="profile">Edit Profile</TabsTrigger>
        </TabsList>

        {/* Bookings */}
        <TabsContent value="bookings">
          <div className="space-y-3">
            {(bookings ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No bookings yet</p>
              </div>
            ) : (
              (bookings ?? []).map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={
                              booking.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : booking.status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {booking.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            #{booking.id} · {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          {booking.serviceDescription}
                        </p>
                        {booking.scheduledAt && (
                          <p className="text-xs text-muted-foreground">
                            Scheduled: {new Date(booking.scheduledAt).toLocaleString()}
                          </p>
                        )}
                        {booking.totalAmount && (
                          <p className="text-sm font-semibold text-primary mt-1">
                            GH₵{Number(booking.totalAmount).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {booking.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateBooking.mutate({ id: booking.id, status: "confirmed" })}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBooking.mutate({ id: booking.id, status: "cancelled" })}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>
                        </div>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => updateBooking.mutate({ id: booking.id, status: "completed" })}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews">
          <div className="space-y-3">
            {(reviews ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No reviews yet</p>
              </div>
            ) : (
              (reviews ?? []).map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < review.rating ? "star-filled fill-current" : "star-empty"}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Edit Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Bio</Label>
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={4}
                  placeholder="Describe your skills..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Phone</Label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">City</Label>
                  <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Min Price (GH₵)</Label>
                  <Input type="number" value={editPriceMin} onChange={(e) => setEditPriceMin(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Max Price (GH₵)</Label>
                  <Input type="number" value={editPriceMax} onChange={(e) => setEditPriceMax(e.target.value)} />
                </div>
              </div>

              {/* Portfolio Photos */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Portfolio Photos</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Showcase your best work. Upload photos directly from your phone camera or gallery. Up to 10 images.
                </p>
                <PortfolioUploader
                  existingImages={editPortfolioImages}
                  onChange={setEditPortfolioImages}
                  maxImages={10}
                />
              </div>
              {/* Services */}
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Services</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add a service"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newService.trim()) {
                          setEditServices([...editServices, newService.trim()]);
                          setNewService("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (newService.trim()) {
                        setEditServices([...editServices, newService.trim()]);
                        setNewService("");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editServices.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button
                        type="button"
                        onClick={() => setEditServices(editServices.filter((x) => x !== s))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={() =>
                  updateArtisan.mutate({
                    bio: editBio,
                    phone: editPhone,
                    city: editCity,
                    priceMin: editPriceMin,
                    priceMax: editPriceMax,
                    services: editServices,
                    portfolioImages: editPortfolioImages,
                  })
                }
                disabled={updateArtisan.isPending}
              >
                {updateArtisan.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
