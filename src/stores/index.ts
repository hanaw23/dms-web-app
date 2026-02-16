import { configureStore } from "@reduxjs/toolkit";
import { authServices } from "@dms/services/auth_services";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [authServices.reducerPath]: authServices.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authServices.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
