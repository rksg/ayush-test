import {
  MsgTemplateUrls,
  TemplateScope,
  Pageable,
  Template,
  Registration,
  MsgCategory,
  TemplateGroup
} from '@acx-ui/rc/utils'
import { baseMsgTemplateApi }                  from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { TableResult,createHttpRequest, ignoreErrorModal,
  transferToNewTablePaginationParams,
  NewAPITableResult,
  TableChangePayload,
  transferNewResToTableResult } from '@acx-ui/utils'


export const msgTemplateApi = baseMsgTemplateApi.injectEndpoints({
  endpoints: build => ({

    // Categories /////////////////////////////////////
    getCategory: build.query<MsgCategory, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MsgTemplateUrls.getCategoryById, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: (result, error, arg) =>
        [{ type: 'MsgCategory', id: (arg.params?.categoryId as string) }]
    }),

    // Template Groups /////////////////////////////////////
    getAllTemplateGroupsByCategoryId: build.query<TableResult<TemplateGroup>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MsgTemplateUrls.getAllTemplateGroupsByCategoryId, params)
        return {
          ...req,
          body: {
            ...(payload as TableChangePayload),
            ...transferToNewTablePaginationParams(payload as TableChangePayload)
          }
        }
      },
      transformResponse (result: NewAPITableResult<TemplateGroup>) {
        return transferNewResToTableResult<TemplateGroup>(result, { pageStartZero: true })
      },
      providesTags: (result, error, arg) => result && result.data ?
        [...result.data.map(({ id }) => ({ type: 'TemplateGroup' as const, id })),
          { type: 'TemplateGroup', id: 'LIST' + arg.params?.categoryId }] :
        [{ type: 'TemplateGroup', id: 'LIST' + arg.params?.categoryId }]
    }),

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
        const req = createHttpRequest(MsgTemplateUrls.getRegistrationById, params, {
          ...ignoreErrorModal
        })
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
    }),
    getTemplateById: build.query<Template, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MsgTemplateUrls.getTemplate, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: (result, error, arg) =>
        [{ type: 'Template', id: (arg.params?.templateId as string) }]
    })
  })
})

export const {
  useGetCategoryQuery,
  useGetAllTemplateGroupsByCategoryIdQuery,
  useGetTemplateScopeWithRegistrationQuery,
  usePutRegistrationByIdMutation,
  useGetRegistrationByIdQuery,
  useGetAllTemplatesByTemplateScopeIdQuery,
  useGetTemplateByIdQuery
} = msgTemplateApi