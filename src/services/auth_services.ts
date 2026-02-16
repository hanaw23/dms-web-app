import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { api_url } from "@dms/constants";

const { AUTH_URL_PATH, BASE_URL } = api_url;

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  });

  return baseQuery(args, api, extraOptions);
};

export const authServices = createApi({
  reducerPath: "authServices",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Auth", "User", "Admins"],
  endpoints: (builder) => ({
    // Register endpoint
    postRegister: builder.mutation<AuthRegisterResponse, AuthRegisterRequest>({
      query: (body) => ({
        url: AUTH_URL_PATH.register,
        method: "POST",
        body,
      }),
    }),

    // Login endpoint
    postLogin: builder.mutation<AuthLoginResponse, AuthLoginRequest>({
      query: (body) => ({
        url: AUTH_URL_PATH.login,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Get User Profile (authentication sudah otomatis dari baseQueryWithAuth)
    getUserProfile: builder.query<AuthUserResponseData, void>({
      query: () => ({
        url: AUTH_URL_PATH.get_user,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // Get All Admins dengan params
    getAllAdmins: builder.query<AuthUserAdminResponse, SearchParams | void>({
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
          url: `${AUTH_URL_PATH.get_all_admins}${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["Admins"],
    }),

    // Logout (client-side only, tanpa API call)
    logout: builder.mutation<void, void>({
      queryFn: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return { data: undefined };
      },
      invalidatesTags: ["Auth", "User", "Admins"],
    }),
  }),
});

export const { usePostRegisterMutation, usePostLoginMutation, useGetUserProfileQuery, useLazyGetUserProfileQuery, useGetAllAdminsQuery, useLazyGetAllAdminsQuery, useLogoutMutation } = authServices;
