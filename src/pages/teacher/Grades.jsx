import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const TeacherGrades = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Grades
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Manage grades and generate report cards for your students.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Grading features:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Grade book management
          </Typography>
          <Typography component="li" variant="body2">
            Progress reports
          </Typography>
          <Typography component="li" variant="body2">
            Performance analytics
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherGrades;
