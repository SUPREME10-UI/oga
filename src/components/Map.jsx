import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Pulsing "you are here" icon
const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:22px;height:22px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(59,130,246,0.25);
        animation:pulse-ring 2s infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;border-radius:50%;
        background:#3b82f6;border:2px solid white;
        box-shadow:0 2px 8px rgba(59,130,246,0.5);
      "></div>
    </div>
    <style>
      @keyframes pulse-ring{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(2.4);opacity:0}}
      @keyframes spin-anim{to{transform:rotate(360deg)}}
      @keyframes modal-in{from{opacity:0;transform:scale(.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
      @keyframes backdrop-in{from{opacity:0}to{opacity:1}}
    </style>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

const ACCRA = { lat: 5.6037, lng: -0.187 };

const TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function LocationUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 15, { duration: 1.6 });
  }, [position, map]);
  return null;
}

/* ─── Permission Modal ─────────────────────────────────────────────────────── */
function LocationModal({ onAllow, onDeny }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(6px)",
        animation: "backdrop-in .25s ease",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          maxWidth: 380,
          width: "100%",
          overflow: "hidden",
          animation: "modal-in .3s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Top gradient banner */}
        <div
          style={{
            background: "linear-gradient(135deg,#1e40af 0%,#3b82f6 60%,#60a5fa 100%)",
            padding: "32px 24px 28px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position:"absolute",top:-30,right:-30,width:100,height:100,
            borderRadius:"50%",background:"rgba(255,255,255,0.08)"
          }}/>
          <div style={{
            position:"absolute",bottom:-20,left:-20,width:70,height:70,
            borderRadius:"50%",background:"rgba(255,255,255,0.06)"
          }}/>

          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              background: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>

          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-.3px" }}>
            Enable Location
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
            OgaHub wants to show artisans near you
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {/* Feature bullets */}
          {[
            { icon: "🔍", text: "Find skilled artisans in your area" },
            { icon: "⚡", text: "Get faster connections to local pros" },
            { icon: "🔒", text: "Your location is never shared publicly" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>{text}</span>
            </div>
          ))}

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
            <button
              onClick={onAllow}
              style={{
                width: "100%",
                padding: "13px",
                background: "linear-gradient(135deg,#2563eb,#3b82f6)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
                transition: "opacity .15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = ".88")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              📍 Allow Location Access
            </button>
            <button
              onClick={onDeny}
              style={{
                width: "100%",
                padding: "12px",
                background: "transparent",
                color: "#94a3b8",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "border-color .15s, color .15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.color = "#64748b";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              Not now
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#cbd5e1", marginTop: 14 }}>
            You can change this in your browser settings anytime
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── MapView ──────────────────────────────────────────────────────────────── */
export function MapView({
  className = "",
  initialCenter = ACCRA,
  initialZoom = 12,
  onMapReady,
}) {
  // "idle" | "pending" | "locating" | "done" | "denied"
  const [phase, setPhase] = useState("idle");
  const [userPosition, setUserPosition] = useState(null);
  const mapRef = useRef(null);

  // Show the modal immediately on mount
  useEffect(() => {
    setPhase("pending");
  }, []);

  function requestLocation() {
    setPhase("locating");
    if (!navigator.geolocation) {
      setPhase("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPhase("done");
      },
      () => {
        setPhase("denied");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function denyLocation() {
    setPhase("denied");
  }

  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: 300 }}>
      {/* Permission modal */}
      {phase === "pending" && (
        <LocationModal onAllow={requestLocation} onDeny={denyLocation} />
      )}

      {/* Locating spinner overlay */}
      {phase === "locating" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(4px)",
            gap: 12,
            borderRadius: "inherit",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "3px solid #3b82f6",
              borderTopColor: "transparent",
              animation: "spin-anim .8s linear infinite",
            }}
          />
          <p style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
            Getting your location…
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

      {/* Location denied notice */}
      {phase === "denied" && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9000,
            background: "rgba(30,41,59,0.85)",
            color: "#e2e8f0",
            borderRadius: 10,
            padding: "7px 16px",
            fontSize: 12,
            whiteSpace: "nowrap",
            backdropFilter: "blur(4px)",
          }}
        >
          📍 Showing default area — location access was not granted
        </div>
      )}
    </div>
  );
}

export default MapView;
