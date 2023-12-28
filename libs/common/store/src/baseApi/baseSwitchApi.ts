import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseSwitchApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'switchApi',
  tagTypes: ['Switch',
    'SwitchBackup',
    'SwitchClient',
    'SwitchPort',
    'SwitchProfiles',
    'SwitchOnDemandCli',
    'SwitchVlan'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
