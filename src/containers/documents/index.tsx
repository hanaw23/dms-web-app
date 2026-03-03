"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import { useGetAllDocumentsQuery, useDeleteDocumentMutation, usePatchUpdateDocumentStatusMutation } from "@dms/services/document_services";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { helpers } from "@dms/utils";
import { PageNames } from "@dms/constants";

export default function DocumentsContainer() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const user = localStorage.getItem("user");
  const role_user = JSON.parse(user)?.role;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [permissionType, setPermissionType] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      helpers.debounce((value: string) => {
        setSearch(value);
        setPage(1);
      }, 500),
    [],
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  // Fetch documents
  const { data, isLoading, isFetching, refetch } = useGetAllDocumentsQuery({
    search,
    page,
    limit,
  });

  // Delete mutation
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  // Update status document mutation
  const [patchUpdateDocumentStatus, { isLoading: isUpdatingStatus }] = usePatchUpdateDocumentStatusMutation();

  // Status badge template
  const statusBodyTemplate = (rowData: Document) => {
    return <Tag value={helpers.getStatus(rowData.status)} severity={helpers.getSeverity(rowData.status)} />;
  };

  // User template
  const userBodyTemplate = (rowData: Document) => {
    return (
      <div>
        <div className="font-semibold">{rowData.user.name}</div>
        <div className="text-sm text-gray-500">@{rowData.user.username}</div>
      </div>
    );
  };

  // Document name with link template
  const nameBodyTemplate = (rowData: Document) => {
    return <div className="font-semibold text-primary">{rowData.name_doc}</div>;
  };

  const TimeTemplate = (date: string | Date) => {
    return <div className="font-semibold text-primary text-sm">{dayjs(date).format("DD MMM YYYY, hh:mm A")}</div>;
  };

  // Actions template
  const actionsBodyTemplate = (rowData: Document) => {
    const handleDelete = () => {
      confirmDialog({
        message: `Are you sure you want to delete "${rowData.name_doc}"?`,
        header: "Confirm Delete",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          try {
            await deleteDocument(rowData.id).unwrap();
            toast.current?.show({
              severity: "success",
              summary: "Success",
              detail: "Document deleted successfully",
              life: 3000,
            });
            refetch();
          } catch (error) {
            toast.current?.show({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete document",
              life: 3000,
            });
          }
        },
      });
    };

    const permissionOptions = [
      { label: "Replace Document", value: "replace" },
      { label: "Remove Document", value: "remove" },
    ].filter((option) => {
      if (option.value === "replace" && rowData.is_replace_permission) {
        return false;
      }
      if (option.value === "remove" && rowData.is_remove_permission) {
        return false;
      }
      return true;
    });

    const handleRequestPermission = () => {
      confirmDialog({
        message: (
          <div className="flex flex-column gap-3">
            <p>Select permission type you want to request:</p>
            <Dropdown value={permissionType} onChange={(e) => setPermissionType(e.value)} options={permissionOptions} placeholder="Select permission type" className="w-full" />
          </div>
        ),
        header: "Request Permission",
        accept: async () => {
          if (!permissionType) {
            toast.current?.show({
              severity: "warn",
              summary: "Warning",
              detail: "Please select permission type",
              life: 3000,
            });
            return;
          }

          try {
            let newStatus = "";
            if (isUpdatingStatus === "replace") {
              newStatus = "pending_replace";
            } else if (isUpdatingStatus === "remove") {
              newStatus = "pending_remove";
            }

            await patchUpdateDocumentStatus({
              id: rowData.id,
              body: {
                status: newStatus,
              },
            }).unwrap();
            toast.current?.show({
              severity: "success",
              summary: "Success",
              detail: `Permission request for ${permissionType} submitted successfully`,
              life: 3000,
            });
            refetch();
            setPermissionType(null);
          } catch (error) {
            toast.current?.show({
              severity: "error",
              summary: "Error",
              detail: "Failed to submit permission request",
              life: 3000,
            });
          }
        },
        reject: () => {
          setPermissionType(null);
        },
      });
    };

    return (
      <div className="flex gap-2">
        <Button icon="pi pi-eye" className="p-button-sm" severity="info" tooltip="View" tooltipOptions={{ position: "top" }} onClick={() => redirectPage("view", rowData.id)} />
        <Button icon="pi pi-pencil" className="p-button-sm" severity="warning" tooltip="Edit" tooltipOptions={{ position: "top" }} onClick={() => redirectPage("update", rowData.id)} disabled={!rowData.is_replace_permission} />
        <Button icon="pi pi-trash" className="p-button-sm" severity="danger" tooltip="Delete" tooltipOptions={{ position: "top" }} onClick={handleDelete} disabled={!rowData.is_remove_permission || isDeleting} loading={isDeleting} />
        {role_user === "ADMIN" ? null : (
          <Button
            icon="pi pi-user-edit"
            className="p-button-sm"
            severity="secondary"
            tooltip="Request Permission"
            tooltipOptions={{ position: "top" }}
            onClick={handleRequestPermission}
            disabled={rowData.is_remove_permission && rowData.is_replace_permission}
            loading={isUpdatingStatus}
          />
        )}
      </div>
    );
  };

  const redirectPage = (action: "create" | "update" | "view", id?: string) => {
    if (action === "create") {
      router.push(`/${PageNames.create_document_page}`);
    } else if (action === "view") {
      router.push(`/${PageNames.update_document_page}/?id=${id}&view=view`);
    } else {
      router.push(`/${PageNames.update_document_page}/?id=${id}`);
    }
  };

  // Toolbar content
  const leftToolbarTemplate = () => {
    return (
      <div className="flex gap-2">
        <Button label="New Document" icon="pi pi-plus" severity="success" onClick={() => redirectPage("create")} />
        <Button label="Refresh" icon="pi pi-refresh" onClick={() => refetch()} loading={isFetching} />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="flex align-items-center gap-2">
        <InputText value={searchInput} onChange={handleSearchChange} placeholder="Search documents..." className="w-full" />
      </div>
    );
  };

  return (
    <div className="card p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      <h1 className="text-3xl font-bold mb-4">Your Documents</h1>
      <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate} />

      <DataTable
        value={data?.data || []}
        loading={isLoading || isFetching}
        paginator
        rows={limit}
        totalRecords={data?.meta?.total || 0}
        lazy
        first={(data?.meta?.page - 1) * limit}
        onPage={(e) => {
          setPage(e.first / e.rows + 1);
          setLimit(e.rows);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} documents"
        emptyMessage="No documents found"
        className="w-full"
        stripedRows
        showGridlines
      >
        <Column field="id" header="ID" sortable style={{ width: "80px" }} />
        <Column field="name_doc" header="Document" body={nameBodyTemplate} sortable style={{ minWidth: "200px" }} />
        <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ width: "150px" }} />
        <Column field="user" header="Uploaded By" body={userBodyTemplate} style={{ minWidth: "200px" }} />
        <Column field="created_at" header="Created At" body={(rowData) => TimeTemplate(rowData.created_at)} sortable style={{ width: "300px" }} />
        <Column field="updated_at" header="Updated At" body={(rowData) => TimeTemplate(rowData.updated_at)} sortable style={{ width: "300px" }} />
        <Column header="Actions" body={actionsBodyTemplate} style={{ width: "180px" }} frozen alignFrozen="right" />
      </DataTable>
    </div>
  );
}
