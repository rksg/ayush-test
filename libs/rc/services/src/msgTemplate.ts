import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  MsgTemplateUrls,
  createHttpRequest,
  TemplateScope,
  RequestPayload,
  Pageable,
  Template,
  Registration
} from '@acx-ui/rc/utils'

import { baseMsgTemplateApi } from '@acx-ui/store'

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
      providesTags: (result, error, arg) =>
        [{ type: 'TemplateScope', id: (arg.templateScopeId as string) }]
    }),

    // Templates ///////////////////////////////////////////
    getAllTemplatesByTemplateScopeId: build.query<Pageable<Template>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MsgTemplateUrls.getAllTemplatesByTemplateScopeId, params)
        return {
          ...req
        }
      },
      providesTags: (result, error, arg) => result && result.content ?
        [...result.content.map(({ id }) => ({ type: 'Template' as const, id })),
          { type: 'Template', id: 'LIST' + arg.templateScopeId }] :
        [{ type: 'Template', id: 'LIST' + arg.templateScopeId }]
    }),

    // Registrations ///////////////////////////////////////
    getRegistrationById: build.query<Registration, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MsgTemplateUrls.getRegistrationById, params)
        return {
          ...req
        }
      },
      providesTags: (result, error, arg) =>
        [{ type: 'TemplateRegistration', id: (arg.registrationId as string) }]
    }),
    putRegistrationById: build.mutation<Registration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MsgTemplateUrls.putRegistrationById, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: (result, error, arg) =>
        [{ type: 'TemplateRegistration', id: (arg.registrationId as string) }]
    })
  })
})

export const {
  useGetTemplateScopeByIdQuery,
  useGetAllTemplatesByTemplateScopeIdQuery,
  useGetRegistrationByIdQuery,
  usePutRegistrationByIdMutation
} = msgTemplateApi