import React, { useEffect, useState, useMemo } from 'react';
import { Outlet } from "react-router-dom";
import { Box, Toolbar, Snackbar, Alert, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import UserSidebar from "./UserSidebar";
import UserTopbar from "./UserTopbar";

import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import Cookies from 'js-cookie';
import * as signalR from '@microsoft/signalr';

const UserLayout = () => {
  // Tema modu: light / dark
  const [mode, setMode] = useState("light");

  // Tema objesi
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        ...(mode === 'light' ? {
          background: {
            default: "#f4f6f8"
          }
        } : {
          background: {
            default: "#121212"
          }
        })
      }
    }), [mode]);

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => setMode(prev => (prev === "light" ? "dark" : "light"));

  // Bildirim state
  const [notification, setNotification] = useState({ message: '', open: false });

  useEffect(() => {
    const notificationHubUrl = 'http://localhost:8086/notifyhub';

    const connection = new HubConnectionBuilder()
      .withUrl(notificationHubUrl, {
        accessTokenFactory: () => Cookies.get('auth_token'),
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: false
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .configureLogging(LogLevel.Debug)
      .build();

    connection.onclose(error => console.error('❌ Connection closed:', error));

    connection.on('ReceiveNotification', message => {
      console.log('📢 Yeni Bildirim:', message);
      setNotification({ message, open: true });
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log('✅ Notification Service SignalR Bağlantısı Başarılı. Connection ID:', connection.connectionId);
      } catch (err) {
        console.error('❌ Notification Service SignalR Bağlantı Hatası:', err);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      connection.stop().catch(err => console.error('SignalR bağlantısını durdururken hata oluştu:', err));
    };
  }, []);

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default", color: "text.primary" }}>
        {/* Burada toggleTheme fonksiyonunu UserTopbar'a props olarak gönderiyoruz */}
        <UserTopbar mode={mode} toggleTheme={toggleTheme} />
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
    </ThemeProvider>
  );
};

export default UserLayout;
