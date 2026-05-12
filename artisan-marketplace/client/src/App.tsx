import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import ArtisanProfile from "./pages/ArtisanProfile";
import ArtisanRegister from "./pages/ArtisanRegister";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import ChatPage from "./pages/ChatPage";
import AdminDashboard from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";
import SearchPage from "./pages/SearchPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import MobileBottomNav from "./components/MobileBottomNav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/map" component={MapPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/artisan/:id" component={ArtisanProfile} />
      <Route path="/register-artisan" component={ArtisanRegister} />
      <Route path="/artisan-dashboard" component={ArtisanDashboard} />
      <Route path="/dashboard" component={CustomerDashboard} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/chat/:conversationId" component={ChatPage} />
      <Route path="/book/:artisanId" component={BookingPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">
              <Router />
            </main>
            <div className="hidden md:block">
              <Footer />
            </div>
            <MobileBottomNav />
            <PWAInstallPrompt />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
