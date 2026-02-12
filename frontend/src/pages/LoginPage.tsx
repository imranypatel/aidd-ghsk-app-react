import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import type { LoginCredentials } from '../types/LoginCredentials';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(data);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Card
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 450,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                AIDD EMS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enterprise Management System
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} role="alert">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="Username"
                margin="normal"
                autoComplete="username"
                autoFocus
                disabled={isLoading}
                error={!!errors.username}
                helperText={
                  errors.username?.type === 'required'
                    ? 'Username is required'
                    : errors.username?.type === 'minLength'
                    ? 'Username must be at least 3 characters'
                    : ''
                }
                inputProps={{
                  'aria-label': 'Username',
                  'aria-required': 'true',
                  'aria-invalid': !!errors.username,
                }}
                {...register('username', {
                  required: true,
                  minLength: 3,
                })}
              />

              <TextField
                fullWidth
                type="password"
                label="Password"
                margin="normal"
                autoComplete="current-password"
                disabled={isLoading}
                error={!!errors.password}
                helperText={
                  errors.password?.type === 'required'
                    ? 'Password is required'
                    : errors.password?.type === 'minLength'
                    ? 'Password must be at least 8 characters'
                    : ''
                }
                inputProps={{
                  'aria-label': 'Password',
                  'aria-required': 'true',
                  'aria-invalid': !!errors.password,
                }}
                {...register('password', {
                  required: true,
                  minLength: 8,
                })}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  position: 'relative',
                }}
                aria-label="Sign in"
              >
                {isLoading ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        marginLeft: '-12px',
                      }}
                      aria-label="Logging in"
                    />
                    <span style={{ opacity: 0 }}>Sign In</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                © 2026 AIDD EMS. All rights reserved.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
