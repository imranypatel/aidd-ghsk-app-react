/**
 * ProtectedLayout Component
 * Feature: 002-modern-ui-redesign / US2 Professional Authenticated Layout
 * Tasks: T067-T074
 * 
 * Complete authenticated page layout with:
 * - AppBar at top
 * - NavigationDrawer on left (responsive)
 * - Main content area (centered, max-width)
 * - Skip link for accessibility
 * - Loading and error states
 * - Screen reader announcements
 */

import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppBarLayout from './AppBarLayout';
import NavigationDrawer from './NavigationDrawer';
import type {
  ProtectedLayoutProps,
} from '../../contracts/components';
import { BREAKPOINTS } from '../../contracts/responsive';
import {
  DEFAULT_A11Y_CONFIG,
} from '../../contracts/components';

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
  title = 'Dashboard',
  currentRoute,
  userInfo,
  onLogout,
  themeMode,
  onThemeChange,
  drawerInitialOpen = true,
  maxContentWidth = 1440,
  contentPadding = 3, // spacing[3] = 24px
  contentClassName,
  className,
  loading = false,
  error = null,
}) => {
  const theme = useTheme();
  // Responsive breakpoints
  const isDesktop = useMediaQuery(`(min-width:${BREAKPOINTS.desktop}px)`);
  const isMobile = useMediaQuery(`(max-width:${BREAKPOINTS.tablet - 1}px)`);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(() => {
    // Initialize drawer based on initial viewport
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= BREAKPOINTS.tablet; // Open on tablet/desktop, closed on mobile
    }
    return drawerInitialOpen;
  });

  // Determine drawer configuration based on breakpoint
  const drawerWidth = 280; // Sidebar width
  const appBarHeight = 64;

  const handleMenuClick = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Screen reader announcement for navigation changes
  useEffect(() => {
    if (DEFAULT_A11Y_CONFIG.announceNavigationChanges) {
      const announceElement = document.createElement('div');
      announceElement.setAttribute('role', 'status');
      announceElement.setAttribute('aria-live', 'polite');
      announceElement.setAttribute('aria-atomic', 'true');
      announceElement.style.position = 'absolute';
      announceElement.style.left = '-10000px';
      announceElement.style.width = '1px';
      announceElement.style.height = '1px';
      announceElement.style.overflow = 'hidden';

      // Get page title from route or use current title
      const pageTitle = title || 'Page';
      announceElement.textContent = `Navigated to ${pageTitle}`;

      document.body.appendChild(announceElement);

      const timeout = setTimeout(() => {
        document.body.removeChild(announceElement);
      }, 1000);

      return () => {
        clearTimeout(timeout);
        if (document.body.contains(announceElement)) {
          document.body.removeChild(announceElement);
        }
      };
    }
  }, [currentRoute, title]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Skeleton variant="rectangular" height={appBarHeight} />
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Skeleton
            variant="rectangular"
            width={drawerWidth}
            height="100%"
            sx={{ display: isMobile ? 'none' : 'block' }}
          />
          <Box sx={{ flex: 1, p: 3 }}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={400} />
          </Box>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          p: 3,
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Page
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          {error.message || 'An unexpected error occurred'}
        </Typography>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Reload Page
        </button>
      </Box>
    );
  }

  return (
    <Box 
      className={className} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.60)' 
            : 'rgba(18, 18, 18, 0.85)',
          backdropFilter: 'blur(2px)',
          zIndex: 0,
        },
      }}
    >
      {/* AppBar */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <AppBarLayout
          title={title}
          subtitle="Enterprise Management System"
          userInfo={userInfo}
          onMenuClick={handleMenuClick}
          showMenuIcon={true}
          onLogout={onLogout}
          themeMode={themeMode}
          onThemeChange={onThemeChange}
          height={appBarHeight}
        />
      </Box>

      {/* Navigation Drawer */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <NavigationDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          activeRoute={currentRoute}
          title={title}
          subtitle="Enterprise Management System"
        />
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        id="main-content"
        role="main"
        className={contentClassName}
        sx={{
          flexGrow: 1,
          marginTop: `${appBarHeight}px`,
          marginLeft: !isMobile && drawerOpen ? `${drawerWidth}px` : 0,
          padding: contentPadding,
          maxWidth: isDesktop ? maxContentWidth : '100%',
          marginX: isDesktop ? 'auto' : 0,
          minHeight: `calc(100vh - ${appBarHeight}px)`,
          width: !isMobile && drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          transition: 'margin 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ProtectedLayout;
