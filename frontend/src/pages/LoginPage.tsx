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
  useTheme,
  IconButton,
  InputAdornment,
  Link,
  Fade,
  Grow,
  keyframes,
} from '@mui/material';
import { Visibility, VisibilityOff, ErrorOutline } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import type { LoginCredentials } from '../types/LoginCredentials';

// T031: Error shake animation keyframes (300ms constitution-compliant)
const shakeAnimation = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
`;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Card entrance animation (T030)
  useEffect(() => {
    const timer = setTimeout(() => setShowCard(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    setShakeError(false);
    setIsLoading(true);

    try {
      const result = await login(data);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
        // T031: Trigger shake animation on authentication failure
        setShakeError(true);
        setTimeout(() => setShakeError(false), 300); // Reset after animation duration
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      // T031: Trigger shake animation on error
      setShakeError(true);
      setTimeout(() => setShakeError(false), 300); // Reset after animation duration
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      data-testid="login-background"
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        // Mobile: background image with overlay
        backgroundImage: {
          xs: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80)',
          md: 'none',
        },
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor:
            theme.palette.mode === 'light'
              ? 'rgba(25, 118, 210, 0.7)'
              : 'rgba(18, 18, 18, 0.85)',
          display: { xs: 'block', md: 'none' },
          zIndex: 0,
        },
      }}
    >
      {/* Left side: Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 50%' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, md: 4 },
          position: 'relative',
          zIndex: 1,
          background: {
            xs: 'transparent',
            md:
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                : theme.palette.background.default,
          },
        }}
      >
      <Fade in={showCard} timeout={300}>
        <Grow in={showCard} timeout={300}>
          <Card
            data-testid="login-card"
            elevation={8}
            sx={{
              maxWidth: { xs: 400, md: 480 },
              width: '100%',
              borderRadius: 2,
              mx: { xs: 2, md: 0 },
              bgcolor: {
                xs:
                  theme.palette.mode === 'light'
                    ? 'transparent'
                    : 'background.paper',
                md: 'background.paper',
              },
              // T031: Apply shake animation on authentication failure
              animation: shakeError ? `${shakeAnimation} 300ms ease-in-out` : 'none',
            }}
          >
        <CardContent
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              data-testid="login-logo"
              component="img"
              src="/logo.svg"
              alt="AIDD EMS Logo"
              sx={{
                width: { xs: 56, md: 64 },
                height: { xs: 56, md: 64 },
                mb: 2,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.5rem', md: '2.125rem' },
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account
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
                InputProps={{
                  endAdornment: errors.username ? (
                    <InputAdornment position="end">
                      <ErrorOutline color="error" fontSize="small" />
                    </InputAdornment>
                  ) : null,
                }}
                inputProps={{
                  'aria-label': 'Username',
                  'aria-required': 'true',
                  'aria-invalid': !!errors.username,
                  'aria-describedby': errors.username ? 'username-error' : undefined,
                }}
                FormHelperTextProps={{
                  id: 'username-error',
                  role: 'alert',
                }}
                {...register('username', {
                  required: true,
                  minLength: 3,
                })}
              />

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {errors.password && (
                      <ErrorOutline color="error" fontSize="small" sx={{ mr: 1 }} />
                    )}
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{ width: 40, height: 40 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                'aria-label': 'Password',
                'aria-required': 'true',
                'aria-invalid': !!errors.password,
                'aria-describedby': errors.password ? 'password-error' : undefined,
              }}
              FormHelperTextProps={{
                id: 'password-error',
                role: 'alert',
              }}
              {...register('password', {
                required: true,
                minLength: 8,
              })}
            />              <Button
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
                  height: 48,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 200ms ease-in-out',
                  },
                  '&:active': {
                    boxShadow: 1,
                  },
                }}
                aria-label="Sign in to your account"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link
                  href="#"
                  variant="body2"
                  color="primary"
                  underline="hover"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to forgot password page (placeholder)
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>
            </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2026 AIDD EMS. All rights reserved.
            </Typography>
          </Box>
        </CardContent>
          </Card>
        </Grow>
      </Fade>
      </Box>

      {/* Right side: Enterprise Image - Desktop only */}
      <Box
        sx={{
          flex: '0 0 50%',
          display: { xs: 'none', md: 'block' },
          backgroundImage:
            'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor:
              theme.palette.mode === 'light'
                ? 'rgba(25, 118, 210, 0.1)'
                : 'rgba(13, 71, 161, 0.3)',
          },
        }}
      >
        {/* Optional: Add text overlay on image */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: 40,
            right: 40,
            zIndex: 1,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Enterprise Management
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.95 }}>
            Powerful tools for modern businesses
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};