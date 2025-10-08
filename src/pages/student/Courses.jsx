import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const StudentCourses = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Courses
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          View your enrolled courses and track your progress.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Course features include:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Course materials and syllabus
          </Typography>
          <Typography component="li" variant="body2">
            Progress tracking
          </Typography>
          <Typography component="li" variant="body2">
            Class announcements
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentCourses;
