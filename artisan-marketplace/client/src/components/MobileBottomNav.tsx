import { Link, useLocation } from "wouter";
import { Home, Map, Search, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/dashboard", icon: User, label: "Account" },
];

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  // Get unread message count for badge
  const { data: conversations } = trpc.chat.myConversations.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const unreadCount = conversations?.filter(
    (c) => (c.lastMessagePreview ?? '') !== ''
  ).length ?? 0;

  // Only show on mobile screens — hidden on md and above
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden safe-area-bottom">
      <div
        className="flex items-center justify-around px-2 py-2 border-t border-amber-900/30"
        style={{
          background: "rgba(30, 14, 4, 0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? location === "/" : location.startsWith(href);
          const showBadge = href === "/chat" && isAuthenticated && (unreadCount as number) > 0;

          return (
            <Link key={href} href={href}>
              <div className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px]">
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-amber-500" : "text-amber-700/60"
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-amber-500" : "text-amber-700/50"
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
