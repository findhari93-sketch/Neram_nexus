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
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import {
  Person,
  School,
  Assignment,
  Schedule,
  Book,
  CalendarToday,
  TrendingUp,
  AssignmentTurnedIn,
  AssignmentLate,
  Announcement,
} from "@mui/icons-material";

const StudentDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  const courses = [
    {
      name: "Mathematics 101",
      instructor: "Dr. Smith",
      progress: 78,
      grade: "B+",
      nextClass: "Today 9:00 AM",
    },
    {
      name: "Physics I",
      instructor: "Prof. Johnson",
      progress: 85,
      grade: "A-",
      nextClass: "Tomorrow 11:00 AM",
    },
    {
      name: "Chemistry Lab",
      instructor: "Dr. Brown",
      progress: 92,
      grade: "A",
      nextClass: "Friday 2:00 PM",
    },
    {
      name: "English Literature",
      instructor: "Ms. Davis",
      progress: 65,
      grade: "B",
      nextClass: "Monday 10:00 AM",
    },
  ];

  const assignments = [
    {
      title: "Quadratic Equations Problem Set",
      course: "Mathematics 101",
      dueDate: "2025-10-05",
      status: "pending",
      priority: "high",
    },
    {
      title: "Physics Lab Report",
      course: "Physics I",
      dueDate: "2025-10-07",
      status: "in-progress",
      priority: "medium",
    },
    {
      title: "Chemical Reactions Essay",
      course: "Chemistry Lab",
      dueDate: "2025-10-10",
      status: "completed",
      priority: "low",
    },
    {
      title: "Shakespeare Analysis",
      course: "English Literature",
      dueDate: "2025-10-12",
      status: "not-started",
      priority: "medium",
    },
  ];

  const upcomingSchedule = [
    {
      time: "9:00 AM",
      course: "Mathematics 101",
      room: "Room 205",
      type: "Lecture",
    },
    {
      time: "11:00 AM",
      course: "Physics I",
      room: "Lab 101",
      type: "Laboratory",
    },
    {
      time: "2:00 PM",
      course: "Study Group",
      room: "Library",
      type: "Study Session",
    },
  ];

  const recentGrades = [
    {
      assignment: "Midterm Exam",
      course: "Mathematics 101",
      grade: "B+",
      date: "2025-09-28",
    },
    {
      assignment: "Lab Report #3",
      course: "Physics I",
      grade: "A-",
      date: "2025-09-25",
    },
    {
      assignment: "Quiz #4",
      course: "Chemistry Lab",
      grade: "A",
      date: "2025-09-23",
    },
    {
      assignment: "Essay #2",
      course: "English Literature",
      grade: "B",
      date: "2025-09-20",
    },
  ];

  const announcements = [
    {
      title: "Mathematics 101: Extra Office Hours",
      content: "Dr. Smith will hold extra office hours this Friday.",
      time: "2 hours ago",
    },
    {
      title: "Physics Lab: Equipment Update",
      content: "New equipment will be available starting next week.",
      time: "1 day ago",
    },
    {
      title: "Library: Extended Hours",
      content: "Library will be open 24/7 during exam week.",
      time: "2 days ago",
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      case "pending":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <AssignmentTurnedIn />;
      case "in-progress":
        return <Assignment />;
      case "pending":
        return <AssignmentLate />;
      default:
        return <Assignment />;
    }
  };

  const overallGPA = 3.4;
  const totalCredits = 16;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Person color="success" />
          Student Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your courses, assignments, and academic progress
        </Typography>
      </Box>

      {/* Academic Overview */}
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
                  <Typography variant="h4" component="div" color="success.main">
                    {overallGPA}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current GPA
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: "success.main" }} />
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
                  <Typography variant="h4" component="div" color="primary.main">
                    {courses.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Courses
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
                  <Typography variant="h4" component="div" color="warning.main">
                    {assignments.filter((a) => a.status !== "completed").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Tasks
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: "warning.main" }} />
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
                    {totalCredits}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Credit Hours
                  </Typography>
                </Box>
                <Book sx={{ fontSize: 40, color: "secondary.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* High Priority Assignments Alert */}
      {assignments.some(
        (a) => a.priority === "high" && a.status !== "completed"
      ) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have high priority assignments due soon! Check your assignment
          list.
        </Alert>
      )}

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
              {upcomingSchedule.map((item, index) => (
                <ListItem
                  key={index}
                  divider={index < upcomingSchedule.length - 1}
                >
                  <ListItemIcon>
                    <Schedule color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${item.time} - ${item.course}`}
                    secondary={`${item.room} • ${item.type}`}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              startIcon={<CalendarToday />}
              fullWidth
              sx={{ mt: 2 }}
            >
              View Full Calendar
            </Button>
          </Paper>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Announcement color="primary" />
              Recent Announcements
            </Typography>
            <List>
              {announcements.map((announcement, index) => (
                <ListItem
                  key={index}
                  divider={index < announcements.length - 1}
                >
                  <ListItemIcon>
                    <Announcement color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={announcement.title}
                    secondary={`${announcement.content} • ${announcement.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Course Progress */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Course Progress
        </Typography>
        <Grid container spacing={3}>
          {courses.map((course, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {course.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Instructor: {course.instructor}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2">Progress:</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{ flexGrow: 1 }}
                    />
                    <Typography variant="body2">{course.progress}%</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={`Grade: ${course.grade}`}
                      color="primary"
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Next: {course.nextClass}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Detailed Sections with Tabs */}
      <Paper sx={{ mt: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Assignments" />
          <Tab label="Recent Grades" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Assignments Tab */}
          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Priority</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {getStatusIcon(assignment.status)}
                          <Typography variant="body1">
                            {assignment.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{assignment.course}</TableCell>
                      <TableCell>{assignment.dueDate}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={assignment.status.replace("-", " ")}
                          color={getStatusColor(assignment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={assignment.priority}
                          color={
                            assignment.priority === "high"
                              ? "error"
                              : assignment.priority === "medium"
                              ? "warning"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined">
                          {assignment.status === "completed"
                            ? "View"
                            : "Work On"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Grades Tab */}
          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Grade</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentGrades.map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {grade.assignment}
                        </Typography>
                      </TableCell>
                      <TableCell>{grade.course}</TableCell>
                      <TableCell>{grade.date}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={grade.grade}
                          color={
                            grade.grade.startsWith("A")
                              ? "success"
                              : grade.grade.startsWith("B")
                              ? "primary"
                              : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined">
                          View Details
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

export default StudentDashboard;
