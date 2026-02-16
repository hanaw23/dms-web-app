import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { api_url } from "@dms/constants";

const { DOCUMENTS_URL_PATH, BASE_URL } = api_url;

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const multipartEndpoints = ["postCreateDocument", "patchUpdateDocument"];

      if (!multipartEndpoints.includes(endpoint || "")) {
        headers.set("Content-Type", "application/json");
      }

      return headers;
    },
  });

  return baseQuery(args, api, extraOptions);
};

export const documentServices = createApi({
  reducerPath: "documentServices",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Documents", "Document"],
  endpoints: (builder) => ({
    // Create/Upload document
    postCreateDocument: builder.mutation<CreateDocumentResponse, FormData>({
      query: (formData) => ({
        url: DOCUMENTS_URL_PATH.post_document,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Documents"],
    }),

    // Get all documents
    getAllDocuments: builder.query<GetAllDocumentsResponse, SearchParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              searchParams.append(key, String(value));
            }
          });
        }

        const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";

        return {
          url: `${DOCUMENTS_URL_PATH.get_all_user_documents}${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["Documents"],
    }),

    // Get single document by ID
    getDocumentById: builder.query<GetDocumentResponse, number | string>({
      query: (id) => ({
        url: `${DOCUMENTS_URL_PATH.document_by_id(id)}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Document", id }],
    }),

    // Patch/Update document
    patchUpdateDocument: builder.mutation<UpdateDocumentResponse, { id: number | string; body: UpdateDocumentRequest | FormData }>({
      query: ({ id, body }) => ({
        url: `${DOCUMENTS_URL_PATH.document_by_id(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Document", id }, "Documents"],
    }),

    // Patch/Update document status
    patchUpdateDocumentStatus: builder.mutation<UpdateDocumentStatusResponse, { id: number | string; body: UpdateDocumentStatusRequest }>({
      query: ({ id, body }) => ({
        url: `${DOCUMENTS_URL_PATH.patch_request_document_permission(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Document", id }, "Documents"],
    }),

    // Delete document
    deleteDocument: builder.mutation<DeleteDocumentResponse, number | string>({
      query: (id) => ({
        url: `${DOCUMENTS_URL_PATH.document_by_id(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Documents"],
    }),
  }),
});

export const {
  usePostCreateDocumentMutation,
  useGetAllDocumentsQuery,
  useLazyGetAllDocumentsQuery,
  useGetDocumentByIdQuery,
  useLazyGetDocumentByIdQuery,
  usePatchUpdateDocumentMutation,
  usePatchUpdateDocumentStatusMutation,
  useDeleteDocumentMutation,
} = documentServices;
