import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Hammer,
  Search,
  Menu,
  X,
  Bell,
  MessageCircle,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function Navbar({ onLoginClick, isFluid }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
  ];

  const getDashboardLink = () => {
    if (!user) return "/";
    return `/dashboard/${user.type || user.role || 'hirer'}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className={isFluid ? "w-full px-4" : "container mx-auto px-4"}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
            <div className="w-8 h-8 rounded-lg craft-gradient flex items-center justify-center">
              <Hammer className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif">
              Oga<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <Link to={getDashboardLink()}>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                  </Button>
                </Link>

                {/* Chat */}
                <Link to={`${getDashboardLink()}/messages`}>
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </Link>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.photoURL || user?.photo || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                        {user?.name || user?.email || "Account"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name || user?.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" /> My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`${getDashboardLink()}/messages`} className="flex items-center gap-2 cursor-pointer">
                        <MessageCircle className="w-4 h-4" /> Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`${getDashboardLink()}/settings`} className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => onLoginClick('login')}>
                  Sign In
                </Button>
                <Button size="sm" className="hidden sm:flex" onClick={() => onLoginClick('signup')}>
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white shadow-xl animate-in slide-in-from-top duration-300">
          <div className="container py-4 flex flex-col gap-1 mx-auto px-4">
            {!user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border mt-2 flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1 rounded-xl h-12" onClick={() => { onLoginClick('login'); setMobileOpen(false); }}>
                    Sign In
                  </Button>
                  <Button size="lg" className="flex-1 rounded-xl h-12" onClick={() => { onOpenAuth('signup'); setMobileOpen(false); }}>
                    Get Started
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-3 mb-2 border-b border-border/50">
                  <p className="font-bold text-foreground">{user.name || user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {[
                  { to: getDashboardLink(), label: "My Dashboard", icon: User },
                  { to: `${getDashboardLink()}/settings`, label: "Settings", icon: Settings },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="mt-2 w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-destructive hover:bg-destructive/5 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
