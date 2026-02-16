"use client";

import { useState, useRef } from "react";
import { useGetAllPermissionRequestsQuery, usePatchUpdatePermissionRequestMutation } from "@dms/services/permission_services";
import dayjs from "dayjs";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { usePatchUpdateDocumentStatusMutation } from "@dms/services/document_services";

enum PermissionStatusEnum {
  ONREVIEW = "ONREVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

const PermissionsContainer = () => {
  const toast = useRef<Toast>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null);
  const [reviewDialogVisible, setReviewDialogVisible] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED" | "ONREVIEW" | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const { data, isLoading, refetch } = useGetAllPermissionRequestsQuery({
    search,
    page,
    limit,
  });

  const [patchUpdatePermissionRequest, { isLoading: isUpdating }] = usePatchUpdatePermissionRequestMutation();
  const [patchUpdateDocumentStatus, { isLoading: isUpdatingStatus }] = usePatchUpdateDocumentStatusMutation();

  const isLoadingUpdateStatus = isUpdatingStatus || isUpdating;

  const permissionRequests = data?.data || [];
  const totalRecords = data?.meta?.total || 0;

  const handleReview = (request: PermissionRequest) => {
    setSelectedRequest(request);
    setReviewStatus(null);
    setAdminNote("");
    setReviewDialogVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest || !reviewStatus) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please select a status",
        life: 3000,
      });
      return;
    }

    try {
      const res = await patchUpdatePermissionRequest({
        id: selectedRequest.id,
        body: {
          status_permission: reviewStatus,
          admin_note: adminNote || undefined,
        },
      }).unwrap();

      if (res?.data) {
        let status = "";
        if (reviewStatus === "APPROVED") {
          status = selectedRequest?.request_type === "REPLACE" ? "approved_replace" : "approved_remove";
        } else {
          status = selectedRequest?.request_type === "REPLACE" ? "rejected_replace" : "rejected_remove";
        }

        await patchUpdateDocumentStatus({
          id: res?.data?.document_id,
          body: {
            status: status,
          },
        }).unwrap();

        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: `Permission request ${reviewStatus.toLowerCase()}`,
          life: 3000,
        });

        setReviewDialogVisible(false);
        refetch();
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.data?.message || "Failed to update permission request",
        life: 3000,
      });
    }
  };

  const statusBodyTemplate = (rowData: PermissionRequest) => {
    const severity = {
      ONREVIEW: "warning",
      APPROVED: "success",
      REJECTED: "danger",
    }[rowData.status_permission] as "warning" | "success" | "danger";

    return <Tag value={rowData.status_permission} severity={severity} />;
  };

  const requestTypeBodyTemplate = (rowData: PermissionRequest) => {
    const severity = rowData.request_type === "REPLACE" ? "info" : "danger";
    return <Tag value={rowData.request_type} severity={severity} />;
  };

  const actionsBodyTemplate = (rowData: PermissionRequest) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-eye" rounded outlined severity="info" onClick={() => handleReview(rowData)} tooltip="Review" tooltipOptions={{ position: "top" }} />
      </div>
    );
  };

  const statusOptions = [
    { label: "Approve", value: PermissionStatusEnum.APPROVED },
    { label: "Reject", value: PermissionStatusEnum.REJECTED },
  ];

  return (
    <div className="card">
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold mb-4">Your Documents</h1>
        <div className="flex gap-2">
          <Button label="Refresh" icon="pi pi-refresh" onClick={() => refetch()} severity="info" />
        </div>
      </div>

      <DataTable
        value={permissionRequests}
        loading={isLoading}
        paginator
        rows={limit}
        totalRecords={totalRecords}
        onPage={(e) => {
          setPage((e.page || 0) + 1);
          setLimit(e.rows);
        }}
        emptyMessage="No permission requests found"
        rowsPerPageOptions={[5, 10, 25, 50]}
      >
        <Column field="id" header="ID" sortable style={{ width: "5%" }} />
        <Column
          field="user.name"
          header="Requested By"
          body={(rowData) => (
            <div>
              <div className="font-semibold">{rowData.user.name}</div>
              <div className="text-sm text-500">@{rowData.user.username}</div>
            </div>
          )}
        />
        <Column field="document.name_doc" header="Document" body={(rowData) => <div className="font-semibold">{rowData.document.name_doc}</div>} />
        <Column field="request_type" header="Request Type" body={requestTypeBodyTemplate} />
        <Column field="status_permission" header="Status" body={statusBodyTemplate} />
        <Column field="message" header="Message" body={(rowData) => rowData.message || "-"} />
        <Column field="created_at" header="Created At" body={(rowData) => dayjs(rowData.created_at).format("DD MMM YYYY, hh:mm A")} />
        <Column header="Actions" body={actionsBodyTemplate} style={{ width: "10%" }} />
      </DataTable>

      {/* Review Dialog */}
      <Dialog header="Review Permission Request" visible={reviewDialogVisible} style={{ width: "500px" }} onHide={() => setReviewDialogVisible(false)}>
        {selectedRequest && (
          <div className="flex flex-column gap-3">
            <div>
              <strong>Requested by:</strong> {selectedRequest.user.name}
            </div>
            <div>
              <strong>Document:</strong> {selectedRequest.document.name_doc}
            </div>
            <div>
              <strong>Request Type:</strong> <Tag value={selectedRequest.request_type} severity={selectedRequest.request_type === "REPLACE" ? "info" : "danger"} />
            </div>
            <div>
              <strong>User Message:</strong>
              <p className="mt-2">{selectedRequest.message || "-"}</p>
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="status" className="font-semibold">
                Decision <span className="text-red-500">*</span>
              </label>
              <Dropdown id="status" value={reviewStatus} onChange={(e) => setReviewStatus(e.value)} options={statusOptions} placeholder="Select decision" className="w-full" />
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="admin_note" className="font-semibold">
                Admin Note (Optional)
              </label>
              <InputTextarea id="admin_note" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} placeholder="Add note for user..." className="w-full" />
            </div>

            <div className="flex gap-2 justify-content-end mt-3">
              <Button label="Cancel" icon="pi pi-times" severity="secondary" onClick={() => setReviewDialogVisible(false)} outlined />
              <Button label="Submit" icon="pi pi-check" severity="success" onClick={handleSubmitReview} loading={isLoadingUpdateStatus} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PermissionsContainer;
