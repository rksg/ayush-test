import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const basePersonaApi = createApi({
  baseQuery: baseQuery,
  tagTypes: ['PersonaGroup', 'Persona', 'IdentityClient'],
  reducerPath: 'personaGroupApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
