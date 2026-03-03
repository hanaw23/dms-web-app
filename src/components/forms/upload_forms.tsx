"use client";

import { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";

interface UploadFormProps {
  mode?: "create" | "update";
  initialName?: string;
  doc_url?: string;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const UploadFormsComponent = ({ mode = "create", initialName = "", doc_url = "", onSubmit, isLoading = false, onCancel }: UploadFormProps) => {
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const [name, setName] = useState(initialName);
  const [countFiles, setCountFiles]: number = useState(0);
  const [files, setFiles]: string[] = useState([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    setSelectedFile(file);

    if (!name) {
      const fileName = file?.name?.replace(/\.[^/.]+$/, "");
      setName(fileName);
    }

    setFiles((prev) => {
      return [...prev, file];
    });

    toast.current?.show({
      severity: "info",
      summary: "File Selected",
      detail: file.name,
      life: 2000,
    });
  };

  useEffect(() => {
    if (countFiles !== files?.length) {
      fileUploadRef.current?.clear();
      setSelectedFile(null);
      setCountFiles((prev) => {
        return (prev += 1);
      });
    }
  }, [files]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(files, "dari submssion");
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Document name is required",
        life: 3000,
      });
      return;
    }

    if (mode === "create" && files.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please select a file",
        life: 3000,
      });
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append("name_doc", name.trim());

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    await onSubmit(formData);
  };

  const handleReset = () => {
    setName(initialName);
    setSelectedFile(null);
    setFiles([]);
    fileUploadRef.current?.clear();
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlPath = new URL(url).pathname;
      return urlPath.split("/").pop() || "Current file";
    } catch {
      return "Current file";
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-column gap-4">
          {/* Document Name */}
          <div className="flex flex-column gap-2">
            <label htmlFor="name_doc" className="font-semibold">
              Document Name <span className="text-red-500">*</span>
            </label>
            <InputText id="name_doc" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter document name" required disabled={isLoading} className="w-full" />
          </div>

          {/* File Upload */}
          <div className="flex flex-column gap-2">
            <label className="font-semibold">
              {mode === "create" ? "Upload File" : "Replace File"} {mode === "create" && <span className="text-red-500">*</span>}
            </label>

            {/* Show existing file in update mode: Will be Updated because it can be bulk */}
            {mode === "update" && doc_url && !selectedFile && (
              <div className="p-3 border-300 border-round mb-2">
                <small className="text-600">
                  <i className="pi pi-file mr-2"></i>
                  Current: {getFileNameFromUrl(doc_url)}
                </small>
              </div>
            )}

            <FileUpload
              ref={fileUploadRef}
              mode="basic"
              name="file"
              accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
              maxFileSize={10000000}
              customUpload
              onSelect={handleFileSelect}
              auto={false}
              chooseLabel={selectedFile ? "Change File" : mode === "update" ? "Replace File" : "Choose File"}
              disabled={isLoading}
              className="w-full"
            />

            <div className="mt-3 flex flex-column gap-2">
              {files && files.length > 0
                ? files.map((url, index) => (
                    <small key={index} className="text-green-600">
                      <i className="pi pi-check-circle mr-1"></i>
                      {url?.name} ({(url?.size / 1024 / 1024).toFixed(2)} MB)
                    </small>
                  ))
                : null}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-content-end">
            {onCancel && <Button type="button" label="Cancel" icon="pi pi-times" severity="secondary" onClick={onCancel} disabled={isLoading} />}
            <Button type="button" label="Reset" icon="pi pi-refresh" severity="warning" onClick={handleReset} disabled={isLoading} outlined />
            <Button type="submit" label={mode === "create" ? "Upload" : "Update"} icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-upload"} severity="success" loading={isLoading} disabled={isLoading} />
          </div>
        </form>
      </Card>
    </>
  );
};

export default UploadFormsComponent;
