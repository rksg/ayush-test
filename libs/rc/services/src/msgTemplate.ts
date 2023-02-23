import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  MsgTemplateUrls,
  createHttpRequest,
  TemplateScope,
//   TableResult,
  RequestPayload,
  Pageable,
  Template,
//   Persona,
//   PersonaDevice,
//   NewTableResult,
//   transferToTableResult,
//   createNewTableHttpRequest,
//   TableChangePayload
} from '@acx-ui/rc/utils'

export const baseMsgTemplateApi = createApi({
  baseQuery: fetchBaseQuery(),
  tagTypes: ['TemplateScope', 'Template'],
  reducerPath: 'msgTemplateApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const msgTemplateApi = baseMsgTemplateApi.injectEndpoints({
  endpoints: build => ({

    // Template Scope /////////////////////////////////////
    getTemplateScopeById: build.query<TemplateScope, RequestPayload>({
        query: ({ params }) => {
        const req = createHttpRequest(MsgTemplateUrls.getTemplateScopeById, params)
            return {
                ...req
            }
        },
        providesTags: (result, error, arg) => [{ type: 'TemplateScope', id: (arg.templateScopeId as string) }]
    }),

    // Templates ///////////////////////////////////////////
    getAllTemplatesByTemplateScopeId: build.query<Pageable<Template>, RequestPayload>({
      query: ({ params }) => {
      const req = createHttpRequest(MsgTemplateUrls.getAllTemplatesByTemplateScopeId, params)
          return {
              ...req
          }
      },
      providesTags: (result) => result && result.content ? [...result.content.map(({id}) => ({type: 'Template' as const, id})), { type: 'Template', id: 'LIST'}] : [{ type: 'Template', id: 'LIST' }]
      
      
  }),
  })
})

export const {
  useGetTemplateScopeByIdQuery,
  useGetAllTemplatesByTemplateScopeIdQuery
} = msgTemplateApi