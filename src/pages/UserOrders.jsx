import React, { useState, useEffect, useCallback } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { useTheme } from '@mui/material/styles';

// Material-UI Components & Icons
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  MenuItem,
  Select,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SendIcon from '@mui/icons-material/Send';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Leaflet icon fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5002';
const NOTIFICATION_HUB_URL = 'http://localhost:8086/notifyhub';
const USERS_API_URL = 'http://localhost:8084/api/Users/GetUsers';
const DEFAULT_CENTER = [39.925, 32.866]; // Ankara
const DEBUG = true;

// --- Helper Functions ---
const debugLog = (...args) => {
  if (DEBUG) {
    console.log('[ShipmentForm Debug]:', ...args);
  }
};

const generateTrackingNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let trackingNumber = '';
  for (let i = 0; i < 15; i++) {
    trackingNumber += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return trackingNumber;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Created':
      return 'text-primary';
    case 'InTransit':
      return 'text-warning';
    case 'Delivered':
      return 'text-success';
    case 'Exception':
      return 'text-danger';
    default:
      return 'text-secondary';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('tr-TR');
};

// Harita için tıklama bileşeni
const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// --- Component ---
const ShipmentForm = () => {
  const navigate = useNavigate();
  const [hubConnection, setHubConnection] = useState(null);
  const [notification, setNotification] = useState(null);
  const [senderMarker, setSenderMarker] = useState(null);
  const [receiverMarker, setReceiverMarker] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState('');
  const theme = useTheme();

  const [formData, setFormData] = useState({
    trackingNumber: generateTrackingNumber(),
    sender: '',
    receiver: '',
    origin: '',
    destination: '',
    senderLatitude: '',
    senderLongitude: '',
    receiverLatitude: '',
    receiverLongitude: '',
    receiverUserId: '', // String olarak tanımlandı
  });

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kullanıcıları Fetch Et
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get('auth_token');
        const response = await fetch(USERS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (!response.ok) throw new Error('Kullanıcılar yüklenirken hata oluştu');
        const data = await response.json();
        const currentUser = jwt_decode(token).unique_name;
        const filteredUsers = data.filter(user => user.username !== currentUser);
        setUsers(filteredUsers);
      } catch (err) {
        debugLog('Error fetching users:', err);
        setError('Kullanıcılar yüklenirken bir hata oluştu.');
      }
    };
    fetchUsers();
  }, []);

  // SignalR Connection Setup
  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${NOTIFICATION_HUB_URL}?access_token=${token}`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveNotification', (message) => {
      debugLog('Received notification:', message);
      setNotification(message);
      fetchUserShipments();
    });

    connection.onclose(() => {
      debugLog('SignalR Connection closed, attempting to reconnect...');
      setError('Bağlantı kesildi, yeniden bağlanılıyor...');
    });

    const startConnection = async () => {
      try {
        await connection.start();
        debugLog('SignalR Connected!');
        setHubConnection(connection);
        setError(null);
      } catch (err) {
        debugLog('SignalR Connection Error:', err);
        setError(`SignalR Bağlantı Hatası: ${err.message}`);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      if (hubConnection) {
        hubConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) {
      debugLog('No auth token found, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        debugLog('Token expired, redirecting to login');
        Cookies.remove('auth_token');
        navigate('/login');
        return;
      }

      debugLog('Token decoded successfully:', { username: decodedToken.unique_name });
      setFormData((prev) => ({
        ...prev,
        sender: decodedToken.unique_name,
      }));
      fetchUserShipments();
    } catch (error) {
      debugLog('Error decoding token:', error);
      Cookies.remove('auth_token');
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserShipments = async () => {
    debugLog('Fetching user shipments...');
    try {
      const token = Cookies.get('auth_token');
      if (!token) {
        debugLog('No auth token found during fetch');
        setError('Oturum bilgisi bulunamadı.');
        setLoading(false);
        return;
      }

      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId || decodedToken.sub || decodedToken.unique_name; // userId'yi token'dan al
      debugLog('User ID from token:', userId);

      const response = await fetch(`${API_BASE_URL}/api/Shipments/GetShipmentsByUserId?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      debugLog('Fetch response status:', response.status);
      debugLog('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        debugLog('Error response body:', errorText);

        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.title || 'Sunucu hatası oluştu';
        } catch {
          errorMessage = errorText || 'Sunucu hatası oluştu';
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      debugLog('Fetched shipments:', data);
      setShipments(data);
      setLoading(false);
    } catch (error) {
      debugLog('Error in fetchUserShipments:', error);
      setError(`Gönderiler yüklenirken bir hata oluştu: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    debugLog('Submitting form with raw data:', formData);

    try {
      const token = Cookies.get('auth_token');
      if (!token) {
        debugLog('No auth token found during submission');
        setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      debugLog('Auth token for submission:', 'Present');

      if (!formData.sender || formData.sender.length < 2 || formData.sender.length > 100) {
        setError('Gönderici bilgisi geçersiz.');
        return;
      }

      if (!selectedReceiver) {
        setError('Lütfen bir alıcı seçin.');
        return;
      }

      const selectedUser = users.find(user => user.username === selectedReceiver);
      if (!selectedUser || !selectedUser.userId) {
        setError('Seçilen alıcı geçersiz veya userId eksik.');
        return;
      }

      const sanitizedCoordinates = {
        senderLatitude: formData.senderLatitude.toString().replace(',', '.'),
        senderLongitude: formData.senderLongitude.toString().replace(',', '.'),
        receiverLatitude: formData.receiverLatitude.toString().replace(',', '.'),
        receiverLongitude: formData.receiverLongitude.toString().replace(',', '.'),
      };

      const parsedCoordinates = {
        senderLatitude: parseFloat(sanitizedCoordinates.senderLatitude),
        senderLongitude: parseFloat(sanitizedCoordinates.senderLongitude),
        receiverLatitude: parseFloat(sanitizedCoordinates.receiverLatitude),
        receiverLongitude: parseFloat(sanitizedCoordinates.receiverLongitude),
      };

      const validationErrors = [];
      if (parsedCoordinates.senderLatitude === 0 && parsedCoordinates.senderLongitude === 0) {
        validationErrors.push('Gönderici koordinatları 0,0 olamaz');
      } else {
        if (isNaN(parsedCoordinates.senderLatitude) || parsedCoordinates.senderLatitude < -90 || parsedCoordinates.senderLatitude > 90) {
          validationErrors.push('Gönderici enlemi -90 ile 90 arasında olmalıdır');
        }
        if (isNaN(parsedCoordinates.senderLongitude) || parsedCoordinates.senderLongitude < -180 || parsedCoordinates.senderLongitude > 180) {
          validationErrors.push('Gönderici boylamı -180 ile 180 arasında olmalıdır');
        }
      }

      if (parsedCoordinates.receiverLatitude === 0 && parsedCoordinates.receiverLongitude === 0) {
        validationErrors.push('Alıcı koordinatları 0,0 olamaz');
      } else {
        if (isNaN(parsedCoordinates.receiverLatitude) || parsedCoordinates.receiverLatitude < -90 || parsedCoordinates.receiverLatitude > 90) {
          validationErrors.push('Alıcı enlemi -90 ile 90 arasında olmalıdır');
        }
        if (isNaN(parsedCoordinates.receiverLongitude) || parsedCoordinates.receiverLongitude < -180 || parsedCoordinates.receiverLongitude > 180) {
          validationErrors.push('Alıcı boylamı -180 ile 180 arasında olmalıdır');
        }
      }

      if (validationErrors.length > 0) {
        debugLog('Coordinate validation errors:', validationErrors);
        setError(validationErrors.join('\n'));
        return;
      }

      const processedFormData = {
        ...formData,
        receiver: selectedReceiver,
        receiverUserId: selectedUser.userId.toString(), // Number'ı string'e çevir
        ...parsedCoordinates,
        trackingNumber: formData.trackingNumber.toUpperCase(),
      };

      const response = await fetch(`${API_BASE_URL}/api/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(processedFormData),
      });

      debugLog('Submit response status:', response.status);
      debugLog('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        debugLog('Error response body:', errorText);

        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors) {
            errorMessage = Object.entries(errorJson.errors)
              .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
              .join('\n');
          } else {
            errorMessage = errorJson.message || errorJson.title || 'Gönderi oluşturulurken bir hata oluştu';
          }
        } catch {
          errorMessage = errorText || 'Gönderi oluşturulurken bir hata oluştu';
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      debugLog('Submit success result:', result);
      alert('Gönderi başarıyla oluşturuldu!');
      fetchUserShipments();

      setFormData((prev) => ({
        trackingNumber: generateTrackingNumber(),
        sender: prev.sender,
        receiver: '',
        origin: '',
        destination: '',
        senderLatitude: '0',
        senderLongitude: '0',
        receiverLatitude: '0',
        receiverLongitude: '0',
        receiverUserId: '', // Sıfırlama
      }));
      setSelectedReceiver('');
      setSenderMarker(null);
      setReceiverMarker(null);
    } catch (error) {
      debugLog('Error in handleSubmit:', error);
      setError(`Gönderi oluşturulurken bir hata oluştu:\n${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReceiverChange = (e) => {
    const selectedUser = users.find(user => user.username === e.target.value);
    setSelectedReceiver(e.target.value);
    setFormData((prev) => ({
      ...prev,
      receiver: e.target.value,
      receiverUserId: selectedUser ? selectedUser.userId.toString() : '', // Number'ı string'e çevir
    }));
  };

  const handleSenderMapClick = (coords) => {
    debugLog('Sender map clicked, coords:', coords);
    setSenderMarker(coords);
    setFormData((prev) => ({
      ...prev,
      senderLatitude: coords[0].toFixed(6),
      senderLongitude: coords[1].toFixed(6),
    }));
  };

  const handleReceiverMapClick = (coords) => {
    debugLog('Receiver map clicked, coords:', coords);
    setReceiverMarker(coords);
    setFormData((prev) => ({
      ...prev,
      receiverLatitude: coords[0].toFixed(6),
      receiverLongitude: coords[1].toFixed(6),
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        message={notification}
      />

      {/* --- FORM SECTION --- */}
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <AddCircleOutlineIcon color="primary" />
              <Typography variant="h5" component="h1" fontWeight="bold">
                Yeni Gönderi
              </Typography>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ whiteSpace: 'pre-line', borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Takip Numarası"
              id="trackingNumber"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleChange}
              pattern="[A-Z0-9]{6,}"
              title="En az 6 karakter uzunluğunda, sadece büyük harf ve rakamlardan oluşmalı"
              required
              variant="outlined"
              fullWidth
              placeholder="Örnek: ABC123"
            />
            <TextField
              label="Gönderici"
              id="sender"
              name="sender"
              value={formData.sender}
              InputProps={{ readOnly: true }}
              variant="outlined"
              fullWidth
            />
            <Select
              label="Alıcı"
              id="receiver"
              name="receiver"
              value={selectedReceiver}
              onChange={handleReceiverChange}
              required
              variant="outlined"
              fullWidth
              displayEmpty
              renderValue={(value) => value || 'Alıcı seçin'}
            >
              {users.map((user) => (
                <MenuItem key={user.userId} value={user.username}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Çıkış Noktası"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              required
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Varış Noktası"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              variant="outlined"
              fullWidth
            />

            <Typography variant="subtitle1" fontWeight="medium" sx={{ pt: 2, pb: 1 }}>
              Gönderici Konumu
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Konumu seçmek için haritaya tıklayın.
            </Typography>
            <Box sx={{ height: 250, mb: 2, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
              <MapContainer
                center={senderMarker || DEFAULT_CENTER}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onClick={handleSenderMapClick} />
                {senderMarker && <Marker position={senderMarker} />}
              </MapContainer>
            </Box>
            <Grid container spacing={2}>
              <Grid item>
                <TextField
                  label="Gönderici Enlem"
                  name="senderLatitude"
                  value={formData.senderLatitude}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Gönderici Boylam"
                  name="senderLongitude"
                  value={formData.senderLongitude}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" fontWeight="medium" sx={{ pt: 2, pb: 1 }}>
              Alıcı Konumu
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Konumu seçmek için haritaya tıklayın.
            </Typography>
            <Box sx={{ height: 250, mb: 2, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
              <MapContainer
                center={receiverMarker || DEFAULT_CENTER}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onClick={handleReceiverMapClick} />
                {receiverMarker && <Marker position={receiverMarker} />}
              </MapContainer>
            </Box>
            <Grid container spacing={2}>
              <Grid item>
                <TextField
                  label="Alıcı Enlem"
                  name="receiverLatitude"
                  value={formData.receiverLatitude}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Alıcı Boylam"
                  name="receiverLongitude"
                  value={formData.receiverLongitude}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              type="submit"
              size="large"
              startIcon={<SendIcon />}
              sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
            >
              Gönderi Oluştur
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* --- SHIPMENTS TABLE SECTION --- */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <ListAltIcon color="primary" />
            <Typography variant="h5" component="h2" fontWeight="bold">
              Gönderilerim
            </Typography>
          </Stack>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          ) : shipments.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 4,
                color: theme.palette.text.primary,
                bgcolor: 'grey.50',
                borderRadius: 2,
              }}
            >
              <InfoOutlinedIcon fontSize="large" />
              <Typography>Henüz gönderi bulunmamaktadır.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold', color: theme.palette.text.primary, border: 0, bgcolor: theme.palette.background.default } }}>
                    <TableCell>Takip No</TableCell>
                    <TableCell>Alıcı</TableCell>
                    <TableCell>Çıkış Noktası</TableCell>
                    <TableCell>Varış Noktası</TableCell>
                    <TableCell align="center">Durum</TableCell>
                    <TableCell>Tarih</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{shipment.trackingNumber}</TableCell>
                      <TableCell>{shipment.receiver}</TableCell>
                      <TableCell>{shipment.origin}</TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell align="center">
                        <span className={getStatusColor(shipment.status)}>{shipment.status}</span>
                      </TableCell>
                      <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Container>
  );
};

export default ShipmentForm;