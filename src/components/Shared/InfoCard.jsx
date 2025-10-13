import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Box,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";

const InfoCard = ({
  title,
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  saveDisabled,
  isLoading,
  actions,
  divider = true,
  titleIcon, // optional: material icon name to render on the left of the title
}) => (
  <Card
    sx={{
      mb: 2,
      border: 1,
      borderColor: "divider",
      borderRadius: 2,
      boxShadow: 0,
      overflow: "hidden",
    }}
  >
    <CardHeader
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          {titleIcon ? (
            <span
              className="material-icons-outlined"
              style={{ fontSize: 22, color: "rgba(0,0,0,0.54)" }}
            >
              {titleIcon}
            </span>
          ) : null}
          <Typography variant="h6" fontWeight={600} component="div">
            {title}
          </Typography>
        </Box>
      }
      action={
        <Box>
          {isLoading ? (
            <CircularProgress size={22} />
          ) : isEditing ? (
            <>
              <IconButton
                aria-label="Save"
                onClick={onSave}
                disabled={saveDisabled}
                size="small"
              >
                <span className="material-icons">check</span>
              </IconButton>
              <IconButton aria-label="Cancel" onClick={onCancel} size="small">
                <span className="material-icons">close</span>
              </IconButton>
            </>
          ) : onEdit ? (
            <IconButton aria-label="Edit" onClick={onEdit} size="small">
              <span className="material-icons">edit</span>
            </IconButton>
          ) : null}
          {actions}
        </Box>
      }
      sx={{ px: 2.5, py: 1.5 }}
    />
    {divider && <Divider />}
    <CardContent sx={{ px: 2.5, py: 2 }}>{children}</CardContent>
  </Card>
);

export default InfoCard;
