import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Wallet, 
    TrendingUp, 
    Clock, 
    CheckCircle2, 
    ArrowUpRight, 
    Receipt, 
    DollarSign,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

function Earnings() {
    const { applications, jobs } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Filter completed applications for the current labourer
    const myId = user?.id || user?.uid;
    const completedJobs = applications
        .filter(app => (app.labourerId === myId) && app.status === 'Completed')
        .map(app => {
            const job = jobs.find(j => String(j.id) === String(app.jobId));
            return {
                id: app.id,
                jobTitle: job?.title || `Job #${app.jobId}`,
                amount: parseInt(job?.budget) || 0,
                date: app.date,
                status: app.status
            };
        });

    // Calculate stats
    const totalEarnings = completedJobs.reduce((sum, job) => sum + job.amount, 0);
    const jobsCompletedCount = completedJobs.length;

    // For now, pending can be Accepted jobs (work in progress)
    const pendingJobsBalances = applications
        .filter(app => (app.labourerId === myId) && app.status === 'Accepted')
        .map(app => {
            const job = jobs.find(j => String(j.id) === String(app.jobId));
            return parseInt(job?.budget) || 0;
        });
    const pendingClearance = pendingJobsBalances.reduce((sum, amount) => sum + amount, 0);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-serif">Financial Overview</h2>
                    <p className="text-muted-foreground text-sm">
                        Track your hard-earned income and payout history
                    </p>
                </div>
                <Button 
                    disabled={totalEarnings === 0} 
                    className="rounded-full shadow-lg h-11 px-8 animate-pulse-slow"
                >
                    <Wallet className="w-4 h-4 mr-2" /> 
                    Withdraw GH₵ {totalEarnings.toLocaleString()}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <CardContent className="p-6 space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Balance</p>
                            <TrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <h3 className="text-3xl font-bold">GH₵ {totalEarnings.toLocaleString()}</h3>
                        <p className="text-xs text-slate-500 italic">Ready for instant withdrawal</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending Clearance</p>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900">GH₵ {pendingClearance.toLocaleString()}</h3>
                        <p className="text-xs text-muted-foreground italic">Funds from active projects</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Career Milestones</p>
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900">{jobsCompletedCount}</h3>
                        <p className="text-xs text-muted-foreground italic">Successful gig completions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                     <Receipt className="w-5 h-5 text-muted-foreground" />
                     Recent Transactions
                </h3>
                
                {completedJobs.length > 0 ? (
                    <div className="grid gap-3">
                        {completedJobs.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(item => (
                            <Card key={item.id} className="group border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                                            <ArrowUpRight className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{item.jobTitle}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {item.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-bold text-slate-900">
                                            + GH₵ {item.amount.toLocaleString()}
                                        </p>
                                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-100 px-2 h-5 font-bold uppercase tracking-tighter">
                                            {item.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-none shadow-sm py-20 text-center flex flex-col items-center justify-center bg-white">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 text-muted-foreground/20 border-2 border-dashed border-slate-200">
                            <Receipt className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold">No Transactions Found</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2 italic mb-8">Complete your first project to start building your financial history here!</p>
                        <Button variant="outline" className="rounded-full px-8" onClick={() => navigate('/dashboard/labourer')}>
                            Find Work
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default Earnings;

