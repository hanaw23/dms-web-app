"use client";

import { useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { PageNames } from "@dms/constants";
import { useGetDocumentByIdQuery, usePatchUpdateDocumentMutation, usePatchUpdateDocumentStatusMutation } from "@dms/services/document_services";
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

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <div className="flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Update Document</h1>
          <p className="text-gray-600 mt-2">
            Editing: <span className="font-semibold">{document.name_doc}</span>
          </p>
        </div>
      </div>

      {/* Document Info Card */}
      <div className="surface-card p-4 border-round mb-4 shadow-1">
        <h3 className="text-xl font-semibold mb-3">Current Document Info</h3>
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="mb-3">
              <label className="text-gray-600 text-sm">Current File</label>
              <div className="flex align-items-center gap-2 mt-1">
                <i className="pi pi-file text-primary"></i>
                <a href={document.url_doc} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {document.name_doc}
                </a>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="mb-3">
              <label className="text-gray-600 text-sm">Status</label>
              <div className="mt-1">
                <span className={`py-1 border-round text-sm ${document.status === "uploaded" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                  <Tag value={helpers.getStatus(document.status)} severity={helpers.getSeverity(document.status)} />
                </span>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="mb-3">
              <label className="text-gray-600 text-sm">Uploaded By</label>
              <div className="mt-1">{document.user.name}</div>
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="mb-3">
              <label className="text-gray-600 text-sm">Last Updated</label>
              <div className="mt-1">{dayjs(document.updated_at).format("DD MMM YYYY, hh:mm A")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Form */}
      <div className="mx-auto">
        <UploadFormsComponent mode="update" initialName={document.name_doc} doc_url={document.url_doc} onSubmit={handleSubmit} isLoading={isSubmitLoading} onCancel={handleCancel} />
      </div>
    </div>
  );
}
