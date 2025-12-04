export type AppBreadcrumb = { label: string; href?: string };

export interface MenuItem {
  label: string;
  href: string;
  roles?: string[]; // allowed roles
  buildBreadcrumbs?: (pathname: string, item: MenuItem) => AppBreadcrumb[];
}

// Default breadcrumb builder: Home + item + any nested segments.
// For nested routes like /web-users/123/edit it will produce:
// Home > Web Users > Details > Edit
// Heuristics:
//  - UUID / numeric segments become 'Details'
//  - Other segments are Title-Cased (hyphens -> spaces)
//  - Intermediate segments get href for progressive navigation
const defaultBuilder = (pathname: string, item: MenuItem): AppBreadcrumb[] => {
  const crumbs: AppBreadcrumb[] = [{ label: "Home", href: "/" }];
  if (item.href !== "/") {
    crumbs.push({ label: item.label, href: item.href });
  } else {
    // root special case; if root and no further segments, return early
    const remaining = pathname.replace(/^\/+/, "").split("/").filter(Boolean);
    if (remaining.length === 0) return crumbs; // just Home
  }
  // Compute remaining path after base href
  let remainder = pathname.startsWith(item.href)
    ? pathname.slice(item.href.length)
    : "";
  remainder = remainder.replace(/^\//, "");
  if (!remainder) return crumbs;
  const segments = remainder.split("/").filter(Boolean);
  let cumulative = item.href === "/" ? "" : item.href; // start base for href construction
  segments.forEach((seg, idx) => {
    const isIdLike = /^(?:\d+|[0-9a-fA-F]{8,}|[0-9a-fA-F-]{32,})$/.test(seg);
    const pretty = isIdLike
      ? "Details"
      : seg.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    cumulative += `/${seg}`;
    // All segments now get href for progressive navigation
    crumbs.push({ label: pretty, href: cumulative });
  });
  return crumbs;
};

export const menuItems: MenuItem[] = [
  {
    label: "Home",
    href: "/",
    roles: ["super_admin", "admin", "teacher", "student"],
    buildBreadcrumbs: defaultBuilder,
  },
  {
    label: "Dashboard",
    href: "/superadmin",
    roles: ["super_admin"],
    buildBreadcrumbs: defaultBuilder,
  },
  {
    label: "Dashboard",
    href: "/admin",
    roles: ["admin"],
    buildBreadcrumbs: defaultBuilder,
  },
  {
    label: "Web Users",
    href: "/web-users",
    roles: ["admin", "super_admin"],
    buildBreadcrumbs: defaultBuilder,
  },
  {
    label: "Class Join Requests",
    href: "/class-requests",
    roles: ["admin", "super_admin"],
    buildBreadcrumbs: (pathname: string, item: MenuItem) => {
      const crumbs: AppBreadcrumb[] = [
        { label: "Home", href: "/" },
        { label: "Class Join Requests", href: "/class-requests" },
      ];

      // Check if we're on a detail page (has an ID segment)
      const remainder = pathname.slice(item.href.length).replace(/^\//, "");
      if (remainder) {
        const segments = remainder.split("/").filter(Boolean);
        if (segments.length > 0) {
          // This is a detail page - the label will be updated dynamically
          // We use a placeholder that will be replaced by the component
          crumbs.push({ label: "Details" });
        }
      }

      return crumbs;
    },
  },
  {
    label: "Exam Centers",
    href: "/exam-centers",
    roles: ["admin", "super_admin"],
    buildBreadcrumbs: (pathname: string, item: MenuItem) => {
      const crumbs: AppBreadcrumb[] = [
        { label: "Home", href: "/" },
        { label: "Exam Centers", href: "/exam-centers" },
      ];

      // Check if we're on a detail/form page (has an ID segment or 'new' segment)
      const remainder = pathname.slice(item.href.length).replace(/^\//, "");
      if (remainder) {
        const segments = remainder.split("/").filter(Boolean);
        if (segments.length > 0) {
          if (segments[0] === "new") {
            crumbs.push({ label: "Add Center", href: "/exam-centers/new" });
          } else {
            crumbs.push({
              label: "Edit Center",
              href: `${item.href}/${segments[0]}`,
            });
          }
        }
      }

      return crumbs;
    },
  },
  {
    label: "Teachers",
    href: "/teacher",
    roles: ["teacher", "admin", "super_admin"],
    buildBreadcrumbs: defaultBuilder,
  },
  {
    label: "Students",
    href: "/student",
    roles: ["student", "teacher", "admin", "super_admin"],
    buildBreadcrumbs: defaultBuilder,
  },
];

export function findBestMatch(pathname: string): MenuItem | undefined {
  // Longest href that is a prefix of pathname (exact or segment boundary)
  const candidates = menuItems.filter(
    (m) => pathname === m.href || pathname.startsWith(m.href + "/")
  );
  if (candidates.length === 0) return menuItems.find((m) => m.href === "/");
  return candidates.sort((a, b) => b.href.length - a.href.length)[0];
}
