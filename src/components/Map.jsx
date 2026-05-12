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
        position: "absolute",   /* scoped to the map container, not the whole page */
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(30,20,10,0.52)",
        backdropFilter: "blur(6px)",
        borderRadius: "inherit",
        animation: "backdrop-in .25s ease",
      }}
    >
      <div
        style={{
          /* warm cream background matching app --card color */
          background: "oklch(1 0 0)",
          borderRadius: "18px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          maxWidth: 340,
          width: "100%",
          overflow: "hidden",
          animation: "modal-in .3s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Top gradient banner — craft gradient (amber/orange) */}
        <div
          style={{
            background: "linear-gradient(135deg, oklch(0.50 0.16 45) 0%, oklch(0.62 0.16 55) 55%, oklch(0.70 0.15 65) 100%)",
            padding: "28px 24px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div style={{ position:"absolute",top:-28,right:-28,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }}/>
          <div style={{ position:"absolute",bottom:-18,left:-18,width:65,height:65,borderRadius:"50%",background:"rgba(255,255,255,0.06)" }}/>

          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              background: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>

          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 5px", letterSpacing: "-.3px" }}>
            Enable Location
          </h2>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
            OgaHub wants to show artisans near you
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
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
                gap: 10,
                padding: "9px 0",
                /* warm border matching app --border color */
                borderBottom: "1px solid oklch(0.88 0.02 75)",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              {/* muted-foreground color from app palette */}
              <span style={{ fontSize: 12.5, color: "oklch(0.42 0.03 60)", lineHeight: 1.4 }}>{text}</span>
            </div>
          ))}

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 18 }}>
            <button
              onClick={onAllow}
              style={{
                width: "100%",
                padding: "12px",
                /* primary amber/orange matching app --primary */
                background: "linear-gradient(135deg, oklch(0.55 0.16 50), oklch(0.65 0.16 58))",
                color: "#fff",
                border: "none",
                borderRadius: 11,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(180,100,20,0.35)",
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
                padding: "11px",
                background: "transparent",
                /* muted-foreground */
                color: "oklch(0.52 0.03 60)",
                /* border color from app palette */
                border: "1.5px solid oklch(0.88 0.02 75)",
                borderRadius: 11,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                transition: "border-color .15s, color .15s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "oklch(0.75 0.05 65)"; e.currentTarget.style.color = "oklch(0.35 0.04 60)"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "oklch(0.88 0.02 75)"; e.currentTarget.style.color = "oklch(0.52 0.03 60)"; }}
            >
              Not now
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 10.5, color: "oklch(0.70 0.02 70)", marginTop: 12 }}>
            You can change this in browser settings anytime
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── MapView ──────────────────────────────────────────────────────────────── */
export function MapView({
  className = "",
  style = {},
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
    <div
      className={`relative w-full ${className}`}
      style={{ height: '420px', minHeight: '300px', ...style }}
    >
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
