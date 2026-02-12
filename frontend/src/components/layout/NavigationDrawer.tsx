/**
 * NavigationDrawer Component
 * Feature: Modern Sidebar Navigation with Tree View
 * 
 * Responsive navigation sidebar with:
 * - Material-UI X Tree View for hierarchical menu
 * - Desktop: Persistent drawer with toggle capability
 * - Mobile: Temporary modal overlay
 * - Smooth scrolling and modern design
 * - Positioned below AppBar (64px)
 * - Active route highlighting
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  useTheme,
  alpha,
  Typography,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { BREAKPOINTS } from '../../contracts/responsive';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  activeRoute: string;
  title?: string;
  subtitle?: string;
}

// Demo menu structure with tree hierarchy
const menuStructure = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <PeopleIcon />,
    children: [
      {
        id: 'users-list',
        label: 'All Users',
        icon: <AccountCircleIcon />,
        path: '/users',
      },
      {
        id: 'users-roles',
        label: 'Roles & Permissions',
        icon: <SecurityIcon />,
        path: '/users/roles',
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <InventoryIcon />,
    children: [
      {
        id: 'inventory-products',
        label: 'Products',
        icon: <CategoryIcon />,
        path: '/inventory/products',
      },
      {
        id: 'inventory-categories',
        label: 'Categories',
        icon: <CategoryIcon />,
        path: '/inventory/categories',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <AssessmentIcon />,
    children: [
      {
        id: 'reports-sales',
        label: 'Sales Reports',
        icon: <DescriptionIcon />,
        children: [
          {
            id: 'reports-sales-monthly',
            label: 'Monthly Sales',
            icon: <DescriptionIcon />,
            path: '/reports/sales/monthly',
          },
          {
            id: 'reports-sales-quarterly',
            label: 'Quarterly Sales',
            icon: <DescriptionIcon />,
            path: '/reports/sales/quarterly',
          },
          {
            id: 'reports-sales-yearly',
            label: 'Yearly Sales',
            icon: <DescriptionIcon />,
            path: '/reports/sales/yearly',
          },
        ],
      },
      {
        id: 'reports-analytics',
        label: 'Analytics',
        icon: <AssessmentIcon />,
        path: '/reports/analytics',
      },
    ],
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <CalendarIcon />,
    path: '/calendar',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <NotificationsIcon />,
    path: '/notifications',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: <HelpIcon />,
    path: '/help',
  },
];

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  onClose,
  activeRoute = '/dashboard',
  title = 'Navigation',
  subtitle = 'Enterprise Management System',
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(`(max-width:${BREAKPOINTS.tablet - 1}px)`);

  const drawerWidth = 280;
  const appBarHeight = 64;

  const handleItemClick = (path?: string) => {
    if (path) {
      navigate(path);
      // Close drawer on mobile after navigation
      if (isMobile) {
        onClose();
      }
    }
  };

  const renderTreeItems = (items: typeof menuStructure) => {
    return items.map((item) => {
      const isActive = activeRoute === item.path;
      const hasChildren = item.children && item.children.length > 0;

      return (
        <TreeItem
          key={item.id}
          itemId={item.id}
          label={
            <Box
              onClick={() => !hasChildren && handleItemClick(item.path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 0.75,
                px: 0.5,
                borderRadius: 1,
                cursor: hasChildren ? 'default' : 'pointer',
                backgroundColor: isActive
                  ? alpha(theme.palette.primary.main, 0.12)
                  : 'transparent',
                color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.16)
                    : alpha(theme.palette.action.hover, 0.08),
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  transition: 'color 0.2s',
                }}
              >
                {item.icon}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive ? 600 : 400,
                  flexGrow: 1,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          }
          sx={{
            [`& .${treeItemClasses.content}`]: {
              padding: 0,
              marginBottom: theme.spacing(0.5),
            },
            [`& .${treeItemClasses.iconContainer}`]: {
              marginRight: theme.spacing(0.5),
            },
            ...(hasChildren && {
              [`& .${treeItemClasses.groupTransition}`]: {
                marginLeft: '20px',
                paddingLeft: '18px',
                borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
              },
            }),
          }}
        >
          {hasChildren && renderTreeItems(item.children!)}
        </TreeItem>
      );
    });
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {/* Tree View Navigation */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 2,
          py: 2,
          // Smooth scrolling
          scrollBehavior: 'smooth',
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.divider, 0.1),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
            },
          },
        }}
      >
        <SimpleTreeView
          defaultExpandedItems={['users', 'inventory', 'reports']}
        >
          {renderTreeItems(menuStructure)}
        </SimpleTreeView>
      </Box>

      <Divider />

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
        style: {
          zIndex: 1099, // Just below AppBar (which is 1100)
        },
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: `${appBarHeight}px`, // Position below AppBar on all devices
          height: `calc(100% - ${appBarHeight}px)`,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: isMobile ? theme.shadows[8] : 'none',
          transition: theme.transitions.create(['width', 'transform'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default NavigationDrawer;
