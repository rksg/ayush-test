import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const rbacApiURL = `${window.location.origin}/analytics/api/rsa-mlisa-rbac`

export const rbacApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'rbacApi',
  refetchOnMountOrArgChange: true,
  tagTypes: ['RBAC'],
  endpoints: () => ({ })
})
