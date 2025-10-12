import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Box,
  CircularProgress,
  Divider,
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
}) => (
  <Card sx={{ mb: 2, boxShadow: 1 }}>
    <CardHeader
      title={title}
      action={
        <Box>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : isEditing ? (
            <>
              <IconButton
                aria-label="Save"
                onClick={onSave}
                disabled={saveDisabled}
                color="primary"
              >
                <span className="material-icons">check</span>
              </IconButton>
              <IconButton aria-label="Cancel" onClick={onCancel} color="error">
                <span className="material-icons">close</span>
              </IconButton>
            </>
          ) : (
            <IconButton aria-label="Edit" onClick={onEdit} color="primary">
              <span className="material-icons">edit</span>
            </IconButton>
          )}
          {actions}
        </Box>
      }
      sx={{ pb: 0, pt: 2 }}
    />
    {divider && <Divider />}
    <CardContent sx={{ pt: 2 }}>{children}</CardContent>
  </Card>
);

export default InfoCard;
