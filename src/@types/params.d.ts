type SearchParams = {
  limit?: number;
  page?: number;
  search?: string;
};

type Primitive = string | number | boolean | Date;
type ParamValue = Primitive | Primitive[] | undefined | null;
type ParamsObject = Record<string, ParamValue>;
