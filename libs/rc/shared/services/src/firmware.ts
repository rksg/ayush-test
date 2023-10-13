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
  SwitchFirmware
} from '@acx-ui/rc/utils'
import { baseFirmwareApi }   from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

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
          onActivityMessageReceived(msg, ['UpdateNow'], () => {
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
    getFirmwareVersionIdList: build.query<string[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getFirmwareVersionIdList, params)
        return {
          ...req
        }
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
    getSwitchLatestFirmwareList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getSwitchLatestFirmwareList, params)
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
    getSwitchVenueVersionList: build.query<TableResult<FirmwareSwitchVenue>, RequestPayload>({
      query: ({ params, payload }) => {
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
        const venueListReq = createHttpRequest(FirmwareUrlsInfo.getSwitchVenueVersionList, params)
        return {
          ...venueListReq,
          body: {
            firmwareType: typeString,
            // eslint-disable-next-line max-len
            firmwareVersion: queryString?.filters?.version ? queryString.filters.version.join(',') : '',
            search: queryString?.searchString ?? '',
            updateAvailable: ''
          }
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transformResponse (result: { upgradeVenueViewList: FirmwareSwitchVenue[] }) {
        const data = [
          {
            id: '156c8b7daa464b06b4fd59ae38dcce30',
            name: 'kittoVenue',
            switchFirmwareVersion: {
              id: '09010f_b403',
              name: '09010f_b403',
              category: 'RECOMMENDED'
            },
            switchFirmwareVersionAboveTen: {
              id: '10010_b214',
              name: '10010_b214',
              category: 'RECOMMENDED'
            },
            availableVersions: [
              {
                id: '09010h_cd1_b3',
                name: '09010h_cd1_b3',
                category: 'RECOMMENDED'
              },
              {
                id: '10010_b214',
                name: '10010_b214',
                category: 'RECOMMENDED'
              }
            ],
            nextSchedule: {
              timeSlot: {
                startDateTime: '2023-10-05T00:00:00-07:00',
                endDateTime: '2023-10-05T02:00:00-07:00'
              },
              version: {
                id: '09010h_cd1_b3',
                name: '09010h_cd1_b3',
                category: 'RECOMMENDED'
              }
            },
            lastScheduleUpdateTime: '2023-09-22T09:00:00.030+00:00',
            preDownload: false,
            switchCount: 1,
            aboveTenSwitchCount: 0,
            upgradeVenueViewList: null,
            status: 'SUCCESS',
            scheduleCount: 1
          },
          {
            id: '9b68bd5cafbf4bc282dc0434102ceca9',
            name: 'My-Venue',
            switchFirmwareVersion: {
              id: '09010f_b403',
              name: '09010f_b403',
              category: 'RECOMMENDED'
            },
            switchFirmwareVersionAboveTen: {
              id: '10010_b214',
              name: '10010_b214',
              category: 'RECOMMENDED'
            },
            availableVersions: [
              {
                id: '09010h_cd1_b3',
                name: '09010h_cd1_b3',
                category: 'RECOMMENDED'
              },
              {
                id: '10010_b214',
                name: '10010_b214',
                category: 'RECOMMENDED'
              }
            ],
            lastScheduleUpdateTime: '2023-10-03T04:00:00.069+00:00',
            preDownload: false,
            switchCount: 1,
            aboveTenSwitchCount: 0,
            upgradeVenueViewList: null,
            status: 'NONE',
            scheduleCount: 0
          }
        ]
        return {
          data: data,
          page: 1,
          totalCount: data.length
        } as TableResult<FirmwareSwitchVenue>
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getSwitchAvailableFirmwareList: build.query<FirmwareVersion[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getSwitchAvailableFirmwareList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),
    getSwitchCurrentVersions: build.query<CurrentVersions, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getSwitchCurrentVersions, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }]
    }),

    getSwitchFirmwareStatusList: build.query<TableResult<SwitchFirmwareStatus>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getSwitchFirmwareVersionIdList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }],
      transformResponse () {
        const data = [
          {
            switchId: 'c0:c5:20:aa:32:55',
            switchName: 'kittoSwitch',
            status: 'FW_UPD_DOWNLOADING',
            targetFirmware: '09010h_cd1_b3'
          }
        ]

        return {
          data,
          page: 1,
          totalCount: data?.length
        } as unknown as TableResult<SwitchFirmwareStatus>
      } }),



    getSwitchFirmwareList: build.query<TableResult<SwitchFirmware>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getSwitchFirmwareVersionIdList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'LIST' }],
      transformResponse () {
        const data =[
          {
            venueId: '156c8b7daa464b06b4fd59ae38dcce30',
            venueName: 'kittoVenue',
            switchId: 'c0:c5:20:aa:32:55',
            switchName: 'kittoSwitch',
            isStack: false,
            model: 'ICX7150-48P',
            currentFirmware: '09010f_b403',
            availableVersion:
                  {
                    id: '09010h_cd1_b3',
                    name: '09010h_cd1_b3',
                    category: 'RECOMMENDED'
                  },
            switchNextSchedule: {
              timeSlot: {
                startDateTime: '2023-10-05T00:00:00-07:00',
                endDateTime: '2023-10-05T02:00:00-07:00'
              },
              version: {
                id: '09010h_cd1_b3',
                name: '09010h_cd1_b3',
                category: 'RECOMMENDED'
              }
            },
            venueNextSchedule: {
              timeSlot: {
                startDateTime: '2023-10-08T00:00:00-07:00',
                endDateTime: '2023-10-08T02:00:00-07:00'
              },
              version: {
                id: '09010h_cd1_b3',
                name: '09010h_cd1_b3',
                category: 'RECOMMENDED'
              }
            },
            preDownload: false
          }
        ]
        return {
          data,
          page: 1,
          totalCount: data?.length
        } as unknown as TableResult<SwitchFirmware>
      } }),


    getSwitchFirmwarePredownload: build.query<PreDownload, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.getSwitchFirmwarePredownload, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SwitchFirmware', id: 'PREDOWNLOAD' }]
    }),
    updateSwitchFirmwarePredownload: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateSwitchFirmwarePredownload, params)
        return {
          ...req,
          body: payload
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'SwitchFirmware', id: 'LIST' }, { type: 'SwitchFirmware', id: 'PREDOWNLOAD' }]
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
      query: () => {
        const req = createHttpRequest(FirmwareUrlsInfo.getVenueEdgeFirmwareList)
        return {
          ...req
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
        const req = createHttpRequest(FirmwareUrlsInfo.getAvailableEdgeFirmwareVersions)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EdgeFirmware', id: 'AVAILABLE_LIST' }]
    }),
    updateEdgeFirmwareNow: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateEdgeFirmware)
        return {
          ...req,
          body: { ...(payload as Object), state: 'UPDATE_NOW' }
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
      query: ({ payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.skipEdgeUpgradeSchedules)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'EdgeFirmware', id: 'LIST' }]
    }),
    updateEdgeVenueSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(FirmwareUrlsInfo.updateEdgeVenueSchedules)
        return {
          ...req,
          body: payload
        }
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
  useGetFirmwareVersionIdListQuery,
  useSkipVenueUpgradeSchedulesMutation,
  useUpdateVenueSchedulesMutation,
  useUpdateNowMutation,
  useSkipSwitchUpgradeSchedulesMutation,
  useUpdateSwitchVenueSchedulesMutation,
  useGetSwitchLatestFirmwareListQuery,
  useGetSwitchFirmwareVersionIdListQuery,
  useGetSwitchVenueVersionListQuery,
  useLazyGetSwitchVenueVersionListQuery,
  useGetSwitchAvailableFirmwareListQuery,
  useGetSwitchCurrentVersionsQuery,
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
  useGetSwitchFirmwareStatusListQuery,
  useLazyGetSwitchFirmwareStatusListQuery
} = firmwareApi
