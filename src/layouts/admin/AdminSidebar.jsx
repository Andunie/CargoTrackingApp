// AdminSidebar.jsx

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// İkonları import ediyoruz
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MapIcon from "@mui/icons-material/Map";
import GroupIcon from "@mui/icons-material/Group"; // 'Person' yerine 'Group' daha uygun
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Logo için

const drawerWidth = 240;

// Admin menü öğelerini yönetmeyi kolaylaştırmak için bir dizi oluşturuyoruz.
const adminMenuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "Gönderiler", icon: <LocalShippingIcon />, path: "/admin/shipments" },
  { text: "Harita", icon: <MapIcon />, path: "/admin/map" },
  { text: "Kullanıcılar", icon: <GroupIcon />, path: "/admin/users" },
];

const AdminSidebar = () => {
  const location = useLocation(); // Mevcut URL'yi almak için
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("auth_token");
    navigate("/login");
  };

  const drawerContent = (
    <div>
      {/* Üst Kısım: Logo ve Başlık */}
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 0, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <AdminPanelSettingsIcon sx={{ fontSize: 32, mr: 1.5 }}/>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Admin Paneli
        </Typography>
      </Toolbar>

      {/* Ana Menü Listesi */}
      <List sx={{ p: 2 }}>
        {adminMenuItems.map((item) => {
          // Aktif durumu kontrol ederken, alt sayfaları da kapsayacak şekilde startsWith kullanmak daha iyidir.
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              selected={isActive} // 'selected' prop'u da kullanılabilir, stil için daha semantik
              sx={{
                borderRadius: '8px',
                mb: 1,
                // 'selected' prop'u aktif olduğunda tema rengini otomatik uygular.
                // İsterseniz üzerine yazabilirsiniz:
                '&.Mui-selected': {
                  backgroundColor: 'primary.dark',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'inherit' : 'text.primary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        })}
      </List>
      
      {/* Bu boş Box, Çıkış Yap butonunu en alta itmemizi sağlar */}
      <Box sx={{ flexGrow: 1 }} /> 
      
      {/* Alt Kısım: Çıkış Yap Butonu */}
      <Divider />
      <List sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)' // Kırmızı bir hover efekti
            },
          }}
        >
          <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
          <ListItemText primary="Çıkış Yap" sx={{ color: 'error.main' }}/>
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          display: 'flex',
          flexDirection: 'column',
          borderRight: 'none', // Kenarlığı kaldırıp gölge ile ayırabiliriz
          boxShadow: '2px 0px 5px rgba(0,0,0,0.05)'
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AdminSidebar;