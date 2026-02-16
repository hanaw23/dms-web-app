enum RequestTypeEnum {
  REPLACE = "REPLACE",
  REMOVE = "REMOVE",
}

enum PermissionStatusEnum {
  ONREVIEW = "ONREVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

enum DocumentStatusEnum {
  UPLOADED = "uploaded",
  PENDING_REPLACE = "pending_replace",
  PENDING_REMOVE = "pending_remove",
  APPROVED_REPLACE = "approved_replace",
  APPROVED_REMOVE = "approved_remove",
  REJECTED_REPLACE = "rejected_replace",
  REJECTED_REMOVE = "rejected_remove",
}

// Request DTOs
interface CreatePermissionRequest {
  document_id: number;
  admin_id: number;
  request_type: RequestType;
  message?: string;
}

interface UpdatePermissionRequest {
  status_permission: "APPROVED" | "REJECTED" | "ONREVIEW";
  admin_note?: string;
}

// Nested DTOs
interface UserInPermission {
  id: number;
  name: string;
  username: string;
}

interface DocumentInPermission {
  id: number;
  name_doc: string;
  url_doc: string;
  status: DocumentStatus;
}

// Main Permission Request DTO
interface PermissionRequest {
  id: number;
  document_id: number;
  document: DocumentInPermission;
  user_id: number;
  user: UserInPermission;
  admin_id: number;
  admin: UserInPermission;
  request_type: RequestType;
  status_permission: PermissionStatus;
  message: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

// Response DTOs
interface CreatePermissionRequestResponseData extends BaseResponse {
  permissionRequest: PermissionRequest;
}

interface GetPermissionRequestResponseData extends BaseResponse {
  permissionRequest: PermissionRequest;
}

interface GetAllPermissionRequestsResponseData extends PaginationResponse {
  permissionRequests: PermissionRequest[];
}

interface UpdatePermissionRequestResponseData extends BaseResponse {
  permissionRequest: PermissionRequest;
}

interface DeletePermissionRequestResponseData extends BaseResponse {
  message?: string;
}

// Type Aliases
type RequestType = RequestTypeEnum;
type PermissionStatus = PermissionStatusEnum;
type DocumentStatus = DocumentStatusEnum;

type CreatePermissionRequestResponse = CreatePermissionRequestResponseData;
type GetPermissionRequestResponse = GetPermissionRequestResponseData;
type GetAllPermissionRequestsResponse = GetAllPermissionRequestsResponseData;
type UpdatePermissionRequestResponse = UpdatePermissionRequestResponseData;
type DeletePermissionRequestResponse = DeletePermissionRequestResponseData;
