import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

let theme = createTheme({
  palette: {
    primary: {
      main: "#347DA2",
      medium: "#0F4880",
      dark: "#2c435a",
    },
    custom: {
      yellow: "#F9C642",
      lightBlue: "#e6f7ff",
      darkBlue: "#AAC5CE",
      headerGradient: "linear-gradient(90deg, #347DA2 0%, #0F4880 100%)",
      paleBlue: "#DDEAEF",
      tablediffBlue: "#F4FBFF",
      brightLightBlue: "#B8E5F4",
      darkNavy: "#21262D",
    },
    text: {
      primary: "#000000",
      secondary: "#e8e8e8",
      disabled: "#777777",
    },
    secondary: {
      main: "#dc004e",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#2c435a",
      paper: "#ffffff",
    },
    neutral: {
      grey100: "#E1E1DF",
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontSize: "2.2rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
  },
  shape: {
    borderRadius: 5,
  },
  spacing: 8,
});

theme = createTheme(theme, {
  components: {
    MuiButton: {
      styleOverrides: {
        root: () => ({
          fontSize: "12px",
          height: 30,
          textTransform: "unset",
          padding: "0 1.1rem",
          borderRadius: theme.shape.borderRadius,
          fontWeight: 600,
          letterSpacing: 0.1,
          ["@media (min-width:1366px)"]: {
            fontSize: "15px",
          },
          "& .MuiButton-startIcon, & .MuiButton-endIcon": {
            color: "inherit",
          },
        }),
        containedPrimary: {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white,
          boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
          "&:hover": {
            backgroundColor:
              theme.palette.primary.medium || theme.palette.primary.main,
            boxShadow: "0 5px 12px rgba(0,0,0,0.16)",
          },
          "&:active": {
            filter: "brightness(0.95)",
          },
        },
        outlinedPrimary: {
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          backgroundColor: "transparent",
          "&:hover": {
            borderColor:
              theme.palette.primary.medium || theme.palette.primary.main,
            backgroundColor: "rgba(52,125,162,0.06)",
          },
          "&:active": {
            borderColor:
              theme.palette.primary.medium || theme.palette.primary.main,
          },
        },
      },
      variants: [
        {
          props: { variant: "ourColor" },
          style: {
            backgroundColor: theme.palette.primary.main,
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#1c5b7a",
            },
          },
        },
        {
          props: { variant: "whiteSolid" },
          style: {
            backgroundColor: "#ffffff",
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.85)",
            },
          },
        },
        {
          props: { variant: "plainSolid" },
          style: {
            backgroundColor: "transparent",
            color: "#ffffff",
            fontStyle: "normal",
            textDecoration: "underline !important",
            "&:hover": {
              color: "#F9C642",
            },
          },
        },
      ],
    },

    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: theme.shape.borderRadius,
        },
        elevation1: {
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: theme.palette.background.default,
          fontFamily: theme.typography.fontFamily,
        },
      },
    },
  },
});

export default theme;
