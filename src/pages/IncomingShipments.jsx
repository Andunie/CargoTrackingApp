import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
import { useTheme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const API_BASE_URL = 'http://localhost:5002';
const debugLog = (...args) => console.log('[IncomingShipments Debug]:', ...args);

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

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

const IncomingShipments = () => {
  const theme = useTheme(); // 🔧 useTheme hook'u burada kullanılmalı
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncomingShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get('auth_token');
      const userId = getUserId();
      if (!token || !userId) throw new Error('Oturum jetonu veya kullanıcı ID bulunamadı.');
      const response = await fetch(`${API_BASE_URL}/api/Shipments/incoming?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      debugLog('Fetched incoming shipments:', data);
      setShipments(data);
    } catch (err) {
      debugLog('Error in fetchIncomingShipments:', err);
      setError(`Gönderiler yüklenirken bir hata oluştu: ${err.message}`);
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
      fetchIncomingShipments();
    } catch (err) {
      Cookies.remove('auth_token');
      navigate('/login');
    }
  }, [navigate, fetchIncomingShipments]);

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: '100vh' }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          height: '100%',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <LocalShippingIcon color="primary" />
          <Typography variant="h5" component="h1" fontWeight="bold">
            Gelen Gönderiler
          </Typography>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 'calc(100% - 120px)', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    '& th': {
                      fontWeight: 'bold',
                      color: theme.palette.text.primary,
                      bgcolor: theme.palette.background.default,
                    },
                  }}
                >
                  <TableCell>Gönderi ID</TableCell>
                  <TableCell>Takip Numarası</TableCell>
                  <TableCell>Gönderici</TableCell>
                  <TableCell>Alıcı</TableCell>
                  <TableCell>Oluşturma Tarihi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">Gelen gönderi bulunamadı.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments.map((shipment) => (
                    <TableRow key={shipment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {shipment.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{shipment.trackingNumber}</TableCell>
                      <TableCell>{shipment.sender}</TableCell>
                      <TableCell>{shipment.receiver}</TableCell>
                      <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default IncomingShipments;
