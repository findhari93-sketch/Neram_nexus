import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const StudentAssignments = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Assignments
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          View and submit your assignments across all courses.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Assignment features:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Assignment submission
          </Typography>
          <Typography component="li" variant="body2">
            Due date tracking
          </Typography>
          <Typography component="li" variant="body2">
            Feedback and grades
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentAssignments;
