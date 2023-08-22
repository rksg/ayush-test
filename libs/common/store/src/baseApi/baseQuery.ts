import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'

export const baseQuery = retry(fetchBaseQuery(), {
  maxRetries: 0
})