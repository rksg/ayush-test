import { createApi, fetchBaseQuery } from './baseQuery'

export const baseMsgTemplateApi = createApi({
  baseQuery: fetchBaseQuery(),
  tagTypes: ['MsgCategory', 'TemplateGroup', 'TemplateScope', 'Template', 'TemplateRegistration'],
  reducerPath: 'msgTemplateApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})
