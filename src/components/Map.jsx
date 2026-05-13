import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Pulsing "you are here" icon
const userIcon = L.divIcon({
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
        background:oklch(0.62 0.16 55);
        border:2px solid white;
        box-shadow:0 2px 8px rgba(180,100,20,0.45);
      "></div>
    </div>
    <style>
      @keyframes pulse-user{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(2.4);opacity:0}}
      @keyframes spin-map{to{transform:rotate(360deg)}}
    </style>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

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

  // Silently try geolocation — permission was already asked by the app-level modal
  useEffect(() => {
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height: "420px", minHeight: "300px", ...style }}
    >
      {/* Subtle locating spinner */}
      {locating && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 500,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 10,
          background: "rgba(250,246,240,0.80)", backdropFilter: "blur(4px)",
          borderRadius: "inherit",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "3px solid oklch(0.62 0.16 55)",
            borderTopColor: "transparent",
            animation: "spin-map .8s linear infinite",
          }}/>
          <p style={{ fontSize: 13, color: "oklch(0.42 0.03 60)", fontWeight: 500 }}>
            Locating you…
          </p>
        </div>
      )}

      <MapContainer
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

        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
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
