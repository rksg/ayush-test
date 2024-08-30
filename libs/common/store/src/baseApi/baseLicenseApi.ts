import { createApi, fetchBaseQuery } from './baseQuery'

export const baseLicenseApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'licenseApi',
  tagTypes: ['License'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
