import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const TeacherAssignments = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Assignments
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Create, manage, and grade assignments for your classes.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Assignment management includes:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Create new assignments
          </Typography>
          <Typography component="li" variant="body2">
            Track submission status
          </Typography>
          <Typography component="li" variant="body2">
            Grade and provide feedback
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherAssignments;
