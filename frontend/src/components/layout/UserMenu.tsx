/**
 * UserMenu Component
 * Feature: 002-modern-ui-redesign / US2 Professional Authenticated Layout
 * Tasks: T060-T066
 * 
 * User dropdown menu with:
 * - User information header (avatar, name, role)
 * - Theme toggle switch
 * - Additional custom menu items
 * - Logout with confirmation dialog
 * - Smooth animations (Fade + Grow)
 * - Keyboard navigation
 */

import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  Typography,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Fade,
  Grow,
  useTheme,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import type {
  UserMenuProps,
} from '../../contracts/components';
import {
  getAvatarInitials,
  getAvatarColor,
} from '../../contracts/components';

const UserMenu: React.FC<UserMenuProps> = ({
  userInfo,
  open,
  anchorEl,
  onClose,
  onLogout,
  themeMode,
  onThemeChange,
  additionalItems = [],
  showThemeToggle = true,
  confirmLogout = true,
  logoutConfirmMessage = 'Are you sure you want to logout?',
  className,
  style,
}) => {
  const theme = useTheme();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleThemeToggle = () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    onThemeChange(nextMode);
  };

  const handleLogoutClick = () => {
    if (confirmLogout) {
      setLogoutDialogOpen(true);
    } else {
      handleLogoutConfirm();
    }
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    onClose();
    onLogout();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleAdditionalItemClick = (item: any) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
      onClose();
    }
  };

  const handleMenuItemKeyDown = (
    event: React.KeyboardEvent,
    callback: () => void
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  return (
    <>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        className={className}
        style={style}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        TransitionComponent={Fade}
        transitionDuration={200}
        PaperProps={{
          elevation: 8,
          sx: {
            width: 280,
            maxHeight: 400,
            overflow: 'auto',
            borderRadius: 2,
            mt: 1,
            bgcolor: 'background.paper',
          },
        }}
        MenuListProps={{
          'aria-labelledby': 'user-avatar-button',
          role: 'menu',
          dense: false,
          sx: {
            bgcolor: 'background.paper',
            py: 0,
          },
        }}
      >
        {/* User Info Header */}
        <Box
          sx={{
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Avatar
            src={userInfo.avatar}
            alt={userInfo.username}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: userInfo.avatar
                ? undefined
                : getAvatarColor(userInfo.userId),
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {!userInfo.avatar && getAvatarInitials(userInfo.username)}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userInfo.username}
            </Typography>
            {userInfo.role && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {userInfo.role}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Theme Toggle */}
        {showThemeToggle && (
          <>
            <MenuItem
              onClick={handleThemeToggle}
              onKeyDown={(e) => handleMenuItemKeyDown(e, handleThemeToggle)}
              role="menuitem"
              aria-label="Theme toggle"
              sx={{
                height: 48,
                px: 2,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon>
                {themeMode === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText primary="Theme" />
              <Switch
                checked={themeMode === 'dark'}
                onChange={handleThemeToggle}
                size="small"
                inputProps={{ 'aria-label': 'Toggle dark mode' }}
                onClick={(e) => e.stopPropagation()} // Prevent double toggle
              />
            </MenuItem>
            <Divider />
          </>
        )}

        {/* Additional Menu Items */}
        {additionalItems.map((item) => (
          <React.Fragment key={item.id}>
            <MenuItem
              onClick={() => handleAdditionalItemClick(item)}
              onKeyDown={(e) =>
                handleMenuItemKeyDown(e, () => handleAdditionalItemClick(item))
              }
              disabled={item.disabled}
              role="menuitem"
              aria-label={item.label}
              aria-disabled={item.disabled ? 'true' : undefined}
              sx={{
                height: 40,
                px: 2,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {item.icon && (
                <ListItemIcon>
                  <item.icon fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText primary={item.label} />
            </MenuItem>
            {item.divider && <Divider />}
          </React.Fragment>
        ))}

        {/* Logout Item */}
        <MenuItem
          onClick={handleLogoutClick}
          onKeyDown={(e) => handleMenuItemKeyDown(e, handleLogoutClick)}
          role="menuitem"
          aria-label="Logout"
          sx={{
            height: 48,
            px: 2,
            bgcolor: 'background.paper',
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: `${theme.palette.error.main}14`, // 8% opacity
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        TransitionComponent={Grow}
        transitionDuration={200}
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper',
          },
        }}
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            {logoutConfirmMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            color="primary"
            autoFocus
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserMenu;
