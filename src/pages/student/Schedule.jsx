import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const StudentSchedule = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Schedule
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          View your class schedule and important dates.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Schedule features:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Class timetables
          </Typography>
          <Typography component="li" variant="body2">
            Exam schedules
          </Typography>
          <Typography component="li" variant="body2">
            Important deadlines
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentSchedule;
