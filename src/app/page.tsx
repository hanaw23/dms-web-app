"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageNames } from "@dms/constants";
import { useAuth } from "@dms/context";

const RootPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push(`/${PageNames.documents_page}`);
      } else {
        router.push(`/${PageNames.login_page}`);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <i className="pi pi-spin pi-spinner" style={{ fontSize: "3rem" }}></i>
    </div>
  );
};

export default RootPage;
