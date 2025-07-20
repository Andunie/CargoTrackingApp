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
  CircularProgress, // Yükleme animasyonu için
  Avatar,           // İkon göstermek için
  CssBaseline,      // Tarayıcı stillerini sıfırlamak için
} from "@mui/material";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined"; // Kayıt ikonu
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Yükleme durumu için state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // İstemci taraflı doğrulama (API isteğinden önce)
    if (form.username.length < 2) {
      setError("Kullanıcı adı en az 2 karakter olmalıdır.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Geçerli bir e-posta adresi giriniz.");
      return;
    }
    if (form.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setIsLoading(true); // Doğrulama başarılıysa yüklemeyi başlat

    try {
      await axios.post(
        "http://localhost:8084/api/Auth/register",
        {
          username: form.username,
          email: form.email,
          password: form.password,
        }
      );

      setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
      setForm({ username: "", email: "", password: "" }); // Formu temizle

      // 2 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Kayıt başarısız. Lütfen tekrar deneyin.";
      setError(errorMessage);
    } finally {
      setIsLoading(false); // İşlem bitince yüklemeyi durdur
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Card
          sx={{
            width: 400,
            p: 2,
            borderRadius: 3,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
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
                gap: 1,
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary" }}>
                <PersonAddOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Hesap Oluştur
              </Typography>
            </Box>

            <form onSubmit={handleRegister} style={{ marginTop: "1rem" }}>
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
                disabled={isLoading}
              />

              <TextField
                label="E-posta Adresi"
                name="email"
                type="email"
                fullWidth
                margin="normal"
                required
                value={form.email}
                onChange={handleChange}
                disabled={isLoading}
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
                disabled={isLoading}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={26} color="inherit" />
                ) : (
                  "Kayıt Ol"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Register;