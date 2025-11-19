# Neram Admin Dashboard

A modern React admin dashboard built with Material-UI (MUI), MUI Icons, and AG-Grid for data visualization and management.

## Features

- **Material-UI Components**: Modern, responsive UI components following Material Design principles
- **MUI Icons**: Extensive icon library for enhanced user experience
- **AG-Grid Integration**: Professional data grid with sorting, filtering, pagination, and CRUD operations
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Theme Support**: Customizable Material-UI theme system

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **Material-UI (MUI) v5**: Complete React UI library
- **MUI Icons**: Material Design icons for React
- **AG-Grid Community**: Enterprise-grade data grid
- **Emotion**: CSS-in-JS styling solution

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:

   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── DataGridDemo.js       # AG-Grid implementation with CRUD operations
│   └── ComponentsShowcase.js # MUI components demonstration
├── App.js                    # Main application component with theme
├── index.js                  # React app entry point
└── index.css                 # Global styles
```

## Key Components

### DataGridDemo

- Demonstrates AG-Grid with sample user data
- Features: sorting, filtering, pagination, inline editing
- CRUD operations: Create, Read, Update, Delete users
- Custom cell renderers for status indicators
- Modal dialogs for data entry

### ComponentsShowcase

- Showcases various MUI components and icons
- Examples: Cards, Buttons, Form controls, Icons, Chips, Lists, Alerts
- Interactive elements with state management
- Responsive grid layout

## Features Included

### Material-UI Components

- AppBar and Toolbar
- Cards and Paper components
- Buttons (variants: contained, outlined, text)
- Form controls (TextField, Switch, Select)
- Typography and layout components
- Snackbar notifications
- Alert messages
- Icons and IconButtons
- Chips for tags and status
- Lists for navigation

### AG-Grid Features

- Data sorting and filtering
- Pagination
- Custom cell renderers
- Row selection
- CRUD operations
- Responsive columns
- Modern styling integration

## Customization

### Theme Customization

The MUI theme can be customized in `App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});
```

### Adding New Components

1. Create new component files in the `src/components/` directory
2. Import and use in `App.js` or other components
3. Follow MUI design patterns and naming conventions

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm run build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run eject`: Ejects from Create React App (one-way operation)

## Browser Support

This project supports all modern browsers including:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Resources

- [React Documentation](https://reactjs.org/)
- [Material-UI Documentation](https://mui.com/)
- [AG-Grid Documentation](https://www.ag-grid.com/)
- [Material Design Guidelines](https://material.io/design)
