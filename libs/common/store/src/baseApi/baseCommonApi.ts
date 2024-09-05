import { createApi, fetchBaseQuery } from './baseQuery'

export const baseCommonApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'commonApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
