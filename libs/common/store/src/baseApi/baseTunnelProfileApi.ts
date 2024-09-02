import { createApi, fetchBaseQuery } from './baseQuery'

export const baseTunnelProfileApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'tunnelProfileApi',
  tagTypes: ['TunnelProfile'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
