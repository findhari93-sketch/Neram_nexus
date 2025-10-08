import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const StudentGrades = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Grades
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          View your grades and academic performance across all courses.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Grade features:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Course grades and GPA
          </Typography>
          <Typography component="li" variant="body2">
            Grade history and trends
          </Typography>
          <Typography component="li" variant="body2">
            Progress reports
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentGrades;
