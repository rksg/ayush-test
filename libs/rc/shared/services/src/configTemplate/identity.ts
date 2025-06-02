import {
  CommonResult,
  IdentityTemplateUrlsInfo,
  PersonaGroup,
  NewTableResult
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'


export const identityConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    addIdentityGroupTemplate: build.mutation<PersonaGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(IdentityTemplateUrlsInfo.addIdentityGroupTemplate, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'IdentityGroupTemplate', id: 'LIST' }]
    }),
    getIdentityGroupTemplateById: build.query<PersonaGroup, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(IdentityTemplateUrlsInfo.getIdentityGroupTemplate, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'IdentityGroupTemplate', id: 'ID' }]
    }),
    queryIdentityGroupTemplates: build.query<NewTableResult<PersonaGroup>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(IdentityTemplateUrlsInfo.queryIdentityGroupTemplates, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'IdentityGroupTemplate', id: 'LIST' }]
    }),
    updateIdentityGroupTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(IdentityTemplateUrlsInfo.updateIdentityGroupTemplate, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'IdentityGroupTemplate' }]
    }),
    deleteIdentityGroupTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(IdentityTemplateUrlsInfo.deleteIdentityGroupTemplate, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'IdentityGroupTemplate' }]
    })
  })
})

export const {
  useAddIdentityGroupTemplateMutation,
  useGetIdentityGroupTemplateByIdQuery,
  useQueryIdentityGroupTemplatesQuery,
  useUpdateIdentityGroupTemplateMutation,
  useDeleteIdentityGroupTemplateMutation
} = identityConfigTemplateApi
