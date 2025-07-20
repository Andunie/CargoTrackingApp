import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// İkonları import ediyoruz
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const drawerWidth = 240;

// Menü öğeleri
const menuItems = [
  { text: "Panelim", icon: <DashboardCustomizeIcon />, path: "/user/home" },
  { text: "Gönderilerim", icon: <ListAltIcon />, path: "/user/orders" },
  { text: "Gelen Gönderiler", icon: <LocalShippingIcon />, path: "/user/incoming" },
  { text: "Gönderi Takip", icon: <TrackChangesIcon />, path: "/user/shipments" },
  { text: "Profilim", icon: <AccountCircleIcon />, path: "/user/profile" },
];

const UserSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("auth_token");
    navigate("/login");
  };

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 0 }}>
        <LocalShippingIcon color="primary" sx={{ fontSize: 32, mr: 1.5 }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          KargoTakip
        </Typography>
      </Toolbar>
      <Divider />

      <List sx={{ p: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                borderRadius: '8px',
                mb: 1,
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'inherit',
                '&:hover': {
                  backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                },
                '& .MuiListItemIcon-root': {
                  color: isActive ? 'primary.contrastText' : 'inherit',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />
      <List sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
            },
          }}
        >
          <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
          <ListItemText primary="Çıkış Yap" sx={{ color: 'error.main' }} />
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
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default UserSidebar;