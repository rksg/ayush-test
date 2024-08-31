import { createApi, fetchBaseQuery } from './baseQuery'

export const userApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'userApi',
  tagTypes: ['UserProfile', 'Mfa', 'Beta'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
