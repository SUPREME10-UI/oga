import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Calendar, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminJobs() {
    const { jobs, deleteJob } = useData();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredJobs = jobs.filter(job => 
        (job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (job.hirerName?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
            try {
                await deleteJob(id);
            } catch (err) {
                console.error("Failed to delete job", err);
                alert("Failed to delete job. See console for details.");
            }
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Manage Jobs</h2>
                <p className="text-muted-foreground mt-1">View and manage all jobs posted on the platform.</p>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="border-b border-border/50 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-serif">All Jobs</CardTitle>
                            <CardDescription>Total {filteredJobs.length} jobs found.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search jobs by title or hirer..." 
                                className="pl-9 bg-slate-50 border-border/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px] w-full">
                        <div className="min-w-[900px]">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground bg-slate-50/50 uppercase border-b border-border/50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Job Title</th>
                                        <th className="px-6 py-4 font-medium">Hirer</th>
                                        <th className="px-6 py-4 font-medium">Location</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 truncate max-w-[250px]">{job.title}</div>
                                                <div className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]">
                                                    {job.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{job.hirerName || 'Unknown'}</div>
                                                <div className="text-xs text-muted-foreground">ID: {job.hirerId?.substring(0,8)}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <MapPin className="w-4 h-4 shrink-0" />
                                                    <span className="truncate max-w-[150px]">{job.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={job.status === 'Active' ? 'default' : 'secondary'} className={job.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                                    {job.status || 'Unknown'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="w-4 h-4 shrink-0" />
                                                    <span>{job.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/job/${job.id}`} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Job Details">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(job.id)}
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" 
                                                        title="Delete Job"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                                No jobs found matching "{searchQuery}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
