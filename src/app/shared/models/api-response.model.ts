export interface ApiResponseMeta { traceId: string; timestamp: string; path: string; }
export interface ApiResponse<T> { data?: T; meta: ApiResponseMeta; }
export interface ApiErrorResponse<E = unknown> {
  type: string; title: string; status: number; detail: string;
  instance: string; errorCode: string; traceId: string; timestamp: string; errors?: E;
}
