import { createApi, fetchBaseQuery } from './baseQuery'

export const baseAdministrationApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'administrationApi',
  tagTypes: ['Administration', 'License', 'RadiusClientConfig', 'Privacy'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
