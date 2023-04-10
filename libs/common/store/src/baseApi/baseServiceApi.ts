import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseServiceApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'serviceApi',
  tagTypes: [
    'Service',
    'Dpsk',
    'DpskPassphrase',
    'MdnsProxy',
    'MdnsProxyAp',
    'WifiCalling',
    'DHCP',
    'Portal',
    'EdgeFirewall'
  ],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
