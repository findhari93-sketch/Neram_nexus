import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const TeacherStudents = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Students
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          View and manage your students across all classes.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Features include:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Student profiles and contact information
          </Typography>
          <Typography component="li" variant="body2">
            Academic progress tracking
          </Typography>
          <Typography component="li" variant="body2">
            Communication with parents
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherStudents;
