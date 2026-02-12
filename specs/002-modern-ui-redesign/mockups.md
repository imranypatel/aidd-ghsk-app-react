# Design Mockups - Modern UI Redesign

**Feature**: 002-modern-ui-redesign  
**Created**: 2026-02-10  
**Purpose**: Visual design mockups for stakeholder approval

---

## Table of Contents

1. [D001: Login Page Mockup](#d001-login-page-mockup)
2. [D002: Dashboard Layout Mockup](#d002-dashboard-layout-mockup)
3. [D003: Component Style Guide](#d003-component-style-guide)

---

## D001: Login Page Mockup

### Overview
Modern, professional login page with gradient background, elevated card, and smooth animations.

### Layout Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         FULL VIEWPORT (100vw × 100vh)                      │
│                                                                            │
│  ╔═══════════════════════════════════════════════════════════════════╗   │
│  ║                    GRADIENT BACKGROUND                            ║   │
│  ║  Linear gradient: 135deg                                          ║   │
│  ║  Primary: #1976d2 (0%) → #42a5f5 (50%) → #90caf9 (100%)         ║   │
│  ║                                                                    ║   │
│  ║                                                                    ║   │
│  ║          ┌─────────────────────────────────────┐                 ║   │
│  ║          │                                     │                 ║   │
│  ║          │      ELEVATED LOGIN CARD            │                 ║   │
│  ║          │      (Max-width: 400px)             │                 ║   │
│  ║          │      Elevation: 8                   │                 ║   │
│  ║          │      Border-radius: 16px            │                 ║   │
│  ║          │      Padding: 48px 32px             │                 ║   │
│  ║          │                                     │                 ║   │
│  ║          │  ┌─────────────────────────────┐   │                 ║   │
│  ║          │  │      [LOGO IMAGE]           │   │                 ║   │
│  ║          │  │      64×64px                │   │                 ║   │
│  ║          │  └─────────────────────────────┘   │                 ║   │
│  ║          │                                     │                 ║   │
│  ║          │       Welcome Back                  │                 ║   │
│  ║          │       (Typography: h4)              │                 ║   │
│  ║          │                                     │                 ║   │
│  ║          │  Sign in to your account            │                 ║   │
│  ║          │  (Typography: body2, secondary)     │                 ║   │
│  ║          │                                     │                 ║   │
│  ║          │  ┌───────────────────────────────┐ │                 ║   │
│  ║          │  │ Username                      │ │                 ║   │
│  ║          │  │ ┌───────────────────────────┐ │ │                 ║   │
│  ║          │  │ │ [Your username]           │ │ │                 ║   │
│  ║          │  │ └───────────────────────────┘ │ │                 ║   │
│  ║          │  └───────────────────────────────┘ │                 ║   │
│  ║          │                                     │                 ║   │
│  ║          │  ┌───────────────────────────────┐ │                 ║   │
│  ║          │  │ Password                      │ │                 ║   │
│  ║          │  │ ┌───────────────────────┬───┐ │ │                 ║   │
│  ║          │  │ │ ••••••••••            │👁 │ │ │                 ║   │
│  ║          │  │ └───────────────────────┴───┘ │ │                 ║   │
│  ║          │  └───────────────────────────────┘ │                 ║   │
│  ║          │                                     │                 ║   │
│  ║          │  ┌───────────────────────────────┐ │                 ║   │
│  ║          │  │      SIGN IN                  │ │                 ║   │
│  ║          │  │  (Button: contained primary)  │ │                 ║   │
│  ║          │  │  Full width, height: 48px     │ │                 ║   │
│  ║          │  └───────────────────────────────┘ │                 ║   │
│  ║          │                                     │                 ║   │
│  ║          │     Forgot password?                │                 ║   │
│  ║          │     (Link: primary color)           │                 ║   │
│  ║          │                                     │                 ║   │
│  ║          └─────────────────────────────────────┘                 ║   │
│  ║                                                                    ║   │
│  ║                                                                    ║   │
│  ╚═══════════════════════════════════════════════════════════════════╝   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Visual Specifications

#### Background
- **Gradient**: Linear, 135-degree angle
  - Stop 1: `#1976d2` at 0%
  - Stop 2: `#42a5f5` at 50%
  - Stop 3: `#90caf9` at 100%
- **Animation**: Subtle 10-second background position shift (optional)
- **Fallback**: Solid `#1976d2` for older browsers

#### Login Card
- **Background**: White (`#ffffff`) in light mode, `#1e1e1e` in dark mode
- **Elevation**: Level 8 (deep shadow for floating effect)
- **Border Radius**: 16px (modern, rounded corners)
- **Padding**: 48px (top/bottom), 32px (left/right)
- **Max Width**: 400px
- **Position**: Centered horizontally and vertically
- **Box Shadow (Light)**: `0px 4px 16px rgba(0,0,0,0.16), 0px 8px 8px rgba(0,0,0,0.12)`
- **Box Shadow (Dark)**: None, surface tinting instead

#### Logo
- **Size**: 64×64px
- **Position**: Centered, top of card
- **Margin Bottom**: 24px
- **Border Radius**: 50% (circular if desired) or 8px (rounded square)

#### Typography
- **"Welcome Back"**: 
  - Variant: h4 (34px)
  - Weight: Regular (400)
  - Color: Text primary
  - Margin Bottom: 8px
  
- **"Sign in to your account"**:
  - Variant: body2 (14px)
  - Weight: Regular (400)
  - Color: Text secondary
  - Margin Bottom: 32px

#### Text Fields
- **Variant**: Outlined (Material-UI standard)
- **Border Radius**: 8px (modern, softer than default)
- **Height**: 56px (standard Material-UI)
- **Spacing**: 24px between fields
- **Label**: Floating label animation on focus
- **Border Color**: 
  - Default: `#e0e0e0` (light), `#424242` (dark)
  - Focus: Primary color
  - Error: Error color (`#d32f2f`)
- **Icon**: Eye icon for password visibility toggle (right-aligned)

#### Sign In Button
- **Variant**: Contained
- **Color**: Primary
- **Width**: 100% (full width of card content)
- **Height**: 48px (generous touch target)
- **Border Radius**: 8px
- **Text Transform**: None (sentence case "Sign In")
- **Font Weight**: Medium (500)
- **Elevation**: 2 (resting), 4 (hover), 1 (active)
- **Hover**: Slight lift animation (translateY -2px)
- **Margin Top**: 32px

#### Forgot Password Link
- **Variant**: body2 (14px)
- **Color**: Primary
- **Position**: Centered below button
- **Margin Top**: 16px
- **Hover**: Underline

### Animations

1. **Card Entrance** (on page load):
   - Fade in: opacity 0 → 1
   - Scale up: scale 0.95 → 1
   - Duration: 300ms
   - Easing: ease-out
   - Delay: 100ms

2. **Field Focus**:
   - Border color transition: 200ms ease-out
   - Label float: 200ms ease-out

3. **Button Hover**:
   - Transform: translateY(-2px), 200ms ease-out
   - Box shadow increase: 200ms ease-out

4. **Button Press**:
   - Transform: translateY(0), 150ms ease-in
   - Box shadow decrease: 150ms ease-in

5. **Error State** (validation failure):
   - Shake animation: translateX(-10px → 10px → 0), 400ms (exception to 300ms limit for feedback)
   - Border color: transition to error color, 150ms

### Responsive Behavior

#### Desktop (≥1200px)
- Card width: 400px
- Padding: 48px 32px
- All elements as specified above

#### Tablet (≥992px, <1200px)
- Card width: 380px
- Padding: 40px 28px
- Slightly reduced spacing

#### Mobile (≥768px, <992px)
- Card width: 90% of viewport (max 360px)
- Padding: 32px 24px
- Logo size: 56×56px
- Heading: h5 (24px) instead of h4
- Reduced margins: 16px between fields

### Dark Mode Variations

#### Background (Dark Mode)
- Gradient: Darker tones
  - Stop 1: `#0d47a1` at 0%
  - Stop 2: `#1565c0` at 50%
  - Stop 3: `#1976d2` at 100%

#### Card (Dark Mode)
- Background: `#1e1e1e`
- Text Primary: `#fafafa`
- Text Secondary: `#b0b0b0`
- Border Color: `#424242`
- Elevation: Surface tinting (5% white overlay per level)

### Accessibility

- **Keyboard Navigation**: Tab order: Username → Password → Show Password → Sign In → Forgot Password
- **ARIA Labels**: 
  - Username field: `aria-label="Username"`
  - Password field: `aria-label="Password"`
  - Show password toggle: `aria-label="Show password"`
  - Sign in button: `aria-label="Sign in to your account"`
- **Focus Indicators**: 2px solid primary color outline, 2px offset
- **Error Messages**: `role="alert"`, announced to screen readers
- **Contrast Ratios**: All text meets WCAG AA (4.5:1 for body text)

---

## D002: Dashboard Layout Mockup

### Overview
Professional authenticated layout with persistent AppBar, responsive sidebar, and main content area.

### Desktop Layout (≥1200px)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │                           APP BAR (Height: 64px)                            │ │
│ │  ┌──┐  AIDD EMS                                          [🔔]  [☀]  [👤▼] │ │
│ │  │🏠│  (Logo + Title)                                     Notifications      │ │
│ │  └──┘                                                     Theme  User Menu   │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────┬──────────────────────────────────────────────────────────────┐  │
│ │ DRAWER     │                    MAIN CONTENT AREA                         │  │
│ │ (240px)    │                    (Centered, max 1440px)                    │  │
│ │            │                                                               │  │
│ │ ┌────────┐ │  ┌──────────────────────────────────────────────────────┐   │  │
│ │ │📊 Dash │ │  │                                                      │   │  │
│ │ └────────┘ │  │                PAGE CONTENT                          │   │  │
│ │  (Active)  │  │                (Padding: 24px)                       │   │  │
│ │            │  │                                                      │   │  │
│ │ ┌────────┐ │  │  Components render here:                            │   │  │
│ │ │👤 Users│ │  │  - Cards, tables, forms, etc.                       │   │  │
│ │ └────────┘ │  │  - Inherits theme colors                            │   │  │
│ │            │  │  - Responsive grid layouts                          │   │  │
│ │ ┌────────┐ │  │                                                      │   │  │
│ │ │📁 Files│ │  │                                                      │   │  │
│ │ └────────┘ │  │                                                      │   │  │
│ │            │  │                                                      │   │  │
│ │ ┌────────┐ │  │                                                      │   │  │
│ │ │⚙ Set.. │ │  │                                                      │   │  │
│ │ └────────┘ │  │                                                      │   │  │
│ │   (Badge)  │  │                                                      │   │  │
│ │            │  └──────────────────────────────────────────────────────┘   │  │
│ │            │                                                               │  │
│ │ ┌────────┐ │                                                               │  │
│ │ │❓ Help │ │                                                               │  │
│ │ └────────┘ │                                                               │  │
│ │            │                                                               │  │
│ └────────────┴──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (≥992px, <1200px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │                    APP BAR (Height: 64px)                        │ │
│ │  ┌──┐  AIDD EMS                           [🔔]  [☀]  [👤▼]     │ │
│ │  │🏠│                                                             │ │
│ │  └──┘                                                             │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ ┌───┬─────────────────────────────────────────────────────────────┐  │
│ │ D │                 MAIN CONTENT AREA                           │  │
│ │ R │                 (Full width)                                │  │
│ │ A │                                                              │  │
│ │ W │  ┌────────────────────────────────────────────────────┐    │  │
│ │ E │  │                                                    │    │  │
│ │ R │  │           PAGE CONTENT                             │    │  │
│ │   │  │           (Padding: 24px)                          │    │  │
│ │ 6 │  │                                                    │    │  │
│ │ 4 │  │  Mini drawer expands on hover:                    │    │  │
│ │ p │  │  - Shows labels                                   │    │  │
│ │ x │  │  - Width becomes 240px temporarily                │    │  │
│ │   │  │  - Overlays content slightly                      │    │  │
│ │ ┌─┐│  │                                                    │    │  │
│ │ │📊││  │                                                    │    │  │
│ │ └─┘│  │                                                    │    │  │
│ │ ┌─┐│  └────────────────────────────────────────────────────┘    │  │
│ │ │👤││                                                              │  │
│ │ └─┘│                                                              │  │
│ │ ┌─┐│                                                              │  │
│ │ │📁││                                                              │  │
│ │ └─┘│                                                              │  │
│ │ ┌─┐│                                                              │  │
│ │ │⚙││                                                              │  │
│ │ └─┘│                                                              │  │
│ │ ┌─┐│                                                              │  │
│ │ │❓││                                                              │  │
│ │ └─┘│                                                              │  │
│ └───┴─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (≥768px, <992px)

```
┌──────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐ │
│ │    APP BAR (Height: 56px)                    │ │
│ │ [☰] AIDD EMS              [🔔]  [☀]  [👤▼] │ │
│ │ Hamburger                                     │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │                                              │ │
│ │         MAIN CONTENT AREA                    │ │
│ │         (Full width)                         │ │
│ │         (Padding: 16px)                      │ │
│ │                                              │ │
│ │  ┌────────────────────────────────────────┐ │ │
│ │  │                                        │ │ │
│ │  │       PAGE CONTENT                     │ │ │
│ │  │       (Stacks vertically)              │ │ │
│ │  │                                        │ │ │
│ │  │  - Single column layout                │ │ │
│ │  │  - Larger touch targets (48×48px min)  │ │ │
│ │  │  - Simplified navigation               │ │ │
│ │  │                                        │ │ │
│ │  │                                        │ │ │
│ │  └────────────────────────────────────────┘ │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ DRAWER (Temporary, overlays when open):          │
│ ┌──────────────────────┐                        │
│ │ NAVIGATION DRAWER    │                        │
│ │ (240px width)        │                        │
│ │                      │                        │
│ │ ┌──────────────────┐ │                        │
│ │ │📊 Dashboard      │ │                        │
│ │ └──────────────────┘ │                        │
│ │ ┌──────────────────┐ │                        │
│ │ │👤 Users          │ │                        │
│ │ └──────────────────┘ │                        │
│ │ ┌──────────────────┐ │                        │
│ │ │📁 Files          │ │                        │
│ │ └──────────────────┘ │                        │
│ │ ┌──────────────────┐ │                        │
│ │ │⚙ Settings       │ │                        │
│ │ └──────────────────┘ │                        │
│ │ ┌──────────────────┐ │                        │
│ │ │❓ Help           │ │                        │
│ │ └──────────────────┘ │                        │
│ │                      │                        │
│ └──────────────────────┘                        │
└──────────────────────────────────────────────────┘
```

### Component Specifications

#### AppBar
- **Height**: 64px (desktop/tablet), 56px (mobile)
- **Background**: Primary color in light mode, `#1e1e1e` in dark mode
- **Elevation**: 4
- **Text Color**: White (contrastText)
- **Z-Index**: 1100

**Left Section**:
- Hamburger menu icon (mobile only): 40×40px touch target
- Logo: 40×40px (desktop/tablet), 32×32px (mobile)
- Title: h6 variant (20px), medium weight

**Right Section**:
- Notification icon: 40×40px touch target (future phase, placeholder)
- Theme toggle: 40×40px touch target
- User avatar + dropdown: 40×40px touch target

#### Navigation Drawer

**Desktop (Permanent)**:
- Width: 240px
- Variant: Permanent
- Background: Paper color (`#ffffff` light, `#1e1e1e` dark)
- Elevation: 0 (no shadow, uses border instead)
- Border Right: 1px solid divider color

**Tablet (Mini, Permanent)**:
- Width: 64px (collapsed), 240px (hover expanded)
- Variant: Permanent with mini variant
- Shows icons only when collapsed
- Expands on hover with smooth transition (300ms)
- Labels appear on hover expansion
- Z-Index: 1200 (above AppBar when expanded)

**Mobile (Temporary)**:
- Width: 240px
- Variant: Temporary (overlay)
- Background: Paper color with backdrop
- Backdrop: Semi-transparent black (0.5 opacity)
- Closes on navigation or backdrop click
- Slide-in animation from left (300ms)
- Z-Index: 1300 (above everything)

#### Menu Items
- **Height**: 48px (comfortable touch target)
- **Padding**: 8px 16px (expanded), 8px 12px (mini)
- **Icon Size**: 24×24px
- **Icon Margin**: 16px right (expanded mode)
- **Text**: body1 variant (16px)
- **Active State**:
  - Background: Primary color with 0.08 opacity
  - Left border: 4px solid primary color
  - Icon color: Primary color
  - Text color: Primary color
  - Font weight: Medium (500)
- **Hover State**:
  - Background: Action hover (rgba(0,0,0,0.04) light, rgba(255,255,255,0.08) dark)
  - Transition: 150ms ease-out
- **Badge** (for notifications):
  - Position: Absolute right (8px from right edge)
  - Size: 20px height, min-width 20px
  - Background: Error color
  - Text: White, 12px
  - Border Radius: 10px (pill shape)

#### User Menu Dropdown
- **Width**: 280px
- **Elevation**: 8
- **Border Radius**: 8px
- **Max Height**: 400px (scrollable if needed)

**Menu Structure**:
1. User Info Header (48px height):
   - Avatar (40×40px): Left aligned
   - Username: body1, text primary
   - Role: caption, text secondary
   - Padding: 16px

2. Divider (1px)

3. Theme Toggle Item:
   - Icon: Sun/Moon
   - Label: "Theme"
   - Toggle switch: Right aligned
   - Height: 48px

4. Divider (1px)

5. Menu Items (future):
   - Profile
   - Settings
   - Height: 40px each

6. Divider (1px)

7. Logout Item:
   - Icon: Logout icon
   - Label: "Logout"
   - Color: Error color
   - Height: 48px

#### Main Content Area
- **Padding**: 24px (desktop/tablet), 16px (mobile)
- **Max Width**: 1440px (desktop only, centered)
- **Background**: Default background color
- **Top Margin**: 64px (AppBar height on desktop), 56px (mobile)
- **Left Margin**: 240px (desktop drawer), 64px (tablet mini drawer), 0 (mobile)

### Animations

1. **Drawer Slide** (mobile):
   - Transform: translateX(-100%) → translateX(0)
   - Duration: 300ms
   - Easing: ease-out
   - GPU accelerated

2. **Drawer Expand** (tablet hover):
   - Width: 64px → 240px
   - Duration: 300ms
   - Easing: ease-out
   - Label fade in: opacity 0 → 1, 200ms delay

3. **User Menu Open**:
   - Opacity: 0 → 1
   - Transform: translateY(-8px) → translateY(0)
   - Duration: 200ms
   - Easing: ease-out

4. **Active Item Highlight**:
   - Background color: transition 150ms
   - Border left: slide in from left, 200ms

### Dark Mode Variations

#### AppBar (Dark)
- Background: `#1e1e1e`
- Text: `#fafafa`
- Elevation: Surface tinting (white overlay)

#### Drawer (Dark)
- Background: `#1e1e1e`
- Border: `#424242`
- Active item background: Primary with 0.12 opacity

#### Content Area (Dark)
- Background: `#121212`
- Text primary: `#fafafa`
- Text secondary: `#b0b0b0`

### Accessibility

- **Skip Link**: "Skip to main content" (visible on focus, jumps to content area)
- **Keyboard Navigation**:
  - Tab order: AppBar icons → Drawer items → Main content
  - Drawer toggle: Space/Enter to open/close
  - Menu items: Arrow keys to navigate, Enter to select
  - User menu: Arrow keys to navigate, Enter to select, Esc to close
- **ARIA Labels**:
  - Drawer: `aria-label="Main navigation"`
  - Hamburger: `aria-label="Open navigation menu"`
  - Menu items: `aria-label="{item name}"`
  - Active item: `aria-current="page"`
- **Focus Management**:
  - Focus trapped in drawer when open (mobile)
  - Focus returns to hamburger when drawer closes
  - Focus outline: 2px solid primary, 2px offset
- **Screen Reader Announcements**:
  - Navigation change: "Navigated to {page name}"
  - Drawer open: "Navigation menu opened"
  - Drawer close: "Navigation menu closed"

---

## D003: Component Style Guide

### Typography Scale

```
H1  █████████████ 96px / 300 / -1.5px    (Page titles, rare)
H2  ██████████ 60px / 300 / -0.5px       (Section headers, rare)
H3  ████████ 48px / 400 / 0px            (Major sections)
H4  ██████ 34px / 400 / 0.25px           (Card headers, "Welcome Back")
H5  █████ 24px / 400 / 0px               (Subsection headers)
H6  ████ 20px / 500 / 0.15px             (Component headers)

Subtitle1  16px / 400 / 0.15px           (Supporting text)
Subtitle2  14px / 500 / 0.1px            (Emphasized supporting text)

Body1      16px / 400 / 0.5px / 1.5      (Default body text)
Body2      14px / 400 / 0.25px / 1.43    (Secondary body text)

Button     14px / 500 / 0.4px / UPPER    (Button labels)
Caption    12px / 400 / 0.4px            (Small text, captions)
Overline   10px / 400 / 1.5px / UPPER    (Overlines, labels)
```

### Color Palette

#### Light Mode

```
PRIMARY (Blue):
  ██████ Main:     #1976d2    Buttons, links, active states
  ██████ Light:    #42a5f5    Hover states
  ██████ Dark:     #1565c0    Active/pressed states

SECONDARY (Gray):
  ██████ Main:     #757575
  ██████ Light:    #9e9e9e
  ██████ Dark:     #616161

ERROR (Red):
  ██████ Main:     #d32f2f    Error messages, destructive actions
  ██████ Light:    #ef5350    Error backgrounds
  ██████ Dark:     #c62828    Error pressed states

WARNING (Orange):
  ██████ Main:     #f57c00    Warning messages
  ██████ Light:    #ff9800    Warning backgrounds
  ██████ Dark:     #ef6c00    Warning pressed states

SUCCESS (Green):
  ██████ Main:     #388e3c    Success messages
  ██████ Light:    #4caf50    Success backgrounds
  ██████ Dark:     #2e7d32    Success pressed states

INFO (Light Blue):
  ██████ Main:     #0288d1    Info messages
  ██████ Light:    #03a9f4    Info backgrounds
  ██████ Dark:     #01579b    Info pressed states

BACKGROUND:
  ██████ Default:  #ffffff    Page background
  ██████ Paper:    #ffffff    Surface background (cards, drawers)

TEXT:
  ██████ Primary:  #212529    Main text (contrast 12.63:1)
  ██████ Secondary:#6c757d    Secondary text (contrast 4.54:1)
  ██████ Disabled: #9e9e9e    Disabled text

DIVIDER:
  ██████           #e0e0e0    Borders, dividers
```

#### Dark Mode

```
PRIMARY (Light Blue):
  ██████ Main:     #90caf9    Buttons, links, active states
  ██████ Light:    #e3f2fd    Hover states
  ██████ Dark:     #42a5f5    Active/pressed states

BACKGROUND:
  ██████ Default:  #121212    Page background (Material Design dark)
  ██████ Paper:    #1e1e1e    Surface background (elevated)

TEXT:
  ██████ Primary:  #fafafa    Main text (contrast 11.85:1)
  ██████ Secondary:#b0b0b0    Secondary text (contrast 4.62:1)
  ██████ Disabled: #616161    Disabled text

DIVIDER:
  ██████           #424242    Borders, dividers
```

### Spacing Scale (8px Base)

```
spacing[0]   0px    ·                   No spacing
spacing[1]   8px    ▪                   Minimal gap
spacing[2]   16px   ▪▪                  Small padding
spacing[3]   24px   ▪▪▪                 Standard padding
spacing[4]   32px   ▪▪▪▪                Section separation
spacing[5]   40px   ▪▪▪▪▪               Larger separation
spacing[6]   48px   ▪▪▪▪▪▪              Major separation
spacing[8]   64px   ▪▪▪▪▪▪▪▪            AppBar height
spacing[12]  96px   ▪▪▪▪▪▪▪▪▪▪▪▪        Large visual breaks
```

### Elevation Scale (Shadows)

```
Level 0   ·  No shadow                  Inline elements
Level 1   ╌  Subtle shadow              Cards at rest
Level 2   ┄  Light shadow               Raised buttons
Level 3   ┈  Medium shadow              AppBar at rest
Level 4   ┉  Medium-high shadow         AppBar scrolled
Level 6   ╍  High shadow                FAB, snackbar
Level 8   ━  Deep shadow                Login card, drawer
Level 12  ═  Very deep shadow           Dialogs
Level 16  ╬  Maximum shadow             Navigation drawer (mobile)
Level 24  ▓  Extreme shadow             Rare, special cases
```

### Button Variants

#### Contained (Primary Action)

```
┌────────────────────────────┐
│        BUTTON TEXT         │  Height: 36px (default)
│    Background: Primary     │  Height: 40px (medium)
│    Text: White             │  Height: 48px (large)
│    Elevation: 2            │
└────────────────────────────┘
   
Hover:   Elevation 4, translateY(-1px)
Active:  Elevation 1, translateY(0)
```

#### Outlined (Secondary Action)

```
┌────────────────────────────┐
│        BUTTON TEXT         │  Border: 1px solid
│    Border: Primary         │  Background: Transparent
│    Text: Primary           │  Text: Primary color
│    Elevation: 0            │
└────────────────────────────┘

Hover:   Background rgba(primary, 0.04)
Active:  Background rgba(primary, 0.12)
```

#### Text (Tertiary Action)

```
    BUTTON TEXT                Text: Primary color
                               Background: Transparent
                               No border
                               
Hover:   Background rgba(primary, 0.04)
Active:  Background rgba(primary, 0.12)
```

### Form Components

#### Text Field (Outlined)

```
┌──────────────────────────────────────────────┐
│ Label (floating, 12px)                       │
│ ┌──────────────────────────────────────────┐ │
│ │ Input text (16px)                   [❌] │ │  Icon (optional)
│ └──────────────────────────────────────────┘ │
│ Helper text (caption, 12px)                  │
└──────────────────────────────────────────────┘

States:
- Default: Border 1px solid #e0e0e0
- Focus:   Border 2px solid Primary
- Error:   Border 2px solid Error + error text
- Disabled: Background #f5f5f5, text disabled color
```

#### Switch (Theme Toggle)

```
Default (Off):  ⚪──────  Track: Gray, Thumb: White
Active (On):    ──────⚪  Track: Primary (0.5 opacity), Thumb: Primary

Transition: 150ms ease-out
Track width: 34px, height: 14px
Thumb diameter: 20px
```

#### Checkbox

```
Unchecked:  ☐  Border 2px solid Secondary
Checked:    ☑  Background Primary, checkmark White
Indeterminate: ☐ with dash

Size: 18×18px
Touch target: 40×40px (padding)
```

### Card Component

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Card Header (optional)                            │
│  Typography: h6, padding: 16px                     │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  Card Content                                      │
│  Padding: 16px (standard), 24px (comfortable)      │
│                                                    │
│  - Text, images, other components                  │
│  - Inherits theme colors                           │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  Card Actions (optional)                           │
│  Buttons right-aligned, padding: 8px               │
│                                                    │
└────────────────────────────────────────────────────┘

Border Radius: 8px (modern, 4px default)
Elevation: 1 (resting), 4 (hover for interactive)
```

### Icon Sizes

```
Small:     18×18px   ▪   Inline with text
Medium:    24×24px   ▪▪  Standard UI icons
Large:     36×36px   ▪▪▪ Feature icons
```

### Border Radius Standards

```
Components:
- Buttons: 8px (modern, softer)
- Text Fields: 8px (outlined variant)
- Cards: 8px (modern)
- Chips: 16px (pill shape, 50% of height)
- Dialogs: 12px (larger surfaces)
- Login Card: 16px (hero element)
- Avatar: 50% (circular)
```

### Animation Timing

```
Micro-interactions:   150ms  Checkbox, switch
Small animations:     200ms  Button hover, field focus
Standard animations:  300ms  Drawer slide, dialog open
Complex (rare):       375ms  Error shake (feedback exception)

Easing:
- ease-out: Entrances, expanding elements
- ease-in:  Exits, collapsing elements
- ease-in-out: State changes, toggles
```

### Touch Targets

```
Minimum (WCAG 2.1 AAA):      44×44px  ☐☐
Recommended (Material):       48×48px  ☐☐☐
Desktop clickable:           ≥32×32px  ☐
```

### Accessibility Indicators

```
Focus Outline:
┌────────────────────────────────┐
║  Focused Element               ║  2px solid Primary
║  2px offset                    ║  Visible on keyboard nav
└────────────────────────────────┘

Keyboard Navigation:
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward
- Enter/Space: Activate buttons, toggle switches
- Arrow Keys: Navigate menus, radio groups
- Esc: Close dialogs, menus
```

### Responsive Breakpoints

```
Mobile:   ≥768px  ▃▃▃▃▃▃         Single column, stacked
Tablet:   ≥992px  ▃▃▃▃▃▃▃▃       2-3 columns, mini drawer
Desktop:  ≥1200px ▃▃▃▃▃▃▃▃▃▃     3-4 columns, full drawer
```

---

## Approval Checklist

### Design Consistency
- [ ] All components follow Material Design 3 principles
- [ ] Color palette meets WCAG AA contrast requirements (4.5:1 minimum)
- [ ] Typography scale is consistent and readable
- [ ] Spacing uses 8px base system throughout
- [ ] Border radius values are consistent across similar components

### Visual Appeal
- [ ] Login page gradient is modern and professional
- [ ] Elevated card creates clear visual hierarchy
- [ ] Dashboard layout feels spacious and organized
- [ ] Dark mode is comfortable for extended use
- [ ] Animations are smooth and purposeful (not distracting)

### Responsiveness
- [ ] Mobile layout (≥768px) is usable with touch targets ≥44×44px
- [ ] Tablet layout (≥992px) makes efficient use of screen space
- [ ] Desktop layout (≥1200px) feels premium and spacious
- [ ] Drawer behavior is appropriate for each breakpoint
- [ ] Content remains readable at all viewport sizes

### Accessibility
- [ ] Keyboard navigation is complete and logical
- [ ] Focus indicators are clearly visible
- [ ] ARIA labels provide context for assistive technologies
- [ ] Color is not the only indicator of state
- [ ] Touch targets meet minimum size requirements

### Brand Alignment
- [ ] Primary color (#1976d2 blue) aligns with enterprise brand
- [ ] Typography (Roboto) is professional and modern
- [ ] Overall aesthetic is professional, not playful
- [ ] Layout conveys stability and reliability
- [ ] Design works for enterprise users (not consumer-focused)

---

## Stakeholder Approval

**Approved By**: ___________________________  
**Date**: ___________________________  
**Signature**: ___________________________

**Comments / Requested Changes**:
```
[Space for stakeholder feedback]




```

**Next Steps After Approval**:
1. Begin Phase 3: Component Implementation (see plan.md)
2. Start with US1 (Enhanced Login Experience)
3. Follow TDD approach (tests first, then implementation)
4. Use design tokens from contracts/theme.ts
5. Reference this mockup document during implementation

---

**Document Version**: 1.0  
**Created**: 2026-02-10  
**Status**: Awaiting Stakeholder Approval  
**Related Documents**: spec.md, data-model.md, plan.md
