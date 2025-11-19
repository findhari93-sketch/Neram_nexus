import React, { useState } from "react";
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
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  School,
  Assignment,
  People,
  Grade,
  Schedule,
  Announcement,
  TrendingUp,
  Book,
  CalendarToday,
  Assessment,
} from "@mui/icons-material";

const TeacherDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  const classes = [
    {
      name: "Mathematics 101",
      students: 28,
      schedule: "Mon, Wed, Fri 9:00 AM",
      room: "Room 205",
    },
    {
      name: "Advanced Algebra",
      students: 22,
      schedule: "Tue, Thu 11:00 AM",
      room: "Room 301",
    },
    {
      name: "Calculus I",
      students: 18,
      schedule: "Mon, Wed 2:00 PM",
      room: "Room 205",
    },
  ];

  const recentAssignments = [
    {
      title: "Quadratic Equations Quiz",
      class: "Mathematics 101",
      dueDate: "2025-10-05",
      submitted: 23,
      total: 28,
    },
    {
      title: "Derivatives Problem Set",
      class: "Calculus I",
      dueDate: "2025-10-07",
      submitted: 15,
      total: 18,
    },
    {
      title: "Linear Systems Test",
      class: "Advanced Algebra",
      dueDate: "2025-10-10",
      submitted: 0,
      total: 22,
    },
  ];

  const upcomingClasses = [
    {
      class: "Mathematics 101",
      time: "9:00 AM",
      room: "Room 205",
      topic: "Polynomial Functions",
    },
    {
      class: "Advanced Algebra",
      time: "11:00 AM",
      room: "Room 301",
      topic: "Matrix Operations",
    },
    {
      class: "Calculus I",
      time: "2:00 PM",
      room: "Room 205",
      topic: "Integration Techniques",
    },
  ];

  const students = [
    {
      name: "Alice Johnson",
      class: "Mathematics 101",
      lastActive: "2 hours ago",
      grade: "A-",
    },
    {
      name: "Bob Smith",
      class: "Calculus I",
      lastActive: "1 day ago",
      grade: "B+",
    },
    {
      name: "Carol Davis",
      class: "Advanced Algebra",
      lastActive: "3 hours ago",
      grade: "A",
    },
    {
      name: "David Wilson",
      class: "Mathematics 101",
      lastActive: "5 hours ago",
      grade: "B",
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <School color="primary" />
          Teacher Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your classes, assignments, and student progress
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                  <Typography variant="h4" component="div" color="primary.main">
                    {classes.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Classes
                  </Typography>
                </Box>
                <School sx={{ fontSize: 40, color: "primary.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                    color="secondary.main"
                  >
                    {classes.reduce((sum, cls) => sum + cls.students, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: "secondary.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                  <Typography variant="h4" component="div" color="success.main">
                    {recentAssignments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Assignments
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: "success.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                  <Typography variant="h4" component="div" color="info.main">
                    85%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Completion
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: "info.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <CalendarToday color="primary" />
              Today's Schedule
            </Typography>
            <List>
              {upcomingClasses.map((item, index) => (
                <ListItem
                  key={index}
                  divider={index < upcomingClasses.length - 1}
                >
                  <ListItemIcon>
                    <Schedule color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${item.time} - ${item.class}`}
                    secondary={`${item.room} • Topic: ${item.topic}`}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              startIcon={<Schedule />}
              fullWidth
              sx={{ mt: 2 }}
            >
              View Full Schedule
            </Button>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Book color="primary" />
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button variant="contained" startIcon={<Assignment />} fullWidth>
                Create Assignment
              </Button>
              <Button variant="outlined" startIcon={<Grade />} fullWidth>
                Grade Submissions
              </Button>
              <Button variant="outlined" startIcon={<Announcement />} fullWidth>
                Send Announcement
              </Button>
              <Button variant="outlined" startIcon={<Assessment />} fullWidth>
                View Reports
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Sections with Tabs */}
      <Paper sx={{ mt: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="My Classes" />
          <Tab label="Recent Assignments" />
          <Tab label="Student Progress" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Classes Tab */}
          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Class Name</TableCell>
                    <TableCell align="center">Students</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((cls, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {cls.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={cls.students}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{cls.schedule}</TableCell>
                      <TableCell>{cls.room}</TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined">
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Assignments Tab */}
          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="center">Progress</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAssignments.map((assignment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {assignment.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{assignment.class}</TableCell>
                      <TableCell>{assignment.dueDate}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {assignment.submitted}/{assignment.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          (
                          {Math.round(
                            (assignment.submitted / assignment.total) * 100
                          )}
                          %)
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Students Tab */}
          {tabValue === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell align="center">Current Grade</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </Avatar>
                          <Typography variant="body1">
                            {student.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.lastActive}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={student.grade}
                          color={
                            student.grade.startsWith("A")
                              ? "success"
                              : "primary"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined">
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherDashboard;
