"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageNames } from "@dms/constants";
import { usePostRegisterMutation } from "@dms/services/auth_services";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";

const optionRole = [
  { label: "Admin", value: "ADMIN" },
  { label: "User", value: "USER" },
];

export default function RegisterContainer() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [name, setName] = useState("");
  const [postRegister, { isLoading, error }] = usePostRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const request = {
      username,
      password,
      name,
      role: selectedRole,
    };

    try {
      const result = await postRegister(request).unwrap();

      toast.current?.show({
        severity: "success",
        summary: `${result?.data?.message}`,
        detail: `Please login to access DMS Web App!`,
        life: 3000,
      });

      setTimeout(() => {
        router.push(`/${PageNames.login_page}`);
      }, 1000);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Login Failed",
        detail: err?.data?.message,
        life: 4000,
      });
    }
  };

  return (
    <div className="flex  flex-col align-items-center justify-content-center min-h-screen">
      <Toast ref={toast} />
      <Card title="Register Your Account" className="w-full md:w-4 lg:w-3 text-center" style={{ maxWidth: "400px" }}>
        <form onSubmit={handleSubmit} className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label htmlFor="name" className="font-semibold text-left">
              Full Name
            </label>
            <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" required />
          </div>

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

          <div className="flex flex-column gap-2 w-full">
            <label htmlFor="role" className="font-semibold text-left">
              Role
            </label>
            <Dropdown
              value={selectedRole}
              onChange={(e: DropdownChangeEvent) => setSelectedRole(e.value)}
              options={optionRole}
              optionLabel="label"
              placeholder="Select user role"
              className="w-full md:w-14rem"
              checkmark={true}
              highlightOnSelect={false}
            />
          </div>

          {error && <Message severity="error" text="Registration failed. Please check your credentials." />}
          <Button type="submit" label={isLoading ? "Register in..." : "Register"} icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"} loading={isLoading} className="w-full mt-4" />
        </form>
      </Card>

      <div className="mt-4">
        <p className="text-sm">
          Already have account?{" "}
          <a href={`/${PageNames.login_page}`} className="text-blue-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
