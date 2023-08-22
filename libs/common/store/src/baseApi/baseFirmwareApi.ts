import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseFirmwareApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'firmwareApi',
  tagTypes: ['Firmware', 'SwitchFirmware', 'ABF'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
