import {
  CommonResult,
  onActivityMessageReceived,
  onSocketActivityChanged,
  TableResult,
  EthernetPortProfileUrls,
  EthernetPortProfileViewData,
  EthernetPortProfile,
  EhternetPortSettings
} from '@acx-ui/rc/utils'
import { baseEthernetPortProfileApi } from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { createHttpRequest }          from '@acx-ui/utils'

export const ethernetPortProfileApi = baseEthernetPortProfileApi.injectEndpoints({
  endpoints: (build) => ({
    createEthernetPortProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EthernetPortProfileUrls.createEthernetPortProfile)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EthernetPortProfile', id: 'LIST' }]
    }),
    getEthernetPortProfileViewDataList:
    build.query<TableResult<EthernetPortProfileViewData>, RequestPayload>
    ({
      query: ({ payload, params }) => {
        const req = createHttpRequest(
          EthernetPortProfileUrls.getEthernetPortProfileViewDataList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'EthernetPortProfile', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddEthernetPortProfile',
            'DeleteEthernetPortProfile'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(
              ethernetPortProfileApi.util.invalidateTags([
                { type: 'EthernetPortProfile', id: 'LIST' }
              ])
            )
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    deleteEthernetPortProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EthernetPortProfileUrls.deleteEthernetPortProfile, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EthernetPortProfile', id: 'LIST' }]
    }),
    getEthernetPortProfileById: build.query<EthernetPortProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EthernetPortProfileUrls.getEthernetPortProfile, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EthernetPortProfile', id: 'DETAIL' }]
    }),
    updateEthernetPortProfile: build.mutation<EthernetPortProfile, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EthernetPortProfileUrls.updateEthernetPortProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EthernetPortProfile', id: 'LIST' }]
    }),
    updateEthernetPortProfileRadiusId: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          EthernetPortProfileUrls.updateEthernetPortProfileRadiusId, params
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EthernetPortProfile', id: 'LIST' }]
    }),
    deleteEthernetPortProfileRadiusId: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          EthernetPortProfileUrls.deleteEthernetPortProfileRadiusId, params
        )
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EthernetPortProfile', id: 'LIST' }]
    }),
    getEthernetPortProfileSettingsByApPortId: build.query<EhternetPortSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(EthernetPortProfileUrls.getEthernetPortSettingsByApPortId, params)
        return {
          ...req
        }
      }
    }),
    updateEthernetPortProfileSettingsByApPortId: build.mutation<EhternetPortSettings, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          EthernetPortProfileUrls.updateEthernetPortProfileSettingsByApPortId, params
        )
        return {
          ...req,
          body: payload
        }
      }
    }),
    activateEthernetPortProfileOnApPortId: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          EthernetPortProfileUrls.activateEthernetPortProfileOnApPortId, params
        )
        return {
          ...req
        }
      }
    })
  })
})

export const {
  useCreateEthernetPortProfileMutation,
  useGetEthernetPortProfileViewDataListQuery,
  useLazyGetEthernetPortProfileViewDataListQuery,
  useDeleteEthernetPortProfileMutation,
  useGetEthernetPortProfileByIdQuery,
  useUpdateEthernetPortProfileMutation,
  useUpdateEthernetPortProfileRadiusIdMutation,
  useDeleteEthernetPortProfileRadiusIdMutation,
  useGetEthernetPortProfileSettingsByApPortIdQuery,
  useUpdateEthernetPortProfileSettingsByApPortIdMutation,
  useActivateEthernetPortProfileOnApPortIdMutation
} = ethernetPortProfileApi