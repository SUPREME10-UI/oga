import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Mail, Calendar, ShieldAlert } from 'lucide-react';

export default function AdminUsers() {
    const { labourers } = useData(); // all users are fetched into this array by DataContext
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = labourers.filter(user => 
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Manage Users</h2>
                <p className="text-muted-foreground mt-1">View and manage all registered users on the platform.</p>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="border-b border-border/50 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-serif">All Users</CardTitle>
                            <CardDescription>Total {filteredUsers.length} users found.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search users by name or email..." 
                                className="pl-9 bg-slate-50 border-border/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px] w-full">
                        <div className="min-w-[800px]">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground bg-slate-50/50 uppercase border-b border-border/50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">User</th>
                                        <th className="px-6 py-4 font-medium">Contact</th>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Joined</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-secondary border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                                                        {user.photo ? (
                                                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-serif font-bold text-primary">
                                                                {user.name?.charAt(0) || 'U'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{user.name || 'Unnamed User'}</div>
                                                        <div className="text-xs text-muted-foreground">{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="w-4 h-4 shrink-0" />
                                                    <span className="truncate max-w-[200px]">{user.email || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={user.type === 'admin' ? 'destructive' : user.type === 'labourer' ? 'default' : 'secondary'} className="capitalize">
                                                    {user.type || 'Unknown'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="w-4 h-4 shrink-0" />
                                                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Ban User (Coming Soon)">
                                                    <ShieldAlert className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                                No users found matching "{searchQuery}"
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
