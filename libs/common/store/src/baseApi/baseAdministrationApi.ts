import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseAdministrationApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'administrationApi',
  tagTypes: ['Administration', 'License', 'RadiusClientConfig'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
