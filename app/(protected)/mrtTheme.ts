import { createTheme } from "@mui/material/styles";
import type { TextFieldProps } from "@mui/material";

// Centralized numeric constants for header and filter heights (px)
const HEADER_HEIGHTS = {
  groupedHeader: 30,
  filterHeader: 60,
  filterInput: 22,
} as const;

// Color constants for easier maintenance
const COLORS = {
  headerBg: "#2c5364",
  headerBgHover: "#344d5c",
  headerText: "#ffffff",
  rowHover: "#f5f5f5",
  rowSelected: "rgba(25, 118, 210, 0.08)",
  rowSelectedHover: "rgba(25, 118, 210, 0.12)",
  border: "#f0f0f0",
  borderDark: "#e0e0e0",
} as const;

const mrtTheme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
    divider: "#e0e0e0",
    action: {
      hover: "rgba(0, 0, 0, 0.04)",
      selected: "rgba(25, 118, 210, 0.08)",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: "1.1rem",
    },
    body1: {
      fontSize: "0.875rem",
    },
    body2: {
      fontSize: "0.8125rem",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Root container used by the grid
        ".web-users-grid-root": {
          padding: "16px",
        },
        // Limit font-size override to header cells for performance
        ".web-users-grid-root thead .MuiTableCell-root": {
          fontSize: "0.75rem", // 12px in rem for accessibility
        },
        // Grouped header row (first header)
        ".web-users-grid-root thead > .MuiTableRow-root:first-of-type": {
          height: `${HEADER_HEIGHTS.groupedHeader}px`,
        },
        // Second header row (filters / search)
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2)": {
          height: `${HEADER_HEIGHTS.filterHeader}px`,
        },
        // Ensure header cells in the grouped header row align vertically
        ".web-users-grid-root thead > .MuiTableRow-root:first-of-type .MuiTableCell-root":
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: `${HEADER_HEIGHTS.groupedHeader}px`,
            padding: "4px 16px",
          },
        // Ensure the inner content wrapper for grouped headers also left-aligns
        ".web-users-grid-root thead > .MuiTableRow-root:first-of-type .Mui-TableHeadCell-Content, .web-users-grid-root thead > .MuiTableRow-root:first-of-type .MuiBox-root":
          {
            justifyContent: "flex-start",
            textAlign: "left",
          },
        // Ensure header cells in the second header row (filters/search) align vertically
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2) .MuiTableCell-root":
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: `${HEADER_HEIGHTS.filterHeader}px`,
            padding: "0 10px",
          },
        // Make per-column filter inputs compact
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2) .MuiOutlinedInput-root":
          {
            height: `${HEADER_HEIGHTS.filterInput}px`,
            boxSizing: "border-box",
          },
        // Ensure filter input elements fit properly
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2) .MuiOutlinedInput-root input":
          {
            height: "100%",
            padding: "0 8px",
            boxSizing: "border-box",
          },
        // Target the Mui-TableHeadCell-Content wrapper
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2) .Mui-TableHeadCell-Content":
          {
            height: `${HEADER_HEIGHTS.groupedHeader}px`,
            display: "flex",
            alignItems: "center",
          },
        // Target MuiBox-root wrapper
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2) .MuiBox-root":
          {
            height: `${HEADER_HEIGHTS.groupedHeader}px`,
            display: "flex",
            alignItems: "center",
          },
        // Ensure collapse wrappers used by MRT filter cells take full width
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2) .MuiCollapse-root":
          {
            width: "100%",
          },
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2) .MuiCollapse-wrapper":
          {
            width: "100%",
            boxSizing: "border-box",
          },
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2) .MuiCollapse-wrapperInner":
          {
            width: "100%",
            height: `${HEADER_HEIGHTS.filterInput}px`,
            maxHeight: `${HEADER_HEIGHTS.filterInput}px`,
            overflow: "hidden",
            boxSizing: "border-box",
          },
        // Remove default shadows for Paper inside the grid container
        ".web-users-grid-root .MuiPaper-root": {
          boxShadow: "none",
        },
        // Reduce horizontal padding on sticky header cells
        ".web-users-grid-root .MuiTableCell-head.MuiTableCell-stickyHeader": {
          paddingLeft: "10px !important",
          paddingRight: "10px !important",
        },
        // Ensure sticky/pinned header cells inherit the header background & text
        // color so pinned columns visually match the table header.
        ".web-users-grid-root .MuiTableCell-stickyHeader, .web-users-grid-root th.MuiTableCell-stickyHeader":
          {
            backgroundColor: `${COLORS.headerBg} !important`,
            color: `${COLORS.headerText} !important`,
          },
        // Specific: make the first header cell (actions column) visually match
        // the header and hide its drag/move/resize icons. Also pin the first
        // header cells horizontally so the actions column headers remain
        // visible when horizontally scrolling.
        ".web-users-grid-root thead th:first-of-type, .web-users-grid-root thead .MuiTableRow-root:first-of-type th:first-of-type, .web-users-grid-root thead .MuiTableRow-root:nth-of-type(2) th:first-of-type":
          {
            backgroundColor: `${COLORS.headerBg} !important`,
            color: `${COLORS.headerText} !important`,
            position: "sticky",
            left: 0,
            zIndex: 250,
          },
        ".web-users-grid-root thead th:first-of-type .mrt-column-drag-button, .web-users-grid-root thead th:first-of-type .mrt-column-actions-button, .web-users-grid-root thead th:first-of-type .mrt-resize-handle":
          {
            display: "none !important",
          },
        // Ensure pinned/sticky columns (th/td with position: sticky) use the
        // same header background / text color so pinned headers visually match
        // the table header. We match by detecting inline `position: sticky`
        // which is how MUI/MRT applies sticky/pinned styles.
        // Generic: any cell with inline `position: sticky` (pinned by MRT)
        // should visually match the header. Increase z-index so pinned cells
        // overlay non-pinned content and add a subtle separator shadow.
        // Only style pinned HEADER cells (th). Do NOT color body cells (td).
        ".web-users-grid-root thead th[style*='position: sticky'], .web-users-grid-root th[style*='position: sticky']":
          {
            backgroundColor: `${COLORS.headerBg} !important`,
            color: `${COLORS.headerText} !important`,
            zIndex: 300,
            boxShadow: "2px 0 6px rgba(0,0,0,0.06)",
          },
        // MRT sometimes injects a pseudo-element on pinned cells which can
        // overlay our header colour. Target the pseudo-element directly and
        // force it to use the header background + remove its light overlay.
        // Target only header pseudo-element for pinned header cells so body
        // pinned cells keep normal table row background.
        ".web-users-grid-root thead th[data-pinned='true']::before, .web-users-grid-root th[data-pinned='true']::before":
          {
            backgroundColor: `${COLORS.headerBg} !important`,
            boxShadow: "none !important",
            // ensure pseudo-element fills the cell and doesn't change colour
            content: '""',
            height: "100%",
            left: 0,
            top: 0,
          },
        // Make sure header <th> pinned cells (thead) are above body pinned cells
        // so header text and controls remain visible when scrolling.
        ".web-users-grid-root thead th[style*='position: sticky']": {
          backgroundColor: `${COLORS.headerBg} !important`,
          color: `${COLORS.headerText} !important`,
          position: "sticky",
          zIndex: 350,
        },
        // Per-column filter input placeholder - subtle but visible for accessibility
        ".web-users-grid-root thead > .MuiTableRow-root:nth-of-type(2) input::placeholder":
          {
            color: "rgba(255, 255, 255, 0.4)",
            fontSize: "0.75rem",
          },
        // Hide drag icons completely but keep functionality
        ".web-users-grid-root .mrt-column-drag-button, .web-users-grid-root .mrt-column-drag-button svg, .web-users-grid-root .mrt-column-drag-button .MuiSvgIcon-root":
          {
            opacity: "0 !important",
            visibility: "hidden !important",
            width: "0 !important",
            padding: "0 !important",
            margin: "0 !important",
          },
        // Keep drag button functional (clickable area)
        ".web-users-grid-root .mrt-column-drag-button": {
          pointerEvents: "auto !important",
          cursor: "grab !important",
        },
        // Action buttons: hidden by default, visible on row hover
        ".web-users-grid-root .mrt-action-btns": {
          opacity: 0,
          pointerEvents: "none",
          transform: "translateY(0)",
          transition: "opacity 140ms ease, transform 140ms ease",
        },
        ".web-users-grid-root tbody tr:hover .mrt-action-btns": {
          opacity: 1,
          pointerEvents: "auto",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            backgroundColor: `${COLORS.headerBg} !important`,
            fontWeight: 600,
            fontSize: "0.8125rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: `${COLORS.headerText} !important`,
            padding: "16px",
            borderBottom: "none",
            cursor: "pointer",
            transition: "background-color 150ms ease",
            "&:hover": {
              backgroundColor: `${COLORS.headerBgHover} !important`,
            },
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": {
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: COLORS.rowHover,
            },
            "&.Mui-selected": {
              backgroundColor: COLORS.rowSelected,
              "&:hover": {
                backgroundColor: COLORS.rowSelectedHover,
              },
            },
          },
          "& .MuiTableCell-root": {
            padding: "14px 16px",
            fontSize: "0.875rem",
            color: "#424242",
            borderBottom: `1px solid ${COLORS.border}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLORS.border}`,
        },
        head: {
          borderBottom: "none",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          backgroundColor: "#fafafa",
          borderTop: `1px solid ${COLORS.borderDark}`,
        },
        toolbar: {
          padding: "8px 16px",
          minHeight: "52px",
        },
        selectLabel: {
          fontSize: "0.875rem",
          color: "#616161",
          margin: 0,
        },
        displayedRows: {
          fontSize: "0.875rem",
          color: "#616161",
          margin: 0,
        },
        select: {
          fontSize: "0.875rem",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          padding: "8px",
          transition: "background-color 150ms ease",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: "6px",
          padding: "8px 16px",
          transition: "all 150ms ease",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            transition: "border-color 150ms ease",
            "& fieldset": {
              borderColor: "#e0e0e0",
              transition: "border-color 150ms ease",
            },
            "&:hover fieldset": {
              borderColor: "#bdbdbd",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1976d2",
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: "6px",
          transition: "color 150ms ease",
          "&.Mui-checked": {
            color: "#1976d2",
          },
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#424242",
          fontSize: "0.75rem",
          fontWeight: 400,
          padding: "8px 12px",
          borderRadius: "4px",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
        },
        arrow: {
          color: "#424242",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          borderRadius: "8px",
          transition: "box-shadow 150ms ease",
        },
        elevation1: {
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.06)",
        },
        elevation2: {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          fontWeight: 500,
          fontSize: "0.8125rem",
          transition: "all 150ms ease",
        },
      },
    },
  },
});

// Typed constant for filter text field props
const FILTER_TEXT_FIELD_PROPS = {
  size: "small",
  variant: "outlined",
  sx: {
    "& .MuiInputBase-root": {
      height: HEADER_HEIGHTS.filterInput,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transition: "all 150ms ease",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
      },
    },
    "& .MuiOutlinedInput-root": {
      height: HEADER_HEIGHTS.filterInput,
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ffffff",
        borderWidth: "2px",
      },
    },
    "& .MuiInputBase-input, & .MuiOutlinedInput-input": {
      height: HEADER_HEIGHTS.filterInput,
      lineHeight: `${HEADER_HEIGHTS.filterInput}px`,
      padding: "0 8px",
      boxSizing: "border-box",
      fontSize: "0.75rem",
      color: "#ffffff",
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.4)",
        opacity: 1,
      },
    },
  },
  InputProps: {
    sx: { height: HEADER_HEIGHTS.filterInput },
  },
} as const satisfies Partial<TextFieldProps>;

// Additional MRT-specific theme overrides
export const mrtTableProps = {
  muiTablePaperProps: {
    elevation: 0,
    sx: {
      border: `1px solid ${COLORS.borderDark}`,
      borderRadius: "8px",
      overflow: "hidden",
    },
  },
  muiTableHeadCellProps: {
    sx: {
      fontWeight: 600,
      fontSize: "0.8125rem",
      // Hide sort icon by default (keeps ability to sort)
      "& .MuiTableSortLabel-icon": {
        opacity: 0,
        transition: "opacity 150ms ease",
      },
      // Show sort icon on hover
      "&:hover .MuiTableSortLabel-icon": {
        opacity: 0.7,
      },
      // Show sort icon when column is sorted (active)
      "& .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon": {
        opacity: 1,
      },
      // Hide column actions and resize buttons by default
      "& .mrt-column-actions-button, & .mrt-resize-handle": {
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity 150ms ease",
      },
      // Keep drag button always invisible but functional
      "& .mrt-column-drag-button": {
        opacity: 0,
        pointerEvents: "auto", // Keep functionality
      },
      // Reveal actions and resize on header hover (but not drag button)
      "&:hover .mrt-column-actions-button, &:hover .mrt-resize-handle": {
        opacity: 1,
        pointerEvents: "auto",
      },
      // Reduce clutter when icons appear
      "& .mrt-column-actions-button": {
        padding: 4,
        minWidth: 0,
      },
      // Keep padding for icons
      pr: 1.5,
    },
  },
  muiTableBodyCellProps: {
    sx: {
      fontSize: "0.875rem",
    },
  },
  muiFilterTextFieldProps: FILTER_TEXT_FIELD_PROPS,
  muiTopToolbarProps: {
    sx: {
      backgroundColor: "#fafafa",
      borderBottom: `1px solid ${COLORS.borderDark}`,
      padding: "12px 16px",
      minHeight: "64px",
    },
  },
  muiBottomToolbarProps: {
    sx: {
      backgroundColor: "#fafafa",
      borderTop: `1px solid ${COLORS.borderDark}`,
      minHeight: "52px",
    },
  },
  muiTableContainerProps: {
    sx: {
      maxHeight: {
        xs: "calc(100vh - 400px)", // Mobile
        sm: "calc(100vh - 350px)", // Tablet
        md: "calc(100vh - 300px)", // Desktop
      },
    },
  },
  // Enable smooth transitions for state changes
  enableRowVirtualization: false, // Set to true for large datasets
  enableColumnResizing: true,
  enableColumnOrdering: true,
  enableStickyHeader: true,
  enableStickyFooter: false,
};

export default mrtTheme;
