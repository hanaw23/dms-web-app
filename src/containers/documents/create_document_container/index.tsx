"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { usePostCreateDocumentMutation } from "@dms/services/document_services";
import { Toast } from "primereact/toast";
import { UploadFormsComponent } from "@dms/components";
import { PageNames } from "@dms/constants";

export default function CreateDocumentContainer() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [postCreateDocument, { isLoading }] = usePostCreateDocumentMutation();

  const handleCancel = () => {
    router.push(`/${PageNames.documents_page}`);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await postCreateDocument(formData).unwrap();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Documents ${result?.data?.name_doc} uploaded successfully`,
        life: 3000,
      });
      setTimeout(() => {
        handleCancel();
      }, 1000);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Upload Failed",
        detail: error?.data?.message || "Failed to upload documents. Please try again.",
        life: 4000,
      });
      throw error;
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <div className="flex align-items-center justify-content-between mb-4">
        <h1 className="text-3xl font-bold">Upload New Files</h1>
      </div>

      <div className="mx-auto">
        <UploadFormsComponent mode="create" onSubmit={handleSubmit} isLoading={isLoading} onCancel={handleCancel} />
      </div>
    </div>
  );
}
