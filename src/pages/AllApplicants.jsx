import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    User, 
    Calendar, 
    MessageCircle, 
    CheckCircle2, 
    XCircle, 
    Search,
    UserCircle2,
    Briefcase,
    Mail,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

function AllApplicants() {
    const { applications, jobs, updateApplicationStatus } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Get all applications for jobs posted by this hirer
    const hirerJobs = jobs.filter(j => j.hirerId === user?.id || j.hirerId === user?.uid);
    const hirerJobIds = hirerJobs.map(j => String(j.id));
    const hirerApplications = applications.filter(app => hirerJobIds.includes(String(app.jobId)));

    const handleStatusUpdate = (appId, status) => {
        updateApplicationStatus(appId, status);
    };

    const getJobTitle = (jobId) => {
        const job = jobs.find(j => String(j.id) === String(jobId));
        return job?.title || `Job #${jobId}`;
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-serif">Global Applicant Review</h2>
                    <p className="text-muted-foreground text-sm">
                        Manage all labourers who have applied to any of your {hirerJobs.length} active listings
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {hirerApplications.length > 0 ? (
                    hirerApplications.map(app => (
                        <Card key={app.id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-14 h-14 rounded-full border-2 border-slate-50 shadow-sm bg-slate-100 overflow-hidden shrink-0">
                                            {app.labourerPhoto ? (
                                                <img src={app.labourerPhoto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                                    <UserCircle2 className="w-7 h-7" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{app.labourerName}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {getJobTitle(app.jobId)}</span>
                                                <span className="mx-1">•</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {app.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                                        <Badge variant="outline" className={cn(
                                            "px-4 py-1 uppercase font-bold tracking-widest text-[10px]",
                                            app.status === 'Accepted' && "border-green-200 bg-green-50 text-green-700",
                                            app.status === 'Rejected' && "border-red-200 bg-red-50 text-red-700",
                                            app.status === 'Pending' && "border-amber-200 bg-amber-50 text-amber-700"
                                        )}>
                                            {app.status}
                                        </Badge>

                                        <div className="flex items-center gap-2">
                                            {app.status === 'Pending' ? (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-green-600 hover:bg-green-50 rounded-xl font-bold h-9"
                                                        onClick={() => handleStatusUpdate(app.id, 'Accepted')}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-500 hover:bg-red-50 rounded-xl font-bold h-9"
                                                        onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" /> Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="rounded-xl font-bold h-9 bg-slate-50"
                                                    onClick={() => navigate('/dashboard/hirer/messages', { state: { chatWith: { id: app.labourerId, name: app.labourerName } } })}
                                                >
                                                    <Mail className="w-4 h-4 mr-2" /> Message
                                                </Button>
                                            )}
                                            
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="rounded-full h-9 w-9"
                                                onClick={() => navigate(`/profile/${app.labourerId}`)}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="border-none shadow-sm py-24 text-center flex flex-col items-center justify-center bg-white">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 text-muted-foreground/20 border-2 border-dashed border-slate-200">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold">No Active Applicants</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 italic">You'll see all people who apply for your jobs listed here for easy management.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default AllApplicants;

