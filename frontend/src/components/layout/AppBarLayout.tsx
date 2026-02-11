/**
 * AppBarLayout Component
 * Feature: 002-modern-ui-redesign / US2 Professional Authenticated Layout
 * Tasks: T049-T052
 * 
 * Top navigation bar with:
 * - Brand title and optional logo
 * - Hamburger menu icon
 * - User avatar and menu
 * - Theme toggle
 * - Responsive height and styling
 */

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
  Tooltip,
  useMediaQuery,
  useTheme as useMuiTheme,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
  Chip,
  alpha,
  InputBase,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import type {
  AppBarLayoutProps,
} from '../../contracts/components';
import UserMenu from './UserMenu';
import { BREAKPOINTS } from '../../contracts/responsive';

const AppBarLayout: React.FC<AppBarLayoutProps> = ({
  title,
  subtitle = 'Enterprise Management System',
  logoSrc,
  logoAlt = 'Logo',
  userInfo,
  onMenuClick,
  showMenuIcon = false,
  onLogout,
  themeMode,
  onThemeChange,
  className,
  style,
}) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(`(max-width:${BREAKPOINTS.tablet - 1}px)`);
  
  // User menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const userMenuOpen = Boolean(userMenuAnchor);
  
  // Notification menu state
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const notificationOpen = Boolean(notificationAnchor);
  
  // Search dialog state (mobile)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // Responsive logo size
  const logoSize = isMobile ? 32 : 40;

  const handleUserAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    setUserMenuAnchor(null);
    if (onLogout) {
      onLogout();
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleSearchDialogOpen = () => {
    setSearchDialogOpen(true);
  };

  const handleSearchDialogClose = () => {
    setSearchDialogOpen(false);
  };

  return (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: -40,
          left: 0,
          background: muiTheme.palette.primary.main,
          color: muiTheme.palette.primary.contrastText,
          padding: '8px 16px',
          textDecoration: 'none',
          zIndex: 10000,
          transition: 'top 0.2s',
        }}
        onFocus={(e) => {
          (e.target as HTMLElement).style.top = '0';
        }}
        onBlur={(e) => {
          (e.target as HTMLElement).style.top = '-40px';
        }}
      >
        Skip to main content
      </a>

      <AppBar
        position="fixed"
        elevation={0}
        className={className}
        style={style}
        sx={{
          height: 64,
          minHeight: 64,
          maxHeight: 64,
          zIndex: 1100,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiToolbar-root': {
            minHeight: '64px !important',
            height: '64px !important',
          },
        }}
      >
        <Toolbar
          sx={{
            minHeight: 64,
            height: 64,
            px: { xs: 2, sm: 3 },
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Left Section: Menu Icon + Logo + Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* Hamburger Menu Icon */}
            {showMenuIcon && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={onMenuClick}
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  color: 'text.primary',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* App Logo & Title */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
              }}
            >
              {logoSrc ? (
                <Box
                  component="img"
                  src={logoSrc}
                  alt={logoAlt}
                  sx={{
                    width: logoSize,
                    height: logoSize,
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Box
                  component="span"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    boxShadow: `0 4px 14px 0 ${alpha(muiTheme.palette.primary.main, 0.25)}`,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {title.charAt(0).toUpperCase()}
                </Box>
              )}
              <Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1.2,
                    letterSpacing: '-0.5px',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {subtitle}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Center Section: Search Bar (Desktop) / Search FAB (Mobile) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: { xs: 0, md: 1 },
              maxWidth: { md: 600 },
            }}
          >
            {/* Search FAB (Mobile Only) */}
            <Fab
              size="small"
              aria-label="search"
              onClick={handleSearchDialogOpen}
              sx={{
                display: { xs: 'flex', md: 'none' },
                background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
                color: 'white',
                boxShadow: `0 4px 12px ${alpha(muiTheme.palette.primary.main, 0.4)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark} 0%, ${muiTheme.palette.primary.main} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(muiTheme.palette.primary.main, 0.6)}`,
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              <SearchIcon />
            </Fab>

            {/* Search Bar (Desktop Only) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                width: '100%',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  backgroundColor: alpha(muiTheme.palette.common.black, 0.04),
                  '&:hover': {
                    backgroundColor: alpha(muiTheme.palette.common.black, 0.06),
                  },
                  width: '100%',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Box
                  sx={{
                    padding: muiTheme.spacing(0, 2),
                    height: '100%',
                    position: 'absolute',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </Box>
                <InputBase
                  placeholder="Search - Coming Soon"
                  disabled
                  sx={{
                    color: 'inherit',
                    width: '100%',
                    '& .MuiInputBase-input': {
                      padding: muiTheme.spacing(1.5, 1.5, 1.5, 0),
                      paddingLeft: `calc(1em + ${muiTheme.spacing(4)})`,
                      transition: muiTheme.transitions.create('width'),
                      width: '100%',
                      fontSize: '0.95rem',
                      cursor: 'not-allowed',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Right Section: Notifications + User Info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              justifyContent: 'flex-end',
              minWidth: 0,
            }}
          >
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                size="medium"
                aria-label="notifications"
                aria-controls="notification-menu"
                aria-haspopup="true"
                onClick={handleNotificationClick}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: alpha(muiTheme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Badge 
                  badgeContent={3} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      color: '#fff',
                      fontWeight: 600,
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Info & Avatar */}
            {userInfo && (
              <>
                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    mr: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.2,
                    }}
                  >
                    {userInfo.username}
                  </Typography>
                  <Chip
                    label={userInfo.role}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      mt: 0.5,
                      bgcolor: alpha(muiTheme.palette.primary.main, 0.1),
                      color: 'primary.main',
                    }}
                  />
                </Box>

                <Tooltip title="Account settings">
                  <IconButton
                    size="medium"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls={userMenuOpen ? 'user-menu' : undefined}
                    aria-haspopup="true"
                    onClick={handleUserAvatarClick}
                    sx={{
                      p: 0.5,
                      '&:hover': {
                        bgcolor: 'transparent',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        fontWeight: 600,
                        fontSize: '1rem',
                        border: 2,
                        borderColor: userMenuOpen ? 'primary.main' : 'transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 0 0 4px ${alpha(muiTheme.palette.primary.main, 0.12)}`,
                        },
                      }}
                    >
                      {userInfo.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Menu */}
      <Menu
        id="notification-menu"
        anchorEl={notificationAnchor}
        open={notificationOpen}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              minWidth: 320,
              maxWidth: 360,
              boxShadow: muiTheme.shadows[8],
              bgcolor: 'background.paper',
              borderRadius: 2,
            },
          },
        }}
        MenuListProps={{
          sx: {
            bgcolor: 'background.paper',
            py: 0,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <MenuItem 
          onClick={handleNotificationClose}
          sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ListItemText
            primary="New module created"
            secondary="2 minutes ago"
            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>
        <MenuItem 
          onClick={handleNotificationClose}
          sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ListItemText
            primary="Function updated"
            secondary="1 hour ago"
            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>
        <MenuItem 
          onClick={handleNotificationClose}
          sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ListItemText
            primary="Security alert"
            secondary="3 hours ago"
            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleNotificationClose}
          sx={{ justifyContent: 'center', color: 'primary.main', fontWeight: 600, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
        >
          View all notifications
        </MenuItem>
      </Menu>

      {/* Search Dialog (Mobile) */}
      <Dialog
        open={searchDialogOpen}
        onClose={handleSearchDialogClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            position: 'fixed',
            top: 20,
            m: 2,
            borderRadius: 3,
            boxShadow: muiTheme.shadows[24],
            bgcolor: 'background.paper',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Search
          </Typography>
          <IconButton
            aria-label="close search"
            onClick={handleSearchDialogClose}
            sx={{
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 3 }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              backgroundColor: alpha(muiTheme.palette.common.black, 0.04),
              border: `2px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`,
              '&:hover': {
                backgroundColor: alpha(muiTheme.palette.common.black, 0.06),
                borderColor: alpha(muiTheme.palette.primary.main, 0.4),
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Box
              sx={{
                padding: muiTheme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </Box>
            <InputBase
              placeholder="Search - Coming Soon"
              disabled
              autoFocus
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: muiTheme.spacing(2, 2, 2, 0),
                  paddingLeft: `calc(1em + ${muiTheme.spacing(4)})`,
                  width: '100%',
                  fontSize: '1rem',
                  cursor: 'not-allowed',
                },
              }}
            />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}
          >
            Search functionality coming soon
          </Typography>
        </DialogContent>
      </Dialog>

      {/* User Menu Dropdown */}
      {userInfo && themeMode && onThemeChange && (
        <UserMenu
          userInfo={userInfo}
          open={userMenuOpen}
          anchorEl={userMenuAnchor}
          onClose={handleUserMenuClose}
          onLogout={handleLogout}
          themeMode={themeMode}
          onThemeChange={onThemeChange}
        />
      )}
    </>
  );
};

export default AppBarLayout;
