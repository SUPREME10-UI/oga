import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  MapPin, Phone, Mail, Star, CheckCircle, MessageCircle, Calendar,
  Hammer, ChevronLeft, Share2, Briefcase, User, Award,
} from "lucide-react";

function StarRating({ rating = 0, size = 4, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-${size} h-${size} transition-colors ${
            star <= (hover || Math.round(rating))
              ? 'star-filled fill-current'
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
    </div>
  );
}

function Profile({ onOpenAuth }) {
  const { id } = useParams();
  const { user } = useAuth();
  const { jobs } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Fetch user directly from Firestore
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setProfileData(null);
    getDoc(doc(db, 'users', id))
      .then((snap) => {
        setProfileData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
        setProfileData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Scroll to top on profile change
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // Real-time reviews
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'users', id, 'reviews'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q,
      (snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setReviews([])
    );
    return unsub;
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <User className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-2">Profile not found</h2>
        <p className="text-muted-foreground mb-6">
          This profile doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/explore')}>Browse Artisans</Button>
      </div>
    );
  }

  const isLabourer = profileData.type === 'labourer';
  const isHirer = profileData.type === 'hirer';
  const isOwnProfile = user?.uid === profileData.id;
  const canReview = user && !isOwnProfile && user.type === 'hirer' && isLabourer;
  const canMessage = user && !isOwnProfile;

  const rating = Number(profileData.rating || 0);
  const reviewCount = profileData.reviewCount || reviews.length;
  const hirerJobs = isHirer ? (jobs || []).filter((j) => String(j.hirerId) === String(profileData.id)) : [];
  const displayName = profileData.name || profileData.displayName || 'User';
  const avatar = profileData.photo || profileData.image || profileData.photoURL;

  const handleBack = () => {
    if (location.state?.fromDashboard) {
      navigate(`/dashboard/${user?.type || 'hirer'}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Cover Banner */}
      <div className="relative h-52 md:h-64 hero-gradient">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleBack}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button
            variant="ghost" size="icon" className="text-white hover:bg-white/20"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Profile link copied!');
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
        {/* Category label */}
        <div className="absolute bottom-4 left-4 z-10">
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
            {isLabourer ? profileData.profession || 'Artisan' : 'Employer'}
          </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Profile Header Card */}
        <div className="relative -mt-14 mb-6">
          <Card className="border-border shadow-md overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0 bg-secondary">
                  {avatar ? (
                    <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full craft-gradient flex items-center justify-center text-white text-3xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold font-serif text-foreground">{displayName}</h1>
                    {profileData.verified && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                    {isLabourer && (
                      <Badge className={profileData.isAvailable !== false
                        ? "bg-green-100 text-green-700 border-none available-badge"
                        : "bg-gray-100 text-gray-500 border-none"}>
                        {profileData.isAvailable !== false ? '✓ Available' : 'Busy'}
                      </Badge>
                    )}
                    {isHirer && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Employer
                      </Badge>
                    )}
                  </div>

                  {/* Title & Location */}
                  <p className="text-muted-foreground mb-1">
                    {profileData.profession || (isHirer ? 'Job Provider' : 'Professional')}
                  </p>
                  {(profileData.location || profileData.city) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{profileData.location || profileData.city}</span>
                    </div>
                  )}

                  {/* Rating inline (for artisans) */}
                  {isLabourer && (
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating rating={rating} size={4} />
                      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                  {canMessage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!user) { onOpenAuth?.('login'); return; }
                        navigate(`/dashboard/${user.type}/messages`, {
                          state: { chatWith: { id: profileData.id, name: displayName, photo: avatar } }
                        });
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5" /> Message
                    </Button>
                  )}
                  {canReview && (
                    <Button size="sm" onClick={() => setIsReviewOpen(true)}>
                      <Star className="w-4 h-4 mr-1.5" /> Rate Artisan
                    </Button>
                  )}
                  {isLabourer && !isOwnProfile && (
                    <Button
                      size="sm"
                      variant={canReview ? "outline" : "default"}
                      onClick={() => {
                        if (!user) { onOpenAuth?.('signup'); return; }
                        navigate('/dashboard/hirer');
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-1.5" /> Book Now
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/${profileData.type}/settings`)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: <Award className="w-5 h-5 text-primary" />,
              value: isLabourer ? (profileData.jobsCompleted || 0) : hirerJobs.length,
              label: isLabourer ? 'Jobs Done' : 'Jobs Posted',
            },
            {
              icon: <Star className="w-5 h-5 star-filled" />,
              value: isLabourer ? rating.toFixed(1) : '—',
              label: 'Avg Rating',
            },
            {
              icon: <Hammer className="w-5 h-5 text-primary" />,
              value: isLabourer ? (profileData.experience ? `${profileData.experience}y` : '—') : '—',
              label: 'Experience',
            },
            {
              icon: <Briefcase className="w-5 h-5 text-primary" />,
              value: isLabourer ? (profileData.hourlyRate ? `GH₵${profileData.hourlyRate}` : 'TBD') : 'Employer',
              label: isLabourer ? 'Hourly Rate' : 'Type',
            },
          ].map(({ icon, value, label }) => (
            <Card key={label} className="border-border">
              <CardContent className="p-4 flex flex-col items-center text-center">
                {icon}
                <p className="text-xl font-bold mt-1">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-11 mb-5">
                <TabsTrigger value="about" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-5">
                  About
                </TabsTrigger>
                {isLabourer && (
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-5">
                    Reviews ({reviewCount})
                  </TabsTrigger>
                )}
                {isHirer && (
                  <TabsTrigger value="jobs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-5">
                    Jobs ({hirerJobs.length})
                  </TabsTrigger>
                )}
              </TabsList>

              {/* About */}
              <TabsContent value="about" className="space-y-4 mt-0">
                <Card className="border-border">
                  <CardContent className="pt-5">
                    <h3 className="font-bold font-serif text-lg mb-2">About</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {profileData.bio || `${displayName} hasn't added a biography yet.`}
                    </p>
                  </CardContent>
                </Card>

                {isLabourer && profileData.skills?.length > 0 && (
                  <Card className="border-border">
                    <CardContent className="pt-5">
                      <h3 className="font-bold font-serif text-lg mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="mt-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold font-serif text-lg">Reviews</h3>
                  {canReview && (
                    <Button size="sm" onClick={() => setIsReviewOpen(true)}>
                      <Star className="w-4 h-4 mr-1.5" /> Write Review
                    </Button>
                  )}
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <Card key={review.id} className="border-border">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full craft-gradient flex items-center justify-center text-white font-bold text-sm">
                                {review.user?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{review.user || 'Anonymous'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {review.date || (review.createdAt?.seconds
                                    ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                                    : 'Recent')}
                                </p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} size={4} />
                          </div>
                          {review.comment && (
                            <p className="text-foreground/80 text-sm leading-relaxed">"{review.comment}"</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="font-semibold mb-1">No Reviews Yet</p>
                    <p className="text-muted-foreground text-sm">
                      {canReview ? "Be the first to leave a review!" : "No reviews have been submitted yet."}
                    </p>
                    {canReview && (
                      <Button className="mt-4" size="sm" onClick={() => setIsReviewOpen(true)}>
                        Write a Review
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Jobs (Hirers) */}
              <TabsContent value="jobs" className="mt-0 space-y-3">
                {hirerJobs.length > 0 ? (
                  hirerJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="border-border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/job/${job.id}`)}
                    >
                      <CardContent className="p-4 flex justify-between items-center gap-4">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-base truncate">{job.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {job.location || 'Ghana'}
                            </span>
                            <span className="text-primary font-medium">
                              GH₵{job.budget || job.salary || 'TBD'}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0">{job.category || 'General'}</Badge>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground">No active job listings.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact */}
            <Card className="border-border">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-serif">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {(profileData.phoneNumber || profileData.phone) && (
                  <a
                    href={`tel:${profileData.phoneNumber || profileData.phone}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                        {profileData.phoneNumber || profileData.phone}
                      </p>
                    </div>
                  </a>
                )}
                {profileData.email && (
                  <a
                    href={`mailto:${profileData.email}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                        {profileData.email}
                      </p>
                    </div>
                  </a>
                )}
                {profileData.location && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{profileData.location}</p>
                    </div>
                  </div>
                )}
                {!profileData.phoneNumber && !profileData.phone && !profileData.email && !profileData.location && (
                  <p className="text-sm text-muted-foreground italic">No contact info provided.</p>
                )}
              </CardContent>
            </Card>

            {/* Rate action card (for hirers viewing a labourer) */}
            {canReview && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 star-filled fill-current mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Worked with {displayName}?</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Share your experience to help others.
                  </p>
                  <Button className="w-full" size="sm" onClick={() => setIsReviewOpen(true)}>
                    Write a Review
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pricing (artisans only) */}
            {isLabourer && profileData.hourlyRate && (
              <Card className="border-border overflow-hidden">
                <div className="h-1.5 craft-gradient w-full" />
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hourly Rate</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">GH₵{profileData.hourlyRate}</span>
                    <span className="text-muted-foreground">/hr</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    May vary based on job complexity.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        labourerId={profileData?.id}
        reviewerId={user?.uid || user?.id}
        reviewerName={user?.name || user?.displayName}
      />
    </div>
  );
}

export default Profile;
