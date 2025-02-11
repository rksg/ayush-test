export interface CatchErrorDetails {
  code: string,
  message: string,
  suggestion?: string
}

export interface CatchErrorResponse {
  data: {
    errors: CatchErrorDetails[],
    requestId: string
  },
  status: number
}
