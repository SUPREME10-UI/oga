import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtisanCard from "@/components/ArtisanCard";
import {
  Calendar,
  Heart,
  Bell,
  Star,
  Hammer,
  CheckCircle,
  Clock,
  MessageCircle,
} from "lucide-react";

export default function CustomerDashboard() {
  const { isAuthenticated, user } = useAuth();

  const { data: myBookings } = trpc.bookings.myBookings.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: favorites } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: notifications } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <Hammer className="w-16 h-16 mx-auto text-primary/30 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-3">My Dashboard</h2>
        <p className="text-muted-foreground mb-6">Sign in to view your dashboard</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In</a>
        </Button>
      </div>
    );
  }

  const pendingBookings = (myBookings ?? []).filter((b) => b.status === "pending");
  const completedBookings = (myBookings ?? []).filter((b) => b.status === "completed");

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-serif text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "My Bookings", value: myBookings?.length ?? 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending", value: pendingBookings.length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Completed", value: completedBookings.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Saved Artisans", value: favorites?.length ?? 0, icon: Heart, color: "text-red-500", bg: "bg-red-50" },
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
          <TabsTrigger value="bookings">My Bookings ({myBookings?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="favorites">Saved ({favorites?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Notifications
            {unreadCount && unreadCount > 0 ? (
              <Badge className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0">
                {unreadCount}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        {/* Bookings tab */}
        <TabsContent value="bookings">
          <div className="space-y-3">
            {(myBookings ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="mb-3">No bookings yet</p>
                <Button asChild variant="outline">
                  <Link href="/search">Find an Artisan</Link>
                </Button>
              </div>
            ) : (
              (myBookings ?? []).map((booking) => (
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
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/artisan/${booking.artisanId}`}>View Artisan</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href="/chat">
                            <MessageCircle className="w-3.5 h-3.5 mr-1" /> Chat
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Favorites tab */}
        <TabsContent value="favorites">
          {(favorites ?? []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="mb-3">No saved artisans yet</p>
              <Button asChild variant="outline">
                <Link href="/search">Discover Artisans</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(favorites ?? []).map((fav) => (
                <div key={fav.artisanId} className="border border-border rounded-xl p-4">
                  <p className="font-medium">Artisan #{fav.artisanId}</p>
                  <Button asChild size="sm" variant="outline" className="mt-2">
                    <Link href={`/artisan/${fav.artisanId}`}>View Profile</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notifications tab */}
        <TabsContent value="notifications">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount && unreadCount > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
                Mark all read
              </Button>
            ) : null}
          </div>
          <div className="space-y-2">
            {(notifications ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No notifications</p>
              </div>
            ) : (
              (notifications ?? []).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    !notif.isRead ? "border-primary/20 bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
