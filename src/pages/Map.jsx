import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { Box, Typography, LinearProgress, Alert, Button } from "@mui/material";
import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";
import Cookies from "js-cookie";
import "leaflet/dist/leaflet.css";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReactDOMServer from "react-dom/server";

// Leaflet icon fix
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const createShipmentIcon = () =>
  new L.DivIcon({
    html: ReactDOMServer.renderToString(
      <LocalShippingIcon
        sx={{
          color: "#1976d2",
          fontSize: "3rem",
          backgroundColor: "rgba(255,255,255,0.7)",
          borderRadius: "50%",
          padding: "2px",
        }}
      />
    ),
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && !isNaN(position[0]) && !isNaN(position[1])) {
      map.flyTo(position, 13);
      map.invalidateSize();
    }
  }, [position, map]);
  return null;
};

const geocodeCity = async (cityName) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`
    );
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    console.warn(`Geocode başarısız: ${cityName} için koordinat bulunamadı`);
    return null;
  } catch (err) {
    console.error("Geocode error:", err);
    return null;
  }
};

const Map = () => {
  const [shipments, setShipments] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});
  const [staticLocations, setStaticLocations] = useState([]);
  const [focusedLocation, setFocusedLocation] = useState([39.925, 32.866]); // Ankara
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const connectionRef = useRef(null);
  const trackedShipments = useRef(new Set());
  const hasFetched = useRef(false);
  const shipmentIcon = createShipmentIcon();

  // 🚚 Kargoları getir
  useEffect(() => {
    let isMounted = true;

    const fetchShipments = async () => {
      if (hasFetched.current) {
        console.log("fetchShipments zaten çağrıldı, tekrar çağrılmadı.");
        return;
      }
      hasFetched.current = true;

      try {
        const token = Cookies.get("auth_token");
        if (!token) throw new Error("Oturum bilgisi eksik. Lütfen tekrar giriş yapın.");

        const res = await fetch("http://localhost:5002/api/Shipments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`API hatası: ${res.statusText}`);

        const data = await res.json();
        if (!isMounted) return;

        setShipments(data);
        const initialLocations = {};
        const staticCoords = [];

        for (const s of data) {
          if (
            s.senderLatitude &&
            s.senderLongitude &&
            !isNaN(s.senderLatitude) &&
            !isNaN(s.senderLongitude) &&
            s.senderLatitude !== 0 &&
            s.senderLongitude !== 0
          ) {
            initialLocations[s.id] = { lat: s.senderLatitude, lng: s.senderLongitude };
          }

          if (s.origin) {
            const coord = await geocodeCity(s.origin);
            if (coord && !isNaN(coord.lat) && !isNaN(coord.lng)) {
              staticCoords.push({ shipmentId: s.id, type: "origin", label: s.origin, position: coord });
            }
          }

          if (s.destination) {
            const coord = await geocodeCity(s.destination);
            if (coord && !isNaN(coord.lat) && !isNaN(coord.lng)) {
              staticCoords.push({ shipmentId: s.id, type: "destination", label: s.destination, position: coord });
            }
          }
        }

        setLiveLocations(initialLocations);
        setStaticLocations(staticCoords);

        const firstLocation = Object.values(initialLocations)[0] || staticCoords[0]?.position;
        if (firstLocation) setFocusedLocation([firstLocation.lat, firstLocation.lng]);
      } catch (err) {
        if (isMounted) setError("Veri yükleme hatası: " + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchShipments();
    return () => {
      isMounted = false;
      hasFetched.current = false;
    };
  }, []);

  // 🔌 SignalR bağlantısı kur
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:8082/trackingHub", {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000])
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;
    let stopped = false;

    connection.on("ReceiveLocationUpdate", (message) => {
      if (
        message.latitude &&
        message.longitude &&
        !isNaN(message.latitude) &&
        !isNaN(message.longitude)
      ) {
        const newPosition = { lat: message.latitude, lng: message.longitude };
        setLiveLocations((prev) => ({
          ...prev,
          [message.shipmentId]: newPosition,
        }));
        setFocusedLocation([newPosition.lat, newPosition.lng]);
      } else {
        console.warn(`Geçersiz SignalR konumu:`, message);
      }
    });

    const startConnection = async () => {
      try {
        await connection.start();
        if (!stopped) {
          setIsConnected(true);
          setError("");
          console.log("✅ SignalR Connected!");
        }
      } catch (e) {
        if (!stopped) {
          console.error("❌ SignalR bağlantı hatası:", e);
          setError("Canlı bağlantı kurulamadı: " + e.message);
        }
      }
    };

    startConnection();

    return () => {
      stopped = true;
      connection.stop().catch((err) => console.error("SignalR stop error:", err));
    };
  }, []);

  // 🚨 Kargoları takip et
  useEffect(() => {
    if (connectionRef.current && isConnected && shipments.length > 0) {
      shipments.forEach((s) => {
        if (!trackedShipments.current.has(s.id)) {
          connectionRef.current
            .invoke("TrackShipment", s.id.toString())
            .then(() => {
              console.log(`📦 ${s.id} takip ediliyor.`);
              trackedShipments.current.add(s.id);
            })
            .catch((err) => console.error(`❌ TrackShipment(${s.id}) hatası:`, err));
        }
      });
    }
  }, [isConnected, shipments]);

  // Rota çizgileri oluştur
  const routes = shipments.map((shipment) => {
    const origin = staticLocations.find(
      (loc) => loc.shipmentId === shipment.id && loc.type === "origin"
    );
    const destination = staticLocations.find(
      (loc) => loc.shipmentId === shipment.id && loc.type === "destination"
    );

    if (origin && destination) {
      return {
        shipmentId: shipment.id,
        positions: [
          [origin.position.lat, origin.position.lng],
          [destination.position.lat, destination.position.lng],
        ],
      };
    }
    return null;
  }).filter((route) => route !== null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Typography variant="h4" p={2}>
        Canlı Gönderi Takibi
      </Typography>

      {loading && <LinearProgress />}
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Yeniden Dene
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ flexGrow: 1 }}>
        {!loading && !error && (
          <MapContainer
            center={focusedLocation}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater position={focusedLocation} />

            {Object.entries(liveLocations).map(([id, pos]) => {
              const shipment = shipments.find((s) => s.id === parseInt(id));
              return (
                <Marker key={`live-${id}`} position={[pos.lat, pos.lng]} icon={shipmentIcon}>
                  <Popup>
                    <strong>ID:</strong> {id} <br />
                    <strong>Çıkış:</strong> {shipment?.origin || "Bilinmiyor"} <br />
                    <strong>Varış:</strong> {shipment?.destination || "Bilinmiyor"} <br />
                    <strong>Durum:</strong> {shipment?.status || "Bilinmiyor"}
                  </Popup>
                </Marker>
              );
            })}

            {staticLocations.map((loc, i) => (
              <Marker key={`static-${i}`} position={[loc.position.lat, loc.position.lng]}>
                <Popup>
                  <strong>{loc.type === "origin" ? "Çıkış" : "Varış"}:</strong> {loc.label}
                  <br />
                  Gönderi ID: {loc.shipmentId}
                </Popup>
              </Marker>
            ))}

            {routes.map((route) => (
              <Polyline
                key={`route-${route.shipmentId}`}
                positions={route.positions}
                color="#1976d2"
                weight={4}
                opacity={0.7}
                dashArray="10, 10" // Opsiyonel: kesikli çizgi stili
              />
            ))}
          </MapContainer>
        )}
      </Box>
    </Box>
  );
};

export default Map;