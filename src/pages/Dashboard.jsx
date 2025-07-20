import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import Cookies from "js-cookie";

// Chart.js bileşenlerini kaydet
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // Filtre: all, 7days, 30days

  // Kullanıcı adını al (varsayılan olarak "Admin")
  const userName = Cookies.get("auth_token")
    ? // JWT decode simülasyonu, gerçekte jwt-decode kütüphanesi kullanılabilir
      "Admin"
    : "Admin";

  // Verileri çek
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const token = Cookies.get("auth_token");
        if (!token) throw new Error("Oturum bilgisi eksik. Lütfen giriş yapın.");

        const res = await fetch("http://localhost:5002/api/Shipments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`API hatası: ${res.statusText}`);

        const data = await res.json();
        setShipments(data);
        setError("");
      } catch (err) {
        setError("Veri yükleme hatası: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // Filtrelenmiş gönderileri hesapla
  const filteredShipments = useMemo(() => {
    const now = new Date();
    if (filter === "7days") {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      return shipments.filter((s) => new Date(s.createdAt) >= sevenDaysAgo);
    } else if (filter === "30days") {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      return shipments.filter((s) => new Date(s.createdAt) >= thirtyDaysAgo);
    }
    return shipments;
  }, [shipments, filter]);

  // İstatistikleri hesapla
  const totalShipments = filteredShipments.length;
  const statusCounts = filteredShipments.reduce(
    (acc, shipment) => {
      acc[shipment.status] = (acc[shipment.status] || 0) + 1;
      return acc;
    },
    { Created: 0, InTransit: 0, Delivered: 0 }
  );

  const cityCounts = filteredShipments.reduce((acc, shipment) => {
    acc[shipment.origin] = (acc[shipment.origin] || 0) + 1;
    acc[shipment.destination] = (acc[shipment.destination] || 0) + 1;
    return acc;
  }, {});

  // Çubuk grafik için veri
  const statusChartData = {
    labels: ["Oluşturuldu", "Yolda", "Teslim Edildi"],
    datasets: [
      {
        label: "Gönderi Durumları",
        data: [statusCounts.Created, statusCounts.InTransit, statusCounts.Delivered],
        backgroundColor: ["#42a5f5", "#ffb300", "#66bb6a"],
        borderColor: ["#1e88e5", "#ff8f00", "#388e3c"],
        borderWidth: 1,
      },
    ],
  };

  // Pasta grafik için veri
  const cityChartData = {
    labels: Object.keys(cityCounts),
    datasets: [
      {
        label: "Şehir Kullanımı",
        data: Object.values(cityCounts),
        backgroundColor: [
          "#42a5f5",
          "#ffb300",
          "#66bb6a",
          "#ef5350",
          "#ab47bc",
          "#26a69a",
          "#ffca28",
        ],
        borderColor: ["#fff"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={(theme) => ({ p: 3, bgcolor: theme.palette.background.default, minHeight: "100vh" })}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Hoş Geldiniz, {userName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gönderi istatistiklerinizi aşağıda görüntüleyebilirsiniz.
        </Typography>
      </Paper>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Yeniden Dene
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Zaman Aralığı</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Zaman Aralığı"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="7days">Son 7 Gün</MenuItem>
                <MenuItem value="30days">Son 30 Gün</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            {/* Toplam Gönderi Sayısı */}
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#555" }}>
                    Toplam Gönderi
                  </Typography>
                  <Typography variant="h3" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                    {totalShipments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Durum Dağılımı Grafiği */}
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#555" }}>
                    Gönderi Durumları
                  </Typography>
                  <Bar
                    data={statusChartData}
                    options={{
                      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                      plugins: { legend: { display: false } },
                      animation: { duration: 1000, easing: "easeOutQuart" },
                    }}
                    height={200}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Şehir Kullanımı Grafiği */}
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#555" }}>
                    En Sık Kullanılan Şehirler
                  </Typography>
                  <Pie
                    data={cityChartData}
                    options={{
                      plugins: {
                        legend: { position: "bottom", labels: { boxWidth: 12, padding: 20 } },
                      },
                      animation: { duration: 1000, easing: "easeOutQuart" },
                    }}
                    height={200}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;