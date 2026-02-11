/**
 * Theme Color Picker Component
 * 
 * Purpose: Test component for dynamically changing theme primary colors
 * Note: Supports both light and dark theme color customization
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeColor } from '../contexts/ThemeColorContext';
import { useTheme } from '../hooks/useTheme';

const PRESET_COLORS = [
  { name: 'Material Blue', color: '#1976d2' },
  { name: 'Purple', color: '#9c27b0' },
  { name: 'Teal', color: '#009688' },
  { name: 'Orange', color: '#ff9800' },
  { name: 'Pink', color: '#e91e63' },
  { name: 'Indigo', color: '#3f51b5' },
  { name: 'Green', color: '#4caf50' },
  { name: 'Red', color: '#f44336' },
];

const DARK_PRESET_COLORS = [
  { name: 'Light Blue', color: '#90caf9' },
  { name: 'Light Purple', color: '#ce93d8' },
  { name: 'Light Teal', color: '#4db6ac' },
  { name: 'Light Orange', color: '#ffb74d' },
  { name: 'Light Pink', color: '#f06292' },
  { name: 'Light Indigo', color: '#7986cb' },
  { name: 'Light Green', color: '#81c784' },
  { name: 'Light Red', color: '#e57373' },
];

export const ThemeColorPicker: React.FC = () => {
  const muiTheme = useMuiTheme();
  const { theme, setMode } = useTheme();
  const { lightPrimaryColor, darkPrimaryColor, setPrimaryColor, resetPrimaryColor } = useThemeColor();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
  
  const currentMode = theme.effectiveMode;
  const currentColor = currentMode === 'light' ? lightPrimaryColor : darkPrimaryColor;
  const [colorInput, setColorInput] = useState<string>(currentColor);

  // Update input when theme mode changes
  useEffect(() => {
    setColorInput(currentColor);
  }, [currentColor, currentMode]);

  const handleColorChange = (color: string) => {
    setColorInput(color);
    setPrimaryColor(color, currentMode);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setColorInput(value);
    
    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setPrimaryColor(value, currentMode);
    }
  };

  const handleReset = () => {
    resetPrimaryColor(currentMode);
    const defaultColor = currentMode === 'light' ? '#1976d2' : '#90caf9';
    setColorInput(defaultColor);
  };

  const handleToggleTheme = () => {
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  const presetColors = currentMode === 'light' ? PRESET_COLORS : DARK_PRESET_COLORS;

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        background: muiTheme.palette.background.paper,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">
          🎨 Theme Color Picker
        </Typography>
        
        {/* Desktop-only Theme Toggle */}
        {isDesktop && (
          <Tooltip title={`Switch to ${currentMode === 'light' ? 'Dark' : 'Light'} Mode`}>
            <IconButton 
              onClick={handleToggleTheme}
              color="primary"
              sx={{ 
                border: 1, 
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              {currentMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Stack spacing={3}>
        {/* Current Mode Indicator */}
        <Box>
          <Chip 
            label={`${currentMode === 'light' ? 'Light' : 'Dark'} Mode`}
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Color Input */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter Hex Color Code
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              value={colorInput}
              onChange={handleInputChange}
              placeholder={currentMode === 'light' ? '#1976d2' : '#90caf9'}
              size="small"
              sx={{ minWidth: 150 }}
              inputProps={{
                pattern: '#[0-9A-Fa-f]{6}',
                maxLength: 7,
              }}
            />
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                backgroundColor: colorInput,
                border: '2px solid',
                borderColor: 'divider',
                boxShadow: 1,
              }}
            />
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleReset}
            >
              Reset
            </Button>
          </Stack>
        </Box>

        {/* Preset Colors */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Quick Presets
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {presetColors.map((preset) => (
              <Chip
                key={preset.color}
                label={preset.name}
                onClick={() => handleColorChange(preset.color)}
                sx={{
                  backgroundColor: preset.color,
                  color: '#fff',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: preset.color,
                    opacity: 0.8,
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Current Theme Info */}
        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active Colors
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" sx={{ minWidth: 80 }}>
                Light Mode:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {lightPrimaryColor}
              </Typography>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 0.5,
                  backgroundColor: lightPrimaryColor,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" sx={{ minWidth: 80 }}>
                Dark Mode:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {darkPrimaryColor}
              </Typography>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 0.5,
                  backgroundColor: darkPrimaryColor,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
