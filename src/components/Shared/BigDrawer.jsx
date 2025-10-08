import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";

/**
 * BigDrawer - A themed MUI Drawer for APP
 * Props:
 *  open: boolean
 *  onClose: function
 *  title: string
 *  actions: ReactNode[] (MUI Buttons)
 *  children: ReactNode (body content)
 *  anchor: 'right' | 'left' | 'top' | 'bottom' (default: 'right')
 */
export default function BigDrawer({
  open,
  onClose,
  title = "",
  actions = [],
  children,
  anchor = "right",
}) {
  const theme = useTheme();

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 900, md: 1193 },
          maxWidth: "100vw",
          bgcolor: theme.palette.background.paper,
          boxShadow: 6,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: "50px",
          bgcolor: theme.palette.primary.main,
          color: theme.palette.common.white,
          pl: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight={600} fontSize={18}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: theme.palette.common.white }}
          size="large"
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          bgcolor: theme.palette.background.paper,
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          height: "61px",
          bgcolor: theme.palette.custom.paleBlue,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack direction="row" spacing={2}>
          {React.Children.map(actions, (action, idx) =>
            React.cloneElement(action, {
              sx: {
                height: "40px",
                minWidth: 120,
                fontWeight: 600,
                fontSize: 16,
                borderRadius: theme.shape.borderRadius,
                ...action.props.sx,
              },
              key: idx,
            })
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
