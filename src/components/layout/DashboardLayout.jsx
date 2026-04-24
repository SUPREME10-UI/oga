import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import MobileNav from './MobileNav';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Menu, X, MessageCircle, FileText, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    
    const { user, logout } = useAuth();
    const { notifications, markNotificationAsRead } = useData();
    const navigate = useNavigate();
    const location = useLocation();

    const isHirer = user?.type === 'hirer';
    const myNotifications = notifications.filter(n => String(n.userId) === String(user?.id));
    const unreadCount = myNotifications.filter(n => !n.read).length;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleNotificationClick = async (notif) => {
        await markNotificationAsRead(notif.id);
        if (notif.type === 'message') {
            navigate(`/dashboard/${user.type}/messages`);
        }
        setShowNotifications(false);
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/admin/jobs')) return 'Manage Jobs';
        if (path.includes('/admin/users')) return 'Manage Users';
        if (path.endsWith('/jobs')) return 'My Jobs';
        if (path.endsWith('/applicants')) return 'Applicants';
        if (path.endsWith('/applications')) return 'My Applications';
        if (path.endsWith('/messages')) return 'Messages';
        if (path.endsWith('/bookings')) return 'Bookings';
        if (path.endsWith('/settings')) return 'Settings';
        return 'Overview';
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-64 border-r border-border bg-white z-20">
                <DashboardSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="font-serif font-bold text-xl text-primary">OgaHub</span>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <DashboardSidebar onNavigate={() => setMobileMenuOpen(false)} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden pb-16 md:pb-0">
                {/* Global Topbar */}
                <header className="h-16 px-4 sm:px-6 bg-white border-b border-border flex items-center justify-between shadow-sm z-30 shrink-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="md:hidden -ml-2 text-foreground"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                        <h1 className="text-lg sm:text-xl font-bold font-serif text-foreground truncate">
                            {getPageTitle()}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Notifications */}
                        <div className="relative">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="relative rounded-full"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell className="w-4 h-4 text-muted-foreground" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
                                    <div className="p-3 border-b border-border flex justify-between items-center bg-slate-50/50">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                        {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>}
                                    </div>
                                    <ScrollArea className="h-[300px]">
                                        {myNotifications.length > 0 ? (
                                            <div className="flex flex-col">
                                                {myNotifications.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        className={cn(
                                                            "p-3 border-b border-border/40 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3",
                                                            !notif.read && "bg-blue-50/40"
                                                        )}
                                                        onClick={() => handleNotificationClick(notif)}
                                                    >
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                                            notif.type === 'message' ? "bg-blue-100 text-blue-600" : 
                                                            notif.type === 'application' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"
                                                        )}>
                                                            {notif.type === 'message' ? <MessageCircle className="w-4 h-4" /> : 
                                                             notif.type === 'application' ? <FileText className="w-4 h-4" /> : 
                                                             <Bell className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <p className={cn("text-sm leading-snug truncate whitespace-normal", !notif.read && "font-medium text-foreground")}>{notif.message}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : `${notif.time}, ${notif.date}`}
                                                            </p>
                                                        </div>
                                                        {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                                                <Bell className="w-8 h-8 mb-3 opacity-20" />
                                                <p className="text-sm">No notifications yet</p>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            )}
                        </div>

                        {/* Topbar Actions */}
                        {isHirer && location.pathname === '/dashboard/hirer' && (
                           <div id="topbar-actions" className="hidden sm:block">
                                {/* Dashboard pages can teleport buttons here, but we'll use a standard button for now or leave it to the page itself */}
                           </div>
                        )}

                        <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-secondary/50" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
            <MobileNav />
        </div>
    );
}
