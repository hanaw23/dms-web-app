import { configureStore } from "@reduxjs/toolkit";
import { authServices } from "@dms/services/auth_services";
import { documentServices } from "@dms/services/document_services";
import { permissionServices } from "@dms/services/permission_services";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [authServices.reducerPath]: authServices.reducer,
    [documentServices.reducerPath]: documentServices.reducer,
    [permissionServices.reducerPath]: permissionServices.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authServices.middleware).concat(documentServices.middleware).concat(permissionServices.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
