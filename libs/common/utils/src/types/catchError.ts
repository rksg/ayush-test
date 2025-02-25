export interface CatchErrorDetails {
  code: string,
  message: string,
  reason?: string,
  suggestion?: string
}

export interface CatchErrorResponse {
  data: {
    errors: CatchErrorDetails[],
    requestId: string
  },
  status: number
}
