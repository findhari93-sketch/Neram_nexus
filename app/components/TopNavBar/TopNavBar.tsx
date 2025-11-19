"use client";
import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import UserProfile from "../UserProfile";
import DateFilter from "../DateFilter/DateFilter";
import { usePathname } from "next/navigation";
import { findBestMatch, MenuItem } from "../../../lib/menuConfig";

// Export header heights for layout calculations
export const HEADER_HEIGHT_XS = 52; // mobile
export const HEADER_HEIGHT_SM = 48; // >= sm

type Breadcrumb = { label: string; href?: string };

export const SECOND_ROW_HEIGHT = 46; // height of the breadcrumb/date bar

type Props = {
  title?: string;
  sectionTitle?: string;
  onMenuClick?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  breadcrumbs?: Breadcrumb[];
  dateFilterValue?: { start: Date; end: Date } | undefined;
  onDateFilterChange?: (range: { start: Date; end: Date } | undefined) => void;
  sidebarWidth?: number; // dynamic width of sidebar (collapsed/expanded) for second row positioning
};

const TopNavHeader: React.FC<Props> = ({
  title = "Admin Portal",
  sectionTitle,
  onMenuClick,
  showBack = false,
  onBack,
  breadcrumbs,
  dateFilterValue,
  onDateFilterChange,
  sidebarWidth = 0,
}) => {
  const theme = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();

  const name = session?.user?.name || "User";
  const displayRole = (session?.user as any)?.role || "";

  // Derive breadcrumbs & section title automatically if missing from props
  let derivedSectionTitle = sectionTitle;
  let derivedBreadcrumbs = breadcrumbs;

  if (!sectionTitle || !breadcrumbs || breadcrumbs.length === 0) {
    const match = findBestMatch(pathname);
    if (match) {
      const builder =
        match.buildBreadcrumbs ||
        ((_: string, item: MenuItem) => [
          { label: "Home", href: "/" },
          { label: item.label },
        ]);
      if (!sectionTitle) derivedSectionTitle = match.label;
      if (!breadcrumbs || breadcrumbs.length === 0)
        derivedBreadcrumbs = builder(pathname, match);
    } else {
      // fallback
      if (!derivedSectionTitle) derivedSectionTitle = "Home";
      if (!derivedBreadcrumbs || derivedBreadcrumbs.length === 0)
        derivedBreadcrumbs = [{ label: "Home", href: "/" }];
    }
  }

  return (
    <>
      {/* Primary top toolbar (full width) */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          backgroundImage: (theme as any).palette?.custom?.headerGradient,
          backgroundColor: "transparent",
          color: "#fff",
          zIndex: (theme as any).zIndex?.drawer + 2,
        }}
      >
        <Toolbar
          sx={{
            minHeight: {
              xs: `${HEADER_HEIGHT_XS}px`,
              sm: `${HEADER_HEIGHT_SM}px`,
            },
            px: 2,
            gap: 1.25,
            background: "#0F2027",
            WebkitBackgroundImage:
              "-webkit-linear-gradient(to right, #2C5364, #203A43, #0F2027)",
            backgroundImage:
              "linear-gradient(to right, #2C5364, #203A43, #0F2027)",
          }}
        >
          {onMenuClick && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="toggle sidebar"
              onClick={onMenuClick}
              sx={{ mr: 1 }}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          )}
          <AccessTimeIcon sx={{ fontSize: 24 }} />
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "Inter, Open Sans, sans-serif",
              letterSpacing: 0.3,
              whiteSpace: "nowrap",
            }}
          >
            Neram Nexus
          </Typography>
          <Box
            sx={{
              width: 2,
              height: 22,
              bgcolor: "white",
              opacity: 0.25,
              borderRadius: 1,
              mx: 2,
            }}
          />
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "Inter, Open Sans, sans-serif",
              opacity: 0.9,
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <UserProfile name={name} role={displayRole} size={34} />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Secondary title/breadcrumb bar; width responds to sidebar width */}
      <Box
        sx={{
          position: "fixed",
          top: {
            xs: `${HEADER_HEIGHT_XS}px`,
            sm: `${HEADER_HEIGHT_SM}px`,
          },
          left: sidebarWidth,
          right: 0,
          height: `${SECOND_ROW_HEIGHT}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5, // reduced horizontal padding to allow content to sit closer to sidebar
          bgcolor: "background.paper",
          boxShadow: 1,
          zIndex: (theme as any).zIndex?.drawer + 1,
          transition: (theme as any).transitions.create(["left"], {
            duration: (theme as any).transitions.duration.shorter,
          }),
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {showBack && (
            <IconButton
              aria-label="Back"
              onClick={onBack}
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "Inter, Open Sans, sans-serif",
                color: "text.primary",
                whiteSpace: "nowrap",
              }}
            >
              {derivedSectionTitle}
            </Typography>
            {derivedBreadcrumbs && derivedBreadcrumbs.length > 0 && (
              <Breadcrumbs
                aria-label="breadcrumb"
                separator={
                  <NavigateNextIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                }
              >
                {derivedBreadcrumbs.map((crumb, idx) =>
                  crumb.href ? (
                    <Link
                      key={idx}
                      color="inherit"
                      href={crumb.href}
                      underline="hover"
                      sx={{ fontSize: 12, fontStyle: "italic" }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <Typography
                      key={idx}
                      color="text.primary"
                      sx={{ fontSize: 12, fontStyle: "italic" }}
                    >
                      {crumb.label}
                    </Typography>
                  )
                )}
              </Breadcrumbs>
            )}
          </Box>
        </Box>
        <DateFilter value={dateFilterValue} onChange={onDateFilterChange} />
      </Box>
    </>
  );
};

export default TopNavHeader;
