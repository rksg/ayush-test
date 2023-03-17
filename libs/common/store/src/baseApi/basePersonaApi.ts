import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const basePersonaApi = createApi({
  baseQuery: fetchBaseQuery(),
  tagTypes: ['PersonaGroup', 'Persona'],
  reducerPath: 'personaGroupApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
