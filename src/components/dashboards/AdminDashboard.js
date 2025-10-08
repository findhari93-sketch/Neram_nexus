import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  AdminPanelSettings,
  People,
  School,
  Assessment,
  Settings,
  Security,
  TrendingUp,
  Notifications,
  DataUsage,
  SupervisorAccount,
} from "@mui/icons-material";
import DataGridDemo from "../DataGridDemo";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      icon: <People />,
      color: "primary",
      change: "+12%",
    },
    {
      title: "Active Teachers",
      value: "89",
      icon: <SupervisorAccount />,
      color: "secondary",
      change: "+5%",
    },
    {
      title: "Students",
      value: "1,045",
      icon: <School />,
      color: "success",
      change: "+8%",
    },
    {
      title: "System Health",
      value: "98.5%",
      icon: <DataUsage />,
      color: "info",
      change: "+0.2%",
    },
  ];

  const recentActivities = [
    {
      action: "New teacher registered",
      user: "John Smith",
      time: "2 minutes ago",
      type: "user",
    },
    {
      action: "System backup completed",
      user: "System",
      time: "1 hour ago",
      type: "system",
    },
    {
      action: "Student enrollment",
      user: "Sarah Johnson",
      time: "3 hours ago",
      type: "student",
    },
    {
      action: "Security scan completed",
      user: "Security Bot",
      time: "6 hours ago",
      type: "security",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <AdminPanelSettings color="error" />
          Administrator Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete system overview and management tools
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      component="div"
                      color={`${stat.color}.main`}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Chip
                      label={stat.change}
                      color={stat.change.startsWith("+") ? "success" : "error"}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box sx={{ color: `${stat.color}.main` }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "fit-content" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Settings color="primary" />
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button variant="contained" startIcon={<People />} fullWidth>
                Manage Users
              </Button>
              <Button variant="outlined" startIcon={<School />} fullWidth>
                View All Classes
              </Button>
              <Button variant="outlined" startIcon={<Assessment />} fullWidth>
                Generate Reports
              </Button>
              <Button variant="outlined" startIcon={<Security />} fullWidth>
                Security Settings
              </Button>
              <Button
                variant="outlined"
                startIcon={<Notifications />}
                fullWidth
              >
                Send Announcements
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <TrendingUp color="primary" />
              Recent System Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem
                  key={index}
                  divider={index < recentActivities.length - 1}
                >
                  <ListItemIcon>
                    {activity.type === "user" && <People color="primary" />}
                    {activity.type === "system" && (
                      <Settings color="secondary" />
                    )}
                    {activity.type === "student" && <School color="success" />}
                    {activity.type === "security" && <Security color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.action}
                    secondary={`${activity.user} • ${activity.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* System Performance */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Performance
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                CPU Usage: 45%
              </Typography>
              <LinearProgress variant="determinate" value={45} sx={{ mt: 1 }} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Memory Usage: 62%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={62}
                color="warning"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Storage Usage: 78%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={78}
                color="error"
                sx={{ mt: 1 }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Status
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">Last Security Scan</Typography>
                <Chip label="6 hours ago" color="success" size="small" />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">Failed Login Attempts</Typography>
                <Chip label="3 today" color="warning" size="small" />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">Active Sessions</Typography>
                <Chip label="456" color="info" size="small" />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">System Alerts</Typography>
                <Chip label="0" color="success" size="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* User Management Grid */}
      <Box sx={{ mt: 4 }}>
        <DataGridDemo />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
