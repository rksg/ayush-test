import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseServiceApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'serviceApi',
  // eslint-disable-next-line max-len
  tagTypes: ['Service', 'Dpsk', 'DpskPassphrase', 'MdnsProxy', 'MdnsProxyAp', 'WifiCalling', 'DHCP', 'Portal'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
