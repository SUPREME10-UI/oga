import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Search, 
    Calendar, 
    MessageCircle, 
    CheckCircle2, 
    FileText, 
    Briefcase,
    User,
    ArrowRight,
    MapPin,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

function Applications() {
    const { applications, updateApplicationStatus, jobs } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hirerNames, setHirerNames] = useState({});

    // Fetch hirer names from Firestore
    useEffect(() => {
        const fetchHirerNames = async () => {
            const names = {};
            const uniqueHirerIds = [...new Set(jobs.map(j => j.hirerId).filter(Boolean))];

            for (const hirerId of uniqueHirerIds) {
                try {
                    const hirerDoc = await getDoc(doc(db, 'users', hirerId));
                    if (hirerDoc.exists()) {
                        names[hirerId] = hirerDoc.data().name || 'Unknown Hirer';
                    }
                } catch (error) {
                    console.error('Error fetching hirer name:', error);
                }
            }
            setHirerNames(names);
        };

        if (jobs.length > 0) {
            fetchHirerNames();
        }
    }, [jobs]);

    // Filter applications for the current labourer
    const myApps = applications.filter(app => app.labourerId === user?.id || app.labourerId === user?.uid).map(app => {
        const job = jobs.find(j => String(j.id) === String(app.jobId));
        const hirerId = job?.hirerId;
        const hirerName = job?.hirerName || hirerNames[hirerId] || 'Unknown Hirer';

        return {
            ...app,
            jobTitle: job?.title || `Job #${app.jobId}`,
            jobLocation: job?.location || 'Accra',
            hirerId,
            hirerName
        };
    });

    const handleMessageHirer = (app) => {
        navigate('/dashboard/labourer/messages', {
            state: {
                chatWith: {
                    id: app.hirerId,
                    name: app.hirerName,
                    photo: null
                }
            }
        });
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-serif">Application Journey</h2>
                    <p className="text-muted-foreground text-sm">
                        Keep track of your active pitches and job status
                    </p>
                </div>
                <Button onClick={() => navigate('/dashboard/labourer')} className="rounded-full shadow-md">
                    <Search className="w-4 h-4 mr-2" /> Browse New Gigs
                </Button>
            </div>

            <div className="grid gap-4">
                {myApps.length > 0 ? (
                    myApps.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(app => (
                        <Card key={app.id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                        <FileText className="w-7 h-7 text-primary/40" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{app.jobTitle}</h3>
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] uppercase font-bold tracking-widest px-2 h-5",
                                                app.status === 'Accepted' && "border-green-200 bg-green-50 text-green-700",
                                                app.status === 'Completed' && "border-blue-200 bg-blue-50 text-blue-700",
                                                app.status === 'Rejected' && "border-red-200 bg-red-50 text-red-700",
                                                app.status === 'Pending' && "border-amber-200 bg-amber-50 text-amber-700"
                                            )}>
                                                {app.status}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1 font-medium text-foreground"><User className="w-3 h-3" /> {app.hirerName}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.jobLocation}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {app.date}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="rounded-xl font-bold h-9 bg-slate-50 px-4"
                                                onClick={() => navigate(`/job/${app.jobId}`)}
                                            >
                                                Details
                                            </Button>
                                            
                                            {app.status === 'Accepted' && (
                                                <Button 
                                                    variant="default" 
                                                    size="sm" 
                                                    className="bg-primary hover:bg-primary/90 rounded-xl font-bold h-9 px-4"
                                                    onClick={() => updateApplicationStatus(app.id, 'Completed')}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Done
                                                </Button>
                                            )}
                                            
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                className="rounded-full h-9 w-9 text-muted-foreground hover:text-primary"
                                                onClick={() => handleMessageHirer(app)}
                                            >
                                                <MessageCircle className="w-4 h-4" />
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
                            <FileText className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold">No Applications Yet</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 italic mb-8">You haven't applied for any jobs yet. Start browsing and pitch your skills to hirers!</p>
                        <Button onClick={() => navigate('/dashboard/labourer')} className="rounded-full px-8 shadow-lg">
                            Find Best Gigs
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default Applications;

