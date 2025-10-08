import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const StudentResources = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Resources
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Access study materials, library resources, and academic support.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Available resources:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2">
            Digital library access
          </Typography>
          <Typography component="li" variant="body2">
            Study guides and materials
          </Typography>
          <Typography component="li" variant="body2">
            Academic support services
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentResources;
