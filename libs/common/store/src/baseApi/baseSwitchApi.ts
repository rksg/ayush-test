import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseSwitchApi = createApi({
  baseQuery: fetchBaseQuery(),
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
