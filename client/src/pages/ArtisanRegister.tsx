import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Hammer, CheckCircle, Plus, X, MapPin } from "lucide-react";
import PortfolioUploader from "@/components/PortfolioUploader";

export default function ArtisanRegister() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [form, setForm] = useState({
    profession: "",
    businessName: "",
    bio: "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    address: "",
    city: "",
    state: "",
    country: "Ghana",
    categoryId: "",
    priceMin: "",
    priceMax: "",
    yearsExperience: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [newLang, setNewLang] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: existingProfile } = trpc.artisans.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const register = trpc.artisans.register.useMutation({
    onSuccess: () => {
      toast.success("Registration submitted! Awaiting admin approval.");
      navigate("/artisan-dashboard");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.profession) return toast.error("Profession is required");
    register.mutate({
      ...form,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
      services,
      languages,
      portfolioImages,
    });
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const addLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <Hammer className="w-16 h-16 mx-auto text-primary/30 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-3">Join as an Artisan</h2>
        <p className="text-muted-foreground mb-6">Sign in to create your artisan profile</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In to Continue</a>
        </Button>
      </div>
    );
  }

  if (existingProfile) {
    return (
      <div className="container py-16 text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-3">You're already registered!</h2>
        <p className="text-muted-foreground mb-2">
          Status:{" "}
          <Badge
            className={
              existingProfile.status === "approved"
                ? "bg-green-100 text-green-700"
                : existingProfile.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }
          >
            {existingProfile.status}
          </Badge>
        </p>
        <Button asChild className="mt-4">
          <a href="/artisan-dashboard">Go to Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-2xl">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl craft-gradient flex items-center justify-center mx-auto mb-4">
          <Hammer className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Register as an Artisan</h1>
        <p className="text-muted-foreground">
          Create your professional profile and start connecting with customers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profession" className="text-sm font-medium mb-1.5 block">
                  Profession <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="profession"
                  value={form.profession}
                  onChange={(e) => setForm({ ...form, profession: e.target.value })}
                  placeholder="e.g. Carpenter, Electrician"
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessName" className="text-sm font-medium mb-1.5 block">
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium mb-1.5 block">
                Category
              </Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-medium mb-1.5 block">
                Bio / Description
              </Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Describe your skills and experience..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="yearsExperience" className="text-sm font-medium mb-1.5 block">
                Years of Experience
              </Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                placeholder="e.g. 5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-1.5 block">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium mb-1.5 block">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-medium mb-1.5 block">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Accra"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-medium mb-1.5 block">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Greater Accra Region"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-sm font-medium mb-1.5 block">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="Ghana"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceMin" className="text-sm font-medium mb-1.5 block">Min Price (GH₵)</Label>
                <Input
                  id="priceMin"
                  type="number"
                  value={form.priceMin}
                  onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label htmlFor="priceMax" className="text-sm font-medium mb-1.5 block">Max Price (GH₵)</Label>
                <Input
                  id="priceMax"
                  type="number"
                  value={form.priceMax}
                  onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
                  placeholder="50000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="e.g. Door installation"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addService}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  {s}
                  <button type="button" onClick={() => setServices(services.filter((x) => x !== s))}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Languages Spoken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                placeholder="e.g. Yoruba, Hausa"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addLanguage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <Badge key={l} variant="secondary" className="gap-1">
                  {l}
                  {l !== "English" && (
                    <button type="button" onClick={() => setLanguages(languages.filter((x) => x !== l))}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              📸 Portfolio Photos
              <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
            </CardTitle>
            <CardDescription>
              Upload photos of your past work to attract more customers. You can add more photos later from your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioUploader
              existingImages={portfolioImages}
              onChange={setPortfolioImages}
              maxImages={10}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={register.isPending}>
          {register.isPending ? "Submitting..." : "Submit Registration"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Your profile will be reviewed by our team before going live (usually within 24 hours).
        </p>
      </form>
    </div>
  );
}
