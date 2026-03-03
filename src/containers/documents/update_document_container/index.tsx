"use client";

import { useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { PageNames } from "@dms/constants";
import { useGetDocumentByIdQuery, usePatchUpdateDocumentMutation, usePatchUpdateDocumentStatusMutation } from "@dms/services/document_services";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { UploadFormsComponent } from "@dms/components";
import { helpers } from "@dms/utils";

export default function UpdateDocumentContainer() {
  const toast = useRef<Toast>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("id") || "";
  const documentMode = searchParams.get("view");
  const is_update_mode = documentMode !== "view";

  // Fetch document data
  const { data: documentData, isLoading: isFetching, error: fetchError } = useGetDocumentByIdQuery(documentId);
  const document = documentData?.data;

  // Update mutation
  const [patchUpdateDocument, { isLoading: isUpdating }] = usePatchUpdateDocumentMutation();
  const [patchUpdateDocumentStatus, { isLoading: isUpdatingStatus }] = usePatchUpdateDocumentStatusMutation();
  const isSubmitLoading = isUpdating || isUpdatingStatus;

  const handleCancel = () => {
    router.push(`/${PageNames.documents_page}`);
  };
  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await patchUpdateDocument({
        id: documentId,
        body: formData,
      }).unwrap();

      if (result?.data) {
        await patchUpdateDocumentStatus({
          id: documentId,
          body: {
            status: "uploaded",
          },
        }).unwrap();

        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: `Document ${result?.data?.name_doc} updated successfully`,
          life: 3000,
        });

        setTimeout(() => {
          handleCancel();
        }, 1000);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Update Failed",
        detail: error?.data?.message || "Failed to update document. Please try again.",
        life: 4000,
      });

      throw error;
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <div className="text-center">
          <ProgressSpinner />
          <p className="mt-3 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError || !document) {
    return (
      <div className="p-4">
        <Toast ref={toast} />
        <Message severity="error" text="Document not found or failed to load" className="w-full mb-4" />
        <div className="flex gap-2">
          <button onClick={() => router.push(`/${PageNames.files_page}`)} className="p-button p-button-secondary">
            <i className="pi pi-arrow-left mr-2"></i>
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const displayIconFile = (extension: string) => {
    switch (extension) {
      case "pdf":
        return <i className="pi pi-file-pdf text-primary text-3xl" />;
        break;
      case "doc":
        return <i className="pi pi-file-word text-primary text-3xl" />;
        break;
      case "png":
      case "jpg":
      case "jpeg":
        return <i className="pi pi-image text-primary text-3xl" />;
        break;
      default:
        return <i className="pi pi-file text-primary text-3xl" />;
        break;
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <div className="flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{is_update_mode ? "Update" : "View"} Document</h1>
        </div>
      </div>

      {/* Document Info Card */}
      <div className="surface-card p-4 border-round mb-4 shadow-1 text-base">
        <h3 className="text-xl font-semibold mb-4">Current Document Info</h3>
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="mb-2">
              <label className="text-gray-600 text-sm font-semibold">Document Name</label>
              <div className="flex align-items-center gap-2 mt-1">{document.name_doc}</div>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="mb-2">
              <label className="text-gray-600 text-sm font-semibold">Status</label>
              <div className="mt-1">
                <span className={`py-1 border-round text-sm ${document.status === "uploaded" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                  <Tag value={helpers.getStatus(document.status)} severity={helpers.getSeverity(document.status)} />
                </span>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="mb-2">
              <label className="text-gray-600 text-sm font-semibold">Uploaded By</label>
              <div className="mt-1">{document.user.name}</div>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="mb-2">
              <label className="text-gray-600 text-sm font-semibold">Last Updated</label>
              <div className="mt-1">{dayjs(document.updated_at).format("DD MMM YYYY, hh:mm A")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Files & Form Update */}
      <div className="surface-card p-4 border-round mb-4 shadow-1 text-base">
        <h3 className="text-xl font-semibold mb-4">{!is_update_mode ? "Document Files" : "Upload New Files"}</h3>

        {is_update_mode && (
          <div className="mb-4">
            <label className="text-gray-600 font-semibold text-sm">Total Previous Files</label>
            <div className="mt-1 ">{document.files?.length} Files</div>
          </div>
        )}

        <div className="mx-auto">
          <UploadFormsComponent mode={is_update_mode ? "update" : "view"} initialName={document.name_doc} initialFiles={document.files} onSubmit={is_update_mode ? handleSubmit : null} isLoading={isSubmitLoading} onCancel={handleCancel} />
        </div>
      </div>

      {/* Action Buttons */}
      {!is_update_mode && (
        <div className="flex gap-2 justify-content-end">
          <Button type="button" label="Back" severity="secondary" onClick={handleCancel} />
        </div>
      )}
    </div>
  );
}
