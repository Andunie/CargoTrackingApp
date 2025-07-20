import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Avatar,
  CssBaseline,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"; // Kilit ikonu
import axios from "axios";
import Cookies from "js-cookie";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Yükleme durumu için state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // İşlem başladığında yükleme durumunu aktif et
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:8084/api/Auth/login",
        {
          username: form.username,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      const { token } = response.data;
      Cookies.set("auth_token", token, {
        expires: 1,
        secure: false, // Development için false, production'da true olmalı
        sameSite: "Strict",
      });

      const jwt_decode = (await import("jwt-decode")).default;
      const decoded = jwt_decode(token);
      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      setSuccess("Giriş başarılı! Yönlendiriliyorsunuz...");

      const redirectPath = role === "Admin" ? "/admin/dashboard" : "/user/home";
      setTimeout(() => navigate(redirectPath), 1500);

    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Giriş başarısız. Kullanıcı adı veya şifre yanlış.";
      setError(errorMessage);
    } finally {
      setIsLoading(false); // İşlem bittiğinde (başarılı veya başarısız) yüklemeyi kapat
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Modern gradyan arka plan
        }}
      >
        <Card
          sx={{
            width: 400,
            p: 2, // İç boşluk
            borderRadius: 3, // Daha yuvarlak köşeler
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", // Daha belirgin gölge
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(255, 255, 255, 0.90)",
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1, // Elemanlar arası boşluk
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Giriş Yap
              </Typography>
            </Box>

            <form onSubmit={handleLogin} style={{ marginTop: "1rem" }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
                  {success}
                </Alert>
              )}

              <TextField
                label="Kullanıcı Adı"
                name="username"
                type="text"
                fullWidth
                margin="normal"
                required
                value={form.username}
                onChange={handleChange}
                disabled={isLoading} // Yükleme sırasında pasif yap
              />

              <TextField
                label="Şifre"
                name="password"
                type="password"
                fullWidth
                margin="normal"
                required
                value={form.password}
                onChange={handleChange}
                disabled={isLoading} // Yükleme sırasında pasif yap
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large" // Daha belirgin bir buton
                disabled={isLoading} // Yükleme sırasında pasif yap
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={26} color="inherit" />
                ) : (
                  "Giriş Yap"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Login;