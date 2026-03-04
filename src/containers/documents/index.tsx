"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import { useGetAllDocumentsQuery, useDeleteDocumentMutation, usePatchUpdateDocumentStatusMutation } from "@dms/services/document_services";
import { useGetAllAdminsQuery } from "@dms/services/auth_services";
import { usePostCreatePermissionRequestMutation } from "@dms/services/permission_services";
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
  const permissionTypeRef = useRef<string | null>(null);
  const permissionAdminRef = useRef<number | null>(null);
  const toast = useRef<Toast>(null);
  const user = localStorage.getItem("user");
  const role_user = JSON.parse(user)?.role;
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

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

  // Fetch
  const { data, isLoading, isFetching, refetch } = useGetAllDocumentsQuery({
    search,
    page,
    limit,
  });

  // Delete mutation
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  // Update status document mutation
  const [patchUpdateDocumentStatus, { isLoading: isUpdatingStatus }] = usePatchUpdateDocumentStatusMutation();

  // Create Permission Request mutation
  const [PostCreatePermissionRequest, { isLoading: isLoadingPermission }] = usePostCreatePermissionRequestMutation();

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

  // Permission dialog
  const PermissionDialogContent = ({
    permissionOptions,
    onChangePermissionType,
    onChangeAdmin,
  }: {
    permissionOptions: { label: string; value: string }[];
    onChangePermissionType: (val: string) => void;
    onChangeAdmin: (val: string) => void;
  }) => {
    const [selectedPermissionType, setSelectedPermissionType] = useState<string | null>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
    const [searchInputAdmin, setSearchInputAdmin] = useState<string>("");
    const [searchAdmin, setSearchAdmin] = useState<string>("");
    const [pageAdmin, _] = useState<number>(1);
    const limitAdmin = 10;
    const showDropdown = searchInputAdmin.length > 0 && !selectedAdmin;

    // Fetch Admins
    const { data: admins, isLoading: isLoadingAdmins } = useGetAllAdminsQuery({
      search: searchAdmin,
      page: pageAdmin,
      limit: limitAdmin,
    });

    // Debounce Admin
    const debouncedSearchAdmin = useMemo(
      () =>
        helpers.debounce((value: string) => {
          setSearchAdmin(value);
        }, 500),
      [],
    );

    const handleSearchChangeAdmin = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInputAdmin(value);
      debouncedSearchAdmin(value);
    };

    const adminOptions = useMemo(
      () =>
        admins?.data?.map((admin) => ({
          label: admin.name,
          value: admin.id,
        })) ?? [],
      [admins],
    );

    const handleSelectAdmin = (admin: { label: string; value: string }) => {
      setSelectedAdmin(admin.value);
      setSearchInputAdmin(admin.label);
      onChangeAdmin(admin.value);
    };

    return (
      <div className="mb-4 w-full">
        {/* Select Permission */}
        <div className="text-left mb-4">
          <div className="w-full">Permission Type *</div>
          <Dropdown
            value={selectedPermissionType}
            onChange={(e: DropdownChangeEvent) => {
              setSelectedPermissionType(e.value);
              onChangePermissionType(e.value);
            }}
            options={permissionOptions}
            optionLabel="label"
            optionValue="value"
            placeholder="Select permission type"
            className="w-full"
            checkmark={true}
            highlightOnSelect={true}
            pt={{
              input: { style: { textAlign: "left" } },
            }}
          />
        </div>
        {/* Admin Search */}
        <div className="text-left mb-4 relative">
          <div className="w-full">Admin To Be Requested *</div>
          <InputText
            value={searchInputAdmin}
            onChange={(e) => {
              if (selectedAdmin) setSelectedAdmin(null);
              handleSearchChangeAdmin(e);
            }}
            placeholder="Search admin..."
            className="w-full!"
          />

          {showDropdown && (
            <div className="absolute z-50 w-full bg-white border border-gray-200 rounded shadow-md mt-1 max-h-52 overflow-y-auto">
              {isLoadingAdmins ? (
                <div className="p-3 text-center text-gray-500 text-sm">Loading...</div>
              ) : adminOptions.length === 0 ? (
                <div className="p-3 text-center text-gray-500 text-sm">No admins found</div>
              ) : (
                adminOptions.map((admin) => (
                  <div
                    key={admin.value}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onMouseDown={(e) => e.preventDefault()} // cegah input blur sebelum onClick
                    onClick={() => handleSelectAdmin(admin)}
                  >
                    {admin.label}
                  </div>
                ))
              )}
            </div>
          )}

          {selectedAdmin && (
            <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-3 py-1 w-fit text-sm text-blue-700">
              <span>{searchInputAdmin}</span>
              <button
                onClick={() => {
                  setSelectedAdmin(null);
                  setSearchInputAdmin("");
                }}
                className="text-blue-400 hover:text-blue-700 font-bold"
              >
                <i className="pi pi-times text-red-500! text-sm!" />
              </button>
            </div>
          )}
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

    // Handle Permission Request : USER ROLE
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

    const resetRef = () => {
      permissionTypeRef.current = null;
      permissionAdminRef.current = null;
    };

    const handleRequestPermission = () => {
      resetRef();
      confirmDialog({
        style: { width: "350px" },
        message: (
          <PermissionDialogContent
            permissionOptions={permissionOptions}
            onChangePermissionType={(val) => {
              permissionTypeRef.current = val;
            }}
            onChangeAdmin={(val) => {
              permissionAdminRef.current = val;
            }}
          />
        ),
        header: "Request Permission",
        accept: async () => {
          if (!permissionTypeRef.current) {
            toast.current?.show({
              severity: "warn",
              summary: "Warning",
              detail: "Please select permission type",
              life: 3000,
            });
            return;
          }

          if (!permissionAdminRef.current) {
            toast.current?.show({
              severity: "warn",
              summary: "Warning",
              detail: "Please select admin to be requested",
              life: 3000,
            });
            return;
          }

          try {
            const requestTypeCapitalize = permissionTypeRef.current.toUpperCase();
            let newStatus: string = "";
            let message: string = "";
            if (permissionTypeRef.current === "replace") {
              newStatus = "pending_replace";
              message = "Request Replace Document";
            } else if (permissionTypeRef.current === "remove") {
              newStatus = "pending_remove";
              message = "Request Remove Document";
            }

            // Ubah status dokumen Dulu Jadi Pending
            const resultUpdateStatusDoc = await patchUpdateDocumentStatus({
              id: rowData.id,
              body: {
                status: newStatus,
              },
            }).unwrap();
            if (resultUpdateStatusDoc?.data && !isUpdatingStatus) {
              // Request permission dari USER ke ADMIN ROLE
              const bodyRequestPermission = {
                document_id: rowData.id,
                admin_id: permissionAdminRef.current,
                request_type: requestTypeCapitalize,
                message: message,
              };
              const resultPermission = await PostCreatePermissionRequest({
                ...bodyRequestPermission,
              }).unwrap();

              if (!resultPermission?.data && !isLoadingPermission) {
                toast.current?.show({
                  severity: "error",
                  summary: "Error",
                  detail: "Failed to request permission",
                  life: 3000,
                });
                return;
              } else {
                toast.current?.show({
                  severity: "success",
                  summary: "Success",
                  detail: `Permission request for ${requestTypeCapitalize} submitted successfully`,
                  life: 3000,
                });
              }
            } else {
              toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to update document status",
                life: 3000,
              });
            }
            refetch();
            resetRef();
          } catch (error) {
            toast.current?.show({
              severity: "error",
              summary: "Error",
              detail: "Failed to submit permission request",
              life: 3000,
            });
            resetRef();
          }
        },
        reject: () => {
          resetRef();
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
