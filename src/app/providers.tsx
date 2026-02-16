"use client";

import { Provider } from "react-redux";
import { store } from "@dms/stores/index";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PrimeReactProvider } from "primereact/api";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <PrimeReactProvider>{children}</PrimeReactProvider>
      </LocalizationProvider>
    </Provider>
  );
};

export default Providers;
