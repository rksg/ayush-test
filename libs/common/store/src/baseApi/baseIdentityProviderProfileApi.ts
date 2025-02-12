
import { createApi, fetchBaseQuery } from './baseQuery'

export const baseIdentityProviderProfileApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'identityProviderProfileApi',
  tagTypes: ['IdentityProviderProfile'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})