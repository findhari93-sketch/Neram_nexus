import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
} from "@mui/material";
import { Class, Assignment, Assessment, TrendingUp } from "@mui/icons-material";

const StudentDashboard = () => {
  const stats = [
    {
      title: "Enrolled Courses",
      value: "6",
      icon: <Class />,
      color: "#1976d2",
    },
    {
      title: "Pending Assignments",
      value: "3",
      icon: <Assignment />,
      color: "#ed6c02",
    },
    {
      title: "Completed Tests",
      value: "12",
      icon: <Assessment />,
      color: "#2e7d32",
    },
    {
      title: "Overall GPA",
      value: "3.8",
      icon: <TrendingUp />,
      color: "#9c27b0",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome to your student portal. Track your academic progress and stay
        organized.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: stat.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your recent academic activities will appear here. This includes:
        </Typography>
        <Box component="ul" sx={{ mt: 2, pl: 2 }}>
          <Typography component="li" variant="body2">
            Assignment due dates
          </Typography>
          <Typography component="li" variant="body2">
            Grade updates
          </Typography>
          <Typography component="li" variant="body2">
            Class announcements
          </Typography>
          <Typography component="li" variant="body2">
            Schedule changes
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentDashboard;
