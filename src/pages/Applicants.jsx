import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    User, 
    Calendar, 
    MessageCircle, 
    CheckCircle2, 
    XCircle, 
    ChevronLeft,
    UserCircle2,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

function Applicants() {
    const { jobId } = useParams();
    const { applications, jobs, updateApplicationStatus } = useData();
    const navigate = useNavigate();

    const job = jobs.find(j => String(j.id) === String(jobId));
    const jobApplicants = applications.filter(app => String(app.jobId) === String(jobId));

    const handleStatusUpdate = (appId, status) => {
        updateApplicationStatus(appId, status);
    };

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-muted-foreground/30 border-2 border-dashed border-slate-200">
                    <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Job Post Not Found</h3>
                <p className="text-muted-foreground mt-2">The job you are looking for doesn't exist or has been removed.</p>
                <Button variant="outline" className="mt-8 rounded-full" onClick={() => navigate('/dashboard/hirer/jobs')}>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to My Jobs
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent text-primary mb-2" onClick={() => navigate('/dashboard/hirer/jobs')}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Jobs
                    </Button>
                    <h2 className="text-2xl font-bold font-serif">Applicants for "{job.title}"</h2>
                    <p className="text-muted-foreground text-sm">
                        {jobApplicants.length} {jobApplicants.length === 1 ? 'person has' : 'people have'} applied for this position
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {jobApplicants.length > 0 ? (
                    jobApplicants.map(app => (
                        <Card key={app.id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-50 shadow-sm bg-slate-100 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                        {app.labourerPhoto ? (
                                            <img src={app.labourerPhoto} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                                <User className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{app.labourerName}</h3>
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] uppercase font-bold tracking-widest px-2 h-5",
                                                app.status === 'Accepted' && "border-green-200 bg-green-50 text-green-700",
                                                app.status === 'Rejected' && "border-red-200 bg-red-50 text-red-700",
                                                app.status === 'Pending' && "border-amber-200 bg-amber-50 text-amber-700"
                                            )}>
                                                {app.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Applied on {app.date}</span>
                                            <span className="flex items-center gap-1"><UserCircle2 className="w-3 h-3" /> Professional Artisan</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="rounded-xl font-bold"
                                            onClick={() => navigate(`/profile/${app.labourerId}`)}
                                        >
                                            View Profile
                                        </Button>
                                        
                                        {app.status === 'Pending' && (
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="default" 
                                                    size="sm" 
                                                    className="bg-green-600 hover:bg-green-700 rounded-xl font-bold px-4"
                                                    onClick={() => handleStatusUpdate(app.id, 'Accepted')}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="text-red-600 border-red-100 hover:bg-red-50 rounded-xl font-bold px-4"
                                                    onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                        
                                        {app.status !== 'Pending' && (
                                            <Button 
                                                variant="secondary" 
                                                size="sm" 
                                                className="rounded-xl font-bold px-5"
                                                onClick={() => navigate('/dashboard/hirer/messages', { state: { chatWith: { id: app.labourerId, name: app.labourerName } } })}
                                            >
                                                <MessageCircle className="w-4 h-4 mr-2" /> Message
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="border-none shadow-sm py-20 text-center flex flex-col items-center justify-center bg-white">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-muted-foreground/20 border-2 border-dashed border-slate-200">
                            <UserCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold">No Applications Yet</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 italic">Once labourers apply for this job, they will appear here. Hang tight!</p>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default Applicants;

