"use client";

import { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { helpers } from "@dms/utils";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";

interface UploadFormProps {
  mode: "create" | "update" | "view";
  initialName: string;
  initialFiles: DocumentFile[];
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const UploadFormsComponent = ({ mode = "create", initialName = "", initialFiles = [], onSubmit, isLoading = false, onCancel }: UploadFormProps) => {
  const toast = useRef<Toast>(null);
  const hasConverted = useRef(false);
  const fileUploadRef = useRef<FileUpload>(null);
  const [name, setName] = useState(initialName);
  const [countFiles, setCountFiles]: number = useState(0);
  const [files, setFiles]: string[] = useState<FileItem[]>([]);
  const [_, setSelectedFile] = useState<File | null>(null);

  const isViewMode = mode === "view";
  const areFilesExist = files && files?.length > 0;
  const checkIsDocumentFileType = (file: FileItem) => helpers.isDocumentFile(file);

  useEffect(() => {
    hasConverted.current = false;
    if (initialFiles.length > 0) {
      hasConverted.current = true;
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  const handleFileSelect = (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    setSelectedFile(file);

    if (!name) {
      const fileName = helpers.removeExtension(file?.name);
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

    if (files.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please select a file",
        life: 3000,
      });
      return;
    }

    // Build FormData
    // Handle name document
    const formData = new FormData();
    formData.append("name_doc", name.trim());

    // Handle Upload Files
    files
      .filter((f) => !helpers.isDocumentFile(f))
      .forEach((file) => {
        formData.append("files", file as File);
      });

    // handle if there're previous files removed (EDIT)
    const deletedIds = initialFiles.filter((f) => !files.find((el) => helpers.isDocumentFile(el) && el.id === f.id)).map((f) => f.id);

    if (deletedIds.length > 0) {
      formData.append("deleted_file_ids", JSON.stringify(deletedIds));
    }

    await onSubmit(formData);
  };

  const handleReset = () => {
    setName(initialName);
    setSelectedFile(null);
    setFiles([]);
    fileUploadRef.current?.clear();
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const displayIconFile = (extension: string) => {
    switch (extension) {
      case "pdf":
        return <i className="pi pi-file-pdf text-primary text-3xl" />;
        break;
      case "doc":
        return <i className="pi pi-file-word text-primary text-3xl" />;
        break;
      case "png" || "PNG":
      case "jpg":
      case "jpeg":
        return <i className="pi pi-image text-primary text-3xl" />;
        break;
      default:
        return <i className="pi pi-file text-primary text-3xl" />;
        break;
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-column gap-4">
      {/* Document Name */}
      {!isViewMode && (
        <div className="flex flex-column gap-2">
          <label htmlFor="name_doc" className="font-semibold">
            Document Name <span className="text-red-500">*</span>
          </label>
          <InputText id="name_doc" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter document name" required disabled={isLoading} className="w-full" />
        </div>
      )}

      {/* File Upload */}
      <div className="flex flex-column gap-2">
        {!isViewMode && (
          <label className="font-semibold">
            Upload File <span className="text-red-500">*</span>
          </label>
        )}

        {!isViewMode && (
          <FileUpload
            ref={fileUploadRef}
            mode="basic"
            name="file"
            accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
            maxFileSize={10000000}
            customUpload
            onSelect={handleFileSelect}
            auto={false}
            chooseLabel="Choose File"
            disabled={isLoading}
            className="w-full"
          />
        )}

        {areFilesExist ? (
          <div className={`${!isViewMode && "mt-3"}`}>
            <div className="font-semibold mb-3">Total Files: {files?.length}</div>
            <div
              className="gap-2 grid p-3 border-round text-sm"
              style={{
                border: "1px dashed #99a1af",
                borderRadius: "8px",
                margin: "0 auto",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {files?.map((file, index) => {
                const fileTypeName = checkIsDocumentFileType(file) ? file.filename : file.name;
                const fileExtention = helpers.getExtension(fileTypeName);
                const fileUrl = checkIsDocumentFileType(file) ? file.url_doc : URL.createObjectURL(file);
                const fileName = helpers.removeExtension(fileTypeName);

                return (
                  <div key={index} className="col-12 md:col-2 mb-3">
                    <div className="flex flex-col align-items-center gap-1 mt-1">
                      {displayIconFile(fileExtention)}
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-primary cursor-pointer hover:underline`}
                        style={{
                          display: "block",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fileName}
                      </a>
                      {!isViewMode && <i className="pi pi-trash cursor-pointer" style={{ color: "red" }} onClick={() => handleRemoveFile(index)} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      {!isViewMode && (
        <div className="flex gap-2 justify-content-end ">
          {onCancel && <Button type="button" label="Cancel" icon="pi pi-times" severity="secondary" onClick={onCancel} disabled={isLoading} />}
          <Button type="button" label="Reset" icon="pi pi-refresh" severity="warning" onClick={handleReset} disabled={isLoading} outlined />
          <Button type="submit" label={mode === "create" ? "Upload" : "Update"} icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-upload"} severity="success" loading={isLoading} disabled={isLoading} />
        </div>
      )}
    </form>
  );

  return (
    <>
      <Toast ref={toast} />
      {isViewMode ? formContent : <Card>{formContent}</Card>}
    </>
  );
};

export default UploadFormsComponent;
