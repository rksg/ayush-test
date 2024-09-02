import { createApi, fetchBaseQuery } from './baseQuery'

export const baseDhcpApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'dhcpApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
