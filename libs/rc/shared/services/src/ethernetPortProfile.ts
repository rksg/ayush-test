import { QueryReturnValue, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import {
  CommonResult,
  onActivityMessageReceived,
  onSocketActivityChanged,
  TableResult,
  EthernetPortProfileUrls,
  EthernetPortProfileViewData,
  EthernetPortProfile,
  ApiVersionEnum,
  GetApiVersionHeader,
  CapabilitiesApModel,
  ApLanPortTypeEnum,
  EthernetPortType,
  EthernetPortAuthType,
  APLanPortSettings,
  VenueLanPortSettings,
  LanPortsUrls
} from '@acx-ui/rc/utils'
import { baseEthernetPortProfileApi } from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { createHttpRequest }          from '@acx-ui/utils'


export const createDefaultEthPort = (
  tenantId: string,
  type: EthernetPortType,
  isTemplate: boolean = false
) => {
  const name = (type === EthernetPortType.ACCESS)
    ? 'Default Access Port'
    : 'Default Trunk Port (WAN)'

  return {
    apSerialNumbers: [] as string[],
    authType: EthernetPortAuthType.DISABLED,
    id: `${tenantId}_${type}${isTemplate? '_template': ''}`,
    isDefault: true,
    name,
    type,
    untagId: 1,
    vlanMembers: (type === EthernetPortType.ACCESS) ? '1' : '1-4094'
  } as EthernetPortProfileViewData

}

export const ethernetPortProfileApi = baseEthernetPortProfileApi.injectEndpoints({
  endpoints: (build) => ({
    createEthernetPortProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(EthernetPortProfileUrls.createEthernetPortProfile)
        return {
          ...req,
          body: JSON.stringify(payload)
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
          body: JSON.stringify(payload)
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
    getEthernetPortProfilesWithOverwrites:
    build.query<TableResult<EthernetPortProfileViewData>, RequestPayload>({
      async queryFn (
        { payload, params, selectedModelCaps }, _queryApi, _extraOptions, fetchWithBQ) {
        const tenantId = params?.tenantId ?? ''
        const viewDataReq = createHttpRequest(
          EthernetPortProfileUrls.getEthernetPortProfileViewDataList, params)
        const ethListQuery = await fetchWithBQ({ ...viewDataReq, body: JSON.stringify(payload) })
        let ethList = ethListQuery.data as TableResult<EthernetPortProfileViewData>

        // Do a workaround to avoid the default ethPort data doesn't be added (data migrate not completed)
        const ethListData = ethList.data
        const predefinedEthPortData = [] as EthernetPortProfileViewData[]
        if (!ethListData.find(d => d?.isDefault && d?.id.includes('_ACCESS'))) {
          predefinedEthPortData.push(createDefaultEthPort(tenantId, EthernetPortType.ACCESS))
        }
        if (!ethListData.find(d => d?.isDefault && d?.id.includes('_TRUNK'))) {
          predefinedEthPortData.push(createDefaultEthPort(tenantId, EthernetPortType.TRUNK))
        }

        ethList.data = [
          ...predefinedEthPortData,
          ...ethList.data
        ]

        if (ethList.data && params?.serialNumber) {
          let bindingPortIds = []
          let apEthPortProfiles = ethList.data?.filter(
            m => m.apSerialNumbers && m.apSerialNumbers.includes(params.serialNumber!)
          ) ?? [] as EthernetPortProfileViewData[]
          const getApPortOverwrite = async (portId:number) => {
            const apPortOverwriteReq = createHttpRequest(
              LanPortsUrls.getApLanPortSettings,
              { venueId: params?.venueId,
                serialNumber: params?.serialNumber,
                portId: portId.toString()
              })
            const apEthPortOverwrites = await fetchWithBQ(apPortOverwriteReq)
            return { ...(apEthPortOverwrites.data as APLanPortSettings),
              portId: portId }
          }

          // ap level binding
          for (let eth of apEthPortProfiles) {
            eth.apPortOverwrites = []
            let apActivations = eth.apActivations?.filter(
              a => a.apSerialNumber === params.serialNumber) ?? []
            for (let apActivation of apActivations) {
              bindingPortIds.push(apActivation.portId?.toString())
              const portOverwrite = await getApPortOverwrite(apActivation.portId!)
              eth.apPortOverwrites?.push(portOverwrite)
            }
          }

          // default capability binding
          for (let lanPort of (selectedModelCaps as CapabilitiesApModel)?.lanPorts ) {
            if (!bindingPortIds.includes(lanPort.id)) {
              const portOverwrite = await getApPortOverwrite(parseInt(lanPort.id, 10))
              const defaultType = lanPort?.defaultType
              let ethProfileId = ''
              switch (defaultType){
                case ApLanPortTypeEnum.ACCESS:
                  ethProfileId = tenantId + '_' + ApLanPortTypeEnum.ACCESS.toString()
                  break
                case ApLanPortTypeEnum.TRUNK:
                  ethProfileId = tenantId + '_' + ApLanPortTypeEnum.TRUNK.toString()
                  break
              }
              let ethProfile = ethList.data?.filter(e => e.id === ethProfileId)?.[0]
              if (ethProfile) {
                if (!ethProfile?.apPortOverwrites) {
                  ethProfile.apPortOverwrites = []
                }
                ethProfile.apPortOverwrites.push(portOverwrite)
              }
            }
          }
        }

        return ethList.data
          ? { data: ethList }
          : { error: ethListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'EthernetPortProfile', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddEthernetPortProfile',
            'DeleteEthernetPortProfile',
            'UpdateApLanPortOverwriteSettings'
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
    getEthernetPortProfileWithRelationsById:
    build.query<EthernetPortProfile | null, RequestPayload>({
      async queryFn ({ payload, params }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.id) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)

        const viewDataReq = createHttpRequest(
          EthernetPortProfileUrls.getEthernetPortProfileViewDataList, params)
        const ethListQuery = await fetchWithBQ({ ...viewDataReq, body: JSON.stringify(payload) })
        let ethList = ethListQuery.data as TableResult<EthernetPortProfileViewData>

        const ethernetPortProfile = await fetchWithBQ(
          createHttpRequest(EthernetPortProfileUrls.getEthernetPortProfile, params)
        )
        const ethernetPortProfileData = ethernetPortProfile.data as EthernetPortProfile

        if (ethernetPortProfileData && ethList.data) {
          ethernetPortProfileData.authRadiusId = ethList.data?.[0]?.authRadiusId
          ethernetPortProfileData.accountingRadiusId = ethList.data?.[0]?.accountingRadiusId
          ethernetPortProfileData.apSerialNumbers = ethList.data?.[0]?.apSerialNumbers
          ethernetPortProfileData.venueActivations = ethList.data?.[0]?.venueActivations
        }

        return ethernetPortProfileData
          ? { data: ethernetPortProfileData }
          : { error: ethernetPortProfile.error } as QueryReturnValue<
          EthernetPortProfile, FetchBaseQueryError, FetchBaseQueryMeta | undefined>
      },
      providesTags: [{ type: 'EthernetPortProfile', id: 'DETAIL' }]
    }),
    updateEthernetPortProfile: build.mutation<EthernetPortProfile, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(EthernetPortProfileUrls.updateEthernetPortProfile, params)
        return {
          ...req,
          body: JSON.stringify(payload)
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
          body: JSON.stringify(payload)
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
    getEthernetPortProfileSettingsByVenueApModel: build.query<VenueLanPortSettings, RequestPayload>({
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
      build.mutation<VenueLanPortSettings, RequestPayload>({
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
    updateEthernetPortProfileOverwritesByApPortId:
      build.mutation<CommonResult, RequestPayload>({
        query: ({ params, payload }) => {
          const req = createHttpRequest(
            EthernetPortProfileUrls.updateEthernetPortProfileOverwritesByApPortId, params)
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
  useGetEthernetPortProfilesWithOverwritesQuery,
  useDeleteEthernetPortProfileMutation,
  useGetEthernetPortProfileByIdQuery,
  useGetEthernetPortProfileWithRelationsByIdQuery,
  useUpdateEthernetPortProfileMutation,
  useUpdateEthernetPortProfileRadiusIdMutation,
  useDeleteEthernetPortProfileRadiusIdMutation,
  useGetEthernetPortProfileSettingsByVenueApModelQuery,
  useUpdateEthernetPortSettingsByVenueApModelMutation,
  useActivateEthernetPortProfileOnVenueApModelPortIdMutation,
  useUpdateEthernetPortProfileOverwritesByApPortIdMutation,
  useActivateEthernetPortProfileOnApPortIdMutation
} = ethernetPortProfileApi