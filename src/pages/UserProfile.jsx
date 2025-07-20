import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import axios from "axios"; // API çağrıları için
import { useTheme } from '@mui/material/styles';

const UserProfile = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const theme = useTheme();

  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (!token) return;

    try {
      const decoded = jwt_decode(token);
      const username = decoded.unique_name;
      const email = decoded.email || "Email bilgisi yok";
      const role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      setUser({ username, email, role });
    } catch (err) {
      console.error("Token çözümlenemedi:", err);
    }
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Yeni şifre ve onay şifresi eşleşmiyor.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Tüm alanlar doldurulmalı.");
      return;
    }

    try {
      const token = Cookies.get("auth_token");
      const decoded = jwt_decode(token);
      const userId = decoded.sub || decoded.nameid; // Kullanıcı ID'sini token'dan al

      const response = await axios.put(
        `http://localhost:8084/api/profile/${userId}/password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(response.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Şifre güncellenirken bir hata oluştu."
      );
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%" }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: 32,
              mx: "auto",
              mb: 2,
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>

          <Typography variant="h5" gutterBottom>
            {user.username}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {user.email}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Rol: {user.role}
          </Typography>

          {/* Şifre Güncelleme Formu */}
          <Box
            component="form"
            onSubmit={handleUpdatePassword}
            sx={{ mt: 3, textAlign: "left" }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Mevcut Şifre"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Yeni Şifre"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Yeni Şifreyi Onaylayın"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Şifreyi Güncelle
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfile;