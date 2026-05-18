import { useData } from '../../context/DataContext';
import { Users, Briefcase, FileText, Calendar, Activity, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
    const { labourers, jobs, applications, bookings } = useData();

    // In DataContext, 'labourers' actually holds all users (both hirers and labourers)
    const allUsers = labourers;
    const totalHirers = allUsers.filter(u => u.type === 'hirer').length;
    const totalLabourers = allUsers.filter(u => u.type === 'labourer').length;
    
    const activeJobs = jobs.filter(j => j.status === 'Active').length;
    
    const stats = [
        {
            title: "Total Users",
            value: allUsers.length,
            subtitle: `${totalHirers} Hirers • ${totalLabourers} Artisans`,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Total Jobs",
            value: jobs.length,
            subtitle: `${activeJobs} currently active`,
            icon: Briefcase,
            color: "text-emerald-600",
            bg: "bg-emerald-100"
        },
        {
            title: "Applications",
            value: applications.length,
            subtitle: "Total job applications",
            icon: FileText,
            color: "text-amber-600",
            bg: "bg-amber-100"
        },
        {
            title: "Bookings",
            value: bookings.length,
            subtitle: "Total direct bookings",
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-100"
        }
    ];

    const recentActivity = [
        ...jobs.map(j => ({ ...j, activityType: 'job', time: j.createdAt || j.date })),
        ...applications.map(a => ({ ...a, activityType: 'application', time: a.createdAt || a.date })),
        ...bookings.map(b => ({ ...b, activityType: 'booking', time: b.createdAt || b.date }))
    ].sort((a, b) => {
        const timeA = a.time?.toMillis?.() || new Date(a.time).getTime() || 0;
        const timeB = b.time?.toMillis?.() || new Date(b.time).getTime() || 0;
        return timeB - timeA;
    }).slice(0, 10);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Admin Overview</h2>
                <p className="text-muted-foreground mt-1">Monitor platform activity and statistics.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="border-border/50 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-serif">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.subtitle}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-border/50 shadow-sm">
                    <CardHeader className="border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-serif">Recent Activity</CardTitle>
                            <Activity className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-border/50">
                                    {recentActivity.map((activity, idx) => (
                                        <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                                activity.activityType === 'job' ? 'bg-blue-100 text-blue-600' :
                                                activity.activityType === 'application' ? 'bg-amber-100 text-amber-600' :
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                                {activity.activityType === 'job' ? <Briefcase className="w-5 h-5" /> :
                                                 activity.activityType === 'application' ? <FileText className="w-5 h-5" /> :
                                                 <Calendar className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {activity.activityType === 'job' && `New Job Posted: ${activity.title}`}
                                                    {activity.activityType === 'application' && `New Application: ${activity.labourerName}`}
                                                    {activity.activityType === 'booking' && `New Booking for ${activity.jobTitle}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {activity.activityType === 'job' && `By ${activity.hirerName}`}
                                                    {activity.activityType === 'application' && `For ${activity.jobTitle}`}
                                                    {activity.activityType === 'booking' && `By ${activity.hirerName}`}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                                                {activity.date}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    No recent activity found.
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-serif">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Manage your platform efficiently using the dedicated admin tools.</p>
                        
                        <div className="space-y-2">
                            <a href="/dashboard/admin/users" className="flex items-center justify-between p-3 rounded-lg bg-white border border-border/50 hover:border-primary/50 hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">Manage Users</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                            <a href="/dashboard/admin/jobs" className="flex items-center justify-between p-3 rounded-lg bg-white border border-border/50 hover:border-primary/50 hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">Manage Jobs</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
