"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@dms/context";
import { PageNames } from "@dms/constants";
import Sidebar from "../sidebars/sidebars";
import "./main_layout.css";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  const publicPaths = [`/${PageNames.login_page}`, `/${PageNames.register_page}`, "/login", "/register"];

  const isPublicPath = publicPaths.some((path) => pathname === path);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "3rem" }}></i>
      </div>
    );
  }

  if (isPublicPath || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
};

export default MainLayout;
