// Topbar.jsx

import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Topbar = ({mode, toggleTheme}) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Shipment Dashboard
        </Typography>
        <IconButton
          color="inherit"
          onClick={toggleTheme}
          title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          size="large"
        >
          {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;