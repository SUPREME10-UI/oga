import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Hammer,
  Map,
  Search,
  Menu,
  X,
  Bell,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const artisanProfile = trpc.artisans.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/map", label: "Map", icon: Map },
    { href: "/search", label: "Find Artisans", icon: Search },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
            <div className="w-8 h-8 rounded-lg craft-gradient flex items-center justify-center">
              <Hammer className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif">
              Artisan<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === link.href
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
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount && unreadCount > 0 ? (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    ) : null}
                  </Button>
                </Link>

                {/* Chat */}
                <Link href="/chat">
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </Link>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                        {user?.name ?? "Account"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <User className="w-4 h-4" /> My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {artisanProfile.data ? (
                      <DropdownMenuItem asChild>
                        <Link href="/artisan-dashboard" className="flex items-center gap-2">
                          <Hammer className="w-4 h-4" /> Artisan Dashboard
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link href="/register-artisan" className="flex items-center gap-2">
                          <Hammer className="w-4 h-4" /> Become an Artisan
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/chat" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Messages
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 text-primary">
                            <Shield className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
                <Button size="sm" className="hidden sm:flex" asChild>
                  <Link href="/register-artisan">Join as Artisan</Link>
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
        <div className="md:hidden border-t border-border bg-white">
          <div className="container py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-2 border-t border-border mt-1 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link href="/register-artisan" onClick={() => setMobileOpen(false)}>
                    Join as Artisan
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
