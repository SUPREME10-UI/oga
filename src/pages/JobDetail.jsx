import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/common/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Wallet,
  AlertCircle,
  Briefcase,
  User,
  MessageCircle,
  CheckCircle,
  Tag,
  Clock,
  ExternalLink,
} from 'lucide-react';

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, applyForJob } = useData();
  const { user } = useAuth();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const job = (jobs || []).find((j) => String(j.id) === String(id));

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <Briefcase className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This job listing doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/explore')}>Browse Other Jobs</Button>
      </div>
    );
  }

  const isLabourer = user?.type === 'labourer';
  const isOwner = user && (user.uid === job.hirerId || user.id === job.hirerId);
  const canApply = isLabourer && !isOwner;
  const canMessage = user && !isOwner;

  const handleApply = () => {
    if (!user) {
      alert('Please sign in as an artisan to apply for this job.');
      return;
    }
    if (!isLabourer) {
      alert('Only artisans can apply for jobs.');
      return;
    }
    setIsApplyModalOpen(true);
  };

  const confirmApply = () => {
    applyForJob(job.id, user.id || user.uid, user.name || user.displayName, job.hirerId, job.title);
    setIsApplyModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const urgencyColor = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  }[job.urgency?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';

  const statusColor = job.status?.toLowerCase() === 'active'
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="hero-gradient py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mb-6 -ml-1"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex flex-wrap items-start gap-3 mb-4">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Tag className="w-3 h-3 mr-1" />
              {job.category || 'General'}
            </Badge>
            <Badge className={`border ${statusColor}`}>
              {job.status || 'Active'}
            </Badge>
            {job.urgency && (
              <Badge className={`border ${urgencyColor}`}>
                <AlertCircle className="w-3 h-3 mr-1" />
                {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)} Priority
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mb-3 leading-tight">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {job.location}
              </span>
            )}
            {job.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Posted {job.date}
              </span>
            )}
            {job.budget && (
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Wallet className="w-4 h-4" /> GH₵{Number(job.budget).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Banner */}
        {showSuccess && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 font-medium">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            Application submitted! The hirer will be in touch soon.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Main Details */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            <Card className="border-border">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg font-serif">Project Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                  {job.description || 'No description provided for this job.'}
                </p>
              </CardContent>
            </Card>

            {/* Requirements / Details Grid */}
            <Card className="border-border">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg font-serif">Key Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {job.location && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Location</p>
                        <p className="font-medium text-foreground">{job.location}</p>
                      </div>
                    </div>
                  )}
                  {job.budget && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Budget</p>
                        <p className="font-bold text-primary text-lg">
                          GH₵{Number(job.budget).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {job.date && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Date Posted</p>
                        <p className="font-medium text-foreground">{job.date}</p>
                      </div>
                    </div>
                  )}
                  {job.urgency && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Priority</p>
                        <Badge className={`border ${urgencyColor} capitalize`}>
                          {job.urgency}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <Card className="border-primary/30 overflow-hidden">
              <div className="h-1.5 craft-gradient w-full" />
              <CardContent className="p-5">
                <p className="font-bold text-xl font-serif mb-1">
                  {job.budget ? `GH₵${Number(job.budget).toLocaleString()}` : 'Salary TBD'}
                </p>
                <p className="text-xs text-muted-foreground mb-4">Estimated budget for this project</p>

                {canApply && (
                  <Button className="w-full" size="lg" onClick={handleApply}>
                    Apply for this Job
                  </Button>
                )}
                {showSuccess && (
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                    <CheckCircle className="w-4 h-4" /> Applied!
                  </div>
                )}
                {!user && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Sign in as an artisan to apply
                  </p>
                )}
                {user && !isLabourer && !isOwner && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Only artisans can apply
                  </p>
                )}
                {isOwner && (
                  <p className="text-xs text-muted-foreground text-center">
                    You posted this job
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Hirer Info Card */}
            <Card className="border-border">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-serif">Posted By</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full craft-gradient flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {(job.hirerName || 'H').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{job.hirerName || 'Anonymous Hirer'}</p>
                    <p className="text-xs text-muted-foreground">Verified Employer</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {job.hirerId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link to={`/profile/${job.hirerId}`}>
                        <User className="w-4 h-4 mr-2" /> View Profile
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </Link>
                    </Button>
                  )}
                  {canMessage && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        navigate(`/dashboard/${user.type}/messages`, {
                          state: {
                            chatWith: {
                              id: job.hirerId,
                              name: job.hirerName || 'Hirer',
                              photo: null,
                            },
                          },
                        })
                      }
                    >
                      <MessageCircle className="w-4 h-4 mr-2" /> Message Hirer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onConfirm={confirmApply}
        title="Apply for this Job?"
        message={`Are you sure you want to apply for "${job.title}"? Your profile will be shared with the hirer.`}
        confirmText="Apply Now"
        cancelText="Not Now"
        type="primary"
      />
    </div>
  );
}

export default JobDetail;
