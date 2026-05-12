import { Link } from "react-router-dom";
import { Hammer, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.18_0.03_55)] text-[oklch(0.85_0.01_75)]">
      <div className="container py-12 px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3 hover:opacity-90">
              <div className="w-8 h-8 rounded-lg craft-gradient flex items-center justify-center">
                <Hammer className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif">
                Oga<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-[oklch(0.65_0.02_70)] leading-relaxed">
              Connecting skilled labourers with opportunities since 2025. Find trusted local
              professionals for every job.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-[oklch(0.65_0.02_70)] hover:text-primary transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-[oklch(0.65_0.02_70)] hover:text-primary transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-[oklch(0.65_0.02_70)] hover:text-primary transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/explore", label: "Explore Jobs" },
                { to: "/terms", label: "Terms of Service" },
                { to: "/privacy", label: "Privacy Policy" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
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
              {["Carpenters", "Electricians", "Plumbers", "Masons", "Painters"].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/explore"
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
                <span>support@ogahub.com</span>
              </li>
              <li className="flex items-center gap-2 text-[oklch(0.65_0.02_70)]">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+233 30 000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[oklch(0.28_0.03_55)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[oklch(0.55_0.02_70)]">
          <p>© {new Date().getFullYear()} OgaHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
