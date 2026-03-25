import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import JobPostModal from '../components/jobs/JobPostModal';

import { Button } from "@/components/ui/badge"; // Note: Checking actual button import below
import { Button as ShadcnButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Plus, 
    Briefcase, 
    MapPin, 
    Calendar, 
    Users, 
    ChevronRight, 
    Search,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

function MyJobs() {
    const authCtx = useAuth() || {};
    const dataCtx = useData() || {};
    const { user } = authCtx;
    const { jobs: allJobs, addJob } = dataCtx;
    const navigate = useNavigate();

    const [isPostJobOpen, setIsPostJobOpen] = useState(false);

    const jobs = Array.isArray(allJobs) ? allJobs : [];
    const myJobs = jobs.filter(j => j.hirerId === user?.id || j.hirerId === user?.uid);

    const handlePostJob = async (jobData) => {
        await addJob(jobData, user.id || user.uid, user.name);
        setIsPostJobOpen(false);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-serif">Job Management</h2>
                    <p className="text-muted-foreground text-sm mt-1">Status and performance of your active listings</p>
                </div>
                <ShadcnButton onClick={() => setIsPostJobOpen(true)} className="rounded-full shadow-md hover:shadow-lg transition-all px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                </ShadcnButton>
            </div>

            {myJobs.length > 0 ? (
                <div className="grid gap-4">
                    {myJobs.map(job => (
                        <Card key={job.id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                        <Briefcase className="w-7 h-7 text-primary/40 truncate" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{job.title}</h3>
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] uppercase font-bold tracking-tighter px-2 h-5",
                                                job.status === 'Active' ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-700"
                                            )}>
                                                {job.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location || 'Remote'}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {job.date}</span>
                                            <span className="flex items-center gap-1 font-bold text-foreground">GH₵{job.budget}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                        <ShadcnButton 
                                            variant="secondary" 
                                            size="sm" 
                                            className="rounded-xl flex-1 md:flex-none font-bold"
                                            onClick={() => navigate(`/dashboard/hirer/jobs/${job.id}/applicants`)}
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            View Applicants
                                        </ShadcnButton>
                                        <ShadcnButton 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-full hover:bg-slate-100 text-muted-foreground hover:text-primary"
                                            onClick={() => navigate(`/job/${job.id}`)}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </ShadcnButton>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-none shadow-sm py-20 text-center flex flex-col items-center justify-center bg-white">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-muted-foreground/20 border-2 border-dashed border-slate-200">
                        <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold">No active jobs yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 mb-8 italic">You haven't posted any jobs. Create your first listing to find skilled labourers.</p>
                    <ShadcnButton onClick={() => setIsPostJobOpen(true)} className="rounded-full px-8 shadow-lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Post a Job Now
                    </ShadcnButton>
                </Card>
            )}

            <JobPostModal 
                isOpen={isPostJobOpen}
                onClose={() => setIsPostJobOpen(false)}
                onJobPost={handlePostJob}
            />
        </div>
    );
}

export default MyJobs;