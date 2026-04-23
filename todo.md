# Artisan Marketplace - TODO

## Phase 1: Database & Setup
- [x] Database schema (users, artisans, categories, reviews, bookings, messages, favorites, conversations, notifications)
- [x] Install socket.io for real-time chat
- [x] Seed 10 artisan categories

## Phase 2: Design System & Homepage
- [x] Global CSS design tokens (warm amber/brown colors, typography)
- [x] Navbar with auth state, notification badge, mobile menu
- [x] Footer with links and contact info
- [x] Homepage hero with search bar and CTAs
- [x] Artisan categories section with icons
- [x] Stats bar (2,500+ artisans, 15,000+ jobs, 4.8/5 rating)
- [x] Map preview section on homepage
- [x] How It Works section
- [x] Trust signals section

## Phase 3: Interactive Map
- [x] Full-screen map page with Google Maps (Manus proxy)
- [x] Artisan markers with availability color coding
- [x] Clickable markers with info windows showing artisan preview
- [x] Filter sidebar (category, rating slider, availability toggle)
- [x] Search bar on map page
- [x] GPS location detection ("My Location" button)
- [x] Artisan list in sidebar with click-to-center

## Phase 4: Artisan Profiles & Registration
- [x] Artisan profile page (name, profession, location, contact, ratings, portfolio)
- [x] Portfolio image gallery with lightbox
- [x] Availability status badge
- [x] Artisan registration form (multi-section)
- [x] Artisan dashboard to manage services, bookings, profile
- [x] Verified badge for approved artisans

## Phase 5: User Accounts, Favorites, Reviews & Booking
- [x] Customer dashboard with stats
- [x] Save/unsave favorite artisans
- [x] Leave reviews with star ratings (1-5)
- [x] Booking form (date, time, service description, address, notes)
- [x] Booking history for customers
- [x] Booking management for artisans (confirm, complete, cancel)
- [x] Dispute system with owner notification

## Phase 6: Real-time Chat
- [x] Chat page with conversation list sidebar
- [x] Message history stored in database
- [x] Polling-based refresh (3-second intervals)
- [x] Chat initiation from artisan profile
- [x] Last message preview in conversation list
- [x] In-app notifications for new messages

## Phase 7: Stripe Payments
- [ ] Stripe checkout for booking deposits (requires user to provide Stripe API keys)

## Phase 8: Admin Dashboard
- [x] Admin overview stats (users, artisans, pending approvals, bookings)
- [x] User management table
- [x] Artisan approval/rejection/suspension workflow
- [x] Review moderation (publish, hide, flag)
- [x] Bookings monitoring
- [x] Owner email notifications (new registrations, critical reviews 1-2 stars, disputes)
- [x] Admin-only route guard (FORBIDDEN for non-admins)

## Phase 9: Testing & Delivery
- [x] 34 passing Vitest unit tests (auth, categories, artisans, reviews, favorites, bookings, chat, notifications, admin)
- [x] Final checkpoint
- [x] Deliver to user

## Ghana Localization
- [x] Update map default center to Accra, Ghana (lat: 5.6037, lng: -0.1870)
- [x] Update phone placeholder to Ghana format (+233 XX XXX XXXX)
- [x] Update currency from ₦ (Naira) to GH₵ (Cedi)
- [x] Update city placeholder from Lagos to Accra
- [x] Update state/region placeholder to Ghana regions
- [x] Update country placeholder to Ghana
- [x] Update footer contact phone to Ghana number
- [x] Update artisan registration form defaults to Ghana

## Full Ghana Currency Fix + Sample Data
- [x] Replace ALL remaining ₦ symbols with GH₵ across every file
- [x] Seed database with 15+ realistic Ghanaian artisan profiles
- [x] Add sample reviews for seeded artisans
- [x] Verify no ₦ symbol remains anywhere in the codebase

## Portfolio Image Upload
- [x] Add portfolio image upload tRPC endpoint with S3 storage
- [x] Add portfolio images table to database schema (stored in artisans.portfolioImages JSON column)
- [x] Build PortfolioUploader component (mobile-friendly, drag & drop, camera capture)
- [x] Integrate PortfolioUploader into ArtisanDashboard
- [x] Integrate PortfolioUploader into ArtisanRegister
- [x] Add image delete functionality (remove button on each image tile)
- [x] Add upload progress indicators (per-file progress bar with XHR)
- [x] Write tests for upload endpoint (covered in artisan.test.ts)

## PWA (Progressive Web App - Mobile Install)
- [ ] Generate app icons (192x192, 512x512, 180x180 apple-touch-icon)
- [ ] Generate splash screen images for iOS
- [ ] Create web app manifest (manifest.json) with name, icons, colors, display mode
- [ ] Create service worker for offline caching and background sync
- [ ] Register service worker in the app
- [ ] Add iOS-specific meta tags (apple-mobile-web-app-capable, status-bar-style)
- [ ] Add install prompt banner for Android (beforeinstallprompt)
- [ ] Add iOS install instructions modal
- [ ] Create offline fallback page
- [ ] Add mobile bottom navigation bar for app-like feel
- [ ] Test installability on Android and iOS
