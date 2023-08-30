import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseFirmwareApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'firmwareApi',
  tagTypes: ['Firmware', 'SwitchFirmware', 'ABF', 'EdgeFirmware'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
