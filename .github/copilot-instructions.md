# Neram Admin Portal - Copilot Instructions

## Project Overview

React 18 educational admin portal with Microsoft Entra ID (Azure AD) authentication, role-based access control (RBAC), and Material-UI v5. Built with Create React App.

## Architecture

### Authentication Flow (MSAL)

- **Provider wrapping**: `index.js` wraps App with `MsalProvider` + `PublicClientApplication`
- **Role extraction**: User roles come from `account.idTokenClaims.roles` array (e.g., `["Admin"]`, `["Teacher"]`, `["Student"]`)
- **Config location**: `src/config/authConfig.js` contains client ID, tenant ID, redirect URIs
- **Route protection**: `RequireRole.jsx` HOC checks `allowedRoles` against token claims
- **Priority routing**: Admin > Teacher > Student (see `App.js` `getUserRole()`)

### Role-Based Routing Pattern

```javascript
// Each role has dedicated route file: AdminRoutes.jsx, TeacherRoutes.jsx, StudentRoutes.jsx
<Route path="/admin/*" element={<AdminRoutes />} />
// Routes wrap content with RequireRole HOC
<RequireRole allowedRoles={["Admin"]}>{/* routes */}</RequireRole>
```

### Layout Architecture

- **Nested layouts**: Role routes render layout (e.g., `AdminLayout.jsx`) with `<Outlet />`
- **Sidebar state**: Persisted to `localStorage` with key `adminNavOpen` (desktop only)
- **Mobile behavior**: Temporary drawer on mobile, permanent on desktop; auto-reset on breakpoint change
- **Header**: Fixed `TopNavHeader` with user profile from Graph API photo endpoint
- **Sidebar navigation**: Updates via `navigationItems` array in layout files

### Theme Customization (`src/theme/index.js`)

- **Custom palette**: `theme.palette.custom` contains brand colors (headerGradient, darkNavy, paleBlue, etc.)
- **Button variants**: Custom variants `ourColor`, `whiteSolid`, `plainSolid` (underlined)
- **Typography**: Open Sans primary, 14px base, unset text-transform on buttons

## Development Workflows

### Running the App

```bash
npm start        # Dev server on localhost:3000
npm run build    # Production build
npm test         # Jest test runner
```

### Missing Dependencies Issue

**Critical**: `@mui/x-date-pickers` is used in `index.js` but not in `package.json`. Add it:

```bash
npm install @mui/x-date-pickers date-fns
```

### Azure AD Configuration Required

Before running, update `src/config/authConfig.js`:

- `clientId`: App Registration Client ID from Azure Portal
- `authority`: `https://login.microsoftonline.com/{TENANT_ID}`
- `redirectUri`: Must match SPA platform config in Azure
- **App Roles**: Define Admin/Teacher/Student roles in App Registration > App roles
- **User assignment**: Assign users to roles via Enterprise Applications > Users and groups

## Critical Conventions

### Component Organization

- **Shared components**: `src/components/Shared/` (BigDrawer, TopNavHeader, UserProfile)
- **Feature components**: `src/components/DateFilter/`
- **Page components**: `src/pages/{role}/` (admin, teacher, student folders)
- **Layouts**: `src/layouts/` for role-specific layouts with sidebar + outlet
- **Routes**: `src/routes/` exports from `index.js` for cleaner imports

### File Naming

- **Components**: PascalCase `.jsx` for React components (e.g., `AdminLayout.jsx`)
- **Utilities**: camelCase `.js` for utilities (e.g., `dateFilterUtils.js`)
- **Index exports**: `src/routes/index.js` exports all route components for cleaner imports

### State Management Patterns

- **No global state library**: Local state with `useState`, props drilling, MSAL hooks
- **MSAL hooks**: `useMsal()`, `useAccount()`, `useIsAuthenticated()` for auth state
- **LocalStorage**: Sidebar state persistence (key: `{role}NavOpen`)

### Date Handling

- **Provider**: `@mui/x-date-pickers` with `AdapterDateFns` in `index.js`
- **DateFilter component**: Custom range picker in `src/components/DateFilter/`
- **State shape**: `{ start: Date, end: Date }` object (not separate fields)

## Common Patterns

### Creating a New Role-Based Page

1. Add page component in `src/pages/{role}/PageName.jsx`
2. Add route in `src/routes/{Role}Routes.jsx`
3. Update sidebar nav in `src/layouts/{Role}Layout.jsx` (`navigationItems` array)
4. Wrap with `RequireRole` if needed (already done at route level)

### Adding Authentication to New Routes

```javascript
// In route file
<RequireRole allowedRoles={["Admin", "Teacher"]}>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Dashboard />} />
    </Route>
  </Routes>
</RequireRole>
```

### Using Material-UI Tables for Data Display

```jsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const DataTable = ({ rows, columns }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((col) => (
            <TableCell key={col.field}>{col.headerName}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {columns.map((col) => (
              <TableCell key={col.field}>{row[col.field]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
```

## External Dependencies

- **Material-UI v5**: Primary UI library; use `useTheme()`, `useMediaQuery()` for responsive design
- **MSAL React v2**: Authentication; tokens auto-refresh, use `acquireTokenSilent` for Graph calls
- **React Router v6**: Use `<Navigate replace />`, not `useNavigate().replace()` in render paths
- **Date Pickers**: `@mui/x-date-pickers` and `date-fns` for date handling

## Testing Considerations

- **MSAL mocking**: Mock `@azure/msal-react` hooks in tests (`useMsal`, `useAccount`)
- **No test files**: Currently no tests written; add test files in `__tests__/` or colocate
- **CRA setup**: `npm test` runs Jest in watch mode

## Build & Deployment

- **Output**: `build/` folder after `npm run build`
- **Environment**: Update `redirectUri` in `authConfig.js` for production domain
- **Static hosting**: Works with any SPA host (Azure Static Web Apps, Vercel, Netlify)
- **Logout redirect**: Set `postLogoutRedirectUri` to production URL

## Known Quirks

- **Role case-sensitivity**: Token roles are case-sensitive (use exact `"Admin"`, not `"admin"`)
- **Sidebar mobile reset**: Sidebar state resets when switching between mobile/desktop breakpoints
- **Graph photo**: Silently fails if `User.Read` scope not granted; falls back to initials in avatar

## Unique Project Patterns

### Drawer System Architecture

- **BigDrawer**: Reusable side drawer in `src/components/Shared/`
- **Mobile-first responsive**: Auto-collapsing sidebar with localStorage persistence
