import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const TeacherSchedule = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Schedule
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          View and manage your teaching schedule.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Schedule management:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Class timetables
          </Typography>
          <Typography component="li" variant="body2">
            Office hours
          </Typography>
          <Typography component="li" variant="body2">
            Meeting schedules
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherSchedule;
