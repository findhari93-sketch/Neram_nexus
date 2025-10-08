import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Box,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  People,
  Settings,
  Notifications,
  Email,
  Phone,
  LocationOn,
  Favorite,
  Star,
  ThumbUp,
  Share,
  Download,
  Upload,
  Search,
  FilterList,
  MoreVert,
  Home,
  Work,
  School,
} from "@mui/icons-material";

const ComponentsShowcase = () => {
  const [textValue, setTextValue] = useState("");
  const [switchValue, setSwitchValue] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleButtonClick = () => {
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Material-UI Components Showcase
      </Typography>

      <Grid container spacing={3}>
        {/* Cards Section */}
        <Grid item xs={12} md={6} lg={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Dashboard Card
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Dashboard color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">Total Users: 1,234</Typography>
              </Box>
              <Button variant="contained" fullWidth>
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Statistics
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <People color="secondary" sx={{ mr: 1 }} />
                <Typography variant="body1">Active Sessions: 456</Typography>
              </Box>
              <Button variant="outlined" fullWidth>
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Settings
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Settings color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">System Status: Online</Typography>
              </Box>
              <Button variant="text" fullWidth>
                Configure
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Form Controls */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Form Controls
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Search Users"
                variant="outlined"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={switchValue}
                    onChange={(e) => setSwitchValue(e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Notifications"
              />

              <Button
                variant="contained"
                onClick={handleButtonClick}
                startIcon={<Notifications />}
              >
                Show Notification
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Icons Showcase */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Material Icons
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Tooltip title="Email">
                <IconButton color="primary">
                  <Email />
                </IconButton>
              </Tooltip>
              <Tooltip title="Phone">
                <IconButton color="secondary">
                  <Phone />
                </IconButton>
              </Tooltip>
              <Tooltip title="Location">
                <IconButton color="success">
                  <LocationOn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Favorite">
                <IconButton color="error">
                  <Favorite />
                </IconButton>
              </Tooltip>
              <Tooltip title="Star">
                <IconButton color="warning">
                  <Star />
                </IconButton>
              </Tooltip>
              <Tooltip title="Like">
                <IconButton color="info">
                  <ThumbUp />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton>
                  <Share />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton>
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Upload">
                <IconButton>
                  <Upload />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter">
                <IconButton>
                  <FilterList />
                </IconButton>
              </Tooltip>
              <Tooltip title="More">
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>

        {/* Chips and Lists */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tags & Status
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Chip label="Active" color="success" variant="filled" />
              <Chip label="Pending" color="warning" variant="filled" />
              <Chip label="Inactive" color="error" variant="filled" />
              <Chip label="Draft" color="default" variant="outlined" />
              <Chip
                label="Featured"
                color="primary"
                variant="filled"
                icon={<Star />}
              />
              <Chip
                label="Verified"
                color="secondary"
                variant="filled"
                icon={<ThumbUp />}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Navigation List */}
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h6" sx={{ p: 2 }}>
              Navigation Menu
            </Typography>
            <Divider />
            <List>
              <ListItem button>
                <ListItemIcon>
                  <Home color="primary" />
                </ListItemIcon>
                <ListItemText primary="Dashboard" secondary="Main overview" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <People color="secondary" />
                </ListItemIcon>
                <ListItemText primary="Users" secondary="Manage users" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Work color="success" />
                </ListItemIcon>
                <ListItemText primary="Projects" secondary="View projects" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <School color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Reports"
                  secondary="Analytics & reports"
                />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Settings color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  secondary="System configuration"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Alert severity="success" icon={<ThumbUp />}>
              Successfully updated user preferences!
            </Alert>
            <Alert severity="info" icon={<Email />}>
              New message received from admin.
            </Alert>
            <Alert severity="warning" icon={<Notifications />}>
              System maintenance scheduled for tonight.
            </Alert>
            <Alert severity="error" icon={<Settings />}>
              Failed to connect to the database. Please check your connection.
            </Alert>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Notification sent successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ComponentsShowcase;
