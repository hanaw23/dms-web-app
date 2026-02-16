"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { PageNames } from "@dms/constants";

const RootPage = () => {
  useEffect(() => {
    redirect(PageNames.login_page);
  }, []);
};

export default RootPage;
