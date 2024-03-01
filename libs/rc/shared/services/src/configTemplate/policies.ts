import {
  CommonResult,
  onActivityMessageReceived,
  onSocketActivityChanged,
  l2AclPolicyInfoType,
  AccessControlInfoType,
  l3AclPolicyInfoType,
  devicePolicyInfoType,
  appPolicyInfoType,
  DevicePolicy,
  PoliciesConfigTemplateUrlsInfo,
  L2AclPolicy,
  L3AclPolicy,
  ApplicationPolicy
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'

import { commonQueryFn, configTemplateApi } from './common'

const L2AclTemplateUseCases = [
  'AddL2AclPolicyTemplate',
  'UpdateL2AclPolicyTemplate',
  'DeleteL2AclPolicyTemplate'
]

const L3AclTemplateUseCases = [
  'AddL3AclPolicyTemplate',
  'UpdateL3AclPolicyTemplate',
  'DeleteL3AclPolicyTemplate'
]

const DeviceTemplateUseCases = [
  'AddDevicePolicyTemplate',
  'UpdateDevicePolicyTemplate',
  'DeleteDevicePolicyTemplate'
]

const ApplicationTemplateUseCases = [
  'AddApplicationPolicyTemplate',
  'UpdateApplicationPolicyTemplate',
  'DeleteApplicationPolicyTemplate'
]

const AccessControlTemplateUseCases = [
  'AddAccessControlProfileTemplate',
  'UpdateAccessControlProfileTemplate',
  'DeleteAccessControlProfileTemplate'
]

export const policiesConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    addL2AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addL2AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getL2AclPolicyTemplate: build.query<l2AclPolicyInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getL2AclPolicy),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, L2AclTemplateUseCases, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getL2AclPolicyTemplateList: build.query<L2AclPolicy[], RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getL2AclPolicyList),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            onActivityMessageReceived(msg, L2AclTemplateUseCases,() => {
              // eslint-disable-next-line max-len
              api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'AccessControlTemplate', id: 'LIST' }]))
            }, params.requestId as string)
          }
        })
      }
    }),
    updateL2AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateL2AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delL2AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.delL2AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    addL3AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addL3AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getL3AclPolicyTemplate: build.query<l3AclPolicyInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getL3AclPolicy),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, L3AclTemplateUseCases, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getL3AclPolicyTemplateList: build.query<L3AclPolicy[], RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getL3AclPolicyList),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            onActivityMessageReceived(msg, L3AclTemplateUseCases,() => {
              // eslint-disable-next-line max-len
              api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'AccessControlTemplate', id: 'LIST' }]))
            }, params.requestId as string)
          }
        })
      }
    }),
    updateL3AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateL3AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delL3AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.delL3AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    addAccessControlProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addAccessControlProfile),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getAccessControlProfileTemplate: build.query<AccessControlInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getAccessControlProfile),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }]
    }),
    getAccessControlProfileTemplateList: build.query<AccessControlInfoType[], RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getAccessControlProfileList),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            ...AccessControlTemplateUseCases,
            ...L2AclTemplateUseCases,
            ...L3AclTemplateUseCases,
            ...DeviceTemplateUseCases,
            ...ApplicationTemplateUseCases
          ], () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateAccessControlProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateAccessControlProfile),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    deleteAccessControlProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.deleteAccessControlProfile),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    addDevicePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addDevicePolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getDevicePolicyTemplate: build.query<devicePolicyInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getDevicePolicy),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, DeviceTemplateUseCases, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getDevicePolicyTemplateList: build.query<DevicePolicy[], RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getDevicePolicyList),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          onActivityMessageReceived(msg, DeviceTemplateUseCases, () => {
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'LIST' }
            ]))
          }, params.requestId as string)
        })
      }
    }),
    updateDevicePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateDevicePolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delDevicePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.delDevicePolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    addAppPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addAppPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getAppPolicyTemplate: build.query<appPolicyInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getAppPolicy),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ApplicationTemplateUseCases, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getAppPolicyTemplateList: build.query<ApplicationPolicy[], RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getAppPolicyList),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            onActivityMessageReceived(msg, ApplicationTemplateUseCases,() => {
              // eslint-disable-next-line max-len
              api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'AccessControlTemplate', id: 'LIST' }]))
            }, params.requestId as string)
          }
        })
      }
    }),
    updateAppPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateAppAclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delAppPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.delAppAclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    })
  })
})

export const {
  useAddL2AclPolicyTemplateMutation,
  useGetL2AclPolicyTemplateQuery,
  useGetL2AclPolicyTemplateListQuery,
  useUpdateL2AclPolicyTemplateMutation,
  useDelL2AclPolicyTemplateMutation,
  useAddL3AclPolicyTemplateMutation,
  useGetL3AclPolicyTemplateQuery,
  useGetL3AclPolicyTemplateListQuery,
  useDelL3AclPolicyTemplateMutation,
  useUpdateL3AclPolicyTemplateMutation,
  useAddAccessControlProfileTemplateMutation,
  useUpdateAccessControlProfileTemplateMutation,
  useDeleteAccessControlProfileTemplateMutation,
  useGetAccessControlProfileTemplateQuery,
  useGetAccessControlProfileTemplateListQuery,
  useAddDevicePolicyTemplateMutation,
  useGetDevicePolicyTemplateQuery,
  useGetDevicePolicyTemplateListQuery,
  useDelDevicePolicyTemplateMutation,
  useUpdateDevicePolicyTemplateMutation,
  useAddAppPolicyTemplateMutation,
  useGetAppPolicyTemplateQuery,
  useGetAppPolicyTemplateListQuery,
  useUpdateAppPolicyTemplateMutation,
  useDelAppPolicyTemplateMutation
} = policiesConfigTemplateApi
