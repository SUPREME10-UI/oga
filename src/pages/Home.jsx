import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ArtisanCard from "../components/ArtisanCard";
import {
  Search,
  MapPin,
  Star,
  Shield,
  Zap,
  Hammer,
  Scissors,
  Wrench,
  Settings2,
  Paintbrush,
  Flame,
  Wind,
  Sparkles,
  Building2,
  ChevronRight,
  CheckCircle,
  Users,
  Award,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

const CATEGORY_ICONS = {
  Hammer,
  Scissors,
  Zap,
  Wrench,
  Settings2,
  Paintbrush,
  Flame,
  Wind,
  Sparkles,
  Building2,
};

const CATEGORIES = [
  { id: "cm78aumik0001y1c0edx2r9d9", name: "Carpenters", description: "Woodwork, furniture, and structure building", icon: "Hammer", color: "#8b5a2b" },
  { id: "cm78aumil0002y1c0sqzlsj95", name: "Electricians", description: "Wiring, repairs, and electrical installations", icon: "Zap", color: "#f59e0b" },
  { id: "cm78aumil0003y1c0of310yde", name: "Plumbers", description: "Pipes, leaks, and water systems", icon: "Wrench", color: "#3b82f6" },
  { id: "cm78aumil0004y1c03p35p28b", name: "Tailors", description: "Custom clothing, alterations, and sewing", icon: "Scissors", color: "#ec4899" },
  { id: "cm78aumil0005y1c0l20y2d6t", name: "Mechanics", description: "Auto repair and maintenance", icon: "Settings2", color: "#475569" },
  { id: "cm78aumil0006y1c0pudb4tve", name: "Painters", description: "Interior and exterior painting", icon: "Paintbrush", color: "#14b8a6" },
  { id: "cm78aumil0007y1c07v15p7n2", name: "Masons", description: "Brick, concrete, and stone work", icon: "Building2", color: "#64748b" },
  { id: "cm78aumil0008y1c08l41b2i2", name: "Welders", description: "Metal fabrication and repairs", icon: "Flame", color: "#f97316" },
];

const STATS = [
  { value: "500+", label: "Verified Labourers", icon: Users },
  { value: "2,000+", label: "Jobs Completed", icon: CheckCircle },
  { value: "4.8/5", label: "Average Rating", icon: Star },
  { value: "20+", label: "Service Categories", icon: Award },
];

export default function Home({ onOpenAuth }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  
  // Try to use labourers data for featured artisans section if available
  let labourers = [];
  try {
    const dataContext = useData();
    labourers = dataContext.labourers || [];
  } catch (err) {
    // Graceful fallback if useData is not available
  }
  
  const featuredArtisans = labourers.slice(0, 6);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="flex flex-col">
      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[600px] flex items-center"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.20 0.04 55) 0%, oklch(0.28 0.06 50) 50%, oklch(0.35 0.08 45) 100%)",
        }}
      >
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container relative z-10 py-16 mx-auto px-4">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 text-sm">
              🔨 Find Skilled Artisans Near You
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight font-serif">
              Connect with Local{" "}
              <span className="text-primary">Artisans</span> You Can Trust
            </h1>
            <p className="text-lg text-[oklch(0.75_0.02_70)] mb-8 leading-relaxed">
              Discover skilled carpenters, electricians, tailors, plumbers, and more in your area. Book
              services, read reviews, and get quality work done.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for carpenters, plumbers..."
                  className="pl-10 bg-white border-0 h-12 text-foreground placeholder:text-muted-foreground w-full"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Search
              </Button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button size="lg" onClick={() => navigate('/explore')}>
                <MapPin className="w-4 h-4 mr-2" />
                Explore Jobs & Artisans
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => onOpenAuth('signup')}
              >
                <Hammer className="w-4 h-4 mr-2" />
                Register as Artisan
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
              fill="var(--background, #fff)" // Ensure wave matches theme background
            />
          </svg>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground font-serif">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ────────────────────────────────────────────────────── */}
      <section className="py-14 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-serif text-foreground mb-3">Browse by Category</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Find the right professional for every job. From home repairs to custom crafts.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat.icon] || Hammer;
              return (
                <div 
                  key={cat.id} 
                  onClick={() => navigate(`/explore?q=${cat.name}`)}
                  className="block cursor-pointer"
                >
                  <Card className="card-hover h-full border border-border hover:border-primary/30 text-center">
                    <CardContent className="pt-6 pb-4 px-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <span style={{ color: cat.color }}>
                          <IconComp className="w-6 h-6" />
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Map Preview ───────────────────────────────────────────────────── */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                📍 Interactive Directory
              </Badge>
              <h2 className="text-3xl font-bold font-serif text-foreground mb-4">
                Find Artisans Near You
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our platform connects you with local artisans instantly. Post a job or heavily explore our directory to find highly-rated professionals nearby.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Verified professional profiles",
                  "Filter by category, rating & availability",
                  "Read genuine ratings from past customers",
                  "Contact pros completely securely",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate('/explore')}>
                <Search className="w-4 h-4 mr-2" />
                Explore Directory
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border aspect-video bg-[oklch(0.90_0.02_75)] flex items-center justify-center">
                <div onClick={() => navigate('/explore')} className="cursor-pointer flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <MapPin className="w-16 h-16" />
                  <span className="font-medium">Click to Open Directory</span>
                </div>
              </div>
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Available Now</p>
                    <p className="text-xs text-muted-foreground">Top Workers</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-border">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 star-filled fill-current text-yellow-500" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Top Rated</p>
                    <p className="text-xs text-muted-foreground">4.9 avg rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Artisans ─────────────────────────────────────────────── */}
      {featuredArtisans && featuredArtisans.length > 0 && (
        <section className="py-14 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold font-serif text-foreground mb-2">Featured Artisans</h2>
                <p className="text-muted-foreground">Top-rated professionals ready to help</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/explore')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-serif text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Get connected with a skilled artisan in 3 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Search & Discover",
                desc: "Search by service type, location, or browse the marketplace to find artisans near you.",
                icon: Search,
              },
              {
                step: "02",
                title: "Review & Connect",
                desc: "Read reviews, check portfolios, and communicate directly through the platform.",
                icon: Star,
              },
              {
                step: "03",
                title: "Get It Done",
                desc: "Agree on details securely, get quality work completed by a verified professional.",
                icon: CheckCircle,
              },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl craft-gradient flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {item.step.replace("0", "")}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust & Safety ────────────────────────────────────────────────── */}
      <section className="py-14 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Verified Artisans",
                desc: "All artisans go through our approval process before appearing on the platform.",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: Star,
                title: "Genuine Reviews",
                desc: "Only customers who have booked can leave reviews, ensuring authenticity.",
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                icon: Zap,
                title: "Fast Response",
                desc: "Real-time chat and notifications keep you connected with artisans instantly.",
                color: "text-green-600",
                bg: "bg-green-50",
              },
            ].map((item) => (
              <Card key={item.title} className="border border-border">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-16 craft-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-serif text-white mb-4">
            Ready to Find Your Artisan?
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Join thousands of customers who have found trusted artisans through OgaHub.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/explore')}>
              Explore Jobs
            </Button>
            {!user ? (
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/20"
                onClick={() => onOpenAuth('signup')}
              >
                Create Account
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/20"
                onClick={() => navigate(`/dashboard`)}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
