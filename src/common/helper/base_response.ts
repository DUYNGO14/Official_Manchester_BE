export interface BaseResponse<T = any> {
  message: string | string[];
  data?: T | null;
  error?: any|null;
  code: number;
  success?: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export function ApiResponseSuccess<T>(
  message: string,
  data: T,
  code = 200,
): BaseResponse<T> {
  return {
    success: true,
    message,
    data,
    code,
  };
}

export function ApiResponseError(
  message: string | string[],
  code = 400,
  error: any = null,
): BaseResponse {
  return {
    success: false,
    message,
    error,
    code,
  };
}

export function ApiResponsePaginateResponse<T>(
  message: string,
  data: T[],
  page: number,
  limit: number,
  total: number,
  code = 200,
): BaseResponse<PaginatedData<T>> {
  return {
    success: true,
    message,
    code,
    data: {
      data,
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
}
