import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import JobPostModal from '../components/jobs/JobPostModal';
import ConfirmModal from '../components/common/ConfirmModal';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Briefcase,
  Users,
  Clock,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Search
} from "lucide-react";

function HirerDashboard() {
    const [isPostJobValOpen, setIsPostJobValOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [jobToDelete, setJobToDelete] = useState(null);

    const { jobs: allJobs, addJob, updateJob, deleteJob, applications } = useData();
    const { user } = useAuth();

    const navigate = useNavigate();

    const jobs = allJobs.filter(j => j.hirerId === user?.id || j.hirerId === user?.uid);
    const activeJobsCount = jobs.filter(j => j.status === 'Active').length;
    const totalAppsCount = applications.filter(app => jobs.some(j => j.id === app.jobId)).length;
    const pendingAppsCount = applications.filter(app => jobs.some(j => j.id === app.jobId) && app.status === 'Pending').length;

    const handleAddJob = async (jobData) => {
        if (editingJob) {
            await updateJob(editingJob.id, { ...jobData, hirerId: user.id || user.uid, hirerName: user.name });
            setEditingJob(null);
        } else {
            await addJob(jobData, user.id || user.uid, user.name);
        }
    };

    const handleDeleteJob = (id) => setJobToDelete(id);
    const confirmDelete = async () => {
        if (jobToDelete) {
            await deleteJob(jobToDelete);
            setJobToDelete(null);
        }
    };
    const handleEditJob = (job) => {
        setEditingJob(job);
        setIsPostJobValOpen(true);
    };
    const handleCloseModal = () => {
        setIsPostJobValOpen(false);
        setEditingJob(null);
    };

    const getCategoryIconStr = (category) => {
        switch (category?.toLowerCase()) {
            case 'plumbing': return 'fas fa-wrench';
            case 'electrical': return 'fas fa-bolt';
            case 'painting': return 'fas fa-paint-roller';
            case 'carpentry': return 'fas fa-hammer';
            case 'cleaning': return 'fas fa-broom';
            default: return 'fas fa-briefcase';
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4 relative">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Jobs</p>
                            <h3 className="text-3xl font-bold mt-1">{activeJobsCount}</h3>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-8 -mt-8" />
                    </CardContent>
                </Card>
                
                <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4 relative">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Applications</p>
                            <h3 className="text-3xl font-bold mt-1">{totalAppsCount}</h3>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-full -mr-8 -mt-8" />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4 relative">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending Review</p>
                            <h3 className="text-3xl font-bold mt-1">{pendingAppsCount}</h3>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50/50 rounded-bl-full -mr-8 -mt-8" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                             Recent Job Listings
                             <Badge variant="secondary" className="font-sans">{jobs.length}</Badge>
                        </h2>
                        <Button variant="ghost" asChild className="text-primary hover:text-primary/80 hover:bg-primary/5">
                            <Link to="/dashboard/hirer/jobs">View All</Link>
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {jobs.length > 0 ? (
                            jobs.slice(0, 5).map(job => (
                                <Card key={job.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                                    <CardContent className="p-0">
                                        <div className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 text-primary border border-slate-100 italic group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                                <i className={`${getCategoryIconStr(job.category)} text-xl`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{job.title}</h4>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5 flex-wrap">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location || 'Remote'}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {job.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                                                <div className="text-sm font-bold text-foreground">
                                                    {isNaN(job.budget) ? job.budget : `GH₵${job.budget}`}
                                                </div>
                                                <Badge variant="outline" className={cn(
                                                    "px-2 py-0 h-6 text-[10px] uppercase font-bold tracking-tighter",
                                                    job.status === 'Active' ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-700"
                                                )}>
                                                    {job.status}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => navigate(`/job/${job.id}`)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600" onClick={() => handleEditJob(job)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-destructive" onClick={() => handleDeleteJob(job.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-none shadow-sm py-16 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-dashed border-slate-200">
                                    <Briefcase className="w-8 h-8 opacity-20" />
                                </div>
                                <h3 className="text-lg font-bold">No active jobs</h3>
                                <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1 mb-6">Post a job to start receiving applications from top Ghanaian artisans.</p>
                                <Button onClick={() => setIsPostJobValOpen(true)} className="rounded-full px-8 shadow-md hover:shadow-lg transition-all">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Post Your First Job
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold font-serif">Quick Actions</h2>
                    <div className="grid gap-4">
                        <Button 
                            variant="outline" 
                            className="h-auto p-5 justify-start bg-white border-none shadow-sm hover:shadow-md hover:bg-white transition-all group flex-col items-start gap-1" 
                            onClick={() => setIsPostJobValOpen(true)}
                        >
                            <div className="flex items-center gap-2 font-bold text-foreground py-0.5">
                                <div className="w-8 h-8 rounded-lg bg-primary container flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                                    <Plus className="w-4 h-4 text-white" />
                                </div>
                                Create New Job
                            </div>
                            <p className="text-xs text-muted-foreground font-normal">Connect with skilled workers quickly.</p>
                        </Button>

                        <Button 
                            variant="outline" 
                            className="h-auto p-5 justify-start bg-white border-none shadow-sm hover:shadow-md hover:bg-white transition-all group flex-col items-start gap-1" 
                            asChild
                        >
                            <Link to="/explore">
                                <div className="flex items-center gap-2 font-bold text-foreground py-0.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <Search className="w-4 h-4 text-white" />
                                    </div>
                                    Browse Artisans
                                </div>
                                <p className="text-xs text-muted-foreground font-normal">Find verified pros for your next task.</p>
                            </Link>
                        </Button>

                        <Button 
                            variant="outline" 
                            className="h-auto p-5 justify-start bg-white border-none shadow-sm hover:shadow-md hover:bg-white transition-all group flex-col items-start gap-1" 
                            asChild
                        >
                            <Link to="/dashboard/hirer/applicants">
                                <div className="flex items-center gap-2 font-bold text-foreground py-0.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                                        <Users className="w-4 h-4 text-white" />
                                    </div>
                                    Manage Applicants
                                </div>
                                <p className="text-xs text-muted-foreground font-normal">Review your job pending applications.</p>
                            </Link>
                        </Button>
                    </div>
                    
                    <Card className="bg-primary/5 border-none shadow-none p-6 rounded-2xl">
                        <h4 className="font-bold text-primary mb-2">Pro Tip 💡</h4>
                        <p className="text-xs text-primary/80 leading-relaxed italic">
                            Verifying your profile increases response rates from skilled artisans by up to 45%. Head to settings to complete your profile!
                        </p>
                    </Card>
                </div>
            </div>

            <JobPostModal
                isOpen={isPostJobValOpen}
                onClose={handleCloseModal}
                onJobPost={handleAddJob}
                initialData={editingJob}
            />

            <ConfirmModal
                isOpen={!!jobToDelete}
                onClose={() => setJobToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Job Posting?"
                message="Are you sure you want to delete this job? This action cannot be undone."
                confirmText="Okay"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}

export default HirerDashboard;