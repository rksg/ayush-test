import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseServiceApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'serviceApi',
  tagTypes: [
    'Service',
    'Dpsk',
    'DpskPassphrase',
    'DpskPassphraseDevices',
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
