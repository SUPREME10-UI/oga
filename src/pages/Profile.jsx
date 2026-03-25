import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import ReviewModal from '../components/common/ReviewModal';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  MessageCircle,
  Calendar,
  Hammer,
  ChevronLeft,
  Share2,
} from "lucide-react";

// Inline StarRating component
function StarRating({ rating = 0, size = 4 }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`w-${size} h-${size} fill-yellow-400 text-yellow-400`} />
      ))}
      {hasHalfStar && (
        <Star key="half" className={`w-${size} h-${size} fill-yellow-400/50 text-yellow-400`} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`w-${size} h-${size} text-gray-300`} />
      ))}
    </div>
  );
}

function Profile({ onOpenAuth }) {
  const { id } = useParams();
  const { user } = useAuth();
  const { labourers, jobs } = useData(); // labourers actually contains all users now
  const navigate = useNavigate();
  const location = useLocation();

  const [labourer, setLabourer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // 1. Fetch User Details directly from Firestore by document ID
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLabourer(null);

    getDoc(doc(db, 'users', id))
      .then((snap) => {
        if (snap.exists()) {
          setLabourer({ id: snap.id, ...snap.data() });
        } else {
          setLabourer(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
        setLabourer(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 1.1 Update page title/scroll
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 2. Real-time Reviews Listener
  useEffect(() => {
    if (!id) return;
    const qReviews = query(collection(db, 'users', id, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qReviews, (snapshot) => {
      const fetchedReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(fetchedReviews);
    }, (err) => {
        console.error("Reviews listener error:", err);
        setReviews([]);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!labourer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <Hammer className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-2">Profile not found</h2>
        <p className="text-muted-foreground mb-6">The profile you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/explore')}>Browse Artisans</Button>
      </div>
    );
  }

  const isLabourer = labourer.type === 'labourer';
  const isHirer = labourer.type === 'hirer';
  const isOwnProfile = user?.uid === labourer.id || user?.id === labourer.id;
  const canReview = user && !isOwnProfile && user.type === 'hirer' && isLabourer;

  const actualRating = labourer.rating || 0;
  const actualReviewCount = labourer.reviewCount || reviews.length;
  
  // Hirer specific stats
  const hirerJobs = isHirer ? jobs.filter(j => String(j.hirerId) === String(labourer.id)) : [];

  return (
    <div className="bg-background min-h-screen pb-12">
      {/* Cover */}
      <div className="relative h-56 md:h-72 bg-gradient-to-br from-blue-100 to-indigo-200">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Navigation controls */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => {
              if (location.state?.fromDashboard) {
                navigate(`/dashboard/${user?.type || 'hirer'}`);
              } else {
                navigate(-1);
              }
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="container px-4 md:px-8 mx-auto max-w-6xl">
        {/* Profile header */}
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-2xl border-4 border-background shadow-xl bg-secondary overflow-hidden flex-shrink-0">
              {labourer.photo || labourer.image ? (
                <img src={labourer.photo || labourer.image} alt={labourer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-4xl font-bold">
                  {labourer?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold font-serif text-foreground">
                  {labourer?.name}
                </h1>
                {labourer.verified && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verified
                  </Badge>
                )}
                {isLabourer && (
                  <Badge
                    variant={labourer.isAvailable === false ? "secondary" : "default"}
                    className={labourer.isAvailable !== false ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" : "bg-gray-100 text-gray-500"}
                  >
                    {labourer.isAvailable !== false ? "Available to Hire" : "Busy"}
                  </Badge>
                )}
                {isHirer && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Employer
                    </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg mb-2">{labourer.profession || (isHirer ? 'Job Provider' : 'Professional')}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 sm:flex-shrink-0 pb-1">
              {!isOwnProfile && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                        if (!user) {
                            if (onOpenAuth) onOpenAuth('login');
                            else navigate('/login');
                            return;
                        }
                        navigate(`/dashboard/${user.type}/messages`, {
                            state: { chatWith: { id: labourer.id, name: labourer.name, photo: labourer.image || labourer.photo } }
                        });
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Message
                  </Button>
                  {isLabourer && (
                    <Button
                      onClick={() => {
                        if (!user) {
                          if (onOpenAuth) onOpenAuth('signup');
                          else navigate('/login');
                          return;
                        }
                        navigate('/dashboard/hirer');
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Book Now
                    </Button>
                  )}
                </>
              )}
              {isOwnProfile && (
                  <Button variant="outline" onClick={() => navigate(`/dashboard/${labourer.type}/settings`)}>
                      Edit Profile
                  </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="mb-6 w-full justify-start overflow-x-auto border-b border-border rounded-none bg-transparent p-0 pl-1 h-12">
                <TabsTrigger value="about" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 text-base">
                  About
                </TabsTrigger>
                {isLabourer && (
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 text-base">
                    Reviews ({reviews.length})
                  </TabsTrigger>
                )}
                {isHirer && (
                  <TabsTrigger value="jobs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-6 text-base">
                    Posted Jobs ({hirerJobs.length})
                  </TabsTrigger>
                )}
              </TabsList>

              {/* About tab */}
              <TabsContent value="about" className="space-y-6 mt-0">
                <Card className="border-border shadow-sm">
                  <CardContent className="pt-6">
                    <h3 className="font-bold font-serif text-lg mb-3">Biography</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {labourer.bio || `${labourer.name} hasn't provided a biography yet.`}
                    </p>
                  </CardContent>
                </Card>

                {isLabourer && (
                  <Card className="border-border shadow-sm">
                    <CardContent className="pt-6">
                      <h3 className="font-bold font-serif text-lg mb-4">Skills & Capabilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {labourer.skills && labourer.skills.length > 0 ? (
                          labourer.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="px-3 py-1 font-normal text-[0.9rem]">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm italic">No specific skills listed</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Reviews tab */}
              <TabsContent value="reviews" className="mt-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold font-serif text-xl">Customer Reviews</h3>
                  {canReview && (
                    <Button onClick={() => setIsReviewOpen(true)} variant="outline" size="sm">
                      <Star className="w-4 h-4 mr-2" /> Write a Review
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id} className="border-border shadow-sm">
                        <CardContent className="pt-5 pb-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary font-serif">
                                {review.user?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm">{review.user}</p>
                                <p className="text-xs text-muted-foreground">
                                  {review.date || (review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Recent')}
                                </p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} size={4} />
                          </div>
                          {review.comment && (
                            <p className="text-foreground/90 leading-relaxed text-[0.95rem]">"{review.comment}"</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl">
                      <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                      <h4 className="font-semibold mb-1">No Reviews Yet</h4>
                      <p className="text-muted-foreground text-sm">
                        {canReview ? "Be the first to review this artisan's work!" : "This artisan hasn't received any reviews."}
                      </p>
                      {canReview && (
                        <Button className="mt-4" onClick={() => setIsReviewOpen(true)}>
                          Write a Review
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Jobs tab (for Hirers) */}
              <TabsContent value="jobs" className="mt-0 space-y-4">
                  {hirerJobs.length > 0 ? (
                      hirerJobs.map(job => (
                          <Card key={job.id} className="border-border hover:border-primary/50 transition-colors shadow-sm cursor-pointer" onClick={() => navigate(`/job/${job.id}`)}>
                              <CardContent className="p-5 flex justify-between items-center">
                                  <div>
                                      <h4 className="font-bold text-lg">{job.title}</h4>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                          <span className="font-medium text-primary">GH₵{job.budget || job.salary}</span>
                                      </div>
                                  </div>
                                  <Badge variant="outline">{job.category}</Badge>
                              </CardContent>
                          </Card>
                      ))
                  ) : (
                      <div className="text-center py-12 border border-dashed border-border rounded-xl">
                          <p className="text-muted-foreground">No active job listings found.</p>
                      </div>
                  )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating summary or Hirer summary */}
            <Card className="border-border shadow-sm">
              <CardContent className="pt-6 pb-6 text-center">
                {isLabourer ? (
                    <>
                        <p className="text-5xl font-bold font-serif text-foreground mb-2">
                          {Number(actualRating || 0).toFixed(1)}
                        </p>
                        <div className="flex justify-center mb-2">
                          <StarRating rating={actualRating} size={5} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on {actualReviewCount} reviews
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                            <Briefcase className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold font-serif">Verified Employer</h3>
                        <p className="text-sm text-muted-foreground mt-1">Member since {labourer.joinedDate || '2024'}</p>
                    </>
                )}
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-secondary/20 rounded-xl p-3 border border-secondary">
                    <p className="text-xl font-bold text-foreground">
                        {isLabourer ? (labourer.jobsCompleted || 0) : hirerJobs.length}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                        {isLabourer ? "Jobs Done" : "Job Posts"}
                    </p>
                  </div>
                  <div className="bg-secondary/20 rounded-xl p-3 border border-secondary">
                    <p className="text-xl font-bold text-foreground">{labourer.experience || (isHirer ? "Vetted" : "1")}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                        {isLabourer ? "Years Exp." : "Trust Level"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg font-serif">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {(labourer.phoneNumber || labourer.phone) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Phone Number</p>
                      <a href={`tel:${labourer.phoneNumber || labourer.phone}`} className="text-sm font-medium hover:text-primary transition-colors block truncate">
                        {labourer.phoneNumber || labourer.phone}
                      </a>
                    </div>
                  </div>
                )}
                {labourer.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Email Address</p>
                      <a href={`mailto:${labourer.email}`} className="text-sm font-medium hover:text-primary transition-colors truncate block">
                        {labourer.email}
                      </a>
                    </div>
                  </div>
                )}
                {labourer.location && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Location</p>
                      <p className="text-sm font-medium">{labourer.location}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Summary (Only for Labourers) */}
            {isLabourer && (
                <Card className="border-border shadow-sm overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary to-orange-400 w-full" />
                  <CardContent className="pt-5 pb-5">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Hourly Rate</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">
                        GH₵{labourer.hourlyRate || 50}
                      </span>
                      <span className="text-muted-foreground font-medium">/hr</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Prices may vary based on job complexity and required materials.</p>
                  </CardContent>
                </Card>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        labourerId={labourer?.id}
        reviewerId={user?.uid || user?.id}
        reviewerName={user?.name}
      />
    </div>
  );
}

export default Profile;
