import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  AppBar,
  Toolbar,
  Avatar,
} from '@mui/material';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AIDD EMS - Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="body1">
                {user?.username || 'User'}
              </Typography>
            </Box>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              aria-label="Logout"
              title="End your session securely"
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {user?.username || 'User'}!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You have successfully logged into the AIDD Enterprise Management System.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Dashboard Features (Coming Soon)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • User management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • System analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Reports and monitoring
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Configuration settings
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Session Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User ID: {user?.userId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Username: {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: Active
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};
