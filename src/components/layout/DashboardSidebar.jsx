import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Search, 
  Mail, 
  Settings,
  Hammer,
  CreditCard,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardSidebar({ className, onNavigate }) {
    const { user } = useAuth();
    const { notifications } = useData();

    const isHirer = user?.type === 'hirer';
    const isAdmin = user?.type === 'admin';
    const myNotifications = notifications.filter(n => String(n.userId) === String(user?.id));
    const unreadMessages = myNotifications.filter(n => n.type === 'message' && !n.read).length;

    // Navigation configuration
    let navGroups = [];

    if (isAdmin) {
        navGroups = [
            {
                title: "Overview",
                links: [{ to: `/dashboard/admin`, icon: LayoutDashboard, label: "Dashboard", end: true }]
            },
            {
                title: "Manage",
                links: [
                    { to: "/dashboard/admin/users", icon: Users, label: "Users" },
                    { to: "/dashboard/admin/jobs", icon: Briefcase, label: "Jobs" }
                ]
            },
            {
                title: "Account",
                links: [
                    { to: `/dashboard/admin/settings`, icon: Settings, label: "Settings" }
                ]
            }
        ];
    } else {
        navGroups = [
            {
                title: "Overview",
                links: [
                    { to: `/dashboard/${user?.type}`, icon: LayoutDashboard, label: "Dashboard", end: true }
                ]
            },
            {
                title: "Manage",
                links: isHirer ? [
                    { to: "/dashboard/hirer/jobs", icon: Briefcase, label: "My Jobs" },
                    { to: "/dashboard/hirer/applicants", icon: Users, label: "Applicants" },
                    { to: "/dashboard/hirer/bookings", icon: Calendar, label: "Bookings" }
                ] : [
                    { to: "/dashboard/labourer/applications", icon: FileText, label: "My Applications" },
                    { to: "/dashboard/labourer/bookings", icon: Calendar, label: "Bookings" },
                    { to: "/dashboard/labourer/earnings", icon: CreditCard, label: "Earnings" }
                ]
            },
            {
                title: "Discover",
                links: [
                    { to: "/explore", icon: Search, label: "Artisan Directory" }
                ]
            },
            {
                title: "Account",
                links: [
                    { to: `/dashboard/${user?.type}/messages`, icon: Mail, label: "Messages", badge: unreadMessages },
                    { to: `/dashboard/${user?.type}/settings`, icon: Settings, label: "Settings" }
                ]
            }
        ];
    }

    return (
        <aside className={cn("flex flex-col h-full bg-white", className)}>
            <div className="p-6 hidden md:block border-b border-border/50">
                <div className="flex items-center gap-2 font-serif font-bold text-2xl text-primary mb-6">
                    <div className="w-8 h-8 rounded-lg craft-gradient flex items-center justify-center shadow-sm">
                        <Hammer className="w-4 h-4 text-white" />
                    </div>
                    <span>OgaHub</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-100 bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                        {user?.photo ? (
                            <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-xl font-bold text-primary font-serif">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">{user?.name || 'User'}</h3>
                        <p className="text-xs text-muted-foreground capitalize">
                            {isAdmin ? 'Admin Dashboard' : isHirer ? 'Hirer Dashboard' : 'Artisan Dashboard'}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <h4 className="px-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2">
                            {group.title}
                        </h4>
                        {group.links.map((link) => (
                            <NavItem 
                                key={link.to} 
                                {...link} 
                                onClick={onNavigate} 
                            />
                        ))}
                    </div>
                ))}
            </nav>
            
            <div className="p-4 border-t border-border mt-auto">
                <div className="bg-slate-50 border border-border/50 p-4 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground mb-2">Need assistance?</p>
                    <a href="mailto:support@ogahub.com" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        Contact Support
                    </a>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ to, icon: Icon, label, end, badge, onClick }) {
    return (
        <NavLink 
            to={to} 
            end={end}
            onClick={onClick}
            className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
            )}
        >
            {({ isActive }) => (
                <>
                    {/* Active indicator bar */}
                    {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                    
                    <Icon className={cn(
                        "w-5 h-5 flex-shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    
                    <span className="flex-1 truncate">{label}</span>
                    
                    {badge > 0 && (
                        <Badge variant="default" className="ml-auto flex-shrink-0 rounded-full h-5 px-1.5 min-w-[1.25rem] flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                            {badge}
                        </Badge>
                    )}
                </>
            )}
        </NavLink>
    );
}