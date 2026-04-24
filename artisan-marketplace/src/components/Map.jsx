import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

function loadMapScript(apiKey) {
  if (window.google?.maps) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    // Check if script already exists to prevent duplicate loading
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function MapView({ className, initialCenter = { lat: 5.6037, lng: -0.1870 }, initialZoom = 12, onMapReady }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""; // Define this in .env if available

  const initMap = useCallback(async () => {
    if (!apiKey) {
      console.warn("Google Maps API key is missing. Map will not load.");
      return;
    }

    try {
      await loadMapScript(apiKey);
      if (!mapContainer.current) return;
      
      mapRef.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: false,
        mapId: "DEMO_MAP_ID" // Requires AdvancedMarkerElement
      });
      
      if (onMapReady) {
        onMapReady(mapRef.current);
      }
    } catch (err) {
      console.error("Failed to initialize Google Maps", err);
    }
  }, [apiKey, initialCenter, initialZoom, onMapReady]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  if (!apiKey) {
    return (
      <div className={cn("w-full h-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center border border-border", className)}>
        <MapIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-semibold text-lg text-foreground mb-2">Interactive Map Unavailable</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          The map cannot be loaded because the Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.
        </p>
      </div>
    );
  }

  return <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />;
}

// Simple fallback Map Icon
function MapIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}
