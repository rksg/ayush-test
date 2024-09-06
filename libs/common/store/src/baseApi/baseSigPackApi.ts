import { createApi, fetchBaseQuery } from './baseQuery'

export const baseSigPackApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'sigPackApi',
  tagTypes: [
    'SigPack'
  ],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
