import React, { useState, useEffect, useCallback } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

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
  Autocomplete,
  Snackbar,
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
const DEFAULT_CENTER = [39.925, 32.866]; // Ankara
const DEBUG = true;

const debugLog = (...args) => {
  if (DEBUG) {
    console.log('[ShipmentForm Debug]:', ...args);
  }
};

// --- Component ---
const ShipmentForm = () => {
  const navigate = useNavigate();
  const [hubConnection, setHubConnection] = useState(null);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    trackingNumber: generateTrackingNumber(),
    sender: '',
    receiverUserId: '',
    origin: '',
    destination: '',
    senderLatitude: '',
    senderLongitude: '',
    receiverLatitude: '',
    receiverLongitude: '',
  });

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // SignalR Connection Setup
  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${NOTIFICATION_HUB_URL}?access_token=${token}`)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (message) => {
      debugLog('Received notification:', message);
      setNotification(message);
      // Refresh shipments list when notification received
      fetchUserShipments();
    });

    const startConnection = async () => {
      try {
        await connection.start();
        debugLog('SignalR Connected!');
        setHubConnection(connection);
      } catch (err) {
        debugLog('SignalR Connection Error:', err);
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
    // Token kontrolü ve yönlendirme
    const token = localStorage.getItem('auth_token');
    if (!token) {
      debugLog('No auth token found, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwt_decode(token);
      
      // Token süresi dolmuş mu kontrol et
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        debugLog('Token expired, redirecting to login');
        localStorage.removeItem('auth_token');
        navigate('/login');
        return;
      }

      debugLog('Token decoded successfully:', { username: decodedToken.unique_name });
      setFormData(prev => ({
        ...prev,
        sender: decodedToken.unique_name
      }));
      
      // Fetch user's shipments when component mounts
      fetchUserShipments();
    } catch (error) {
      debugLog('Error decoding token:', error);
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserShipments = async () => {
    debugLog('Fetching user shipments...');
    try {
      const token = localStorage.getItem('auth_token');
      debugLog('Auth token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_BASE_URL}/api/shipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
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
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token=')).split('=')[1];
      
      if (!token) {
        debugLog('No auth token found during submission');
        setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      debugLog('Auth token for submission:', 'Present');

      // Form validation
      if (!formData.sender || formData.sender.length < 2 || formData.sender.length > 100) {
        setError('Gönderici bilgisi geçersiz.');
        return;
      }

      // Koordinat değerlerini işle
      debugLog('Raw coordinate values:', {
        senderLat: formData.senderLatitude,
        senderLng: formData.senderLongitude,
        receiverLat: formData.receiverLatitude,
        receiverLng: formData.receiverLongitude
      });

      // Virgülleri noktalara çevir
      const sanitizedCoordinates = {
        senderLatitude: formData.senderLatitude.toString().replace(',', '.'),
        senderLongitude: formData.senderLongitude.toString().replace(',', '.'),
        receiverLatitude: formData.receiverLatitude.toString().replace(',', '.'),
        receiverLongitude: formData.receiverLongitude.toString().replace(',', '.')
      };

      debugLog('Sanitized coordinate values:', sanitizedCoordinates);

      // Sayısal değerlere çevir
      const parsedCoordinates = {
        senderLatitude: parseFloat(sanitizedCoordinates.senderLatitude),
        senderLongitude: parseFloat(sanitizedCoordinates.senderLongitude),
        receiverLatitude: parseFloat(sanitizedCoordinates.receiverLatitude),
        receiverLongitude: parseFloat(sanitizedCoordinates.receiverLongitude)
      };

      debugLog('Parsed coordinate values:', parsedCoordinates);

      // Koordinat değerlerinin geçerliliğini kontrol et
      const validationErrors = [];

      // Gönderici koordinatları kontrolü
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

      // Alıcı koordinatları kontrolü
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

      // Form verilerini hazırla
      const processedFormData = {
        ...formData,
        ...parsedCoordinates,
        trackingNumber: formData.trackingNumber.toUpperCase()
      };

      debugLog('Final processed form data:', processedFormData);

      const response = await fetch(`${API_BASE_URL}/api/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(processedFormData)
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
            // Validation errors
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
      
      // Form verilerini sıfırla ama sender'ı koru
      setFormData(prev => ({
        trackingNumber: '',
        sender: prev.sender,
        receiver: '',
        origin: '',
        destination: '',
        senderLatitude: '0',    // Default değer
        senderLongitude: '0',   // Default değer
        receiverLatitude: '0',  // Default değer
        receiverLongitude: '0', // Default değer
      }));
    } catch (error) {
      debugLog('Error in handleSubmit:', error);
      setError(`Gönderi oluşturulurken bir hata oluştu:\n${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Update Grid components in the render section
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
            bgcolor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="trackingNumber">Takip Numarası:</label>
              <input
                type="text"
                id="trackingNumber"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                pattern="[A-Z0-9]{6,}"
                title="En az 6 karakter uzunluğunda, sadece büyük harf ve rakamlardan oluşmalı"
                required
                className="form-control"
                placeholder="Örnek: ABC123"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sender">Gönderici:</label>
              <input
                type="text"
                id="sender"
                name="sender"
                value={formData.sender}
                readOnly
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="receiver">Alıcı:</label>
              <input
                type="text"
                id="receiver"
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="origin">Çıkış Noktası:</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">Varış Noktası:</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Gönderici Enlem"
                  name="senderLatitude"
                  value={formData.senderLatitude}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
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
              <Grid item xs={6}>
                <TextField
                  label="Alıcı Enlem"
                  name="receiverLatitude"
                  value={formData.receiverLatitude}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
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

            <button type="submit" className="btn btn-primary">Gönderi Oluştur</button>
          </Stack>
        </Paper>
      </Container>

      <h2 className="mb-4">Gönderilerim</h2>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Yükleniyor...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : shipments.length === 0 ? (
        <div className="alert alert-info" role="alert">
          Henüz gönderi bulunmamaktadır.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Takip No</th>
                <th>Alıcı</th>
                <th>Çıkış Noktası</th>
                <th>Varış Noktası</th>
                <th>Durum</th>
                <th>Oluşturulma Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.trackingNumber}</td>
                  <td>{shipment.receiver}</td>
                  <td>{shipment.origin}</td>
                  <td>{shipment.destination}</td>
                  <td>
                    <span className={getStatusColor(shipment.status)}>
                      {shipment.status}
                    </span>
                  </td>
                  <td>{formatDate(shipment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
};

export default ShipmentForm; 