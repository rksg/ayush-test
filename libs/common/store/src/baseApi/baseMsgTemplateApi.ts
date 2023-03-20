import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseMsgTemplateApi = createApi({
  baseQuery: fetchBaseQuery(),
  tagTypes: ['TemplateSelection', 'TemplateScope', 'Template', 'TemplateRegistration'],
  reducerPath: 'msgTemplateApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})