import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseMigrationApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'migrationApi',
  tagTypes: ['Migration'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
