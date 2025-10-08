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
import { Class, People, Assignment, TrendingUp } from "@mui/icons-material";

const TeacherDashboard = () => {
  const stats = [
    {
      title: "Active Classes",
      value: "5",
      icon: <Class />,
      color: "#1976d2",
    },
    {
      title: "Total Students",
      value: "123",
      icon: <People />,
      color: "#2e7d32",
    },
    {
      title: "Pending Assignments",
      value: "8",
      icon: <Assignment />,
      color: "#ed6c02",
    },
    {
      title: "Average Grade",
      value: "85%",
      icon: <TrendingUp />,
      color: "#9c27b0",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Teacher Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome to your teaching portal. Here's an overview of your classes and
        students.
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
          Your recent teaching activities will appear here. This includes:
        </Typography>
        <Box component="ul" sx={{ mt: 2, pl: 2 }}>
          <Typography component="li" variant="body2">
            New assignment submissions
          </Typography>
          <Typography component="li" variant="body2">
            Student grade updates
          </Typography>
          <Typography component="li" variant="body2">
            Class schedule changes
          </Typography>
          <Typography component="li" variant="body2">
            Parent communication
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherDashboard;
