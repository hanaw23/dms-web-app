// "use client";

// import { useState, useEffect, useRef } from "react";
// import { helpers } from "@dms/utils";
// import { TextField, CircularProgress, MenuItem } from "@mui/material";
// import ClearIcon from "@mui/icons-material/Clear";
// import IconButton from "@mui/material/IconButton";
// import { useLazyGetAllAirportsQuery } from "@dms/services/flight_services";

// interface Airport {
//   value: {
//     skyId: string;
//     entityId: string;
//   };
//   label: string;
// }

// interface SearchInputProps {
//   label: string;
//   onSelect?: (airport: Airport) => void;
//   initialValue?: Airport;
//   error?: boolean;
//   helperText?: string;
//   locale: string;
// }

// const { debounce } = helpers;

// const SearchInput = ({ label, onSelect, initialValue, error, helperText, locale }: SearchInputProps) => {
//   const [labelValue, setLabelValue] = useState<string>("");
//   const [tempSelectedlabelValue, setTempSelectedLabelValue] = useState<string>("");
//   const [options, setOptions] = useState<Airport[]>([]);
//   const [getSearchAirportsTrigger] = useLazyGetAllAirportsQuery();
//   const [loadingSearchAirports, setLoadingSearchAirports] = useState(false);
//   const [errorSearchAirports, setErrorSearchAirports] = useState<string>("");

//   const debouncedSearch = useRef<(query: string) => void>();

//   useEffect(() => {
//     if (tempSelectedlabelValue && tempSelectedlabelValue !== initialValue?.label) {
//       setLabelValue(tempSelectedlabelValue);
//     } else if (initialValue?.label && !tempSelectedlabelValue) {
//       setLabelValue(initialValue.label);
//     } else {
//       setLabelValue("");
//     }
//   }, [initialValue, tempSelectedlabelValue]);

//   useEffect(() => {
//     debouncedSearch.current = debounce(async (query: string) => {
//       if (!query.trim()) {
//         setOptions([]);
//         return;
//       }

//       setLoadingSearchAirports(true);
//       try {
//         const res = await getSearchAirportsTrigger({ params: { query: query, locale: locale } }).unwrap();

//         const data = [];
//         if (res.data && res.data.length > 0) {
//           res.data.map((val) => {
//             data.push({
//               value: {
//                 skyId: val.navigation?.relevantFlightParams?.skyId,
//                 entityId: val.navigation?.relevantFlightParams?.entityId,
//               },
//               label: `${val.navigation?.relevantFlightParams?.localizedName} (${val.navigation?.relevantFlightParams?.skyId})`,
//             });
//           });
//         }
//         setOptions(data || []);
//       } catch (e) {
//         setErrorSearchAirports("Airport search error");
//         setOptions([]);
//       } finally {
//         setLoadingSearchAirports(false);
//       }
//     }, 300);
//   }, [getSearchAirportsTrigger, locale]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const input = e.target.value;
//     setLabelValue(input);
//     debouncedSearch.current?.(input);
//   };

//   const handleSelect = (airport: Airport) => {
//     setTempSelectedLabelValue(airport.label);
//     onSelect(airport);
//     setOptions([]);
//   };

//   return (
//     <div className="relative w-full">
//       <TextField
//         fullWidth
//         label={label}
//         value={labelValue}
//         onChange={handleChange}
//         error={error}
//         helperText={helperText}
//         InputProps={{
//           endAdornment: (
//             <>
//               {labelValue && (
//                 <IconButton
//                   size="small"
//                   onClick={() => {
//                     setLabelValue("");
//                     setOptions([]);
//                     onSelect?.(null);
//                   }}
//                 >
//                   <ClearIcon fontSize="small" />
//                 </IconButton>
//               )}
//               {loadingSearchAirports && <CircularProgress size={20} />}
//             </>
//           ),
//         }}
//         placeholder="Enter country, city, or location"
//       />
//       {options.length > 0 && (
//         <div className="absolute z-50 bg-white border rounded shadow w-full max-h-60 overflow-y-auto">
//           {options.map((airport) => (
//             <MenuItem key={airport.value.entityId} onClick={() => handleSelect(airport)}>
//               {airport.label}
//             </MenuItem>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchInput;
