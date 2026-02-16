"use client";

import { Provider } from "react-redux";
import { store } from "@dms/stores/index";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PrimeReactProvider } from "primereact/api";
import { AuthProvider } from "@dms/context";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <PrimeReactProvider>{children}</PrimeReactProvider>
        </LocalizationProvider>
      </AuthProvider>
    </Provider>
  );
};

export default Providers;
