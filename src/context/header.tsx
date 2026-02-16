// "use client";

// import { createContext, useState, useEffect, useCallback } from "react";
// import Image from "next/image";
// import { useGeolocation } from "@dms/hooks";
// import PublicIcon from "@mui/icons-material/Public";
// import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
// import Skeleton from "@mui/material/Skeleton";
// import { useLazyGetAllConfigsQuery, useLazyGetAllLocalesQuery } from "@dms/services/locale_services";

// export const HeaderContext = createContext<HeaderContextType>({} as HeaderContextType);

// export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
//   const { userLocation } = useGeolocation();
//   const [ConfigTrigger] = useLazyGetAllConfigsQuery();
//   const [LocaleTrigger] = useLazyGetAllLocalesQuery();

//   const [userConfigData, setUserConfigData] = useState<ConfigData>();
//   const [userLocaleData, setUserLocaleData] = useState<LocaleData>();
//   const [userCurrentLocationData, setUserCurrentLocationData] = useState<UserCurrentLocation>();

//   const getConfigLocation = useCallback(async () => {
//     setUserConfigData((prev) => ({
//       ...prev,
//       isLoading: true,
//     }));

//     try {
//       const response = await ConfigTrigger().unwrap();
//       if (response?.data?.length > 0) {
//         const defaultLocation = response.data.find((item) => item.country === "United States");
//         const userCurrentLocation = response.data.find((item) => item.country === userLocation?.country);

//         setUserConfigData({
//           data: userCurrentLocation || defaultLocation,
//           isLoading: false,
//           error: null,
//         });
//       }
//     } catch (err) {
//       setUserConfigData({
//         ...userConfigData,
//         isLoading: false,
//         error: err.data.message,
//       });
//     }
//   }, [ConfigTrigger, userLocation?.country]);

//   const getLocaleLocation = useCallback(async () => {
//     setUserLocaleData((prev) => ({
//       ...prev,
//       isLoading: true,
//     }));

//     try {
//       const response = await LocaleTrigger().unwrap();
//       if (response?.data?.length > 0 && userConfigData?.data?.market) {
//         const defaultLocale = response.data.find((item) => item.id === "en-US");
//         const userLocale = response.data.find((item) => item.id === userConfigData.data.market);

//         setUserLocaleData({
//           data: userLocale || defaultLocale,
//           isLoading: false,
//           error: null,
//         });
//       }
//     } catch (err) {
//       setUserLocaleData({
//         ...userLocaleData,
//         isLoading: false,
//         error: err.data.message,
//       });
//     }
//   }, [LocaleTrigger, userConfigData]);

//   useEffect(() => {
//     if (userLocation) {
//       setUserCurrentLocationData(userLocation);
//       getConfigLocation();
//     }
//   }, [getConfigLocation, userLocation]);

//   useEffect(() => {
//     if (userLocation && userConfigData?.data) {
//       getLocaleLocation();
//     }
//   }, [getLocaleLocation, userConfigData, userLocation]);

//   const isLoading = userConfigData?.isLoading || userLocaleData?.isLoading;
//   const isError = userConfigData?.error || userLocaleData?.error;

//   return (
//     <HeaderContext.Provider
//       value={{
//         userConfigData,
//         userLocaleData,
//         setUserConfigData,
//         setUserLocaleData,
//         userCurrentLocationData,
//       }}
//     >
//       {!isError && (
//         <div className="flex justify-end w-full px-6 pt-4 bg-slate-950 z-[999]">
//           <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-md p-4 flex flex-wrap gap-6 items-center text-sm md:text-base min-h-[56px]">
//             {isLoading ? (
//               <>
//                 <Skeleton variant="circular" width={40} height={40} />
//                 <Skeleton variant="text" width={120} height={24} />
//                 <Skeleton variant="text" width={100} height={24} />
//               </>
//             ) : (
//               <>
//                 <div className="flex items-center gap-2">
//                   <Image src="/logo.png" alt="Plane Icon" width={40} height={40} priority />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <PublicIcon fontSize="small" />
//                   <span>{userConfigData?.data?.country}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <AttachMoneyIcon fontSize="small" />
//                   <span>
//                     {userConfigData?.data?.currencySymbol} {userConfigData?.data?.currency}
//                   </span>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//       {!isLoading && children}
//     </HeaderContext.Provider>
//   );
// };
