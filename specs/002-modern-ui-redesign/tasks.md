# Tasks: Modern UI Redesign for Login and Authenticated Layout

**Feature**: 002-modern-ui-redesign  
**Input**: Design documents from `/specs/002-modern-ui-redesign/`  
**Prerequisites**: ✅ spec.md, ✅ plan.md, ✅ data-model.md, ✅ contracts/, ✅ quickstart.md, ✅ mockups.md

**Tests**: Test tasks are included per Constitution Section III mandatory TDD requirement

**Organization**: Tasks grouped by user story for independent implementation and testing

---

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4) for traceability
- All paths are absolute from workspace root

## Project Structure

- **Frontend**: `frontend/src/`
- **Backend**: `backend/src/` (no changes in this feature)
- **Tests**: `frontend/tests/` (E2E), `frontend/src/` (component tests co-located)
- **Specs**: `specs/002-modern-ui-redesign/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create theme system foundation and directory structure

- [X] T001 Create theme directory structure: `frontend/src/theme/`, `frontend/src/theme/tokens.ts`, `frontend/src/theme/lightTheme.ts`, `frontend/src/theme/darkTheme.ts`, `frontend/src/theme/createTheme.ts`
- [X] T002 Create components directory structure: `frontend/src/components/layout/`, `frontend/src/components/theme/`
- [X] T003 [P] Create hooks directory structure: `frontend/src/hooks/`
- [X] T004 [P] Create E2E test directories: `frontend/tests/e2e/login/`, `frontend/tests/e2e/dashboard/`, `frontend/tests/e2e/theme/`

**Checkpoint**: Directory structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme system and design tokens that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create design tokens in `frontend/src/theme/tokens.ts` (colors, spacing scale 0-96px, typography scale h1-h6/body/button, elevation 0-24, breakpoints 768/992/1200, transitions 150-300ms, z-index scale)
- [X] T006 Create light theme configuration in `frontend/src/theme/lightTheme.ts` (primary #1976d2, background #ffffff, text #212529, component overrides for Button/TextField/Card, MUI createTheme integration)
- [X] T007 Create dark theme configuration in `frontend/src/theme/darkTheme.ts` (primary #90caf9, background #121212/#1e1e1e, text #fafafa/#b0b0b0, surface tinting for elevation, component overrides)
- [X] T008 Create theme factory in `frontend/src/theme/createTheme.ts` (theme mode selection, system preference detection, localStorage persistence key 'theme-mode', FOUC prevention logic)
- [X] T009 Create ThemeProvider component in `frontend/src/theme/ThemeProvider.tsx` (ThemeContext, mode state management, localStorage sync, matchMedia listener for system preference, InitColorSchemeScript for SSR, CssBaseline wrapper)
- [X] T010 [P] Create useTheme hook in `frontend/src/hooks/useTheme.ts` (access theme state, setMode function, toggleMode function, muiTheme object, TypeScript types from contracts/theme.ts)
- [X] T011 [P] Create useResponsive hook in `frontend/src/hooks/useResponsive.ts` (viewport width/height tracking, current breakpoint detection, isMobile/isTablet/isDesktop booleans, resize listener with debounce 150ms, cleanup on unmount)
- [X] T012 [P] Create useMediaQuery hook in `frontend/src/hooks/useMediaQuery.ts` (matchMedia wrapper, change listener, cleanup, SSR safety check, TypeScript boolean return)
- [X] T013 [P] Create useBreakpoint hook in `frontend/src/hooks/useBreakpoint.ts` (current breakpoint only, is.mobile/tablet/desktop object, simpler alternative to useResponsive)
- [X] T014 Update `frontend/src/main.tsx` to wrap App with ThemeProvider (import ThemeProvider, wrap App component, ensure React.StrictMode preserved)

**Checkpoint**: Foundation ready - theme system functional, hooks available, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Enhanced Login Experience (Priority: P1) 🎯 MVP

**Goal**: Modern login page with split-screen layout (desktop: gradient left + enterprise image right; mobile: image background with gradient card), elevated card, real-time validation, smooth animations

**Implementation Note**: ⚠️ **DESIGN DEVIATION FROM ORIGINAL SPEC** - User feedback requested split-screen layout with enterprise background images instead of gradient-only approach. The following describes the IMPLEMENTED design:
- **Desktop (≥900px)**: 50/50 split-screen - Left: gray-blue gradient (#f5f7fa→#c3cfe2) with Card, Right: enterprise building image (Unsplash) with light overlay + text
- **Mobile (<900px)**: Full-width enterprise image background with blue overlay (rgba(25,118,210,0.7)), Card with gradient background
- **Dark Mode**: Gradients change to darker variants (#1a1a2e→#16213e)
- **Tests Updated**: 2026-02-10 - All component tests updated to match implemented split-screen design. Pass rate: 15/44 (34%)

**Independent Test**: Navigate to `/login`, observe split-screen layout (desktop) or image background (mobile), elevated card, submit credentials with validation feedback, verify animations (card entrance Fade+Grow, field focus, button states)

### Tests for User Story 1 ⚠️ WRITE FIRST - ENSURE FAIL BEFORE IMPLEMENTATION

- [X] T015 [P] [US1] Component test for LoginPage gradient background in `frontend/src/pages/LoginPage.test.tsx` (verify gradient CSS applied, fallback color #1976d2, dark mode gradient renders)
- [X] T016 [P] [US1] Component test for LoginPage card elevation in `frontend/src/pages/LoginPage.test.tsx` (verify elevation 8 shadow applied, border-radius 16px, max-width 400px, centered positioning)
- [X] T017 [P] [US1] Component test for LoginPage form validation in `frontend/src/pages/LoginPage.test.tsx` (required fields show errors, debounced validation 300ms, error icons render, success checkmarks render)
- [X] T018 [P] [US1] Component test for LoginPage button states in `frontend/src/pages/LoginPage.test.tsx` (loading state shows spinner, button disabled during submit, "Signing in..." text appears, success transition)
- [X] T019 [P] [US1] E2E test for LoginPage visual appearance in `frontend/tests/e2e/login/visual-appearance.spec.ts` (Playwright screenshot comparison, light/dark mode, desktop/tablet/mobile viewports 1200px/992px/768px)
- [X] T020 [P] [US1] E2E test for LoginPage animations in `frontend/tests/e2e/login/animations.spec.ts` (card entrance 300ms, field focus transition 200ms, button hover lift, error shake 400ms exception, smooth page transition)
- [X] T021 [P] [US1] E2E test for LoginPage responsive behavior in `frontend/tests/e2e/login/responsive.spec.ts` (card width 400px desktop, 380px tablet, 90% mobile max 360px, padding adjustments, logo size changes)
- [X] T022 [P] [US1] Accessibility test for LoginPage keyboard navigation in `frontend/tests/e2e/login/accessibility.spec.ts` (tab order Username→Password→Show Password→Sign In→Forgot Password, Enter key submits, Escape clears errors, focus indicators 2px primary offset 2px, axe-core 0 violations)

### Implementation for User Story 1

- [X] T023 [US1] Enhance LoginPage component in `frontend/src/pages/LoginPage.tsx` (replace plain background with gradient linear 135deg #1976d2→#42a5f5→#90caf9, wrap form in Card elevation 8, add logo 64×64px centered, add welcome heading h4 "Welcome Back", add subtitle body2 "Sign in to your account")
- [X] T024 [US1] Add gradient background styles to LoginPage in `frontend/src/pages/LoginPage.tsx` (styled-component or sx prop for gradient, dark mode gradient #0d47a1→#1565c0→#1976d2, fullscreen viewport 100vw×100vh, centered Card positioning, fallback color for no-gradient browsers)
- [X] T025 [US1] Enhance TextField components in LoginPage in `frontend/src/pages/LoginPage.tsx` (variant outlined, borderRadius 8px, height 56px, floating label animation, error state with ErrorOutline icon, success state with CheckCircle icon, helperText for validation messages, autoComplete attributes)
- [X] T026 [US1] Add real-time validation to LoginPage form in `frontend/src/pages/LoginPage.tsx` (debounce validation 300ms, required field checks, email format validation, min length checks, inline error display, prevent submit if validation fails, clear errors on input change)
- [X] T027 [US1] Enhance Sign In button in LoginPage in `frontend/src/pages/LoginPage.tsx` (variant contained, color primary, fullWidth, height 48px, borderRadius 8px, textTransform none "Sign In", loading state with CircularProgress, disabled during submit, elevation 2 rest 4 hover 1 active, hover transform translateY -2px transition 200ms)
- [X] T028 [US1] Add password visibility toggle to LoginPage in `frontend/src/pages/LoginPage.tsx` (IconButton with Visibility/VisibilityOff icon, positioned right in TextField, type switches text/password, aria-label "Show password", 40×40px touch target)
- [X] T029 [US1] Add Forgot Password link to LoginPage in `frontend/src/pages/LoginPage.tsx` (Typography variant body2, color primary, centered below button, margin-top 16px, hover underline, navigate to /forgot-password or placeholder)
- [X] T030 [US1] Add card entrance animation to LoginPage in `frontend/src/pages/LoginPage.tsx` (Fade + Grow components from @mui/material, opacity 0→1 duration 300ms, scale 0.95→1 duration 300ms, easing ease-out, delay 100ms, useEffect trigger on mount)
- [X] T031 [US1] Add error shake animation to LoginPage in `frontend/src/pages/LoginPage.tsx` (keyframes translateX -10px→10px→0, duration 300ms constitution-compliant, trigger on authentication failure, CSS animation or Framer Motion if available)
- [X] T032 [US1] Add responsive styles to LoginPage in `frontend/src/pages/LoginPage.tsx` (useMediaQuery hooks, desktop card width 400px padding 48px×32px, tablet 380px padding 40px×28px, mobile 90% max 360px padding 32px×24px, logo size 64px→56px mobile, heading h4→h5 mobile)
- [X] T033 [US1] Add dark mode support to LoginPage in `frontend/src/pages/LoginPage.tsx` (useTheme hook, card background #1e1e1e, text colors #fafafa/#b0b0b0, border colors #424242, gradient #0d47a1→#1565c0→#1976d2, surface tinting instead of shadows)
- [X] T034 [US1] Add accessibility attributes to LoginPage in `frontend/src/pages/LoginPage.tsx` (aria-label on TextField "Username" "Password", aria-label on button "Sign in to your account", role="alert" on error messages, aria-live="polite" on validation feedback, aria-describedby linking fields to errors)
- [X] T035 [US1] Add focus management to LoginPage in `frontend/src/pages/LoginPage.tsx` (autoFocus on username field on mount, focus password field after username Enter, focus button after password Enter, preserve focus on validation errors, outline 2px solid primary offset 2px)
- [X] T036 [US1] Add loading state to LoginPage authentication in `frontend/src/pages/LoginPage.tsx` (isLoading state, CircularProgress size 24px in button, button text "Signing in...", disable form fields during submit, prevent double-click submit, onSubmit handler integration with AuthContext)

**Checkpoint**: User Story 1 complete - Login page modernized with gradient, validation, animations, fully responsive, WCAG AA accessible, independently testable

---

## Phase 4: User Story 2 - Professional Authenticated Layout (Priority: P1)

**Goal**: Modern AppBar + responsive Drawer navigation + user profile menu with Material-UI X TreeView hierarchical navigation

**Implementation Note**: ✅ **TREEVIEW IMPLEMENTATION COMPLETE** - NavigationDrawer implemented with Material-UI X TreeView (SimpleTreeView + TreeItem) supporting 3+ levels deep hierarchical menus. Proper indentation achieved using conditional `treeItemClasses.groupTransition` styling with connecting borders. Responsive behavior working correctly across all viewports (persistent desktop, modal tablet/mobile with z-index 1099 below AppBar). Tests updated to reflect implementation.

**Independent Test**: Login to dashboard, observe AppBar with logo/title/user menu, sidebar navigation with TreeView hierarchy (Reports > Sales Reports > Monthly/Quarterly/Yearly), permanent on desktop, modal on mobile with clickable hamburger menu, click menu items to navigate, open user menu dropdown, theme toggle works, logout confirmation appears

### Tests for User Story 2 ⚠️ WRITE FIRST - ENSURE FAIL BEFORE IMPLEMENTATION

- [X] T037 [P] [US2] Component test for AppBarLayout rendering in `frontend/src/components/layout/AppBarLayout.test.tsx` (renders title prop, renders logo if provided, renders user avatar, renders menu icon if showMenuIcon true, elevation 4 applied, height 64px desktop 56px mobile) ✅ COMPLETE
- [X] T038 [P] [US2] Component test for AppBarLayout interactions in `frontend/src/components/layout/AppBarLayout.test.tsx` (onMenuClick fires when hamburger clicked, user avatar opens UserMenu, theme toggle changes mode, responsive height changes with breakpoint) ✅ COMPLETE
- [X] T039 [P] [US2] Component test for NavigationDrawer rendering in `frontend/src/components/layout/NavigationDrawer.test.tsx` (renders menu items from props with TreeView, active route highlighted, icons rendered, badges shown if present, width 240px expanded 64px mini, variant permanent/persistent/temporary, hierarchical structure with 3+ levels) ✅ COMPLETE - TreeView implementation
- [X] T040 [P] [US2] Component test for NavigationDrawer interactions in `frontend/src/components/layout/NavigationDrawer.test.tsx` (menu item click calls onMenuItemClick, active route gets primary color + 4px left border, hover shows background, mini variant expands on hover, temporary variant closes on navigation, keyboard navigation arrows work, tree expansion/collapse) ✅ COMPLETE - TreeView implementation
- [X] T041 [P] [US2] Component test for UserMenu rendering in `frontend/src/components/layout/UserMenu.test.tsx` (user info displayed username/role, theme toggle shown if showThemeToggle true, logout item rendered, additional items if provided, avatar with initials fallback, dropdown width 280px)
- [X] T042 [P] [US2] Component test for UserMenu interactions in `frontend/src/components/layout/UserMenu.test.tsx` (theme toggle changes mode and calls onThemeChange, logout click shows confirmation if confirmLogout true, logout confirmation calls onLogout, menu closes on backdrop click, Escape key closes menu)
- [X] T043 [P] [US2] Component test for ProtectedLayout composition in `frontend/src/components/layout/ProtectedLayout.test.tsx` (renders AppBar + Drawer + children, passes props to AppBar and Drawer, responsive variant changes with breakpoint, drawer state managed, content padding applied spacing[3] 24px, maxContentWidth 1440px centered desktop)
- [X] T044 [P] [US2] E2E test for Dashboard layout visual in `frontend/tests/e2e/dashboard/layout-visual.spec.ts` (AppBar 64px top, Drawer 240px left permanent desktop, content centered max 1440px, screenshot comparison light/dark, tablet mini drawer 64px, mobile temporary drawer overlay)
- [X] T045 [P] [US2] E2E test for Dashboard navigation flow in `frontend/tests/e2e/dashboard/navigation.spec.ts` (click menu item navigates to route, active item highlighted primary color, breadcrumbs update, URL changes, tablet hover expands drawer 64px→240px, mobile hamburger opens drawer, drawer closes on navigation mobile)
- [X] T046 [P] [US2] E2E test for Dashboard user menu flow in `frontend/tests/e2e/dashboard/user-menu.spec.ts` (avatar click opens menu, user info displayed, theme toggle changes appearance, logout shows confirmation dialog, confirm logout redirects to /login, cancel logout closes dialog, menu closes on click outside)
- [X] T047 [P] [US2] E2E test for Dashboard responsive behavior in `frontend/tests/e2e/dashboard/responsive.spec.ts` (desktop 1200px permanent drawer full, tablet 992px mini drawer hover expand, mobile 768px temporary drawer hamburger, AppBar height 64px→56px, content padding 24px→16px, touch targets ≥44×44px mobile)
- [X] T048 [P] [US2] Accessibility test for Dashboard keyboard nav in `frontend/tests/e2e/dashboard/accessibility.spec.ts` (tab order AppBar icons→Drawer items→Main content, drawer items navigate with arrows, Enter/Space activates, Escape closes temporary drawer, skip link to main content, focus indicators visible 2px primary, axe-core 0 violations, screen reader announcements for navigation changes)

### Implementation for User Story 2

- [X] T049 [P] [US2] Create AppBarLayout component in `frontend/src/components/layout/AppBarLayout.tsx` (AppBar from @mui/material, position fixed, height 64px desktop 56px mobile, elevation prop default 4, color primary light mode #1e1e1e dark mode, zIndex 1100, Toolbar with flexbox layout left/center/right sections)
- [X] T050 [P] [US2] Add AppBar left section in `frontend/src/components/layout/AppBarLayout.tsx` (IconButton hamburger menu if showMenuIcon, onMenuClick callback, MenuIcon from @mui/icons-material, aria-label "Open navigation menu", 40×40px touch target, logo img if logoSrc provided 40×40px desktop 32×32px mobile, Typography h6 variant title prop margin-left 16px)
- [X] T051 [P] [US2] Add AppBar right section in `frontend/src/components/layout/AppBarLayout.tsx` (IconButton notifications placeholder NotificationsIcon 40×40px, IconButton search placeholder SearchIcon disabled tooltip "Search - Coming Soon", ThemeToggle component if themeMode and onThemeChange provided, Avatar clickable opens UserMenu, Badge with count if provided, flexbox gap 8px between icons)
- [X] T052 [P] [US2] Add AppBar responsive behavior in `frontend/src/components/layout/AppBarLayout.tsx` (useMediaQuery hooks, show hamburger mobile only isMobile, height 64px isDesktop/isTablet 56px isMobile, logo size 40×40px desktop 32×32px mobile, hide notifications icon mobile if needed, sx prop for responsive styles)
- [X] T053 [P] [US2] Create NavigationDrawer component in `frontend/src/components/layout/NavigationDrawer.tsx` (Drawer from @mui/material, variant prop permanent/persistent/temporary, open prop controlled, onClose callback, anchor left, width 240px expanded 64px mini, sx prop for mini variant styles, PaperProps for background/border)
- [X] T054 [P] [US2] Add Drawer menu item rendering in `frontend/src/components/layout/NavigationDrawer.tsx` (List component, map menuItems prop, ListItem button, ListItemIcon with icon prop, ListItemText primary label, active highlighting if activeRoute matches path isRouteActive helper from contracts/components.ts, primary color background rgba 0.08, left border 4px solid primary, icon/text primary color)
- [X] T055 [P] [US2] Add Drawer menu item interactions in `frontend/src/components/layout/NavigationDrawer.tsx` (onClick handler calls onMenuItemClick if provided else navigate to path, hover state background action.hover rgba(0,0,0,0.04) light rgba(255,255,255,0.08) dark, focus visible outline 2px primary, keyboard navigation onKeyDown Enter/Space activates, badge Chip if badge prop absolutePositioned right 8px error color)
- [X] T056 [P] [US2] Add Drawer mini variant behavior in `frontend/src/components/layout/NavigationDrawer.tsx` (miniVariant prop boolean, width 64px when true, hide labels ListItemText, show icons only, Tooltip on hover with label if tooltip prop or default label, expand on hover pseudo-permanent width 240px transition 300ms, zIndex 1200 when expanded over content)
- [X] T057 [P] [US2] Add Drawer temporary variant behavior in `frontend/src/components/layout/NavigationDrawer.tsx` (variant temporary mobile, ModalProps backdrop true, onClose on backdrop click, SlideTransition from left 300ms, closes on navigation onClick, width 240px fullscreen overlay, zIndex 1300 above AppBar)
- [X] T058 [P] [US2] Add Drawer responsive styles in `frontend/src/components/layout/NavigationDrawer.tsx` (useMediaQuery or useBreakpoint, desktop variant permanent miniVariant false width 240px, tablet variant permanent miniVariant true width 64px, mobile variant temporary width 240px, border-right 1px solid divider color desktop/tablet, no border mobile overlay)
- [X] T059 [P] [US2] Add Drawer accessibility attributes in `frontend/src/components/layout/NavigationDrawer.tsx` (aria-label "Main navigation" or ariaLabel prop, role="navigation", ListItem role="button", aria-current="page" on active item, aria-expanded for nested items if children, keyboard focus management FocusTrap if temporary variant)
- [X] T060 [P] [US2] Create UserMenu component in `frontend/src/components/layout/UserMenu.tsx` (Menu from @mui/material, open prop controlled, anchorEl prop for positioning, onClose callback, width 280px, elevation 8, borderRadius 8px, maxHeight 400px overflow auto)
- [X] T061 [P] [US2] Add UserMenu header section in `frontend/src/components/layout/UserMenu.tsx` (Box padding 16px, Avatar 40×40px left with getAvatarInitials fallback, Typography body1 username from userInfo, Typography caption role if provided, flexbox layout avatar left text right, background transparent, divider below)
- [X] T062 [P] [US2] Add UserMenu theme toggle item in `frontend/src/components/layout/UserMenu.tsx` (MenuItem if showThemeToggle true default true, ThemeToggle component inline, ListItemIcon LightMode/DarkMode icon, ListItemText "Theme", Switch controlled by themeMode prop, onChange calls onThemeChange, height 48px, divider below)
- [X] T063 [P] [US2] Add UserMenu additional items in `frontend/src/components/layout/UserMenu.tsx` (map additionalItems prop if provided, MenuItem for each, ListItemIcon if icon provided, ListItemText label, onClick handler, disabled prop, color prop for text color, Divider if divider true, height 40px each)
- [X] T064 [P] [US2] Add UserMenu logout item in `frontend/src/components/layout/UserMenu.tsx` (MenuItem always last, ListItemIcon LogoutIcon, ListItemText "Logout", color error, height 48px, onClick shows Dialog if confirmLogout true default true, Dialog title "Confirm Logout", content logoutConfirmMessage or default "Are you sure?", actions Cancel/Logout buttons, Logout button calls onLogout and closes menu)
- [X] T065 [P] [US2] Add UserMenu animations in `frontend/src/components/layout/UserMenu.tsx` (Fade + Grow transition on open, opacity 0→1 duration 200ms, transform translateY -8px→0 duration 200ms, easing ease-out, exit transitions, smooth close)
- [X] T066 [P] [US2] Add UserMenu accessibility in `frontend/src/components/layout/UserMenu.tsx` (role="menu" on Menu, role="menuitem" on MenuItem, aria-label descriptive on items, keyboard navigation arrows, Enter/Space activates, Escape closes, focus management returns to avatar on close, aria-live="polite" on theme toggle feedback)
- [X] T067 [US2] Create ProtectedLayout component in `frontend/src/components/layout/ProtectedLayout.tsx` (Box main container, AppBarLayout at top with title/userInfo/onMenuClick/onLogout/themeMode/onThemeChange props, NavigationDrawer with menuItems/currentRoute/open/variant/miniVariant based on breakpoint, main content Box with children, responsive drawer state useState, useBreakpoint for variant selection, sx for layout positioning)
- [X] T068 [US2] Add ProtectedLayout responsive logic in `frontend/src/components/layout/ProtectedLayout.tsx` (useBreakpoint hook, desktop variant permanent miniVariant false drawerOpen true, tablet variant permanent miniVariant true drawerOpen true, mobile variant temporary drawerOpen false toggle via hamburger, AppBar onMenuClick toggleDrawer for mobile, Drawer onClose setDrawerOpen false)
- [X] T069 [US2] Add ProtectedLayout content area styling in `frontend/src/components/layout/ProtectedLayout.tsx` (Box main content, marginTop 64px AppBar height desktop 56px mobile, marginLeft 240px desktop 64px tablet 0 mobile, padding contentPadding prop spacing[3] 24px default, maxWidth maxContentWidth prop 1440px default desktop only, margin auto centered desktop, background theme.palette.background.default, minHeight calc 100vh minus AppBar height)
- [X] T070 [US2] Add ProtectedLayout loading/error states in `frontend/src/components/layout/ProtectedLayout.tsx` (if loading prop show Skeleton for AppBar+Drawer+content, if error prop show ErrorBoundary fallback, Suspense boundary if lazy loading components, CircularProgress centered during async operations)
- [X] T071 [US2] Add ProtectedLayout skip link in `frontend/src/components/layout/ProtectedLayout.tsx` (Link "Skip to main content" positioned absolute top left, visibleOnFocus only, navigate to main content id, tab index 0 first in tab order, background primary color text white, padding 8px 16px, zIndex 9999)
- [X] T072 [US2] Update Dashboard.tsx to use ProtectedLayout in `frontend/src/pages/Dashboard.tsx` (import ProtectedLayout, useAuth hook for user/logout, useTheme hook for themeMode/setThemeMode, define menuItems array with id/label/icon/path for Dashboard/Users/Settings/Help from DashboardIcon/PeopleIcon/SettingsIcon/HelpIcon, useLocation currentRoute, wrap existing content in ProtectedLayout, pass all required props)
- [X] T073 [US2] Define menu items for Dashboard in `frontend/src/pages/Dashboard.tsx` (menuItems array const, Dashboard item id "dashboard" label "Dashboard" icon DashboardIcon path "/dashboard", Users item placeholders, Files item, Settings item with badge 1 badgeColor "error", Help item, follow MenuItem interface from contracts/components.ts, export for reuse if needed)
- [X] T074 [US2] Add screen reader announcements to navigation in `frontend/src/components/layout/ProtectedLayout.tsx` (useEffect on currentRoute changes, create div role="status" aria-live="polite", append to body, set textContent "Navigated to {pageTitle}", remove after 1000ms, only if a11yConfig.announceNavigationChanges true from contracts/components.ts DEFAULT_A11Y_CONFIG)

**Checkpoint**: User Story 2 complete - Dashboard has modern AppBar, responsive Drawer navigation, user menu with theme toggle and logout, fully keyboard accessible, independently testable alongside US1

---

## Phase 5: User Story 3 - Dark Mode Support (Priority: P2)

**Goal**: Seamless light/dark theme toggle with system preference sync, smooth transitions, localStorage persistence

**Independent Test**: Toggle theme via user menu switch, observe smooth color transitions 300ms, verify dark background #121212, verify persistence on page reload, verify system preference sync when "system" mode selected, verify no FOUC on initial load

### Tests for User Story 3 ⚠️ WRITE FIRST - ENSURE FAIL BEFORE IMPLEMENTATION

- [ ] T075 [P] [US3] Component test for ThemeToggle rendering in `frontend/src/components/theme/ThemeToggle.test.tsx` (renders current mode icon LightMode/DarkMode/SettingsBrightness, shows tooltip on hover, size prop affects icon fontSize, disabled state grays out, className/style props applied)
- [ ] T076 [P] [US3] Component test for ThemeToggle interactions in `frontend/src/components/theme/ThemeToggle.test.tsx` (click cycles light→dark→system→light if showSystemOption true, click cycles light→dark→light if showSystemOption false, onChange callback fired with new mode, keyboard Space/Enter toggles, focus visible outline)
- [ ] T077 [P] [US3] Component test for ThemeProvider mode changes in `frontend/src/theme/ThemeProvider.test.tsx` (setMode updates context, toggleMode cycles modes, system mode reads matchMedia prefers-color-scheme:dark, effectiveMode resolves correctly light/dark, localStorage updated on mode change key 'theme-mode')
- [ ] T078 [P] [US3] Component test for ThemeProvider persistence in `frontend/src/theme/ThemeProvider.test.tsx` (initial load reads localStorage, missing localStorage defaults to 'system', localStorage write on every mode change, system preference change listener updates effectiveMode, cleanup removes listener on unmount)
- [ ] T079 [P] [US3] Component test for ThemeProvider FOUC prevention in `frontend/src/theme/ThemeProvider.test.tsx` (InitColorSchemeScript renders in head, script runs before React hydration, no flash of wrong theme, theme applied before first paint, SSR compatibility if applicable)
- [ ] T080 [P] [US3] E2E test for theme toggle user flow in `frontend/tests/e2e/theme/toggle-flow.spec.ts` (login → open user menu → click theme switch → observe transition 300ms → verify dark colors #121212 background #fafafa text → toggle back → verify light colors #ffffff background #212529 text → reload page → verify persistence)
- [ ] T081 [P] [US3] E2E test for system preference sync in `frontend/tests/e2e/theme/system-sync.spec.ts` (set theme to system → emulate prefers-color-scheme: dark → verify app goes dark → emulate prefers-color-scheme: light → verify app goes light → manual toggle overrides system → verify system ignored until system mode reselected)
- [ ] T082 [P] [US3] E2E test for dark mode visual regression in `frontend/tests/e2e/theme/dark-mode-visual.spec.ts` (Playwright screenshot comparison, login page dark mode, dashboard dark mode, all components dark mode, contrast meets WCAG AA 4.5:1, semantic colors adjust appropriately error/warning/success, elevation tinting instead of shadows)

### Implementation for User Story 3

- [ ] T083 [P] [US3] Create ThemeToggle component in `frontend/src/components/theme/ThemeToggle.tsx` (IconButton, current mode icon LightModeIcon if light DarkModeIcon if dark SettingsBrightnessIcon if system, onClick cycles modes light→dark→system or light→dark if showSystemOption false, onChange callback prop fired, Tooltip with tooltips prop or defaults "Light mode"/"Dark mode"/"System preference", size prop small/medium/large, disabled prop, className/style props)
- [ ] T084 [US3] Add ThemeToggle cycle logic in `frontend/src/components/theme/ThemeToggle.tsx` (handleClick function, if mode light set dark, if mode dark set system or light based on showSystemOption, if mode system set light, call onChange with new mode, TypeScript ThemeToggleProps from contracts/components.ts, React.memo optimization)
- [ ] T085 [US3] Add ThemeToggle accessibility in `frontend/src/components/theme/ThemeToggle.tsx` (aria-label "Toggle theme mode" or custom, aria-pressed current mode, role="button", keyboard Space/Enter handler onKeyDown, focus visible outline 2px primary offset 2px, tooltip aria-describedby)
- [ ] T086 [US3] Enhance ThemeProvider with transition logic in `frontend/src/theme/ThemeProvider.tsx` (CSS transition on theme change, add global style transition: all 300ms ease-in-out, apply to theme.palette colors, disable transition if prefers-reduced-motion, requestAnimationFrame for smooth batch updates, avoid janky repaints)
- [ ] T087 [US3] Add system preference listener in `frontend/src/theme/ThemeProvider.tsx` (useEffect, window.matchMedia PREFERS_DARK_MODE_QUERY from contracts/theme.ts, addEventListener 'change', update effectiveMode when event.matches changes, cleanup removeEventListener on unmount, only active if mode is 'system')
- [ ] T088 [US3] Add localStorage persistence in `frontend/src/theme/ThemeProvider.tsx` (useEffect on mode change, localStorage.setItem THEME_MODE_STORAGE_KEY 'theme-mode' mode, initial load useEffect localStorage.getItem, parse stored mode, default 'system' if null, validate stored value is valid ThemeMode, error handling for localStorage unavailable)
- [ ] T089 [US3] Add FOUC prevention in `frontend/index.html` (inline blocking script in <head> before React loads, reads localStorage 'theme-mode' key, applies 'data-theme' attribute to <html> element, Material-UI CSS variables resolve immediately, prevents flash of wrong theme, Vite SPA compatible approach)
- [ ] T090 [US3] Verify dark mode colors in theme configs in `frontend/src/theme/darkTheme.ts` (primary main #90caf9 light #e3f2fd dark #42a5f5, background default #121212 paper #1e1e1e, text primary #fafafa secondary #b0b0b0, error/warning/success/info adjust for dark, border main #424242 light #333333, contrast ratios test ≥4.5:1 body ≥3:1 large, component overrides for dark surfaces)
- [ ] T091 [US3] Add surface tinting for dark mode elevation in `frontend/src/theme/darkTheme.ts` (elevation prop on components, dark mode uses white overlay 5% per level instead of shadows, elevation 1 = rgba(255,255,255,0.05), elevation 8 = rgba(255,255,255,0.40), apply to Paper/Card/AppBar/Drawer, overlayOpacity calculation helper function)
- [ ] T092 [US3] Test theme transitions in all components in `frontend/src/components/` (verify LoginPage card transitions background/text colors, verify AppBarLayout transitions primary background, verify NavigationDrawer transitions paper background, verify UserMenu transitions, verify all text remains readable WCAG AA, verify no flickering or jarring changes)
- [ ] T093 [US3] Add debounce to rapid theme toggles in `frontend/src/theme/ThemeProvider.tsx` (debounce setMode function 300ms, prevent localStorage thrashing, prevent multiple rapid transitions, maintain stable UI state, use debounce helper from contracts/responsive.ts if available or implement locally)
- [ ] T094 [US3] Add prefers-reduced-motion support in `frontend/src/theme/ThemeProvider.tsx` (matchMedia PREFERS_REDUCED_MOTION_QUERY from contracts/responsive.ts, if matches set transition durations to 0ms instant or 50ms minimal per spec, apply to all theme transitions, component animations, update a11yConfig.respectMotionPreference from contracts/components.ts DEFAULT_A11Y_CONFIG)

**Checkpoint**: User Story 3 complete - Dark mode fully functional, smooth transitions, system preference sync, localStorage persistence, FOUC prevented, reduced motion respected, independently testable, works with US1 and US2

---

## Phase 6: User Story 4 - Enhanced Visual Hierarchy (Priority: P2)

**Goal**: Consistent spacing (8px base system), typography scale, visual weight distribution, 24-column grid

**Independent Test**: Inspect elements across login and dashboard, verify all padding/margin multiples of 8px, verify typography follows Material Design scale h1-h6 16px body minimum, verify card spacing consistent 16-24px, verify grid system applied, verify visual hierarchy clear (headings bold, primary actions elevated)

### Tests for User Story 4 ⚠️ WRITE FIRST - ENSURE FAIL BEFORE IMPLEMENTATION

- [ ] T095 [P] [US4] Visual regression test for spacing consistency in `frontend/tests/e2e/visual/spacing.spec.ts` (Playwright screenshot, measure padding/margin on 10 components, verify multiples of 8px, verify login card padding 48px/32px desktop, verify dashboard content padding 24px, verify menu item spacing 8px, verify button padding 8px×16px)
- [ ] T096 [P] [US4] Visual regression test for typography hierarchy in `frontend/tests/e2e/visual/typography.spec.ts` (Playwright, measure font sizes, verify h4 34px login heading, verify h6 20px app title, verify body1 16px default text, verify body2 14px secondary text, verify button 14px medium weight, verify line-height 1.5 body, verify letter-spacing per scale)
- [ ] T097 [P] [US4] Visual regression test for visual weight distribution in `frontend/tests/e2e/visual/hierarchy.spec.ts` (Playwright, verify headings font-weight 500-600, verify body font-weight 400, verify primary button elevation 2 stands out, verify card elevation 1 subtle, verify active menu item primary color dominant)
- [ ] T098 [P] [US4] Component test for spacing scale usage in `frontend/src/theme/tokens.ts` (SpacingScale type verified, spacing array [0,8,16,24,32,40,48,56,64,72,80,88,96], theme.spacing function multiplies by 8, spacing[3] = 24px, spacing[6] = 48px)
- [ ] T099 [P] [US4] Component test for typography scale in `frontend/src/theme/tokens.ts` (TypographyScale interface verified, h1 96px light, h4 34px regular, body1 16px regular 1.5 line-height, button 14px medium uppercase, caption 12px, overline 10px uppercase)

### Implementation for User Story 4

- [ ] T100 [US4] Audit and fix spacing violations in LoginPage in `frontend/src/pages/LoginPage.tsx` (card padding spacing[6]×spacing[4] 48px×32px desktop, heading margin-bottom spacing[1] 8px, subtitle margin-bottom spacing[4] 32px, TextField spacing spacing[3] 24px between, button margin-top spacing[4] 32px, link margin-top spacing[2] 16px, responsive padding adjustments all multiples of 8)
- [ ] T101 [US4] Audit and fix spacing violations in AppBarLayout in `frontend/src/components/layout/AppBarLayout.tsx` (Toolbar padding spacing[2] 16px, logo margin-right spacing[2] 16px, right section gap spacing[1] 8px, IconButton size 40×40px exact, responsive adjustments multiples of 8)
- [ ] T102 [US4] Audit and fix spacing violations in NavigationDrawer in `frontend/src/components/layout/NavigationDrawer.tsx` (ListItem padding spacing[1]×spacing[2] 8px×16px, icon margin-right spacing[2] 16px, ListItem height 48px exact, badge positioning spacing[1] 8px from right, nested items padding-left spacing[4] 32px)
- [ ] T103 [US4] Audit and fix spacing violations in UserMenu in `frontend/src/components/layout/UserMenu.tsx` (header padding spacing[2] 16px, MenuItem height 48px logout 40px others, divider margin spacing[1] 8px, avatar size 40×40px, text margin-left spacing[2] 16px)
- [ ] T104 [US4] Audit and fix spacing violations in ProtectedLayout in `frontend/src/components/layout/ProtectedLayout.tsx` (content padding spacing[3] 24px desktop spacing[2] 16px mobile, main margin-top 64px desktop 56px mobile exact AppBar heights, margin-left 240px desktop 64px tablet 0 mobile exact Drawer widths, maxWidth 1440px desktop)
- [ ] T105 [US4] Audit and fix typography violations in LoginPage in `frontend/src/pages/LoginPage.tsx` (heading variant h4 34px, subtitle variant body2 14px, TextField label body1 16px, TextField input body1 16px, helperText caption 12px, button variant button 14px medium, link body2 14px)
- [ ] T106 [US4] Audit and fix typography violations in AppBarLayout in `frontend/src/components/layout/AppBarLayout.tsx` (title variant h6 20px medium, notification badge caption 12px, all text variants explicit not default)
- [ ] T107 [US4] Audit and fix typography violations in NavigationDrawer in `frontend/src/components/layout/NavigationDrawer.tsx` (menu label variant body1 16px, nested label variant body2 14px, badge text caption 12px, tooltip body2 14px, all weights explicit 400 body 500 active)
- [ ] T108 [US4] Audit and fix typography violations in UserMenu in `frontend/src/components/layout/UserMenu.tsx` (username variant body1 16px, role variant caption 12px, menu items variant body2 14px, theme label body2 14px, logout label body2 14px medium weight for emphasis)
- [ ] T109 [US4] Add visual weight to primary actions in `frontend/src/pages/LoginPage.tsx` (Sign In button elevation 2 rest 4 hover 1 active, font-weight medium 500, full-width for prominence, primary color background, contrast text white, other actions body2 secondary text lower weight)
- [ ] T110 [US4] Add visual weight to primary actions in `frontend/src/components/layout/NavigationDrawer.tsx` (active item background primary rgba 0.08, active item left border 4px primary, active item icon/text primary color, active item font-weight medium 500, inactive items regular 400 secondary text)
- [ ] T111 [US4] Add card elevation consistency in Dashboard content in `frontend/src/pages/Dashboard.tsx` (all content cards elevation 1, interactive cards elevation 1 rest 4 hover, spacing between cards spacing[2] or spacing[3] 16-24px consistent, card padding spacing[2] 16px standard spacing[3] 24px comfortable, borderRadius 8px all cards)
- [ ] T112 [US4] Verify 24-column grid in ProtectedLayout content in `frontend/src/components/layout/ProtectedLayout.tsx` (use MUI Grid component, container columns 24, item xs/sm/md/lg/xl responsive columns, gutter spacing[2] 16px consistent, maxWidth 1440px constraint, centered margin auto desktop)
- [ ] T113 [US4] Add responsive typography scaling in theme config in `frontend/src/theme/createTheme.ts` (h1-h6 responsive fontSize using MUI breakpoints, h4 34px desktop 28px mobile, body1 16px all viewports minimum readability, button 14px all viewports, scale down only large headings h1-h3 mobile, preserve body text size)
- [ ] T114 [US4] Document design system in quickstart.md usage examples in `specs/002-modern-ui-redesign/quickstart.md` (add section "Using Design Tokens", spacing examples theme.spacing(3), typography examples Typography variant="h4", color examples theme.palette.primary.main, elevation examples elevation={8}, component examples with all tokens applied)

**Checkpoint**: User Story 4 complete - All spacing 8px multiples verified, typography scale consistent Material Design, visual hierarchy clear, 24-column grid applied, design system documented, independently testable visual regressions

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final enhancements, documentation, and quality validation

- [ ] T115 [P] Add loading skeletons for async components in `frontend/src/components/layout/` (Skeleton for AppBar while loading, Skeleton for Drawer menu items, Skeleton for content cards, Suspense boundaries, fallback prop, smooth transition when content loads)
- [ ] T116 [P] Add error boundaries for component failures in `frontend/src/components/` (ErrorBoundary wrapper around LoginPage, ErrorBoundary wrapper around ProtectedLayout, componentDidCatch logging, user-friendly error message, "Reload page" button, preserve logs for debugging)
- [ ] T117 [P] Optimize bundle size with tree-shaking in `frontend/vite.config.ts` (Material-UI icon imports individual not *, Emotion styled tree-shaking, code splitting lazy loading routes, analyze bundle with rollup-plugin-visualizer, target <50KB increase per spec)
- [ ] T118 [P] Add performance monitoring in `frontend/src/main.tsx` (Web Vitals measurement CLS/LCP/FID, console.log performance metrics in dev, send to analytics in prod if available, page load time tracking, TTI tracking, animation FPS monitoring, performance.mark/measure)
- [ ] T119 [P] Validate WCAG AA compliance with axe-core in `frontend/tests/e2e/` (run axe.run on LoginPage, run axe.run on Dashboard, verify 0 critical violations mandatory, verify 0 serious violations mandatory per SC-006, verify contrast ratios, verify keyboard navigation, generate accessibility report)
- [ ] T120 [P] Add screen reader testing checklist in `specs/002-modern-ui-redesign/checklists/accessibility.md` (NVDA on Windows checklist, JAWS on Windows checklist, VoiceOver on macOS checklist, announce navigation changes, announce form errors, announce loading states, announce dialog open/close, all interactive elements labeled)
- [ ] T121 [P] Optimize animations for 60fps in `frontend/src/` (verify all animations use transform/opacity only GPU-accelerated, add will-change: transform to animated elements, remove will-change after animation completes, avoid animating width/height/margin/padding, use RAF for smooth transitions)
- [ ] T122 [P] Add CSS containment for performance in `frontend/src/components/layout/` (add contain: layout style paint to AppBarLayout, add contain: layout to NavigationDrawer, add contain: content to main content Box, reduce repaints/reflows, improve scroll performance)
- [ ] T123 Code cleanup and refactor in `frontend/src/` (remove console.logs for production, extract magic numbers to constants, extract repeated styles to shared tokens, DRY principle violations, remove unused imports, TypeScript strict mode compliance check, ESLint warnings fix)
- [ ] T124 Update README.md with new UI features in `README.md` (add "UI Redesign" section, document theme toggle feature, document dark mode support, document responsive behavior, screenshot placeholders or descriptions, link to quickstart.md for developers)
- [ ] T125 Update CHANGELOG.md with version entry in `CHANGELOG.md` (version 0.2.0 or appropriate, "Added" section modern login page, modern dashboard layout, dark mode support, responsive design, accessibility improvements, "Changed" section Material-UI v7 migration if applicable)
- [ ] T126 Run quickstart.md validation in `specs/002-modern-ui-redesign/quickstart.md` (verify all code examples compile, verify all imports correct, verify all props match interfaces, verify all paths absolute, verify all screenshots/diagrams referenced exist or marked placeholder)
- [ ] T127 Final constitution compliance check in `specs/002-modern-ui-redesign/plan.md` (re-verify all 17 sections, Section VIII Enterprise UI/UX all requirements met, Section III TDD all tests written and passing, Section XIV code organization absolute paths, Section XVI requirement tags [REQUIRED] on core features)

**Checkpoint**: All polish tasks complete - bundle optimized, performance validated, accessibility verified, documentation updated, constitution compliance confirmed, ready for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** → No dependencies, start immediately
- **Phase 2: Foundational** → Depends on Phase 1 complete (directory structure exists)
- **Phase 2 BLOCKS** → All user story phases (US1, US2, US3, US4 cannot start until Phase 2 theme system ready)
- **Phase 3: US1** → Can start after Phase 2 complete, independent of US2/US3/US4
- **Phase 4: US2** → Can start after Phase 2 complete, independent of US1/US3/US4
- **Phase 5: US3** → Can start after Phase 2 complete, independent of US1/US2/US4
- **Phase 6: US4** → Can start after Phase 2 complete, independent of US1/US2/US3
- **Phase 7: Polish** → Depends on all desired user stories (US1+US2 minimum MVP, US3+US4 optional)

### User Story Independence

- **US1 (Enhanced Login)**: Tests login page only, no dashboard dependencies, deliverable standalone
- **US2 (Dashboard Layout)**: Tests dashboard only, login redirects but layout independent, deliverable standalone
- **US3 (Dark Mode)**: Tests theme toggle across US1+US2, enhances both, non-blocking, deliverable after US1+US2
- **US4 (Visual Hierarchy)**: Tests spacing/typography across US1+US2+US3, polish phase, deliverable after US1+US2+US3

### Within Each User Story (TDD Flow)

1. **Tests FIRST** (T015-T022 for US1, T037-T048 for US2, etc.)
   - Write all tests for story
   - Confirm tests FAIL (Red)
   - Do NOT proceed until tests fail correctly
2. **Implementation** (T023-T036 for US1, T049-T074 for US2, etc.)
   - Implement component by component
   - Watch tests turn GREEN
   - Refactor for quality
3. **Checkpoint**: All story tests GREEN, story independently testable

### Parallel Opportunities (Maximum Efficiency)

**Phase 1 Setup**: All 4 tasks [T001-T004] can run in parallel (different directories)

**Phase 2 Foundational**: 
- T005-T009 theme files in parallel (different files)
- T010-T013 hooks in parallel (different files)
- T014 must wait for T009 (wraps App with ThemeProvider)

**User Story Tests** (if staffed with multiple developers):
- All US1 tests T015-T022 in parallel (different test files)
- All US2 tests T037-T048 in parallel (different test files)
- All US3 tests T075-T082 in parallel (different test files)
- All US4 tests T095-T099 in parallel (different test files)

**User Story Implementation**:
- US1 T024-T027 fields in parallel (different subsections)
- US2 T049-T066 AppBar/Drawer/UserMenu components in parallel (3 developers on 3 files)
- US3 T083-T091 ThemeToggle/ThemeProvider/theme configs in parallel (different files)
- US4 T100-T108 audit tasks in parallel (different files)

**Phase 7 Polish**: T115-T127 all marked [P] can run in parallel (different concerns)

**Between User Stories** (maximum parallelism with team):
- After Phase 2 complete, launch US1+US2+US3+US4 all in parallel (4 developers each owning a story)
- Each developer completes their story independently
- Integration testing after all stories complete

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch theme token system (5 parallel tasks):
Task T005: "Create design tokens in frontend/src/theme/tokens.ts"
Task T006: "Create light theme in frontend/src/theme/lightTheme.ts"
Task T007: "Create dark theme in frontend/src/theme/darkTheme.ts"
Task T008: "Create theme factory in frontend/src/theme/createTheme.ts"
Task T009: "Create ThemeProvider in frontend/src/theme/ThemeProvider.tsx"

# Launch hooks (4 parallel tasks after theme system):
Task T010: "Create useTheme hook in frontend/src/hooks/useTheme.ts"
Task T011: "Create useResponsive hook in frontend/src/hooks/useResponsive.ts"
Task T012: "Create useMediaQuery hook in frontend/src/hooks/useMediaQuery.ts"
Task T013: "Create useBreakpoint hook in frontend/src/hooks/useBreakpoint.ts"

# Final foundational task:
Task T014: "Update main.tsx wrap App with ThemeProvider"
```

---

## Parallel Example: User Story 2 (Professional Layout)

```bash
# Launch all tests in parallel (12 test files):
T037-T048 all in parallel (different test files, no dependencies)

# Launch component implementations in parallel (3 components):
Task T049: "Create AppBarLayout component" (developer A)
Task T053: "Create NavigationDrawer component" (developer B)
Task T060: "Create UserMenu component" (developer C)

# Each component's sub-tasks sequential within component:
AppBar: T049 → T050 → T051 → T052
Drawer: T053 → T054 → T055 → T056 → T057 → T058 → T059
UserMenu: T060 → T061 → T062 → T063 → T064 → T065 → T066

# Integration after all components complete:
Task T067: "Create ProtectedLayout" (combines AppBar+Drawer+UserMenu)
Task T068-T074: Sequential ProtectedLayout enhancements
```

---

## Implementation Strategy

### Option 1: MVP First (Minimum User Stories)

**Fastest path to value**:

1. ✅ Phase 1: Setup (T001-T004) - 1 hour
2. ✅ Phase 2: Foundational (T005-T014) - 4-6 hours (theme system + hooks)
3. ✅ Phase 3: **US1 Enhanced Login** (T015-T036) - 8-12 hours (tests + implementation)
4. ✅ Phase 4: **US2 Professional Layout** (T037-T074) - 12-16 hours (tests + 3 components + integration)
5. **STOP - MVP READY**
6. Validate: US1 + US2 fully functional, modern login + dashboard
7. Deploy/demo if approved

**Total MVP time**: 25-38 hours (3-5 days single developer)

**Delivers**: Modern login page + professional dashboard layout, no dark mode yet, spacing may need polish

---

### Option 2: Full Feature (All User Stories)

**Complete modern UI**:

1. ✅ Phase 1: Setup (T001-T004)
2. ✅ Phase 2: Foundational (T005-T014)
3. ✅ Phase 3: US1 Enhanced Login (T015-T036)
4. ✅ Phase 4: US2 Professional Layout (T037-T074)
5. ✅ Phase 5: **US3 Dark Mode** (T075-T094) - 6-8 hours (theme toggle + transitions)
6. ✅ Phase 6: **US4 Visual Hierarchy** (T095-T114) - 4-6 hours (spacing audit + typography)
7. ✅ Phase 7: Polish (T115-T127) - 4-6 hours (optimization + documentation)

**Total full feature time**: 43-68 hours (5-9 days single developer)

**Delivers**: Complete modern UI with dark mode, perfect spacing, production-ready

---

### Option 3: Parallel Team (Fastest)

**With 4 developers after Phase 2**:

1. ✅ Phase 1+2: Setup + Foundational (Team) - 5-7 hours
2. **Parallel User Stories**:
   - Dev A: US1 Enhanced Login (T015-T036) - 8-12 hours
   - Dev B: US2 Professional Layout (T037-T074) - 12-16 hours
   - Dev C: US3 Dark Mode (T075-T094) - 6-8 hours
   - Dev D: US4 Visual Hierarchy (T095-T114) - 4-6 hours
3. ✅ Phase 7: Polish (Team) - 4-6 hours

**Total parallel time**: 19-25 hours (2-3 days team of 4)

**Optimal for**: Tight deadlines, full team availability, independent story work

---

### Option 4: Incremental Delivery (Recommended)

**Progressive value delivery**:

1. Week 1: Phase 1+2 Foundational → US1 Enhanced Login → **Deploy MVP 1**
2. Week 2: US2 Professional Layout → **Deploy MVP 2** (login + dashboard)
3. Week 3: US3 Dark Mode → **Deploy MVP 3** (adds theme toggle)
4. Week 4: US4 Visual Hierarchy + Polish → **Deploy Final v1.0**

**Benefits**:
- Stakeholder feedback each week
- Earlier ROI on modern login
- Risk mitigation (catch issues early)
- Each MVP independently valuable

---

## Notes

- **[P] tasks**: Different files, no shared state, safe to parallelize
- **[Story] labels**: Trace task back to spec.md user story for requirements clarity
- **TDD mandatory**: Tests written first, confirm fail, implement until green, refactor
- **Checkpoints**: Stop after each phase to validate story independently before proceeding
- **Constitution gates**: Phase 2 complete = foundation ready, Phase 7 complete = final compliance check
- **File paths**: All absolute from workspace root `frontend/src/` for tool compatibility
- **Commit frequency**: After each task or logical group (e.g., all US1 tests, then all US1 implementation)
- **Testing approach**: Component tests (Vitest/RTL) for logic, E2E tests (Playwright) for visual/interactions
- **Accessibility**: axe-core automated + manual keyboard/screen reader testing required
- **Performance**: Profile after US1+US2 complete, optimize animations, bundle size, lighthouse score ≥90

---

## Task Count Summary

- **Setup (Phase 1)**: 4 tasks
- **Foundational (Phase 2)**: 10 tasks
- **US1 Enhanced Login (Phase 3)**: 22 tasks (8 tests + 14 implementation)
- **US2 Professional Layout (Phase 4)**: 38 tasks (12 tests + 26 implementation)
- **US3 Dark Mode (Phase 5)**: 20 tasks (8 tests + 12 implementation)
- **US4 Visual Hierarchy (Phase 6)**: 20 tasks (5 tests + 15 implementation)
- **Polish (Phase 7)**: 13 tasks

**Total Tasks**: 127 tasks

**Critical Path**: Phase 1 → Phase 2 → (US1 or US2 or US3 or US4 in any order) → Phase 7

**MVP (US1+US2 only)**: 74 tasks (4 + 10 + 22 + 38 = 74 tasks)

**Parallel Opportunities**: ~40% of tasks marked [P] can run simultaneously with proper staffing

---

## Validation Checklist (Post-Implementation)

After completing all desired phases, verify:

- [ ] All tests GREEN (run `npm test` - 0 failures)
- [ ] E2E tests pass all viewports (run `npx playwright test`)
- [ ] Lighthouse score ≥90 performance/accessibility/best practices
- [ ] axe-core 0 critical violations (run in E2E tests)
- [ ] Manual keyboard navigation functional (Tab/Enter/Escape/Arrows)
- [ ] Manual screen reader testing (NVDA/JAWS/VoiceOver announcements correct)
- [ ] Theme toggle smooth transitions <300ms
- [ ] Theme persistence localStorage working
- [ ] System preference sync functional
- [ ] Dark mode WCAG AA contrast verified
- [ ] All spacing multiples of 8px verified
- [ ] Typography scale Material Design compliance verified
- [ ] Bundle size increase <50KB verified
- [ ] Constitution Section VIII all requirements met
- [ ] quickstart.md examples all compile
- [ ] README.md updated with new features
- [ ] CHANGELOG.md version entry added

**Gate**: All checkboxes must be checked before marking feature complete and merging to main branch

---

**Tasks Status**: Ready for execution  
**Generated**: 2026-02-10  
**Based On**: spec.md v1.0, plan.md v1.0, data-model.md v1.0, contracts/ v1.0  
**Total Estimated Time**: 43-68 hours full feature (5-9 days), 25-38 hours MVP (3-5 days)
