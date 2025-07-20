import React, { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

// API Base URL'ini doğru porta ayarlayalım
const API_BASE_URL = 'http://localhost:5002';

// Debug modunu aktif edelim
const DEBUG = true;

const debugLog = (...args) => {
  if (DEBUG) {
    console.log('[ShipmentForm Debug]:', ...args);
  }
};

const ShipmentForm = () => {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    sender: '',
    receiver: '',
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

  useEffect(() => {
    // Token'ı application cookie'den al
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const token = getCookie('auth_token');
    debugLog('Token from cookie:', token ? 'Present' : 'Missing');

    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        debugLog('Token decoded successfully:', { username: decodedToken.unique_name });
        setFormData(prev => ({
          ...prev,
          sender: decodedToken.unique_name
        }));
        // Fetch user's shipments when component mounts
        fetchUserShipments();
      } catch (error) {
        debugLog('Error decoding token:', error);
        setError('Oturum bilgisi geçersiz. Lütfen tekrar giriş yapın.');
      }
    } else {
      debugLog('No auth token found');
      setError('Lütfen giriş yapın.');
    }
  }, []);

  const fetchUserShipments = async () => {
    debugLog('Fetching user shipments...');
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token=')).split('=')[1];
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Koordinat alanları için virgülü noktaya çevirme
    if (name.includes('Latitude') || name.includes('Longitude')) {
      const sanitizedValue = value.replace(',', '.');
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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

      if (isNaN(parsedCoordinates.senderLatitude) || parsedCoordinates.senderLatitude < -90 || parsedCoordinates.senderLatitude > 90) {
        validationErrors.push('Gönderici enlemi -90 ile 90 arasında olmalıdır');
      }
      if (isNaN(parsedCoordinates.senderLongitude) || parsedCoordinates.senderLongitude < -180 || parsedCoordinates.senderLongitude > 180) {
        validationErrors.push('Gönderici boylamı -180 ile 180 arasında olmalıdır');
      }
      if (isNaN(parsedCoordinates.receiverLatitude) || parsedCoordinates.receiverLatitude < -90 || parsedCoordinates.receiverLatitude > 90) {
        validationErrors.push('Alıcı enlemi -90 ile 90 arasında olmalıdır');
      }
      if (isNaN(parsedCoordinates.receiverLongitude) || parsedCoordinates.receiverLongitude < -180 || parsedCoordinates.receiverLongitude > 180) {
        validationErrors.push('Alıcı boylamı -180 ile 180 arasında olmalıdır');
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
        senderLatitude: '',
        senderLongitude: '',
        receiverLatitude: '',
        receiverLongitude: '',
      }));
    } catch (error) {
      debugLog('Error in handleSubmit:', error);
      setError(`Gönderi oluşturulurken bir hata oluştu:\n${error.message}`);
    }
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

  // Hata mesajı gösterimi için
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="mb-4">Yeni Gönderi Oluştur</h2>
      <form onSubmit={handleSubmit} className="shipment-form mb-5">
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
            minLength="2"
            maxLength="100"
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

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="senderLatitude">Gönderici Enlem:</label>
            <input
              type="text"
              id="senderLatitude"
              name="senderLatitude"
              value={formData.senderLatitude}
              onChange={handleChange}
              placeholder="Örnek: 41.0082"
              pattern="-?\d*[.,]?\d*"
              title="Lütfen geçerli bir koordinat giriniz (Örnek: 41.0082)"
              required
              className="form-control"
            />
            <small className="form-text text-muted">-90 ile 90 arasında bir değer giriniz</small>
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="senderLongitude">Gönderici Boylam:</label>
            <input
              type="text"
              id="senderLongitude"
              name="senderLongitude"
              value={formData.senderLongitude}
              onChange={handleChange}
              placeholder="Örnek: 28.9784"
              pattern="-?\d*[.,]?\d*"
              title="Lütfen geçerli bir koordinat giriniz (Örnek: 28.9784)"
              required
              className="form-control"
            />
            <small className="form-text text-muted">-180 ile 180 arasında bir değer giriniz</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="receiverLatitude">Alıcı Enlem:</label>
            <input
              type="text"
              id="receiverLatitude"
              name="receiverLatitude"
              value={formData.receiverLatitude}
              onChange={handleChange}
              placeholder="Örnek: 41.0082"
              pattern="-?\d*[.,]?\d*"
              title="Lütfen geçerli bir koordinat giriniz (Örnek: 41.0082)"
              required
              className="form-control"
            />
            <small className="form-text text-muted">-90 ile 90 arasında bir değer giriniz</small>
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="receiverLongitude">Alıcı Boylam:</label>
            <input
              type="text"
              id="receiverLongitude"
              name="receiverLongitude"
              value={formData.receiverLongitude}
              onChange={handleChange}
              placeholder="Örnek: 28.9784"
              pattern="-?\d*[.,]?\d*"
              title="Lütfen geçerli bir koordinat giriniz (Örnek: 28.9784)"
              required
              className="form-control"
            />
            <small className="form-text text-muted">-180 ile 180 arasında bir değer giriniz</small>
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-3">Gönderi Oluştur</button>
      </form>

      <h2 className="mb-4">Gönderilerim</h2>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Yükleniyor...</span>
          </div>
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
    </div>
  );
};

export default ShipmentForm; 