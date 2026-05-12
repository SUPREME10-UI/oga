import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Hammer,
  CheckCircle,
  Star,
  ChevronLeft,
  Clock,
  CreditCard,
} from "lucide-react";

export default function BookingPage() {
  const { artisanId: paramId } = useParams<{ artisanId: string }>();
  const artisanId = Number(paramId);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    serviceDescription: "",
    scheduledAt: "",
    address: "",
    totalAmount: "",
    notes: "",
  });

  const { data: artisan, isLoading } = trpc.artisans.getById.useQuery({ id: artisanId });

  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Booking request sent! The artisan will confirm shortly.");
      navigate("/dashboard");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceDescription.trim()) {
      return toast.error("Please describe the service you need");
    }
    createBooking.mutate({
      artisanId,
      ...form,
      scheduledAt: form.scheduledAt || undefined,
      totalAmount: form.totalAmount || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <Calendar className="w-16 h-16 mx-auto text-primary/30 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-3">Book an Artisan</h2>
        <p className="text-muted-foreground mb-6">Sign in to make a booking</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In to Book</a>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8 max-w-2xl">
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
        <Hammer className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Artisan not found</h2>
        <Button asChild>
          <Link href="/search">Browse Artisans</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 text-muted-foreground"
        onClick={() => history.back()}
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Profile
      </Button>

      <h1 className="text-2xl font-bold font-serif text-foreground mb-6">Book a Service</h1>

      {/* Artisan summary */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              {artisan.avatarUrl ? (
                <img src={artisan.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                <Hammer className="w-7 h-7 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">
                  {artisan.businessName ?? artisan.profession}
                </p>
                {artisan.isVerified && <CheckCircle className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground">{artisan.profession}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 star-filled fill-current" />
                  <span className="text-xs">{(artisan.avgRating ?? 0).toFixed(1)}</span>
                </div>
                {artisan.city && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {artisan.city}
                  </div>
                )}
                <Badge
                  className={
                    artisan.isAvailable
                      ? "bg-green-100 text-green-700 text-xs"
                      : "bg-gray-100 text-gray-500 text-xs"
                  }
                >
                  {artisan.isAvailable ? "Available" : "Busy"}
                </Badge>
              </div>
            </div>
            {(artisan.priceMin || artisan.priceMax) && (
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  {artisan.priceMin
                    ? `GH₵${Number(artisan.priceMin).toLocaleString()}`
                    : ""}
                  {artisan.priceMin && artisan.priceMax ? " – " : ""}
                  {artisan.priceMax
                    ? `GH₵${Number(artisan.priceMax).toLocaleString()}`
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground">per job</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="desc" className="text-sm font-medium mb-1.5 block">
                What do you need? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="desc"
                value={form.serviceDescription}
                onChange={(e) => setForm({ ...form, serviceDescription: e.target.value })}
                placeholder="Describe the work you need done in detail..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="scheduled" className="text-sm font-medium mb-1.5 block">
                <Clock className="w-4 h-4 inline mr-1" />
                Preferred Date & Time
              </Label>
              <Input
                id="scheduled"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium mb-1.5 block">
                <MapPin className="w-4 h-4 inline mr-1" />
                Service Address
              </Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Where should the artisan come?"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium mb-1.5 block">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Agreed Amount (GH₵)
              </Label>
              <Input
                id="amount"
                type="number"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                placeholder="Optional — can be negotiated"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium mb-1.5 block">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions or requirements..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notice about payment */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Payment Information</p>
          <p>
            Payment can be arranged directly with the artisan after they confirm your booking. Online
            payment integration is coming soon.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={createBooking.isPending || !artisan.isAvailable}
        >
          {createBooking.isPending
            ? "Sending Request..."
            : !artisan.isAvailable
            ? "Artisan Currently Unavailable"
            : "Send Booking Request"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          The artisan will review your request and confirm within 24 hours.
        </p>
      </form>
    </div>
  );
}
