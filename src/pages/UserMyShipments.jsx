import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import {
  Alert,
  Box,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const defaultIcon = new L.Icon({
  iconUrl: 'leaflet/dist/images/marker-icon.png',
  iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const API_BASE_URL = 'http://localhost:5002';
const SIGNALR_HUB_URL = 'http://localhost:8082/trackingHub';
const DEFAULT_CENTER = [39.925, 32.866];

const debugLog = (...args) => console.log('[MyShipments Debug]:', ...args);

const toLatLngArray = (position) => {
  if (!position) {
    debugLog('toLatLngArray: Position is null or undefined');
    return null;
  }
  if (Array.isArray(position)) {
    debugLog('toLatLngArray: Position is already an array:', position);
    return position;
  }
  if (position.lat !== undefined && position.lng !== undefined) {
    const result = [position.lat, position.lng];
    debugLog('toLatLngArray: Converted object to array:', result);
    return result;
  }
  debugLog('toLatLngArray: Invalid position format:', position);
  return null;
};

const getStatusChipProps = (status) => {
  switch (status) {
    case 'Created': return { label: 'Oluşturuldu', color: 'primary' };
    case 'InTransit': return { label: 'Yolda', color: 'warning' };
    case 'Delivered': return { label: 'Teslim Edildi', color: 'success' };
    case 'Exception': return { label: 'Sorunlu', color: 'error' };
    default: return { label: status || 'Bilinmiyor', color: 'default' };
  }
};

const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A');

const geocodeCity = async (cityName) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`);
  const data = await response.json();
  return data.length > 0 ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
};

const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    const positionArray = toLatLngArray(position);
    debugLog('MapUpdater: Position received:', position, 'Converted to:', positionArray);
    if (positionArray && !isNaN(positionArray[0]) && !isNaN(positionArray[1])) {
      debugLog('MapUpdater: Flying to position:', positionArray);
      map.flyTo(positionArray, 10);
      map.invalidateSize();
    }
  }, [position, map]);
  return null;
};

const MyShipments = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [staticLocations, setStaticLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef(null);
  const mapRef = useRef(null);

  const getUserId = () => {
    const token = Cookies.get('auth_token');
    if (!token) return null;
    try {
      const decoded = jwt_decode(token);
      debugLog('Decoded token:', decoded);
      return decoded.sub || decoded.id || null;
    } catch (err) {
      debugLog('Error decoding token:', err);
      return null;
    }
  };

  const fetchUserShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get('auth_token');
      const userId = getUserId();
      if (!token || !userId) throw new Error('Oturum jetonu veya kullanıcı ID bulunamadı.');
      const response = await fetch(`${API_BASE_URL}/api/Shipments/GetShipmentsByUserId?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      debugLog('Fetched shipments:', data);
      setShipments(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setFilteredShipments(data);
      const coords = [];
      for (const shipment of data) {
        if (shipment.origin) {
          const coord = await geocodeCity(shipment.origin);
          if (coord) coords.push({ shipmentId: shipment.id, type: 'origin', label: shipment.origin, position: coord });
        }
        if (shipment.destination) {
          const coord = await geocodeCity(shipment.destination);
          if (coord) coords.push({ shipmentId: shipment.id, type: 'destination', label: shipment.destination, position: coord });
        }
      }
      debugLog('Static locations:', coords);
      setStaticLocations(coords);
    } catch (err) {
      debugLog('Error in fetchUserShipments:', err);
      setError(`Veri yüklenirken bir hata oluştu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      jwt_decode(token);
      fetchUserShipments();
    } catch (err) {
      Cookies.remove('auth_token');
      navigate('/login');
    }
  }, [navigate, fetchUserShipments]);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, { skipNegotiation: true, transport: HttpTransportType.WebSockets })
      .withAutomaticReconnect([0, 1000, 3000]) // Optimize edilmiş zamanlama
      .configureLogging(LogLevel.Information)
      .build();
    connectionRef.current = connection;

    connection.on('ReceiveLocationUpdate', (message) => {
      if (message.latitude && message.longitude && !isNaN(message.latitude) && !isNaN(message.longitude) && selectedShipment && message.shipmentId === selectedShipment.id) {
        setLiveLocation([message.latitude, message.longitude]);
      }
    });

    const startConnection = async () => {
      try {
        await connection.start();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        debugLog('SignalR connection error:', err);
        setError('Canlı bağlantı kurulamadı: ' + err.message);
      }
    };
    startConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch((err) => debugLog('SignalR stop error:', err));
      }
    };
  }, []);

  useEffect(() => {
    if (connectionRef.current && isConnected && selectedShipment) {
      connectionRef.current.invoke('TrackShipment', selectedShipment.id.toString())
        .catch((err) => debugLog(`TrackShipment error for ${selectedShipment.id}:`, err));
    }
  }, [isConnected, selectedShipment]);

  const handleSelectShipment = (shipment) => {
    debugLog('Selected shipment:', shipment);
    setSelectedShipment(shipment);
    if (shipment.senderLatitude && shipment.senderLongitude && !isNaN(shipment.senderLatitude) && !isNaN(shipment.senderLongitude)) {
      setLiveLocation([shipment.senderLatitude, shipment.senderLongitude]);
    } else {
      const originCoord = staticLocations.find((loc) => loc.shipmentId === shipment.id && loc.type === 'origin');
      setLiveLocation(originCoord ? [originCoord.position.lat, originCoord.position.lng] : null);
    }
    // Route’u güncelle
    const route = staticLocations
      .filter((loc) => loc.shipmentId === shipment.id)
      .reduce((acc, loc) => {
        if (loc.type === 'origin') acc.origin = toLatLngArray(loc.position);
        if (loc.type === 'destination') acc.destination = toLatLngArray(loc.position);
        return acc;
      }, { origin: null, destination: null });
    // Harita için geçerli bir merkez ayarla
    const newMapCenter = toLatLngArray([shipment.senderLatitude, shipment.senderLongitude]) || toLatLngArray(route.origin) || DEFAULT_CENTER;
    setLiveLocation(newMapCenter); // Doğrudan güncellenmiş konumu ayarla
  };

  const route = selectedShipment
    ? staticLocations
        .filter((loc) => loc.shipmentId === selectedShipment.id)
        .reduce((acc, loc) => {
          if (loc.type === 'origin') acc.origin = toLatLngArray(loc.position);
          if (loc.type === 'destination') acc.destination = toLatLngArray(loc.position);
          return acc;
        }, { origin: null, destination: null })
    : null;

  const routePositions = route && route.origin && route.destination ? [route.origin, route.destination] : [];
  const mapCenter = toLatLngArray(liveLocation) || toLatLngArray(route?.origin) || DEFAULT_CENTER;
  debugLog('Current liveLocation:', liveLocation);
  debugLog('Current route:', route);
  debugLog('Current mapCenter:', mapCenter);

  useEffect(() => {
    if (mapRef.current) {
      debugLog('Map initialized:', mapRef.current);
      mapRef.current.invalidateSize();
    }
  }, [selectedShipment, mapRef]);

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: '#fffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: '100%' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <TrackChangesIcon color="primary" />
          <Typography variant="h5" component="h1" fontWeight="bold">Gönderi Takip</Typography>
        </Stack>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        <TextField label="Gönderi ID veya Takip Numarası Ara" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} variant="outlined" fullWidth sx={{ mb: 3 }} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3} sx={{ height: 'calc(100% - 120px)' }}>
            <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
              <TableContainer sx={{ maxHeight: '100%', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead><TableRow sx={{ '& th': { fontWeight: 'bold', color: 'text.secondary', bgcolor: 'grey.50' } }}><TableCell>Takip No</TableCell><TableCell>Çıkış → Varış</TableCell><TableCell align="center">Durum</TableCell><TableCell>Tarih</TableCell></TableRow></TableHead>
                  <TableBody>
                    {filteredShipments.length === 0 ? (
                      <TableRow><TableCell colSpan={4} align="center"><Typography color="text.secondary">Gönderi bulunamadı.</Typography></TableCell></TableRow>
                    ) : (
                      filteredShipments.map((shipment) => (
                        <TableRow key={shipment.id} hover onClick={() => handleSelectShipment(shipment)} sx={{ cursor: 'pointer', backgroundColor: selectedShipment?.id === shipment.id ? 'action.selected' : 'inherit' }}>
                          <TableCell><Typography variant="body2" fontWeight="bold">{shipment.trackingNumber}</Typography></TableCell>
                          <TableCell>{shipment.origin} → {shipment.destination}</TableCell>
                          <TableCell align="center"><Chip {...getStatusChipProps(shipment.status)} size="small" /></TableCell>
                          <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
              <Box sx={{ height: '500px', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                {selectedShipment ? (
                  <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%' }} ref={mapRef}>
                    <TileLayer attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater position={mapCenter} />
                    {liveLocation && toLatLngArray(liveLocation) && (
                      <Marker position={toLatLngArray(liveLocation)} icon={defaultIcon}>
                        <Popup><Typography><strong>Gönderi ID:</strong> {selectedShipment.id} <br /><strong>Takip No:</strong> {selectedShipment.trackingNumber} <br /><strong>Konum:</strong> {liveLocation[0].toFixed(6)}, {liveLocation[1].toFixed(6)} <br /><strong>Durum:</strong> {selectedShipment.status}</Typography></Popup>
                      </Marker>
                    )}
                    {routePositions.length > 0 && <Polyline positions={routePositions} color="#1976d2" weight={4} opacity={0.7} dashArray="10, 10" />}
                    {route?.origin && <Marker position={route.origin}><Popup>Çıkış: {selectedShipment.origin}</Popup></Marker>}
                    {route?.destination && <Marker position={route.destination}><Popup>Varış: {selectedShipment.destination}</Popup></Marker>}
                  </MapContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                    <Typography color="text.secondary">Lütfen bir gönderi seçin veya arama yapın.</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default MyShipments; 