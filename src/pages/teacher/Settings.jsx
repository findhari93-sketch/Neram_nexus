import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const TeacherSettings = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Manage your teacher profile and preferences.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Settings include:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Profile information
          </Typography>
          <Typography component="li" variant="body2">
            Notification preferences
          </Typography>
          <Typography component="li" variant="body2">
            Teaching preferences
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherSettings;
