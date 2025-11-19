import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  People,
  School,
  Assessment,
  TrendingUp,
  Security,
  Storage,
  Speed,
  CheckCircle,
} from "@mui/icons-material";

const Dashboard = () => {
  // Dummy metrics data
  const metrics = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      changeType: "positive",
      icon: <People />,
      color: "primary",
    },
    {
      title: "Active Enquiries",
      value: "156",
      change: "+8%",
      changeType: "positive",
      icon: <Assessment />,
      color: "secondary",
    },
    {
      title: "Teachers",
      value: "89",
      change: "+3%",
      changeType: "positive",
      icon: <School />,
      color: "success",
    },
    {
      title: "System Health",
      value: "98.5%",
      change: "+0.2%",
      changeType: "positive",
      icon: <CheckCircle />,
      color: "info",
    },
  ];

  const systemStats = [
    { label: "CPU Usage", value: 45, color: "primary" },
    { label: "Memory Usage", value: 62, color: "warning" },
    { label: "Storage Usage", value: 78, color: "error" },
    { label: "Network Activity", value: 34, color: "success" },
  ];

  const recentActivity = [
    {
      action: "New enquiry submitted",
      user: "John Smith",
      time: "5 minutes ago",
      status: "new",
    },
    {
      action: "Teacher registration approved",
      user: "Sarah Johnson",
      time: "15 minutes ago",
      status: "approved",
    },
    {
      action: "Student enrollment completed",
      user: "Mike Davis",
      time: "32 minutes ago",
      status: "completed",
    },
    {
      action: "System backup finished",
      user: "System",
      time: "1 hour ago",
      status: "system",
    },
    {
      action: "Security scan completed",
      user: "Security Bot",
      time: "2 hours ago",
      status: "security",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "primary";
      case "approved":
        return "success";
      case "completed":
        return "info";
      case "system":
        return "secondary";
      case "security":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <Assessment />;
      case "approved":
        return <CheckCircle />;
      case "completed":
        return <School />;
      case "system":
        return <Storage />;
      case "security":
        return <Security />;
      default:
        return <TrendingUp />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ color: `${metric.color}.main` }}>
                    {React.cloneElement(metric.icon, { sx: { fontSize: 32 } })}
                  </Box>
                  <Chip
                    label={metric.change}
                    color={
                      metric.changeType === "positive" ? "success" : "error"
                    }
                    size="small"
                  />
                </Box>
                <Typography
                  variant="h4"
                  component="div"
                  color={`${metric.color}.main`}
                  gutterBottom
                >
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* System Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "fit-content" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Speed color="primary" />
              System Performance
            </Typography>
            <Box sx={{ mt: 3 }}>
              {systemStats.map((stat, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {stat.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stat.value}
                    color={stat.color}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "grey.200",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "fit-content" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <TrendingUp color="primary" />
              Recent Activity
            </Typography>
            <Box sx={{ mt: 3 }}>
              {recentActivity.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    borderBottom:
                      index < recentActivity.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{ color: `${getStatusColor(activity.status)}.main` }}
                  >
                    {getStatusIcon(activity.status)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {activity.user} • {activity.time}
                    </Typography>
                  </Box>
                  <Chip
                    label={activity.status}
                    color={getStatusColor(activity.status)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Assessment color="primary" />
              Quick Statistics
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h3" color="primary.main" gutterBottom>
                    324
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h3" color="success.main" gutterBottom>
                    1,543
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Tasks
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h3" color="warning.main" gutterBottom>
                    67
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h3" color="error.main" gutterBottom>
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issues Reported
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
