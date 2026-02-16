"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageNames } from "@dms/constants";
import { usePostLoginMutation } from "@dms/services/auth_services";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";

export default function LoginContainer() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [postLogin, { isLoading, error }] = usePostLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await postLogin({ username, password }).unwrap();
      const accessToken = result?.data?.accessToken;
      const user = result?.data?.user;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);

        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      toast.current?.show({
        severity: "success",
        summary: "Login Successful",
        detail: `Welcome back, ${user?.username}!`,
        life: 3000,
      });

      setTimeout(() => {
        router.push(`/${PageNames.documents_page}`);
      }, 1000);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Login Failed",
        detail: err?.data?.message || "Invalid username or password. Please try again.",
        life: 4000,
      });
    }
  };

  return (
    <div className="flex flex-col align-items-center justify-content-center min-h-screen">
      <Toast ref={toast} />
      <Card title="Welcome to DMS Web App" className="w-full md:w-4 lg:w-3 text-center" style={{ maxWidth: "400px" }}>
        <form onSubmit={handleSubmit} className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label htmlFor="username" className="font-semibold text-left">
              Username
            </label>
            <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" required />
          </div>

          <div className="flex flex-column gap-2 w-full">
            <label htmlFor="password" className="font-semibold text-left">
              Password
            </label>
            <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" feedback={false} toggleMask required />
          </div>

          {error && <Message severity="error" text="Login failed. Please check your credentials." />}

          <Button type="submit" label={isLoading ? "Logging in..." : "Login"} icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"} loading={isLoading} className="w-full mt-4" />
        </form>
      </Card>

      <div className="mt-4">
        <p className="text-sm">
          Still not have account?{" "}
          <a href={`/${PageNames.register_page}`} className="text-blue-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
