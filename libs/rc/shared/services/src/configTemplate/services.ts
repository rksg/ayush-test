import { Params } from 'react-router-dom'

import {
  CommonResult, DpskMutationResult, DpskSaveData,
  ServicesConfigTemplateUrlsInfo, TableResult, onActivityMessageReceived,
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { ApiInfo }               from '@acx-ui/utils'

import { createDpskHttpRequest } from '../service'

export const servicesConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    getDpskTemplate: build.query<DpskSaveData, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const getDpskReq = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.getDpsk, params)
        return {
          ...getDpskReq,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'DpskTemplate', id: 'DETAIL' }]
    }),
    createDpskTemplate: build.mutation<DpskMutationResult, RequestPayload<DpskSaveData>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const createDpskReq = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.addDpsk, params)
        return {
          ...createDpskReq,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DpskTemplate', id: 'LIST' }]
    }),
    updateDpskTemplate: build.mutation<DpskMutationResult, RequestPayload<DpskSaveData>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const updateDpskReq = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.updateDpsk, params)
        return {
          ...updateDpskReq,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DpskTemplate', id: 'LIST' }]
    }),
    deleteDpskTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.deleteDpsk, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DpskTemplate', id: 'LIST' }]
    }),
    getEnhancedDpskTemplateList: build.query<TableResult<DpskSaveData>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const getDpskListReq = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.getEnhancedDpskList, params)
        const defaultPayload = {
          page: 1,
          pageSize: 10,
          sortField: 'name',
          sortOrder: 'ASC'
        }
        return {
          ...getDpskListReq,
          body: JSON.stringify(payload ?? defaultPayload)
        }
      },
      providesTags: [{ type: 'DpskTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'CREATE_POOL_TEMPLATE_RECORD',
            'UPDATE_POOL_TEMPLATE_RECORD',
            'DELETE_POOL_TEMPLATE_RECORD'
          ], () => {
            api.dispatch(servicesConfigTemplateApi.util.invalidateTags([
              { type: 'ConfigTemplate', id: 'LIST' }, { type: 'DpskTemplate', id: 'LIST' }
            ]))
          })
        })
      }
    })
  })
})

export const {
  useGetDpskTemplateQuery,
  useCreateDpskTemplateMutation,
  useUpdateDpskTemplateMutation,
  useGetEnhancedDpskTemplateListQuery,
  useLazyGetEnhancedDpskTemplateListQuery,
  useDeleteDpskTemplateMutation
} = servicesConfigTemplateApi


const dpskTemplateHeaders = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}
function createDpskTemplateHttpRequest (apiInfo: ApiInfo, params?: Params<string>) {
  return createDpskHttpRequest(apiInfo, params, dpskTemplateHeaders)
}
