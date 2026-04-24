import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import JobCard from '../components/common/JobCard';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  CheckCircle,
  Clock,
  Moon,
  MessageCircle,
  FileText,
  Briefcase,
  Quote,
  Eye,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

function LabourerDashboard() {
    const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applications'
    const { user, updateUser } = useAuth();
    const { jobs, applications, updateLabourerProfile, labourers } = useData();

    useEffect(() => {
        const syncProfile = async () => {
            if (user && user.type === 'labourer' && user.id) {
                const existsInList = labourers.find(l => String(l.id) === String(user.id));
                if (!existsInList) {
                    await updateLabourerProfile(user.id, {
                        ...user, 
                        name: user.name || 'Labourer',
                        profession: user.profession || 'Labourer',
                        location: user.location || 'Accra, Ghana',
                        availabilityStatus: user.availabilityStatus || 'Available'
                    });
                }
            }
        };
        syncProfile();
    }, [user, labourers, updateLabourerProfile]);

    const [isAvailabilityEditing, setIsAvailabilityEditing] = useState(false);
    const [availStatus, setAvailStatus] = useState(user?.availabilityStatus || 'Available');
    const [availNote, setAvailNote] = useState(user?.availabilityNote || '');

    const myApplications = applications.filter(app => app.labourerId === user?.id || app.labourerId === user?.uid);
    
    const navigate = useNavigate();

    const handleSaveAvailability = async () => {
        const statusUpdateTime = new Date().toISOString();
        const labourerData = {
            id: user.id || user.uid,
            uid: user.id || user.uid,
            name: user.name || 'Labourer',
            profession: user.profession || 'Labourer',
            location: user.location || 'Accra, Ghana',
            photo: user.photo || null,
            email: user.email || '',
            availabilityStatus: availStatus,
            availabilityNote: availNote,
            statusUpdateTime: statusUpdateTime,
            rating: user.rating || 0,
            reviewCount: user.reviewCount || 0,
            hourlyRate: user.hourlyRate || 50,
            skills: user.skills || [],
            verified: user.verified || false
        };

        await updateLabourerProfile(user.id || user.uid, labourerData);
        try {
            await updateUser({
                availabilityStatus: availStatus,
                availabilityNote: availNote,
                statusUpdateTime: statusUpdateTime
            });
            setIsAvailabilityEditing(false);
        } catch (err) {
            console.error('Update failed', err);
            setIsAvailabilityEditing(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {/* Welcome Banner & Status Posting */}
            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="bg-slate-900 p-8 md:p-10 text-white relative overflow-hidden">
                        {/* Abstract Background pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-10 -mb-10 blur-2xl" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl border-4 border-white/10 shadow-xl bg-slate-800 overflow-hidden shrink-0 group hover:scale-105 transition-transform">
                                    {user?.photo ? (
                                        <img src={user.photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-primary text-white">
                                            {user?.name?.charAt(0) || 'L'}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl md:text-3xl font-bold font-serif">Akwaba, {user?.name}! 👋</h2>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{user?.location || 'Accra, Ghana'}</span>
                                        <span className="mx-1">•</span>
                                        <span className="text-primary font-medium">{user?.profession || 'Artisan'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-3 shrink-0">
                                <div className="flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10">
                                     <div className={cn(
                                         "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                         availStatus === 'Available' ? "bg-green-500/20 text-green-400" :
                                         availStatus === 'Busy' ? "bg-orange-500/20 text-orange-400" : "bg-slate-500/20 text-slate-400"
                                     )}>
                                         <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                                             availStatus === 'Available' ? "bg-green-400" :
                                             availStatus === 'Busy' ? "bg-orange-400" : "bg-slate-400"
                                         )} />
                                         {availStatus}
                                     </div>
                                     <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setIsAvailabilityEditing(!isAvailabilityEditing)}
                                        className="text-white hover:bg-white/10 rounded-full h-8"
                                    >
                                        {isAvailabilityEditing ? 'Cancel' : 'Update Status'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {isAvailabilityEditing && (
                            <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-4 relative z-10">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Select Availability</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['Available', 'Busy', 'Away'].map(status => (
                                                <Button
                                                    key={status}
                                                    variant="outline"
                                                    onClick={() => setAvailStatus(status)}
                                                    className={cn(
                                                        "rounded-xl px-5 py-6 h-auto flex-col gap-2 transition-all border-white/10 hover:border-white/40 group",
                                                        availStatus === status ? "bg-white text-slate-900 border-white" : "text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    {status === 'Available' && <CheckCircle className={cn("w-5 h-5", availStatus === status ? "text-green-600" : "text-green-400")} />}
                                                    {status === 'Busy' && <Clock className={cn("w-5 h-5", availStatus === status ? "text-orange-600" : "text-orange-400")} />}
                                                    {status === 'Away' && <Moon className={cn("w-5 h-5", availStatus === status ? "text-slate-600" : "text-slate-400")} />}
                                                    <span className="font-bold">{status}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Update Note</label>
                                        <Textarea
                                            placeholder="e.g. Currently working near Spintex. Available for small tasks tonight!"
                                            value={availNote}
                                            onChange={(e) => setAvailNote(e.target.value)}
                                            className="resize-none bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                                            rows={3}
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handleSaveAvailability} className="px-8 shadow-xl">
                                                Go Online with Status
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {!isAvailabilityEditing && availNote && (
                            <div className="mt-6 flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5 max-w-2xl relative z-10">
                                <Quote className="w-5 h-5 text-primary shrink-0 opacity-50" />
                                <p className="italic text-slate-300 text-sm leading-relaxed">"{availNote}"</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-slate-400">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Skill Level</p>
                                <p className="text-lg font-bold">Verified Pro</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-slate-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Apps</p>
                                <p className="text-lg font-bold">{myApplications.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-slate-400">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Success Rate</p>
                                <p className="text-lg font-bold">98%</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* View Switcher Controls */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                         {activeTab === 'jobs' ? 'Opportunities for You' : 'My Application Journey'}
                         <Badge variant="secondary" className="font-sans">
                             {activeTab === 'jobs' ? jobs.length : myApplications.length}
                         </Badge>
                    </h3>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="bg-white shadow-sm border border-border/50">
                            <TabsTrigger value="jobs" className="px-6">Job Board</TabsTrigger>
                            <TabsTrigger value="applications" className="px-6">Track Apps</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Tab Views */}
                {activeTab === 'jobs' ? (
                    <div className="pb-8">
                        {jobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {jobs.map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-none shadow-sm py-20 text-center flex flex-col items-center justify-center bg-white">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-muted-foreground/20 border-2 border-dashed border-slate-200">
                                    <Briefcase className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold">No Active Gigs Found</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 italic">Check back soon for new opportunities in your area.</p>
                            </Card>
                        )}
                    </div>
                ) : (
                    <div className="pb-8 space-y-4">
                        {myApplications.length > 0 ? (
                            myApplications.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(app => (
                                <Card key={app.id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                                <FileText className="w-7 h-7 text-primary/40" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">Job Application #{app.jobId.slice(-6)}</h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Submitted on {app.date}</span>
                                                    <span className="mx-1">•</span>
                                                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Standard Application</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0">
                                            <Badge 
                                                variant="outline" 
                                                className={cn(
                                                    "px-4 py-1.5 uppercase font-bold tracking-widest text-[10px]",
                                                    app.status === 'Accepted' && "border-green-200 bg-green-50 text-green-700",
                                                    app.status === 'Rejected' && "border-red-200 bg-red-50 text-red-700",
                                                    app.status === 'Pending' && "border-amber-200 bg-amber-50 text-amber-700"
                                                )}
                                            >
                                                {app.status}
                                            </Badge>
                                            <div className="flex items-center gap-2">
                                                 <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={() => navigate(`/job/${app.jobId}`)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" className="rounded-xl font-bold group" onClick={() => navigate(`/job/${app.jobId}`)}>
                                                    Details <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-none shadow-sm py-20 text-center flex flex-col items-center justify-center bg-white">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-muted-foreground/20 border-2 border-dashed border-slate-200">
                                    <FileText className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold">Your Application History is Empty</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 mb-8">Start exploring the job board and pitch your skills to potential hirers!</p>
                                <Button onClick={() => setActiveTab('jobs')} className="rounded-full px-8 shadow-lg">
                                    Go Apply for Jobs
                                </Button>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LabourerDashboard;

