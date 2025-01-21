import { QueryReturnValue, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import _                                                                        from 'lodash'

import {
  CommonResult,
  CurrentVersions,
  PreDownload,
  TableResult,
  UpgradePreferences,
  FirmwareUrlsInfo,
  FirmwareVersion,
  FirmwareVenue,
  FirmwareSwitchVenue,
  ABFVersion,
  onSocketActivityChanged,
  onActivityMessageReceived,
  LatestEdgeFirmwareVersion,
  EdgeVenueFirmware,
  EdgeFirmwareVersion,
  SwitchFirmwareStatus,
  SwitchFirmware,
  ApModelFamily,
  FirmwareVenuePerApModel,
  ApModelFirmware,
  UpdateFirmwarePerApModelPayload,
  UpdateFirmwareSchedulePerApModelPayload,
  FirmwareRbacUrlsInfo,
  CurrentVersionsV1002,
  SwitchFirmwareVersion1002,
  FirmwareSwitchVenueV1002,
  SwitchFirmwareV1002,
  SwitchRbacUrlsInfo,
  SwitchRow,
  ApFirmwareBatchOperationType,
  ApFirmwareStartBatchOperationResult,
  FirmwareType,
  EdgeFirmwareBatchOperationType,
  EdgeFirmwareStartBatchOperationResult,
  StartEdgeFirmwareVenueUpdateNowPayload,
  UpdateEdgeFirmwareVenueSchedulePayload
} from '@acx-ui/rc/utils'
import { baseFirmwareApi }              from '@acx-ui/store'
import { MaybePromise, RequestPayload } from '@acx-ui/types'
import { CloudVersion }                 from '@acx-ui/user'
import { batchApi, createHttpRequest }  from '@acx-ui/utils'

const v1Header = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

const v1_1Header = {
  'Content-Type': 'application/vnd.ruckus.v1.1+json',
  'Accept': 'application/vnd.ruckus.v1.1+json'
}

export const firmwareApi = baseFirmwareApi.injectEndpoints({
  endpoints: (build) => ({
    getUpgradePreferences: build.query<UpgradePreferences, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getUpgradePreferences, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'PREFERENCES' }]
    }),
    getSwitchUpgradePreferences: build.query<UpgradePreferences, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getSwitchUpgradePreferences, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'SWITCH_PREFERENCES' }]
    }),
    updateUpgradePreferences: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateUpgradePreferences, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'PREFERENCES' }]
    }),
    updateSwitchUpgradePreferences: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateSwitchUpgradePreferences, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'SWITCH_PREFERENCES' }]
    }),
    getVenueVersionList: build.query<TableResult<FirmwareVenue>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const queryString = payload as { searchString: string, filters: { version: [], type: string[] } }
        const req = createHttpRequest(FirmwareUrlsInfo.getVenueVersionList, {
          ...params,
          version: queryString?.filters?.version ? queryString.filters.version.join(',') : '',
          // eslint-disable-next-line max-len
          type: queryString?.filters?.type ? queryString.filters.type.map(t => t.toLowerCase()).join(',') : '',
          search: queryString?.searchString ?? ''
        })
        return{
          ...req
        }
      },
      transformResponse (result: FirmwareVenue[] ) {
        return {
          data: result,
          page: 1,
          totalCount: result.length
        } as TableResult<FirmwareVenue>
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateNow', 'DowngradeVenueAbf'], () => {
            api.dispatch(firmwareApi.util.invalidateTags([
              { type: 'Firmware', id: 'LIST' }
            ]))
          })
        })
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getLatestFirmwareList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getLatestFirmwareList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    getAvailableFirmwareList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getAvailableFirmwareList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    getAvailableABFList: build.query<ABFVersion[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getAvailableABFList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'ABF', id: 'LIST' }]
    }),
    getApModelFamilies: build.query<ApModelFamily[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getApModelFamilies, params)
        return {
          ...req
        }
      }
    }),
    getFirmwareVersionIdList: build.query<string[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        // eslint-disable-next-line max-len
        const apiInfo = FirmwareUrlsInfo[enableRbac ? 'getDistinctFirmwareIdList' : 'getFirmwareVersionIdList']

        return createHttpRequest(apiInfo, params)
      },
      transformResponse: (response: string[] | { id: string }[], _meta, arg: RequestPayload) => {
        if (arg.enableRbac) {
          const res = response as { id: string }[]
          return res.map(r => r.id)
        }
        return response as string[]
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    skipVenueUpgradeSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.skipVenueUpgradeSchedules, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    updateVenueSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateVenueSchedules, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    updateNow: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateNow, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    updateDowngrade: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateDowngrade, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    skipSwitchUpgradeSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.skipSwitchUpgradeSchedules, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    batchSkipSwitchUpgradeSchedules: build.mutation<void, RequestPayload[]>({
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        return batchApi(
          FirmwareRbacUrlsInfo.skipSwitchUpgradeSchedules, requests, fetchWithBQ, v1Header
        )
      },
      invalidatesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    updateSwitchVenueSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateSwitchVenueSchedules, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    batchUpdateSwitchVenueSchedules: build.mutation<void, RequestPayload[]>({
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        return batchApi(
          FirmwareRbacUrlsInfo.updateSwitchVenueSchedules, requests, fetchWithBQ, v1Header
        )
      },
      invalidatesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    batchUpdateSwitchVenueSchedulesV1001: build.mutation<void, RequestPayload[]>({
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        return batchApi(
          FirmwareRbacUrlsInfo.updateSwitchVenueSchedules, requests, fetchWithBQ, v1_1Header
        )
      },
      invalidatesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitchLatestFirmwareList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? v1Header : {}
        const switchUrls = enableRbac ? FirmwareRbacUrlsInfo : FirmwareUrlsInfo
        const req = createHttpRequest(switchUrls.getSwitchLatestFirmwareList, params, headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitchLatestFirmwareListV1001: build.query<SwitchFirmwareVersion1002[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          FirmwareRbacUrlsInfo.getSwitchLatestFirmwareList, params, v1_1Header)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitchDefaultFirmwareList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? v1Header : {}
        const switchUrls = enableRbac ? FirmwareRbacUrlsInfo : FirmwareUrlsInfo
        const req = createHttpRequest(switchUrls.getSwitchDefaultFirmwareList, params, headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),

    getSwitchDefaultFirmwareListV1001: build.query<SwitchFirmwareVersion1002[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          FirmwareRbacUrlsInfo.getSwitchDefaultFirmwareList, params, v1_1Header)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitchFirmwareVersionIdList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getSwitchFirmwareVersionIdList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    getSwitchVenueVersionListV1001: build.query<TableResult<FirmwareSwitchVenueV1002>, RequestPayload>({
      query: ({ params, payload }) => {
        const headers = v1_1Header
        // eslint-disable-next-line max-len
        const queryString = payload as { searchString: string, filters: { filterModelVersion: string[] } }
        const request =
            createHttpRequest(FirmwareRbacUrlsInfo.getSwitchVenueVersionList, params, headers)

        let filterObject = {}
        const modelVersion = queryString?.filters?.filterModelVersion || []
        if (modelVersion.length > 0) {
          const [modelGroup, firmwareVersion] = modelVersion[0]?.split(',')
          filterObject = {
            firmwareVersion: firmwareVersion,
            modelGroup: modelGroup
          }
        }
        return {
          ...request,
          body: JSON.stringify({
            // eslint-disable-next-line max-len
            searchFilter: queryString?.searchString ?? '',
            ...filterObject
          })
        }
      },
      transformResponse (result: {
        upgradeVenueViewList?: FirmwareSwitchVenueV1002[]
      } | FirmwareSwitchVenueV1002[]) {
        const data = Array.isArray(result) ? result : result.upgradeVenueViewList ?? []
        const totalCount = data.length

        return {
          data,
          page: 1,
          totalCount
        } as TableResult<FirmwareSwitchVenueV1002>
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getSwitchVenueVersionList: build.query<TableResult<FirmwareSwitchVenue>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = v1Header
        // eslint-disable-next-line max-len
        const queryString = payload as { searchString: string, filters: { version: [], type: string[] } }
        let typeString = ''
        if (queryString?.filters?.type && queryString.filters.type.join(',') === 'Release') {
          typeString = 'RECOMMENDED'
        }
        // eslint-disable-next-line max-len
        if (queryString?.filters?.type && queryString.filters.type.join(',') === 'Beta') {
          typeString = 'BETA'
        }
        if (enableRbac) {
          const request =
            createHttpRequest(FirmwareRbacUrlsInfo.getSwitchVenueVersionList, params, headers)
          return {
            ...request,
            body: JSON.stringify({
              // eslint-disable-next-line max-len
              firmwareVersion: queryString?.filters?.version ? queryString.filters.version.join(',') : '',
              searchFilter: queryString?.searchString ?? ''
            })
          }
        } else {
          const request = createHttpRequest(FirmwareUrlsInfo.getSwitchVenueVersionList, params)
          return {
            ...request,
            body: {
              firmwareType: typeString,
              // eslint-disable-next-line max-len
              firmwareVersion: queryString?.filters?.version ? queryString.filters.version.join(',') : '',
              search: queryString?.searchString ?? '',
              updateAvailable: ''
            }
          }
        }
      },
      transformResponse (result: {
        upgradeVenueViewList?: FirmwareSwitchVenue[]
      } | FirmwareSwitchVenue[]) {
        const data = Array.isArray(result) ? result : result.upgradeVenueViewList ?? []
        const totalCount = data.length

        return {
          data,
          page: 1,
          totalCount
        } as TableResult<FirmwareSwitchVenue>
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getSwitchAvailableFirmwareList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? v1Header : {}
        const switchUrls = enableRbac ? FirmwareRbacUrlsInfo : FirmwareUrlsInfo
        const req = createHttpRequest(switchUrls.getSwitchAvailableFirmwareList, params, headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitchAvailableFirmwareListV1001: build.query<SwitchFirmwareVersion1002[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          FirmwareRbacUrlsInfo.getSwitchAvailableFirmwareList, params, v1_1Header)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitchCurrentVersions: build.query<CurrentVersions, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? v1Header : {}
        const switchUrls = enableRbac ? FirmwareRbacUrlsInfo : FirmwareUrlsInfo
        const req = createHttpRequest(switchUrls.getSwitchCurrentVersions, params, headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitchCurrentVersionsV1001: build.query<CurrentVersionsV1002, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          FirmwareRbacUrlsInfo.getSwitchCurrentVersions, params, v1_1Header)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitcDefaultVersions: build.query<CurrentVersions, RequestPayload>({
      query: ({ params, enableRbac, customHeaders }) => {
        const headers = enableRbac ? v1Header : {}
        const switchUrls = enableRbac ? FirmwareRbacUrlsInfo : FirmwareUrlsInfo
        const req = createHttpRequest(switchUrls.getSwitchCurrentVersions, params,
          customHeaders || headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),

    getSwitchFirmwareStatusList: build.query<TableResult<SwitchFirmwareStatus>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? v1Header : {}
        const switchUrls = enableRbac ? FirmwareRbacUrlsInfo : FirmwareUrlsInfo
        const req = createHttpRequest(switchUrls.getSwitchFirmwareStatusList, params, headers)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }],
      transformResponse (result: { upgradeStatusDetailsViewList: SwitchFirmwareStatus[] }) {
        return {
          data: result.upgradeStatusDetailsViewList || result
        } as unknown as TableResult<SwitchFirmwareStatus>
      }
    }),
    getSwitchFirmwareList: build.query<TableResult<SwitchFirmware>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? v1Header : {}
        const switchUrls = enableRbac ? FirmwareRbacUrlsInfo : FirmwareUrlsInfo
        const req = createHttpRequest(switchUrls.getSwitchFirmwareList, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }],
      transformResponse (result: { upgradeSwitchViewList: FirmwareSwitchVenue[] }) {
        return {
          data: result.upgradeSwitchViewList || result
        } as unknown as TableResult<SwitchFirmware>
      }
    }),
    getSwitchFirmwareListV1001: build.query<TableResult<SwitchFirmwareV1002>, RequestPayload>({
      query: ({ params, payload }) => {
        const headers = v1_1Header
        const req = createHttpRequest(FirmwareRbacUrlsInfo.getSwitchFirmwareList, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }],
      transformResponse (result: { upgradeSwitchViewList: FirmwareSwitchVenue[] }) {
        return {
          data: result.upgradeSwitchViewList || result
        } as unknown as TableResult<SwitchFirmwareV1002>
      }
    }),
    // eslint-disable-next-line max-len
    batchGetSwitchFirmwareListV1001: build.query<TableResult<SwitchFirmwareV1002>, RequestPayload[]>({
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        const promises = requests.map((arg) => {
          const req = createHttpRequest(FirmwareRbacUrlsInfo.getSwitchFirmwareList,
            arg.params, v1_1Header)
          return fetchWithBQ({
            ...req,
            body: JSON.stringify(arg.payload)
          })
        })
        return Promise.all(promises)
          .then((results) => {
            const error = results.find(i => i.error)
            if(error) {
              return { error }
            }
            return {
              data: { data: results.flatMap(result => { return result.data }) }
            }
          })
          .catch((error)=>{
            return error
          })
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitchFirmwarePredownload: build.query<PreDownload, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? v1_1Header : v1Header
        const switchUrls = enableRbac ? FirmwareRbacUrlsInfo : FirmwareUrlsInfo
        const req = createHttpRequest(switchUrls.getSwitchFirmwarePredownload, params, headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'PREDOWNLOAD' }]
    }),
    updateSwitchFirmwarePredownload: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? v1_1Header : v1Header
        const switchUrls = enableRbac ? FirmwareRbacUrlsInfo : FirmwareUrlsInfo
        const req = createHttpRequest(switchUrls.updateSwitchFirmwarePredownload, params, headers)
        return {
          ...req,
          body: payload
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'SwitchFirmware', id: 'LIST' }, { type: 'SwitchFirmware', id: 'PREDOWNLOAD' }]
    }),
    retryFirmwareUpdateV1001: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchRbacUrlsInfo.retryFirmwareUpdate, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getLatestEdgeFirmware: build.query<LatestEdgeFirmwareVersion[], RequestPayload>({
      query: () => {
        const req = createHttpRequest(FirmwareUrlsInfo.getLatestEdgeFirmware)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeFirmware', id: 'LATEST' }]
    }),
    getVenueEdgeFirmwareList: build.query<EdgeVenueFirmware[], RequestPayload>({
      query: ({ payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(FirmwareUrlsInfo.getVenueEdgeFirmwareList, undefined, v1Header)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'EdgeFirmware', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Update Edge Firmware Now',
            'Change Edge Upgrade Schedule',
            'Skip Edge Upgrade Schedule'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(firmwareApi.util.invalidateTags([{ type: 'EdgeFirmware', id: 'LIST' }]))
          })
        })
      }
    }),
    getAvailableEdgeFirmwareVersions: build.query<EdgeFirmwareVersion[], RequestPayload>({
      query: () => {
        const req = createHttpRequest(
          FirmwareUrlsInfo.getAvailableEdgeFirmwareVersions,
          undefined,
          v1Header
        )
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeFirmware', id: 'AVAILABLE_LIST' }]
    }),
    updateEdgeFirmwareNow: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateEdgeFirmware, params, v1Header)
        return {
          ...req,
          body: JSON.stringify({ ...(payload as Object), state: 'UPDATE_NOW' })
        }
      },
      invalidatesTags: [{ type: 'EdgeFirmware', id: 'LIST' }]
    }),
    getEdgeUpgradePreferences: build.query<UpgradePreferences, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getEdgeUpgradePreferences, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeFirmware', id: 'PREFERENCES' }]
    }),
    updateEdgeUpgradePreferences: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateEdgeUpgradePreferences, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeFirmware', id: 'PREFERENCES' }]
    }),
    skipEdgeUpgradeSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          FirmwareUrlsInfo.skipEdgeUpgradeSchedules,
          params,
          v1Header
        )
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeFirmware', id: 'LIST' }]
    }),
    updateEdgeVenueSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          FirmwareUrlsInfo.updateEdgeVenueSchedules,
          params,
          v1Header
        )
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EdgeFirmware', id: 'LIST' }]
    }),
    getScheduledFirmware: build.query<CloudVersion, RequestPayload>({
      query: ({ params, enableRbac }) => {
        if (enableRbac) {
          return {
            ...createHttpRequest(FirmwareUrlsInfo.getVenueApModelFirmwareList, params),
            body: JSON.stringify({
              fields: ['nextApFirmwareSchedules'],
              page: 1, pageSize: 10000
            })
          }
        } else {
          return createHttpRequest(FirmwareUrlsInfo.getScheduledFirmware, params)
        }
      },
      // eslint-disable-next-line max-len
      transformResponse: (response: CloudVersion | TableResult<FirmwareVenuePerApModel>, _meta, arg: RequestPayload) => {
        if (arg.enableRbac) {
          const res = response as TableResult<FirmwareVenuePerApModel>
          const result = res.data.flatMap(fw => {
            return fw.nextApFirmwareSchedules?.map(nextFw =>
              nextFw.versionInfo?.type === FirmwareType.AP_FIRMWARE_UPGRADE &&
              nextFw.versionInfo.version)
          })

          return {
            scheduleVersionList: _.uniq(_.compact(result))
          }
        }
        return response as CloudVersion
      }
    }),
    // eslint-disable-next-line max-len
    getVenueApModelFirmwareList: build.query<TableResult<FirmwareVenuePerApModel>, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getVenueApModelFirmwareList)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          // eslint-disable-next-line max-len
          onActivityMessageReceived(msg, ['UpdateNowByApModel', 'ChangeUpgradeScheduleByApMode', 'SkipUpgradeSchedule'], () => {
            api.dispatch(firmwareApi.util.invalidateTags([
              { type: 'Firmware', id: 'LIST' }
            ]))
          })
        })
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getVenueApModelFirmwareSchedulesList: build.query<FirmwareVenuePerApModel[], RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getVenueApModelFirmwareSchedulesList)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          // eslint-disable-next-line max-len
          onActivityMessageReceived(msg, ['UpdateNowByApModel', 'ChangeUpgradeScheduleByApMode', 'SkipUpgradeSchedule'], () => {
            api.dispatch(firmwareApi.util.invalidateTags([
              { type: 'Firmware', id: 'LIST' }
            ]))
          })
        })
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getAllApModelFirmwareList: build.query<ApModelFirmware[], RequestPayload>({
      query: () => {
        const req = createHttpRequest(FirmwareUrlsInfo.getAllApModelFirmwareList)
        return { ...req }
      }
    }),
    // eslint-disable-next-line max-len
    patchVenueApModelFirmwares: build.mutation<{ batchId: string }, RequestPayload<UpdateFirmwarePerApModelPayload>>({
      async queryFn (args, _queryApi, _extraOptions, fetchWithBQ) {
        // eslint-disable-next-line max-len
        const { data, error } = await getBatchOperationResult(ApFirmwareBatchOperationType.UPDATE_NOW, fetchWithBQ)
        if (error) return { error: error as FetchBaseQueryError }
        const batchId = (data as ApFirmwareStartBatchOperationResult).response.batchId

        const { venueIds, ...rest } = args.payload!
        const requests = venueIds.map(venueId => ({
          params: { venueId, batchId },
          payload: { ...rest }
        }))
        await batchApi(FirmwareUrlsInfo.patchVenueApModelFirmwares, requests, fetchWithBQ)

        return { data: { batchId } }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    getVenueApModelFirmwares: build.query<{ apModel: string, firmware: string }[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getVenueApModelFirmwares, params)
        return { ...req }
      },
      providesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    updateVenueSchedulesPerApModel: build.mutation<{ batchId: string }, RequestPayload<UpdateFirmwareSchedulePerApModelPayload>>({
      async queryFn (args, _queryApi, _extraOptions, fetchWithBQ) {
        // eslint-disable-next-line max-len
        const { data, error } = await getBatchOperationResult(ApFirmwareBatchOperationType.CHANGE_SCHEDULE, fetchWithBQ)
        if (error) return { error: error as FetchBaseQueryError }
        const batchId = (data as ApFirmwareStartBatchOperationResult).response.batchId

        const { venueIds, ...rest } = args.payload!
        const requests = venueIds.map(venueId => ({
          params: { venueId, batchId },
          payload: { ...rest }
        }))
        await batchApi(FirmwareUrlsInfo.updateVenueSchedulesPerApModel, requests, fetchWithBQ)

        return { data: { batchId } }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    skipVenueSchedulesPerApModel: build.mutation<{ batchId: string }, RequestPayload<{ venueIds: string[] }>>({
      async queryFn (args, _queryApi, _extraOptions, fetchWithBQ) {
        // eslint-disable-next-line max-len
        const { data, error } = await getBatchOperationResult(ApFirmwareBatchOperationType.SKIP_SCHEDULE, fetchWithBQ)
        if (error) return { error: error as FetchBaseQueryError }
        const batchId = (data as ApFirmwareStartBatchOperationResult).response.batchId

        const requests = args.payload!.venueIds.map(venueId => ({ params: { venueId, batchId } }))
        await batchApi(FirmwareUrlsInfo.skipVenueSchedulesPerApModel, requests, fetchWithBQ)

        return { data: { batchId } }
      },
      invalidatesTags: [{ type: 'Firmware', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    startEdgeFirmwareVenueUpdateNow: build.mutation<{ batchId: string }, RequestPayload<StartEdgeFirmwareVenueUpdateNowPayload>>({
      async queryFn (args, _queryApi, _extraOptions, fetchWithBQ) {
        // eslint-disable-next-line max-len
        const { data, error } = await getEdgeFirmwareBatchOperationResult(EdgeFirmwareBatchOperationType.UPDATE_NOW, fetchWithBQ)
        if (error) return { error: error as FetchBaseQueryError }
        const batchId = (data as EdgeFirmwareStartBatchOperationResult).response.batchId

        const { venueIds, ...rest } = args.payload!
        const requests = venueIds.map(venueId => ({
          params: { venueId, batchId },
          payload: { ...rest }
        }))
        await batchApi(FirmwareUrlsInfo.startEdgeFirmwareVenueUpdateNow, requests, fetchWithBQ)

        return { data: { batchId } }
      },
      invalidatesTags: [{ type: 'EdgeFirmware', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    updateEdgeFirmwareVenueSchedule: build.mutation<{ batchId: string }, RequestPayload<UpdateEdgeFirmwareVenueSchedulePayload>>({
      async queryFn (args, _queryApi, _extraOptions, fetchWithBQ) {
        // eslint-disable-next-line max-len
        const { data, error } = await getEdgeFirmwareBatchOperationResult(EdgeFirmwareBatchOperationType.CHANGE_SCHEDULE, fetchWithBQ)
        if (error) return { error: error as FetchBaseQueryError }
        const batchId = (data as EdgeFirmwareStartBatchOperationResult).response.batchId

        const { venueIds, ...rest } = args.payload!
        const requests = venueIds.map(venueId => ({
          params: { venueId, batchId },
          payload: { ...rest }
        }))
        await batchApi(FirmwareUrlsInfo.updateEdgeFirmwareVenueSchedule, requests, fetchWithBQ)

        return { data: { batchId } }
      },
      invalidatesTags: [{ type: 'EdgeFirmware', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    skipEdgeFirmwareVenueSchedule: build.mutation<{ batchId: string }, RequestPayload<{ venueIds: string[] }>>({
      async queryFn (args, _queryApi, _extraOptions, fetchWithBQ) {
        // eslint-disable-next-line max-len
        const { data, error } = await getEdgeFirmwareBatchOperationResult(EdgeFirmwareBatchOperationType.SKIP_SCHEDULE, fetchWithBQ)
        if (error) return { error: error as FetchBaseQueryError }
        const batchId = (data as EdgeFirmwareStartBatchOperationResult).response.batchId

        const requests = args.payload!.venueIds.map(venueId => ({ params: { venueId, batchId } }))
        await batchApi(FirmwareUrlsInfo.skipEdgeFirmwareVenueSchedule, requests, fetchWithBQ)

        return { data: { batchId } }
      },
      invalidatesTags: [{ type: 'EdgeFirmware', id: 'LIST' }]
    })
  })
})

export const {
  useGetUpgradePreferencesQuery,
  useUpdateUpgradePreferencesMutation,
  useGetSwitchUpgradePreferencesQuery,
  useUpdateSwitchUpgradePreferencesMutation,
  useGetVenueVersionListQuery,
  useGetLatestFirmwareListQuery,
  useGetAvailableFirmwareListQuery,
  useGetAvailableABFListQuery,
  useGetApModelFamiliesQuery,
  useGetFirmwareVersionIdListQuery,
  useSkipVenueUpgradeSchedulesMutation,
  useUpdateVenueSchedulesMutation,
  useUpdateNowMutation,
  useUpdateDowngradeMutation,
  useSkipSwitchUpgradeSchedulesMutation,
  useUpdateSwitchVenueSchedulesMutation,
  useBatchUpdateSwitchVenueSchedulesMutation,
  useBatchUpdateSwitchVenueSchedulesV1001Mutation,
  useGetSwitchLatestFirmwareListQuery,
  useLazyGetSwitchLatestFirmwareListQuery,
  useGetSwitchLatestFirmwareListV1001Query,
  useLazyGetSwitchLatestFirmwareListV1001Query,
  useGetSwitchDefaultFirmwareListQuery,
  useLazyGetSwitchDefaultFirmwareListQuery,
  useGetSwitchDefaultFirmwareListV1001Query,
  useLazyGetSwitchDefaultFirmwareListV1001Query,
  useGetSwitchFirmwareVersionIdListQuery,
  useGetSwitchVenueVersionListQuery,
  useLazyGetSwitchVenueVersionListQuery,
  useGetSwitchVenueVersionListV1001Query,
  useLazyGetSwitchVenueVersionListV1001Query,
  useGetSwitchAvailableFirmwareListQuery,
  useGetSwitchAvailableFirmwareListV1001Query,
  useGetSwitchCurrentVersionsQuery,
  useGetSwitchCurrentVersionsV1001Query,
  useGetSwitcDefaultVersionsQuery,
  useGetSwitchFirmwarePredownloadQuery,
  useUpdateSwitchFirmwarePredownloadMutation,
  useGetAvailableEdgeFirmwareVersionsQuery,
  useGetLatestEdgeFirmwareQuery,
  useGetVenueEdgeFirmwareListQuery,
  useUpdateEdgeFirmwareNowMutation,
  useGetEdgeUpgradePreferencesQuery,
  useUpdateEdgeUpgradePreferencesMutation,
  useSkipEdgeUpgradeSchedulesMutation,
  useUpdateEdgeVenueSchedulesMutation,
  useLazyGetVenueEdgeFirmwareListQuery,
  useGetSwitchFirmwareListQuery,
  useLazyGetSwitchFirmwareListQuery,
  useGetSwitchFirmwareListV1001Query,
  useBatchGetSwitchFirmwareListV1001Query,
  useLazyGetSwitchFirmwareListV1001Query,
  useGetSwitchFirmwareStatusListQuery,
  useLazyGetSwitchFirmwareStatusListQuery,
  useGetScheduledFirmwareQuery,
  useLazyGetScheduledFirmwareQuery,
  useGetVenueApModelFirmwareListQuery,
  useGetVenueApModelFirmwareSchedulesListQuery,
  useGetAllApModelFirmwareListQuery,
  usePatchVenueApModelFirmwaresMutation,
  useGetVenueApModelFirmwaresQuery,
  useUpdateVenueSchedulesPerApModelMutation,
  useSkipVenueSchedulesPerApModelMutation,
  useBatchSkipSwitchUpgradeSchedulesMutation,
  useRetryFirmwareUpdateV1001Mutation,
  useStartEdgeFirmwareVenueUpdateNowMutation,
  useUpdateEdgeFirmwareVenueScheduleMutation,
  useSkipEdgeFirmwareVenueScheduleMutation
} = firmwareApi

async function getBatchOperationResult (
  operationType: ApFirmwareBatchOperationType,
  // eslint-disable-next-line max-len
  fetchWithBQ:(arg: string | FetchArgs) => MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>
) {
  return await fetchWithBQ({
    ...createHttpRequest(FirmwareUrlsInfo.startFirmwareBatchOperation),
    body: JSON.stringify({ operationType })
  })
}

async function getEdgeFirmwareBatchOperationResult (
  operationType: EdgeFirmwareBatchOperationType,
  // eslint-disable-next-line max-len
  fetchWithBQ:(arg: string | FetchArgs) => MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>
) {
  return await fetchWithBQ({
    ...createHttpRequest(FirmwareUrlsInfo.startEdgeFirmwareBatchOperation),
    body: JSON.stringify({ operationType })
  })
}
