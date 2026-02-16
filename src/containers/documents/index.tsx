"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import { useGetAllDocumentsQuery, useDeleteDocumentMutation } from "@dms/services/document_services";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toolbar } from "primereact/toolbar";
import { helpers } from "@dms/utils";
import { PageNames } from "@dms/constants";

export default function DocumentsContainer() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    q: search,
    page,
    limit,
  });

  // Delete mutation
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  // Status badge template
  const statusBodyTemplate = (rowData: Document) => {
    return <Tag value={helpers.getStatus(rowData.status)} severity={helpers.getSeverity(rowData.status)} />;
  };

  // Date format template
  const dateBodyTemplate = (rowData: Document, field: "created_at" | "updated_at") => {
    return new Date(rowData[field]).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-file text-xl"></i>
        <div>
          <a href={rowData.url_doc} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
            {rowData.name_doc}
          </a>
        </div>
      </div>
    );
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

    return (
      <div className="flex gap-2">
        <Button icon="pi pi-eye" className="p-button-sm" severity="info" tooltip="View" tooltipOptions={{ position: "top" }} onClick={() => window.open(rowData.url_doc, "_blank")} />
        <Button icon="pi pi-pencil" className="p-button-sm" severity="warning" tooltip="Edit" tooltipOptions={{ position: "top" }} onClick={() => redirectPage("update", rowData.id)} disabled={!rowData.is_replace_permission} />
        <Button icon="pi pi-trash" className="p-button-sm" severity="danger" tooltip="Delete" tooltipOptions={{ position: "top" }} onClick={handleDelete} disabled={!rowData.is_remove_permission || isDeleting} />
      </div>
    );
  };

  const redirectPage = (action: "create" | "update", id?: string) => {
    if (action === "create") {
      router.push(`/${PageNames.create_document_page}`);
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
        <span className="p-input-icon-left p-input-icon-right">
          <InputText value={searchInput} onChange={handleSearchChange} placeholder="Search documents..." className="w-full" />
          {searchInput && (
            <i
              className="pi pi-times cursor-pointer"
              onClick={() => {
                setSearchInput("");
                debouncedSearch("");
              }}
            />
          )}
        </span>
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
        <Column field="name_doc" header="Document" body={nameBodyTemplate} sortable style={{ minWidth: "300px" }} />
        <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ width: "150px" }} />
        <Column field="user" header="Uploaded By" body={userBodyTemplate} style={{ minWidth: "200px" }} />
        <Column field="created_at" header="Created At" body={(rowData) => dayjs(rowData.created_at).format("DD MMM YYYY, hh:mm A")} sortable style={{ width: "200px" }} />
        <Column field="updated_at" header="Updated At" body={(rowData) => dayjs(rowData.updated_at).format("DD MMM YYYY, hh:mm A")} sortable style={{ width: "200px" }} />
        <Column header="Actions" body={actionsBodyTemplate} style={{ width: "180px" }} frozen alignFrozen="right" />
      </DataTable>
    </div>
  );
}
