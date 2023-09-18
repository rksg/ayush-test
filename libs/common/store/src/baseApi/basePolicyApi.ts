import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const basePolicyApi = createApi({
  baseQuery: baseQuery,
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
    'RogueAp',
    'RadiusAttributeGroup',
    'RadiusAttribute',
    'AdaptivePolicy',
    'AdaptivePolicySet',
    'AdaptivePrioritizedPolicy',
    'AdaptivePolicyCondition'
  ],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
