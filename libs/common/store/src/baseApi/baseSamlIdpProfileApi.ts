
import { createApi, fetchBaseQuery } from './baseQuery'

export const baseSamlIdpProfileApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'samlIdpProfileApi',
  tagTypes: ['SamlIdpProfile'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})