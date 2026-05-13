import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Fix Leaflet default icon paths broken by bundlers ──────────────────────
// Must be done lazily (inside a function) so it doesn't execute at module
// parse time in environments where `L.Icon.Default.prototype` may not exist.
function fixLeafletIcons() {
  try {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  } catch (_) {}
}

// ── Create user icon lazily so L.divIcon only runs after Leaflet is ready ──
function createUserIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:22px;height:22px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:rgba(180,100,20,0.22);
          animation:pulse-user 2s infinite;
        "></div>
        <div style="
          position:absolute;inset:4px;border-radius:50%;
          background:#c97e2e;
          border:2px solid white;
          box-shadow:0 2px 8px rgba(180,100,20,0.45);
        "></div>
      </div>
      <style>
        @keyframes pulse-user{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(2.4);opacity:0}}
      </style>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

const ACCRA = { lat: 5.6037, lng: -0.187 };
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Flies the map to a new position when it changes */
function LocationUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 15, { duration: 1.6 });
  }, [position, map]);
  return null;
}

/**
 * MapView
 * Props:
 *   className       – extra CSS classes
 *   style           – inline styles
 *   initialCenter   – { lat, lng } fallback (defaults to Accra)
 *   initialZoom     – fallback zoom (default 12)
 *   onMapReady      – callback(leafletMap)
 */
export function MapView({
  className = "",
  style = {},
  initialCenter = ACCRA,
  initialZoom = 12,
  onMapReady,
}) {
  const [userPosition, setUserPosition] = useState(null);
  const [locating, setLocating] = useState(true);
  const mapRef = useRef(null);
  const userIconRef = useRef(null);

  // Fix icons + create user icon once on mount
  useEffect(() => {
    fixLeafletIcons();
    userIconRef.current = createUserIcon();
  }, []);

  // Silently try geolocation — permission was already asked by the app-level modal
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    const timeoutId = setTimeout(() => setLocating(false), 10000); // hard fallback
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        clearTimeout(timeoutId);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height: "420px", minHeight: "300px", ...style }}
    >
      {/* Small locating badge — doesn't cover the map */}
      {locating && (
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, background: "rgba(255,255,255,0.92)",
          borderRadius: 20, padding: "5px 14px",
          fontSize: 12, fontWeight: 600, color: "#7a5a2a",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "center", gap: 6,
          pointerEvents: "none",
        }}>
          <span style={{
            display: "inline-block", width: 10, height: 10, borderRadius: "50%",
            border: "2px solid #c97e2e", borderTopColor: "transparent",
            animation: "spin-map .8s linear infinite",
          }} />
          <style>{`@keyframes spin-map{to{transform:rotate(360deg)}}`}</style>
          Locating you…
        </div>
      )}

      <MapContainer
        key="map"
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={initialZoom}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
        ref={(map) => {
          if (map && !mapRef.current) {
            mapRef.current = map;
            if (onMapReady) onMapReady(map);
          }
        }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

        {userPosition && <LocationUpdater position={userPosition} />}

        {userPosition && userIconRef.current && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIconRef.current}>
            <Popup>
              <span style={{ fontSize: 13, fontWeight: 600 }}>📍 You are here</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
