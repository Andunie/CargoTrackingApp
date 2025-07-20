import { useMemo, useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Toolbar,
  createTheme,
  ThemeProvider,
  Snackbar,
  Alert,
} from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import AdminTopbar from "./AdminTopbar";
import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";

const AdminLayout = () => {
  const token = Cookies.get("auth_token");
  let role = null;

  if (token) {
    try {
      const decoded = jwt_decode(token);
      role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    } catch {
      role = null;
    }
  }

  if (!token || role !== "Admin") {
    return <Navigate to="/login" replace />;
  }

  // Tema modu: light/dark
  const [mode, setMode] = useState("light");
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // SignalR bağlantısı
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:8082/notifyHub", {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on("ReceiveNotification", (message) => {
      setSnackbar({
        open: true,
        message: `Kargo durumu güncellendi: ${message}`,
        severity: "info",
      });
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("SignalR Connected!");
      } catch (err) {
        console.error("SignalR Connection Error:", err);
      }
    };

    startConnection();

    return () => {
      connection.stop().catch((err) => console.error("SignalR Stop Error:", err));
    };
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: {
                  main: "#0D47A1",
                },
                background: {
                  default: "#f4f6f8",
                  paper: "#ffffff",
                },
              }
            : {
                primary: {
                  main: "#90caf9",
                },
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
              }),
        },
      }),
    [mode]
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <AdminTopbar mode={mode} toggleTheme={toggleTheme} />
        <AdminSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            bgcolor: "background.default",
          }}
        >
          <Toolbar />
          <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
            <Outlet />
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;