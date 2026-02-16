import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { api_url } from "@dms/constants";

import type { SearchParams } from "@dms/types";

const { PERMISSION_URL_PATH, BASE_URL } = api_url;

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  });

  return baseQuery(args, api, extraOptions);
};

export const permissionServices = createApi({
  reducerPath: "permissionServices",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["PermissionRequests", "PermissionRequest"],
  endpoints: (builder) => ({
    // Create permission request
    postCreatePermissionRequest: builder.mutation<CreatePermissionRequestResponse, CreatePermissionRequest>({
      query: (body) => ({
        url: PERMISSION_URL_PATH.permission_request,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PermissionRequests"],
    }),

    // Get all permission requests (admin)
    getAllPermissionRequests: builder.query<GetAllPermissionRequestsResponse, SearchParams | void>({
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
          url: `${PERMISSION_URL_PATH.permission_request}${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["PermissionRequests"],
    }),

    // Get user's own permission requests
    getMyPermissionRequests: builder.query<GetAllPermissionRequestsResponse, SearchParams | void>({
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
          url: `${PERMISSION_URL_PATH.get_all_permissions_user}${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["PermissionRequests"],
    }),

    // Get single permission request by ID
    getPermissionRequestById: builder.query<GetPermissionRequestResponse, number | string>({
      query: (id) => ({
        url: PERMISSION_URL_PATH.permission_by_id(Number(id)),
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "PermissionRequest", id }],
    }),

    // Update permission request (approve/reject by admin)
    patchUpdatePermissionRequest: builder.mutation<UpdatePermissionRequestResponse, { id: number | string; body: UpdatePermissionRequest }>({
      query: ({ id, body }) => ({
        url: PERMISSION_URL_PATH.permission_by_id(Number(id)),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "PermissionRequest", id }, "PermissionRequests"],
    }),

    // Delete permission request
    deletePermissionRequest: builder.mutation<DeletePermissionRequestResponse, number | string>({
      query: (id) => ({
        url: PERMISSION_URL_PATH.permission_by_id(Number(id)),
        method: "DELETE",
      }),
      invalidatesTags: ["PermissionRequests"],
    }),
  }),
});

export const {
  usePostCreatePermissionRequestMutation,
  useGetAllPermissionRequestsQuery,
  useLazyGetAllPermissionRequestsQuery,
  useGetMyPermissionRequestsQuery,
  useLazyGetMyPermissionRequestsQuery,
  useGetPermissionRequestByIdQuery,
  useLazyGetPermissionRequestByIdQuery,
  usePatchUpdatePermissionRequestMutation,
  useDeletePermissionRequestMutation,
} = permissionServices;
