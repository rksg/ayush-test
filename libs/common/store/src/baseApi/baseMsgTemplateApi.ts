import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseMsgTemplateApi = createApi({
  baseQuery: fetchBaseQuery(),
  tagTypes: ['TemplateScope', 'Template', 'TemplateRegistration'],
  reducerPath: 'msgTemplateApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})