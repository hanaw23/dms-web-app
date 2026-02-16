enum DocumentStatusEnum {
  UPLOADED = "uploaded",
  PENDING_REPLACE = "pending_replace",
  PENDING_REMOVE = "pending_remove",
  APPROVED_REPLACE = "approved_replace",
  APPROVED_REMOVE = "approved_remove",
  REJECTED_REPLACE = "rejected_replace",
  REJECTED_REMOVE = "rejected_remove",
}

interface CreateDocumentRequest {
  name_doc: string;
}

interface UpdateDocumentRequest {
  name_doc?: string;
}

interface UpdateDocumentStatusRequest {
  status: DocumentStatus;
}

interface UserInDocument {
  id: number;
  name: string;
  username: string;
}

interface Document {
  id: number;
  name_doc: string;
  url_doc: string;
  status: DocumentStatus;
  is_remove_permission: boolean;
  is_replace_permission: boolean;
  user_id: number;
  user: UserInDocument;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string | null;
}

interface CreateDocumentResponseData extends BaseResponse {
  document: Document;
}

interface GetDocumentResponseData extends BaseResponse {
  document: Document;
}

interface GetAllDocumentsResponseData extends PaginationResponse {
  documents: Document[];
}

interface UpdateDocumentResponseData extends BaseResponse {
  document: Document;
}

interface UpdateDocumentStatusResponseData extends BaseResponse {
  document: Document;
}

interface DeleteDocumentResponseData extends BaseResponse {
  message?: string;
}

type DocumentStatus = DocumentStatusEnum;
type CreateDocumentResponse = CreateDocumentResponseData;
type GetDocumentResponse = GetDocumentResponseData;
type GetAllDocumentsResponse = GetAllDocumentsResponseData;
type UpdateDocumentResponse = UpdateDocumentResponseData;
type UpdateDocumentStatusResponse = UpdateDocumentStatusResponseData;
type DeleteDocumentResponse = DeleteDocumentResponseData;
