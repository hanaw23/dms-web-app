"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { useAuth } from "@dms/context";
import { PageNames } from "@dms/constants";
import "./sidebar.css";

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  roles: ("USER" | "ADMIN")[];
}

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    {
      label: "Documents",
      icon: "pi pi-file",
      path: PageNames.documents_page,
      roles: ["USER", "ADMIN"],
    },
    {
      label: "Request Permissions",
      icon: "pi pi-shield",
      path: PageNames.request_permission_page,
      roles: ["ADMIN"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => user && item.roles.includes(user?.role));

  const handleLogout = () => {
    confirmDialog({
      message: "Are you sure you want to logout?",
      header: "Confirm Logout",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        logout();
        router.push(`/${PageNames.login_page}`);
      },
    });
  };

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="sidebar">
      {/* User Info */}
      <div className="sidebar-user">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-user text-2xl"></i>
          <div className="flex flex-column">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-sm text-500">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="sidebar-menu">
        {filteredMenuItems.map((item) => (
          <button key={item.path} className={`sidebar-menu-item ${isActive(item.path) ? "active" : ""}`} onClick={() => router.push(`/${item.path}`)}>
            <i className={`${item.icon} text-xl`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <Button label="Logout" icon="pi pi-sign-out" severity="danger" onClick={handleLogout} className="w-full" outlined />
      </div>
    </div>
  );
};

export default Sidebar;
