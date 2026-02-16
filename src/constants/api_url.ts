const BASE_URL = process.env.NEXT_PUBLIC_PATH_URL as string;

const AUTH_URL_PATH = {
  register: `auth/register`,
  login: "auth/login",
  get_user: "auth/profile",
  get_all_admins: "auth/admins",
};

const DOCUMENTS_URL_PATH = {
  post_document: `documents/upload`,
  get_all_documents: "documents",
  get_all_user_documents: "documents/my-documents",
  get_check_document_update_permission: (id: number) => `documents/${id}/check-update-permission`,
  get_check_document_remove_permission: (id: number) => `documents/${id}/check-remove-permission`,
  document_by_id: (id: number) => `documents/${id}`,
  patch_request_document_permission: (id: number) => `documents/${id}/request-permission`,
};

const PERMISSION_URL_PATH = {
  permission_request: `permission-requests`,
  get_all_permissions_user: "permission-requests/my-requests",
  permission_by_id: (id: number) => `permission-requests/${id}`,
};

export { BASE_URL, PERMISSION_URL_PATH, DOCUMENTS_URL_PATH, AUTH_URL_PATH };
