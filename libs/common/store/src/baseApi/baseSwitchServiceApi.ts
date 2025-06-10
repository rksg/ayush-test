import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseSwitchServiceApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'baseSwitchServiceApi',
  tagTypes: ['Switch',
    'SwitchBackup',
    'SwitchClient',
    'SwitchPort',
    'SwitchProfiles',
    'SwitchFlexAuth',
    'SwitchOnDemandCli',
    'SwitchVlan',
    'FlexAuthProfile',
    'SwitchPortProfile',
    'SwitchMacAcl'
  ],
  keepUnusedDataFor: 0,
  endpoints: () => ({})
})
