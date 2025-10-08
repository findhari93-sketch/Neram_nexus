# Neram Admin Portal - Microsoft Entra ID Authentication

A modern React admin portal with Microsoft Entra ID (Azure AD) authentication, role-based access control, and comprehensive dashboards for educational management.

## 🚀 Features

- **Microsoft Entra ID Authentication**: Secure login using MSAL React
- **Role-Based Access Control**: Admin, Teacher, and Student roles with different permissions
- **Dynamic Role Detection**: Automatic role extraction from ID token claims
- **Responsive Dashboards**: Tailored interfaces for each user role
- **Material-UI Design**: Modern, professional interface with MUI components
- **Protected Routes**: Authentication and role-based route protection
- **AG-Grid Integration**: Professional data grids for user management

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks and functional components
- **MSAL React**: Microsoft Authentication Library for authentication
- **Material-UI (MUI) v5**: Complete React UI library with icons
- **React Router v6**: Client-side routing with protection
- **AG-Grid Community**: Enterprise-grade data grid
- **Emotion**: CSS-in-JS styling solution

## 📋 Prerequisites

Before running this application, you need:

1. **Node.js** (version 14 or higher)
2. **Microsoft Entra ID App Registration** with the following configuration:
   - Platform: Single-page application (SPA)
   - Redirect URI: `http://localhost:3000`
   - App roles defined for Admin, Teacher, and Student

## ⚙️ Azure AD App Registration Setup

### 1. Create App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: Neram Admin Portal
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**:
     - Platform: Single-page application (SPA)
     - URI: `http://localhost:3000`

### 2. Configure App Roles

In your app registration, go to **App roles** and create these roles:

```json
{
  "allowedMemberTypes": ["User"],
  "description": "Admins can manage everything in the system",
  "displayName": "Admin",
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "isEnabled": true,
  "value": "Admin"
}

{
  "allowedMemberTypes": ["User"],
  "description": "Teachers can manage classes and students",
  "displayName": "Teacher",
  "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
  "isEnabled": true,
  "value": "Teacher"
}

{
  "allowedMemberTypes": ["User"],
  "description": "Students can view their courses and assignments",
  "displayName": "Student",
  "id": "c3d4e5f6-g7h8-9012-cdef-345678901234",
  "isEnabled": true,
  "value": "Student"
}
```

### 3. Assign Users to Roles

1. Go to **Enterprise applications** in Azure Portal
2. Find your app and go to **Users and groups**
3. Assign users to their appropriate roles

### 4. Configure API Permissions

Add these permissions to your app registration:

- Microsoft Graph > User.Read (delegated)
- Microsoft Graph > openid (delegated)
- Microsoft Graph > profile (delegated)

## 🔧 Configuration

### 1. Update Authentication Configuration

Edit `src/config/authConfig.js` with your Azure AD details:

```javascript
export const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID", // Replace with your app registration Client ID
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // Replace with your Tenant ID
    redirectUri: "http://localhost:3000",
    postLogoutRedirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};
```

**Where to find these values:**

- **Client ID**: App registration > Overview > Application (client) ID
- **Tenant ID**: App registration > Overview > Directory (tenant) ID

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

### 3. Test the Application

1. Navigate to `http://localhost:3000`
2. Click "Sign in with Microsoft"
3. Complete the authentication flow
4. You'll be redirected to the appropriate dashboard based on your assigned role

## 🎯 Application Structure

```
src/
├── components/
│   ├── dashboards/
│   │   ├── AdminDashboard.js      # Full system management
│   │   ├── TeacherDashboard.js    # Class and student management
│   │   └── StudentDashboard.js    # Course and assignment tracking
│   ├── DataGridDemo.js            # AG-Grid user management
│   ├── Header.js                  # Navigation with user profile
│   ├── LoginPage.js               # Microsoft authentication
│   ├── ProtectedRoute.js          # Authentication guard
│   └── RoleBasedRoute.js          # Role-based access control
├── config/
│   └── authConfig.js              # MSAL configuration
├── App.js                         # Main routing and app logic
└── index.js                       # App initialization with MSAL provider
```

## 🔐 Role-Based Features

### Admin Dashboard

- **System Overview**: User statistics, system health, security status
- **User Management**: Complete CRUD operations for all users
- **Quick Actions**: System administration tools
- **Performance Monitoring**: CPU, memory, and storage usage
- **Security Dashboard**: Login attempts, active sessions, alerts

### Teacher Dashboard

- **Class Management**: View and manage assigned classes
- **Assignment Tracking**: Create and monitor assignments
- **Student Progress**: Track individual student performance
- **Schedule Management**: Today's classes and upcoming sessions
- **Grade Management**: Review and grade student submissions

### Student Dashboard

- **Course Progress**: Visual progress tracking for all courses
- **Assignment Center**: View pending, in-progress, and completed tasks
- **Grade Tracking**: Recent grades and overall GPA
- **Schedule View**: Today's classes and upcoming events
- **Announcements**: Important updates from instructors

## 🎨 UI Components

### Header Features

- **User Profile**: Display name, email, and profile avatar
- **Role Badge**: Visual indicator of user's current role
- **Profile Menu**: User details and logout option
- **Responsive Design**: Works on desktop and mobile

### Authentication Flow

- **Modern Login Page**: Clean, professional sign-in interface
- **Role Cards**: Preview of different access levels
- **Automatic Redirection**: Routes users to appropriate dashboard
- **Session Management**: Secure token handling and refresh

## 🛡️ Security Features

- **Token-Based Authentication**: Secure JWT tokens from Microsoft Entra ID
- **Role-Based Authorization**: Server-side role validation
- **Protected Routes**: Client-side route protection
- **Session Management**: Automatic token refresh and logout
- **HTTPS Support**: Ready for production deployment

## 🔄 Authentication Flow

1. **User accesses application** → Redirected to login page
2. **User clicks "Sign in with Microsoft"** → MSAL popup/redirect flow
3. **Microsoft authentication** → User signs in with organizational account
4. **Token reception** → App receives ID token with role claims
5. **Role extraction** → App reads `roles` claim from `idTokenClaims`
6. **Dashboard routing** → User redirected to role-appropriate dashboard
7. **Session management** → Tokens automatically refreshed

## 📦 Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run eject`: Ejects from Create React App

## 🌐 Production Deployment

### 1. Update Redirect URIs

Add your production URL to the app registration redirect URIs

### 2. Environment Variables

Create environment-specific config files for different environments

### 3. Build for Production

```bash
npm run build
```

### 4. Deploy

Deploy the `build` folder to your hosting service

## 🔧 Troubleshooting

### Common Issues

**"Login failed" or authentication errors:**

- Verify Client ID and Tenant ID in `authConfig.js`
- Check redirect URI matches exactly (including protocol)
- Ensure app registration is properly configured

**"Access denied" or role issues:**

- Verify users are assigned to appropriate app roles
- Check that role values match exactly (case-sensitive)
- Ensure roles are properly configured in app registration

**Build or runtime errors:**

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for conflicting dependencies
- Verify all required environment variables are set

## 📚 Resources

- [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
- [Microsoft Entra ID Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [AG-Grid Documentation](https://www.ag-grid.com/)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
