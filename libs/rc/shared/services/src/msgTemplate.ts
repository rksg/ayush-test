import {
  MsgTemplateUrls,
  TemplateScope,
  Pageable,
  Template,
  Registration
} from '@acx-ui/rc/utils'
import { baseMsgTemplateApi } from '@acx-ui/store'
import { RequestPayload }     from '@acx-ui/types'
import { createHttpRequest }  from '@acx-ui/utils'


export const msgTemplateApi = baseMsgTemplateApi.injectEndpoints({
  endpoints: build => ({

    // Template Scopes /////////////////////////////////////
    getTemplateScopeWithRegistration: build.query<TemplateScope, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MsgTemplateUrls.getTemplateScopeByIdWithRegistration, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: (result, error, arg) => {
        let tagArray:Array<{ type:'TemplateScope' | 'TemplateRegistration', id:string }>
          = [{ type: 'TemplateScope', id: (arg.params?.templateScopeId as string) }]

        if(arg.params?.registrationId) {
          tagArray.push({ type: 'TemplateRegistration',
            id: (arg.params?.registrationId as string) })

        }
        return tagArray
      }

    }),

    // Registrations ///////////////////////////////////////
    putRegistrationById: build.mutation<Registration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MsgTemplateUrls.putRegistrationById, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: (result, error, arg) =>
        [{ type: 'TemplateRegistration', id: (arg.params?.registrationId as string) }]
    }),
    getRegistrationById: build.query<Registration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MsgTemplateUrls.getRegistrationById, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: (result, error, arg) =>
        [{ type: 'TemplateRegistration', id: (arg.params?.registrationId as string) }]
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
          { type: 'Template', id: 'LIST' + arg.params?.templateScopeId }] :
        [{ type: 'Template', id: 'LIST' + arg.params?.templateScopeId }]
    })
  })
})

export const {
  useGetTemplateScopeWithRegistrationQuery,
  usePutRegistrationByIdMutation,
  useGetRegistrationByIdQuery,
  useGetAllTemplatesByTemplateScopeIdQuery
} = msgTemplateApi