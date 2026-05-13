import { useEffect, useRef } from "react";

/**
 * MapView — uses window.L (Leaflet loaded via CDN in index.html)
 * This completely bypasses npm/bundler issues that affect react-leaflet in production.
 */
export function MapView({
  className = "",
  style = {},
  initialCenter = { lat: 5.6037, lng: -0.187 },
  initialZoom = 12,
  onMapReady,
}) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    console.log("[MapView] Mounting...", { el, L: window.L });
    if (!el || mapInstanceRef.current) return;

    // window.L is loaded via CDN <script> in index.html
    const L = window.L;
    if (!L) {
      console.error("[MapView] Leaflet (window.L) not available. Check CDN script in index.html.");
      if (el) {
        el.innerHTML = `
          <div style="padding: 20px; text-align: center; background: #fee2e2; color: #991b1b; border-radius: 12px; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 10px;">
            <p style="font-weight: bold;">Map Error</p>
            <p style="font-size: 12px;">Leaflet library failed to load. Please check your internet connection or browser console.</p>
          </div>
        `;
      }
      return;
    }

    // Init map
    const map = L.map(el, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    if (onMapReady) onMapReady(map);

    // Try geolocation silently
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;

          const userIcon = L.divIcon({
            className: "",
            html: `
              <div style="position:relative;width:22px;height:22px;">
                <div style="position:absolute;inset:0;border-radius:50%;background:rgba(180,100,20,0.22);animation:pulse-user 2s infinite;"></div>
                <div style="position:absolute;inset:4px;border-radius:50%;background:#c97e2e;border:2px solid white;box-shadow:0 2px 8px rgba(180,100,20,0.45);"></div>
              </div>
              <style>
                @keyframes pulse-user{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(2.4);opacity:0}}
              </style>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            popupAnchor: [0, -14],
          });

          L.marker([lat, lng], { icon: userIcon })
            .addTo(map)
            .bindPopup('<span style="font-size:13px;font-weight:600">📍 You are here</span>');

          map.flyTo([lat, lng], 15, { duration: 1.6 });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "420px",
        minHeight: "300px",
        ...style,
      }}
    />
  );
}

export default MapView;