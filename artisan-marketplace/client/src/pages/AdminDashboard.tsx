import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users,
  Hammer,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  TrendingUp,
  Eye,
  Ban,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();

  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: user?.role === "admin" });
  const { data: artisans } = trpc.admin.artisans.useQuery({}, { enabled: user?.role === "admin" });
  const { data: users } = trpc.admin.users.useQuery({}, { enabled: user?.role === "admin" });
  const { data: reviews } = trpc.admin.reviews.useQuery({}, { enabled: user?.role === "admin" });
  const { data: bookings } = trpc.admin.bookings.useQuery({}, { enabled: user?.role === "admin" });

  const utils = trpc.useUtils();

  const approveArtisan = trpc.admin.approveArtisan.useMutation({
    onSuccess: () => {
      utils.admin.artisans.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Artisan approved!");
    },
  });

  const rejectArtisan = trpc.admin.rejectArtisan.useMutation({
    onSuccess: () => {
      utils.admin.artisans.invalidate();
      toast.success("Artisan rejected");
    },
  });

  const suspendArtisan = trpc.admin.suspendArtisan.useMutation({
    onSuccess: () => {
      utils.admin.artisans.invalidate();
      toast.success("Artisan suspended");
    },
  });

  const updateReview = trpc.admin.updateReviewStatus.useMutation({
    onSuccess: () => {
      utils.admin.reviews.invalidate();
      toast.success("Review updated");
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container py-16 text-center">
        <Shield className="w-16 h-16 mx-auto text-primary/30 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-3">Admin Access Required</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const pendingArtisans = (artisans ?? []).filter((a) => a.status === "pending");

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold font-serif text-foreground">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-sm">Manage the ArtisanHub platform</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Artisans", value: stats.totalArtisans, icon: Hammer, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Pending Approvals", value: stats.pendingArtisans, icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "text-green-600", bg: "bg-green-50" },
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
      )}

      {/* Pending approvals alert */}
      {pendingArtisans.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{pendingArtisans.length} artisan(s)</span> are waiting for approval.
          </p>
        </div>
      )}

      <Tabs defaultValue="artisans">
        <TabsList className="mb-6">
          <TabsTrigger value="artisans">
            Artisans ({artisans?.length ?? 0})
            {pendingArtisans.length > 0 && (
              <Badge className="ml-1 bg-yellow-500 text-white text-xs px-1.5">{pendingArtisans.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users ({users?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings?.length ?? 0})</TabsTrigger>
        </TabsList>

        {/* Artisans tab */}
        <TabsContent value="artisans">
          <div className="space-y-3">
            {(artisans ?? []).map((artisan) => (
              <Card key={artisan.id}>
                <CardContent className="pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">
                          {artisan.businessName ?? artisan.profession}
                        </p>
                        <Badge
                          className={
                            artisan.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : artisan.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : artisan.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {artisan.status}
                        </Badge>
                        {artisan.isVerified && (
                          <Badge className="bg-blue-100 text-blue-700">Verified</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {artisan.profession} · {[artisan.city, artisan.state].filter(Boolean).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Registered: {new Date(artisan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/artisan/${artisan.id}`}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Link>
                      </Button>
                      {artisan.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveArtisan.mutate({ id: artisan.id })}
                            disabled={approveArtisan.isPending}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectArtisan.mutate({ id: artisan.id })}
                            disabled={rejectArtisan.isPending}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {artisan.status === "approved" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => suspendArtisan.mutate({ id: artisan.id })}
                          disabled={suspendArtisan.isPending}
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Users tab */}
        <TabsContent value="users">
          <div className="space-y-3">
            {(users ?? []).map((u) => (
              <Card key={u.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{u.name ?? "Unnamed User"}</p>
                        <Badge
                          className={u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}
                        >
                          {u.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{u.email ?? "No email"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Joined: {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reviews tab */}
        <TabsContent value="reviews">
          <div className="space-y-3">
            {(reviews ?? []).map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < review.rating ? "star-filled fill-current" : "star-empty"}`}
                            />
                          ))}
                        </div>
                        <Badge
                          className={
                            review.status === "published"
                              ? "bg-green-100 text-green-700"
                              : review.status === "flagged"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {review.status}
                        </Badge>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Artisan #{review.artisanId} · {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {review.status !== "hidden" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReview.mutate({ id: review.id, status: "hidden" })}
                        >
                          Hide
                        </Button>
                      )}
                      {review.status !== "published" && (
                        <Button
                          size="sm"
                          onClick={() => updateReview.mutate({ id: review.id, status: "published" })}
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Bookings tab */}
        <TabsContent value="bookings">
          <div className="space-y-3">
            {(bookings ?? []).map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={
                            booking.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "disputed"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {booking.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{booking.id}</span>
                      </div>
                      <p className="text-sm font-medium">{booking.serviceDescription}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Artisan #{booking.artisanId} · Customer #{booking.customerId} ·{" "}
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                      {booking.disputeReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Dispute: {booking.disputeReason}
                        </p>
                      )}
                    </div>
                    {booking.totalAmount && (
                      <p className="text-sm font-semibold text-primary">
                        GH₵{Number(booking.totalAmount).toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
