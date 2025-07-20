import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Box,
  Alert,
} from "@mui/material";

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5002/api/Shipments")
      .then((res) => {
        setShipments(res.data);
        setError("");
      })
      .catch((err) => {
        console.error("Hata:", err);
        setError("Gönderiler yüklenirken hata oluştu. Lütfen tekrar deneyin.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Created":
        return "primary";
      case "InTransit":
        return "warning";
      case "Delivered":
        return "success";
      case "Failed":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Gönderiler
      </Typography>

      {loading && <LinearProgress />}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <Paper elevation={3} sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight: "bold"}}>ID</TableCell>
                <TableCell sx={{fontWeight: "bold"}}>Takip No</TableCell>
                <TableCell sx={{fontWeight: "bold"}}>Gönderici</TableCell>
                <TableCell sx={{fontWeight: "bold"}}>Alıcı</TableCell>
                <TableCell sx={{fontWeight: "bold"}}>Çıkış Noktası</TableCell>
                <TableCell sx={{fontWeight: "bold"}}>Varış Noktası</TableCell>
                <TableCell sx={{fontWeight: "bold"}}>Oluşturulma Tarihi</TableCell>
                <TableCell sx={{fontWeight: "bold"}}>Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.trackingNumber}</TableCell>
                  <TableCell>{s.sender}</TableCell>
                  <TableCell>{s.receiver}</TableCell>
                  <TableCell>{s.origin}</TableCell>
                  <TableCell>{s.destination}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={s.status} color={getStatusColor(s.status)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default Shipments;