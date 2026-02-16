interface BaseResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginationResponse extends BaseResponse<T> {
  meta: PaginationMeta;
}
