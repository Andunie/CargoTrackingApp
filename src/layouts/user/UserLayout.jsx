import { Outlet } from "react-router-dom";
import { Box, Toolbar, Snackbar, Alert } from "@mui/material";
import UserSidebar from "./UserSidebar";
import UserTopbar from "./UserTopbar";

// Gerekli kütüphaneleri import ediyoruz.
import React, { useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import Cookies from 'js-cookie'; // js-cookie kütüphanesini import ediyoruz
import * as signalR from '@microsoft/signalr'; // signalR kütüphanesini import ediyoruz

const UserLayout = () => {
  const [notification, setNotification] = useState({ message: '', open: false });

  // useEffect hook'u kullanarak component yüklendiğinde çalışacak kodu yazıyoruz.
  useEffect(() => {
    // NotificationService'in Hub adresi
    const notificationHubUrl = 'http://localhost:8086/notifyhub';

    // SignalR bağlantısını yapılandırıyoruz.
    const connection = new HubConnectionBuilder()
      .withUrl(notificationHubUrl, {
        accessTokenFactory: () => {
          const token = Cookies.get('auth_token');
          console.log('🔑 Token being used:', token);
          return token;
        },
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: false
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // Retry with increasing delays
      .configureLogging(LogLevel.Debug) // Increase logging level for debugging
      .build();

    connection.onclose((error) => {
      console.error('❌ Connection closed:', error);
    });

    connection.on('ReceiveNotification', (message) => {
      console.log('📢 Yeni Bildirim:', message);
      setNotification({ message, open: true });
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log('✅ Notification Service SignalR Bağlantısı Başarılı. Connection ID:', connection.connectionId);
      } catch (err) {
        console.error('❌ Notification Service SignalR Bağlantı Hatası:', err);
        setTimeout(startConnection, 5000); // Retry after 5 seconds
      }
    };

    startConnection();

    // Bu component ekrandan kaldırıldığında (örneğin kullanıcı çıkış yaptığında)
    // arkada gereksiz yere çalışmaması için bağlantıyı güvenli bir şekilde kapatıyoruz.
    return () => {
      if (connection) {
        connection.stop().catch(err => console.error('SignalR bağlantısını durdururken hata oluştu:', err));
      }
    };
  }, []); // Köşeli parantezlerin boş olması, bu kodun sadece component ilk yüklendiğinde bir kez çalışmasını sağlar.

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <UserTopbar />
      <UserSidebar />
      <Box component="main" sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Toolbar />
        <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity="info" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserLayout; 