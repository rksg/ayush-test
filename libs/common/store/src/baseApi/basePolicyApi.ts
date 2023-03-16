import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const basePolicyApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'policyApi',
  tagTypes: [
    'Policy',
    'MacRegistrationPool',
    'MacRegistration',
    'ClientIsolation',
    'Syslog',
    'SnmpAgent',
    'VLANPool',
    'AAA',
    'AccessControl',
    'RadiusAttributeGroup',
    'RadiusAttribute'
  ],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
