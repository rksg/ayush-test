import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseMigrationApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'migrationApi',
  tagTypes: ['Migration'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
