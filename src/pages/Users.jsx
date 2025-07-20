// src/pages/admin/Users.jsx

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Stack } from '@mui/system';

// Gerekli MUI bileşenlerini ve ikonları import ediyoruz
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE_URL = 'http://localhost:8084';

// Yardımcı fonksiyonlar değişmedi
const getRoleChipProps = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin': return { label: 'Admin', color: 'error', variant: 'filled' };
    case 'user': return { label: 'Kullanıcı', color: 'success', variant: 'outlined' };
    default: return { label: role || 'Bilinmiyor', color: 'default' };
  }
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- YENİ STATE'LER ---
  // Onay diyalogunu yönetmek için
  const [openDialog, setOpenDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Snackbar (bildirim) yönetimi için
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mevcut fetchUsers fonksiyonu değişmedi
  useEffect(() => {
    const fetchUsers = async () => {
      // ... (fonksiyonun içeriği aynı)
      setLoading(true);
      setError(null);
      const token = Cookies.get("auth_token");
      if (!token) {
        setError("Yetkilendirme hatası: Lütfen giriş yapın.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/Users/GetUsers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error(`Veri alınamadı. Sunucu durumu: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(`Kullanıcılar yüklenirken bir hata oluştu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // --- YENİ FONKSİYONLAR ---

  // Silme ikonuna tıklandığında diyalog kutusunu açar
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setOpenDialog(true);
  };

  // Diyalog kutusunu kapatır
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserToDelete(null);
  };
  
  // Snackbar'ı kapatır
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Asıl silme işlemini yapan fonksiyon
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const token = Cookies.get("auth_token");
    if (!token) {
      setSnackbar({ open: true, message: 'Oturumunuz bulunamadı. Lütfen tekrar giriş yapın.', severity: 'error' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/Users/DeleteUser/${userToDelete.userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Kullanıcı silinirken hata oluştu.");
      }

      setSnackbar({ open: true, message: 'Kullanıcı başarıyla silindi.', severity: 'success' });
      setUsers((prevUsers) => prevUsers.filter(user => user.userId !== userToDelete.userId));

    } catch (error) {
      console.error("Kullanıcı silinirken hata:", error);
      setSnackbar({ open: true, message: `Hata: ${error.message}`, severity: 'error' });
    } finally {
      // İşlem bitince diyalog kutusunu kapat
      handleCloseDialog();
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <GroupIcon color="primary" sx={{ fontSize: '2.5rem' }} />
        <Typography variant="h4" component="h1">Kullanıcı Yönetimi</Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={(theme) => { bgcolor: theme.palette.mode === "light" ? theme.palette.grey[200] : theme.palette.grey[900] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Kullanıcı Adı</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>E-posta</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Chip {...getRoleChipProps(user.role)} size="small" /></TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sil">
                      {/* onClick artık diyalog kutusunu açıyor */}
                      <IconButton onClick={() => handleOpenDeleteDialog(user)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- YENİ BİLEŞENLER --- */}
      
      {/* Silme Onay Diyalogu */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Kullanıcıyı Silmeyi Onayla</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{userToDelete?.username}</strong> adlı kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Başarı/Hata Bildirimleri */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;