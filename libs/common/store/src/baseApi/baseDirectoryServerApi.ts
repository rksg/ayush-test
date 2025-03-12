import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseDirectoryServerApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'directoryServerApi',
  tagTypes: ['DirectoryServer'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
