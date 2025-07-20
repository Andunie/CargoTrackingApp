// src/pages/Home.jsx

import { Box, Typography, Paper, Grid } from "@mui/material";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // İkon ekleyerek daha şık hale getirebiliriz.

const Home = () => {
  const [user, setUser] = useState({ username: "", role: "" });

  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const username = decoded.unique_name;
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setUser({ username, role });
      } catch (error) {
        console.error("Invalid token:", error);
        // İsteğe bağlı: token geçersizse cookie'yi temizle
        Cookies.remove("auth_token");
      }
    }
  }, []);

  // Kartlar için ortak stil objesi
  const cardStyles = {
    p: 3,
    borderRadius: '12px', // Köşeleri biraz daha yumuşatalım
    height: '100%', // Kartların aynı yükseklikte olmasını sağlar
    display: 'flex',
    flexDirection: 'column',
    // --- HOVER EFEKTİ İÇİN GEREKLİ STİLLER ---
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-8px)", // 8 piksel yukarı kaldır
      boxShadow: 6, // Gölgeyi artır (elevation 3'ten 6'ya)
      cursor: "pointer", // Farenin imlecini el işareti yap
    },
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        backgroundColor: "background.default", // Beyaz arka plan
      }}
    >
      <Typography variant="h4" gutterBottom>
        Hoş geldin, <Box component="span" fontWeight="bold" color="primary.main">{user.username}</Box>
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Rolün: {user.role}
      </Typography>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={cardStyles}>
            <Typography variant="h6" fontWeight="bold">Siparişlerim</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mt: 1 }}>
              Gönderdiğiniz kargoları burada görebilir ve yenilerini oluşturabilirsiniz.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <ArrowForwardIcon color="primary" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={cardStyles}>
            <Typography variant="h6" fontWeight="bold">Harita Takibi</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mt: 1 }}>
              Kargonuzun konumunu harita üzerinde gerçek zamanlı olarak izleyin.
            </Typography>
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <ArrowForwardIcon color="primary" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={cardStyles}>
            <Typography variant="h6" fontWeight="bold">Profil</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mt: 1 }}>
              Bilgilerinizi güncelleyin ve hesap ayarlarınızı kolayca yönetin.
            </Typography>
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <ArrowForwardIcon color="primary" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;