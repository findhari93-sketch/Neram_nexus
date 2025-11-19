"use client";
import React from "react";
import TopNavHeader, {
  HEADER_HEIGHT_SM,
  HEADER_HEIGHT_XS,
  SECOND_ROW_HEIGHT,
} from "@/app/components/TopNavBar/TopNavBar";
import Sidebar, {
  EXPANDED_WIDTH,
  COLLAPSED_WIDTH,
} from "@/app/components/Sidebar/Sidebar";

type PageHeaderConfig = {
  sectionTitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  showBack?: boolean;
  onBack?: () => void;
};

export default function ClientProtectedShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [headerConfig, setHeaderConfig] = React.useState<PageHeaderConfig>({});
  const toggleSidebar = () => setSidebarOpen((p) => !p);

  const sidebarWidth = sidebarOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
  const totalHeaderHeightDesktop = HEADER_HEIGHT_SM + SECOND_ROW_HEIGHT;
  const totalHeaderHeightMobile = HEADER_HEIGHT_XS + SECOND_ROW_HEIGHT;

  // Listen for custom header update events from child pages
  React.useEffect(() => {
    const handleHeaderUpdate = (event: CustomEvent) => {
      if (event.detail.reset) {
        setHeaderConfig({});
      } else {
        setHeaderConfig(event.detail);
      }
    };

    window.addEventListener('updatePageHeader', handleHeaderUpdate as EventListener);
    return () => {
      window.removeEventListener('updatePageHeader', handleHeaderUpdate as EventListener);
    };
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar rendered as fixed Drawer; supply topOffset so it starts below the AppBar */}
      <Sidebar
        role={role}
        open={sidebarOpen}
        onToggle={toggleSidebar}
        permanent
        topOffset={HEADER_HEIGHT_SM}
      />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)`,
          transition: "margin-left .25s, width .25s",
        }}
      >
        <TopNavHeader
          title="Portal"
          onMenuClick={toggleSidebar}
          sidebarWidth={sidebarWidth}
          sectionTitle={headerConfig.sectionTitle}
          breadcrumbs={headerConfig.breadcrumbs}
          showBack={headerConfig.showBack}
          onBack={headerConfig.onBack}
        />
        <div
          style={{
            paddingTop: totalHeaderHeightDesktop,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
