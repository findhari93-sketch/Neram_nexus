import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const TeacherClasses = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Classes
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Manage your classes, view enrollment, and track student progress.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This section will include:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Class roster management
          </Typography>
          <Typography component="li" variant="body2">
            Attendance tracking
          </Typography>
          <Typography component="li" variant="body2">
            Class performance analytics
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherClasses;
