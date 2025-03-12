
import { createApi, fetchBaseQuery } from './baseQuery'

export const baseClientIsolationApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'clientIsolationApi',
  tagTypes: ['ClientIsolation'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})