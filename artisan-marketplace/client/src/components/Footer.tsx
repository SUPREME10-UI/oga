import { Link } from "wouter";
import { Hammer, Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.18_0.03_55)] text-[oklch(0.85_0.01_75)]">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <div className="w-8 h-8 rounded-lg craft-gradient flex items-center justify-center">
                <Hammer className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif">
                Artisan<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-[oklch(0.65_0.02_70)] leading-relaxed">
              Connecting skilled artisans with customers who need quality craftsmanship. Find trusted local
              professionals for every job.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-[oklch(0.65_0.02_70)] hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-[oklch(0.65_0.02_70)] hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[oklch(0.65_0.02_70)] hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/map", label: "Find on Map" },
                { href: "/search", label: "Search Artisans" },
                { href: "/register-artisan", label: "Become an Artisan" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[oklch(0.65_0.02_70)] hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {["Carpenters", "Electricians", "Plumbers", "Tailors", "Mechanics", "Painters"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/search?category=${cat.toLowerCase()}`}
                    className="text-[oklch(0.65_0.02_70)] hover:text-primary transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-[oklch(0.65_0.02_70)]">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>support@artisanhub.com</span>
              </li>
              <li className="flex items-center gap-2 text-[oklch(0.65_0.02_70)]">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+233 30 000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[oklch(0.28_0.03_55)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[oklch(0.55_0.02_70)]">
          <p>© {new Date().getFullYear()} ArtisanHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
