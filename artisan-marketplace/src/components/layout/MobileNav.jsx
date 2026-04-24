import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, MessageCircle, User, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const { user } = useAuth();
  const { notifications } = useData();
  const location = useLocation();

  if (!user) return null;

  const isLabourer = user.type === 'labourer';
  const dashboardPath = `/dashboard/${user.type}`;
  
  // Count unread notifications for the badge
  const unreadCount = notifications?.filter(n => String(n.userId) === String(user.uid || user.id) && !n.read).length || 0;

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { 
      to: isLabourer ? `${dashboardPath}/bookings` : '/explore', 
      icon: isLabourer ? Calendar : Briefcase, 
      label: isLabourer ? 'Bookings' : 'Find Pros' 
    },
    { to: `${dashboardPath}/messages`, icon: MessageCircle, label: 'Chat', badge: unreadCount },
    { to: dashboardPath, icon: User, label: 'Dashboard' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-bottom h-16 flex items-center justify-around px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors tap-active h-full",
            isActive ? "text-primary font-semibold" : "text-muted-foreground"
          )}
        >
          <div className="relative">
            <item.icon className="w-5 h-5 mb-0.5" />
            {item.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white font-bold">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-tighter font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
