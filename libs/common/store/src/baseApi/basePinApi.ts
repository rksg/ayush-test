import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const basePinApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'pinApi',
  tagTypes: ['EdgePin', 'WebAuthNSG'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
