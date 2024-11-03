import {
  CommonResult,
  onActivityMessageReceived,
  onSocketActivityChanged,
  TableResult,
  EthernetPortProfileUrls,
  EthernetPortProfileViewData,
  EthernetPortProfile,
  EhternetPortSettings,
  ApiVersionEnum,
  GetApiVersionHeader
} from '@acx-ui/rc/utils'
import { baseEthernetPortProfileApi } from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { createHttpRequest }          from '@acx-ui/utils'
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import { fetch } from 'msw/lib/types/context'

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
    // getEthernetPortProfileWithRelationsById: build.query<EthernetPortProfile, RequestPayload>({
    //   async queryFn: ({ params }, _queryApi, _extraOptions, fetchWithBQ) {
    //     if (!params?.id) return Promise.resolve({ data: null } as QueryReturnValue<
    //       null,
    //       FetchBaseQueryError,
    //       FetchBaseQueryMeta
    //     >)

    //     const ethernetPortProfileQuery = await fetchWithBQ(
    //       createHttpRequest(
    //         EthernetPortProfileUrls.getEthernetPortProfileViewDataList, params)
    //     )

    //     const ethernetPortProfile = await fetchWithBQ(
    //       createHttpRequest(EthernetPortProfileUrls.getEthernetPortProfile, params)
    //     )

    //     return 
    //   },
    //   providesTags: [{ type: 'EthernetPortProfile', id: 'DETAIL' }]
    // }),
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

    // eslint-disable-next-line max-len
    getEthernetPortProfileSettingsByVenueApModel: build.query<EhternetPortSettings, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          EthernetPortProfileUrls.getEthernetPortSettingsByVenueApModel, params, customHeaders)
        return {
          ...req
        }
      }
    }),

    updateEthernetPortSettingsByVenueApModel:
      build.mutation<EhternetPortSettings, RequestPayload>({
        query: ({ params, payload }) => {
          const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
          const req = createHttpRequest(
            EthernetPortProfileUrls.updateEthernetPortSettingsByVenueApModel, params,
            customHeaders)
          return {
            ...req,
            body: JSON.stringify(payload)
          }
        }
      }),

    activateEthernetPortProfileOnVenueApModelPortId: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          EthernetPortProfileUrls.activateEthernetPortProfileOnVenueApModelPortId,
          params,
          customHeaders
        )
        return {
          ...req
        }
      }
    }),
    getEthernetPortProfileSettingsByApPortId: build.query<EhternetPortSettings, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          EthernetPortProfileUrls.getEthernetPortSettingsByApPortId, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    updateEthernetPortProfileSettingsByApPortId:
      build.mutation<CommonResult, RequestPayload>({
        query: ({ params, payload }) => {
          const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
          const req = createHttpRequest(
            EthernetPortProfileUrls.updateEthernetPortProfileSettingsByApPortId, params,
            customHeaders)
          return {
            ...req,
            body: JSON.stringify(payload)
          }
        }
      }),
    activateEthernetPortProfileOnApPortId: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          EthernetPortProfileUrls.activateEthernetPortProfileOnApPortId, params, customHeaders
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
  useGetEthernetPortProfileSettingsByVenueApModelQuery,
  useUpdateEthernetPortSettingsByVenueApModelMutation,
  useActivateEthernetPortProfileOnVenueApModelPortIdMutation,
  useGetEthernetPortProfileSettingsByApPortIdQuery,
  useUpdateEthernetPortProfileSettingsByApPortIdMutation,
  useActivateEthernetPortProfileOnApPortIdMutation
} = ethernetPortProfileApi