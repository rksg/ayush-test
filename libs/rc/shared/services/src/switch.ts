import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import _                       from 'lodash'

import { Filter }                    from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  RequestFormData,
  SaveSwitchProfile,
  SwitchUrlsInfo,
  SwitchRbacUrlsInfo,
  SwitchViewModel,
  SwitchVlans,
  Acl,
  Vlan,
  SwitchPortViewModel,
  TableResult,
  SwitchDefaultVlan,
  SwitchProfile,
  SwitchVlanUnion,
  PortSettingModel,
  PortsSetting,
  Switch,
  STACK_MEMBERSHIP,
  onSocketActivityChanged,
  onActivityMessageReceived,
  SwitchRow,
  StackMember,
  ConfigurationHistory,
  CliTemplateExample,
  CliConfiguration,
  CliFamilyModels,
  ConfigurationProfile,
  transformConfigType,
  transformConfigStatus,
  VeViewModel,
  VlanVePort,
  AclUnion,
  VeForm,
  StaticRoute,
  StackMemberList,
  SwitchClient,
  transformConfigBackupStatus,
  ConfigurationBackup,
  ConfigurationBackupStatus,
  transformConfigBackupType,
  JwtToken,
  TroubleshootingResult,
  SwitchDhcp,
  SwitchDhcpLease,
  CommonResult,
  SwitchProfileModel,
  SwitchCliTemplateModel,
  SwitchFrontView,
  SwitchRearView,
  Lag,
  SwitchVlan,
  downloadFile,
  SEARCH,
  SORTER,
  SwitchPortViewModelQueryFields,
  TroubleshootingResponse
} from '@acx-ui/rc/utils'
import { baseSwitchApi }               from '@acx-ui/store'
import { RequestPayload }              from '@acx-ui/types'
import { createHttpRequest, batchApi } from '@acx-ui/utils'

export type SwitchsExportPayload = {
  filters: Filter
  tenantId: string
} & SEARCH & SORTER

type StackInfo = {
  serialNumber: string
  venueId: string
}

const customHeaders = {
  v1: {
    'Content-Type': 'application/vnd.ruckus.v1+json',
    'Accept': 'application/vnd.ruckus.v1+json'
  },
  v1001: {
    'Content-Type': 'application/vnd.ruckus.v1.1+json',
    'Accept': 'application/vnd.ruckus.v1.1+json'
  }
}

const getSwitchUrls = (enableRbac?: boolean | unknown) => {
  return enableRbac ? SwitchRbacUrlsInfo : SwitchUrlsInfo
}

export const switchApi = baseSwitchApi.injectEndpoints({
  endpoints: (build) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    switchList: build.query<TableResult<SwitchRow>, RequestPayload<any>>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const hasGroupBy = !!arg.payload?.groupBy
        const switchUrls = getSwitchUrls(arg.enableRbac)
        const headers = arg.enableRbac ? customHeaders.v1 : {}
        const req = hasGroupBy
          ? createHttpRequest(switchUrls.getSwitchListByGroup, arg.params, headers)
          : createHttpRequest(switchUrls.getSwitchList, arg.params, headers)
        const listInfo = {
          ...req,
          body: JSON.stringify(arg.payload)
        }
        const listQuery = await fetchWithBQ(listInfo)
        const list = listQuery.data as TableResult<SwitchRow>
        const stackMembers:{ [index:string]: StackMember[] } = {}
        const stacks: StackInfo[] = []
        if(!list) return { error: listQuery.error as FetchBaseQueryError }

        list.data.forEach(async (item:SwitchRow) => {
          if(hasGroupBy){
            item.children = item.switches
            item.switches?.forEach((i:SwitchRow) => {
              if(i.isStack || i.formStacking){
                stacks.push({
                  serialNumber: i.serialNumber,
                  venueId: i.venueId
                })
              }
            })
          }else if(item.isStack || item.formStacking){
            stacks.push({
              serialNumber: item.serialNumber,
              venueId: item.venueId
            })
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allStacksMember:any = await Promise.all(stacks.map(stack =>
          fetchWithBQ(genStackMemberPayload(arg, stack))
        ))
        stacks.forEach((stack:StackInfo, index:number) => {
          stackMembers[stack.serialNumber] = allStacksMember[index]?.data?.data
        })

        const getUniqSerialNumberList = function (list: TableResult<SwitchRow>) {
          const seenSerialNumbers = new Set()

          list.data = list.data.filter((item: SwitchRow) => {
            if (!seenSerialNumbers.has(item.serialNumber)) {
              seenSerialNumbers.add(item.serialNumber)
              return true
            }
            return false
          })
          return list
        }

        const aggregatedList = hasGroupBy
          ? aggregatedSwitchGroupByListData(list, stackMembers)
          : aggregatedSwitchListData(getUniqSerialNumberList(list), stackMembers)

        return { data: aggregatedList }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Switch', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddSwitch',
            'UpdateSwitch',
            'DeleteSwitch',
            'ImportSwitches'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(switchApi.util.invalidateTags([
              { type: 'Switch', id: 'LIST' },
              { type: 'Switch', id: 'DETAIL' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    stackMemberList: build.query<TableResult<StackMember>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getMemberList,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Switch', id: 'StackMemberList' }]
    }),
    batchDeleteSwitch: build.mutation<void, RequestPayload[]>({ // RBAC only
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        return batchApi(SwitchUrlsInfo.deleteSwitches, requests, fetchWithBQ)
      },
      invalidatesTags: [{ type: 'Switch', id: 'LIST' }]
    }),
    deleteSwitches: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.deleteSwitches, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LIST' }]
    }),
    deleteStackMember: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteStackMember, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'DETAIL' }, { type: 'Switch', id: 'StackMemberList' }]
    }),
    acknowledgeSwitch: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.acknowledgeSwitch, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'DETAIL' }, { type: 'Switch', id: 'StackMemberList' }]
    }),
    rebootSwitch: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.reboot, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    syncData: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.syncData, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    syncSwitchesData: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        if (enableRbac) {
          const req = createHttpRequest(SwitchRbacUrlsInfo.syncSwitchesData, params)
          return {
            ...req,
            body: payload
          }
        } else {
          const req = createHttpRequest(SwitchUrlsInfo.syncSwitchesData, params)
          return {
            ...req,
            body: payload
          }
        }
      }
    }),
    retryFirmwareUpdate: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        if (enableRbac) {
          const req = createHttpRequest(SwitchRbacUrlsInfo.retryFirmwareUpdate, params)
          return {
            ...req
          }
        } else {
          const req = createHttpRequest(SwitchUrlsInfo.retryFirmwareUpdate, params)
          return {
            ...req,
            body: payload
          }
        }


      }
    }),
    switchDetailHeader: build.query<SwitchViewModel, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getSwitchDetailHeader, params, headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Switch', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateSwitch'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(switchApi.util.invalidateTags([{ type: 'Switch', id: 'DETAIL' }]))
          })
        })
      }
    }),
    switchFrontView: build.query<SwitchFrontView, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getSwitchFrontView,
          params
        )
        return {
          ...req
        }
      }
    }),
    switchRearView: build.query<SwitchRearView & { data:SwitchRearView[] } , RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(
          switchUrls.getSwitchRearView,
          params,
          headers
        )
        return {
          ...req
        }
      }
    }),
    switchPortlist: build.query<TableResult<SwitchPortViewModel>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(
          switchUrls.getSwitchPortlist,
          params,
          headers
        )
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateSwitch'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(switchApi.util.invalidateTags([{ type: 'SwitchPort', id: 'LIST' }]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchPort', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getProfiles: build.query<TableResult<SwitchProfileModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getProfiles,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'SwitchProfiles', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddSwitchConfigProfile',
            'UpdateSwitchConfigProfile',
            'DeleteSwitchConfigProfile'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(switchApi.util.invalidateTags([
              { type: 'SwitchProfiles', id: 'LIST' },
              { type: 'SwitchProfiles', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    deleteProfiles: build.mutation<SwitchProfileModel, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteProfiles, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchProfiles', id: 'LIST' }]
    }),
    getSwitchConfigProfileDetail: build.query<ConfigurationProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchConfigProfileDetail, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'SwitchProfiles', id: 'DETAIL' }]
    }),
    getCliTemplates: build.query<TableResult<SwitchCliTemplateModel>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getCliTemplates, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchOnDemandCli', id: 'LIST' }]
    }),
    deleteCliTemplates: build.mutation<SwitchCliTemplateModel, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.deleteCliTemplates, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SwitchOnDemandCli', id: 'LIST' }]
    }),
    addSwitch: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.addSwitch, params, headers)
        return {
          ...req,
          body: JSON.stringify([payload])
        }
      }
    }),
    convertToStack: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.convertToStack, params, headers)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getPortSetting: build.query<PortSettingModel, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getPortSetting, params, headers)
        return { ...req, body: JSON.stringify(payload) }
      },
      transformResponse: (result: PortsSetting | PortSettingModel) => {
        const res = _.get(result, 'response')
        return Array.isArray(res) ? res.pop() : result
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchPort', id: 'Setting' }]
    }),
    getPortsSetting: build.query<PortsSetting, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(
          switchUrls.getPortsSetting,
          params,
          headers
        )
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchPort', id: 'Setting' }]
    }),
    cyclePoe: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.portsPowerCycle, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getDefaultVlan: build.query<SwitchDefaultVlan[], RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getDefaultVlan, params, headers)
        payload = enableRbac
          ? payload
          : { isDefault: true, switchIds: payload }

        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getSwitchVlanUnionByVenue: build.query<SwitchVlan[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getSwitchVlanUnionByVenue, params, headers)
        return {
          ...req
        }
      }
    }),
    getSwitchVlan: build.query<SwitchVlanUnion, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getSwitchVlanUnion, params, headers)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchVlan', id: 'LIST' }]
    }),
    getSwitchVlans: build.query<Vlan[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getSwitchVlans, params, headers)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchVlan', id: 'LIST' }]
    }),
    getSwitchesVlan: build.query<SwitchVlanUnion, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getSwitchesVlan, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    getTaggedVlansByVenue: build.query<SwitchVlans[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getTaggedVlansByVenue, params)
        return { ...req, body: params }
      }
    }),
    getUntaggedVlansByVenue: build.query<SwitchVlans[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getUntaggedVlansByVenue, params)
        return { ...req, body: params }
      }
    }),
    getSwitchConfigurationProfileByVenue: build.query<SwitchProfile[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(
          switchUrls.getSwitchConfigurationProfileByVenue, params, headers
        )
        return {
          ...req
        }
      }
    }),
    savePortsSetting: build.mutation<SaveSwitchProfile[], RequestPayload>({ ////
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.savePortsSetting, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SwitchPort', id: 'LIST' }]
    }),

    importSwitches: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.importSwitches, params, {
          'Content-Type': undefined,
          'Accept': '*/*'
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LIST' }]
    }),
    getSwitchList: build.query<TableResult<SwitchViewModel>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const switchListReq = createHttpRequest(switchUrls.getSwitchList, params, headers)
        return {
          ...switchListReq,
          body: JSON.stringify(payload)
        }
      }
    }),
    getSwitchConfigBackupList: build.query<TableResult<ConfigurationBackup>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const switchUrls = getSwitchUrls(enableRbac)
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(switchUrls.getSwitchConfigBackupList, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      transformResponse: (res: TableResult<ConfigurationBackup>) => {
        return {
          ...res,
          data: Array.isArray(res.data) ? res.data
            .map(item => ({
              ...item,
              createdDate: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.createdDate),
              backupType: transformConfigBackupType(item.backupType),
              backupStatus: transformConfigBackupStatus(item) as ConfigurationBackupStatus
            })) : []
        }
      },
      providesTags: [{ type: 'SwitchBackup', id: 'LIST' }]
    }),
    addConfigBackup: build.mutation<ConfigurationBackup, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const switchUrls = getSwitchUrls(enableRbac)
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(switchUrls.addBackup, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SwitchBackup', id: 'LIST' }]
    }),
    restoreConfigBackup: build.mutation<ConfigurationBackup, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const switchUrls = getSwitchUrls(enableRbac)
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(switchUrls.restoreBackup, params, headers)
        const payload = {
          configBackupAction: 'restore'
        }
        return {
          ...req,
          ...(enableRbac ? { body: JSON.stringify(payload) } : {})
        }
      },
      invalidatesTags: [{ type: 'SwitchBackup', id: 'LIST' }]
    }),
    downloadConfigBackup: build.mutation<{ response: string }, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const switchUrls = getSwitchUrls(enableRbac)
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(switchUrls.downloadSwitchConfig, params, headers)
        const payload = {
          configBackupAction: 'download'
        }
        return {
          ...req,
          ...(enableRbac ? { body: JSON.stringify(payload) } : {})
        }
      }
    }),
    deleteConfigBackups: build.mutation<ConfigurationBackup, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const switchUrls = getSwitchUrls(enableRbac)
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(switchUrls.deleteBackups, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SwitchBackup', id: 'LIST' }]
    }),
    getSwitchConfigHistory: build.query<TableResult<ConfigurationHistory>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const switchUrls = getSwitchUrls(enableRbac)
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(switchUrls.getSwitchConfigHistory, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      transformResponse: (res: {
        response:{ list:ConfigurationHistory[], totalCount:number }
        } & { list:ConfigurationHistory[], totalCount:number }, meta
      , arg: { payload:{ page:number } }) => {
        const result = res.response?.list || res.list
        const totalCount = res.response?.totalCount || res.totalCount
        const configType = result ? (res.list ? 'historyConfigTypeV1001' : 'configType' )
          : 'configType'
        return {
          data: result ? result.map(item => ({
            ...item,
            startTime: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.startTime),
            configType: transformConfigType(item[configType]),
            dispatchStatus: transformConfigStatus(item.dispatchStatus)
          })) : [],
          totalCount: totalCount,
          page: arg.payload.page
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    addStackMember: build.mutation<{}, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addStackMember, params)
        return {
          ...req
          // body:
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LIST' }]
    }),
    getVlansByVenue: build.query<Vlan[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getVlansByVenue, params, headers)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchVlan', id: 'LIST' }]
    }),
    getSwitchRoutedList: build.query<TableResult<VeViewModel>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getSwitchRoutedList, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Switch', id: 'VE' }],
      extraOptions: { maxRetries: 5 }
    }),
    getVenueRoutedList: build.query<TableResult<VeViewModel>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getVenueRoutedList, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Switch', id: 'VE' }],
      extraOptions: { maxRetries: 5 }
    }),
    getVlanListBySwitchLevel: build.query<TableResult<Vlan>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getVlanListBySwitchLevel, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    getSwitchAcls: build.query<TableResult<Acl>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getSwitchAcls, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    getJwtToken: build.query<JwtToken, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getJwtToken, params, headers)
        return {
          ...req
        }
      }
    }),
    saveSwitch: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.addSwitch, params, headers)
        return {
          ...req,
          body: [payload]
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LIST' }]
    }),
    updateSwitch: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.updateSwitch, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'Switch', id: 'LIST' },
        { type: 'Switch', id: 'DETAIL' },
        { type: 'Switch', id: 'SWITCH' },
        { type: 'Switch', id: 'StackMemberList' }
      ]
    }),
    getFreeVePortVlans: build.query<VlanVePort[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getFreeVePortVlans, params, headers)
        return {
          ...req
        }
      }
    }),
    getAclUnion: build.query<AclUnion, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getAclUnion, params, headers)
        return {
          ...req
        }
      }
    }),
    addAcl: build.mutation<Acl, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.addAcl, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    addVlan: build.mutation<Vlan, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.addVlan, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    addVePort: build.mutation<VeForm, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.addVePort, params, headers)
        return {
          ...req,
          body: JSON.stringify([payload])
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'VE' }]
    }),
    updateVePort: build.mutation<VeForm, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.updateVePort, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'VE' }]
    }),
    getSwitch: build.query<Switch, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getSwitch, params, headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Switch', id: 'SWITCH' }]
    }),
    getSwitchModelList: build.query<TableResult<Switch>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getSwitchModelList, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    deleteVePorts: build.mutation<VeForm, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.deleteVePorts, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'VE' }]
    }),
    getSwitchStaticRoutes: build.query<StaticRoute[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getStaticRoutes, params, headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Switch', id: 'ROUTES' }]
    }),
    addSwitchStaticRoute: build.mutation<StaticRoute, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.addStaticRoute, params, headers)
        return {
          ...req,
          body: JSON.stringify([payload])
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'ROUTES' }]
    }),
    updateSwitchStaticRoute: build.mutation<StaticRoute, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.updateStaticRoute, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'ROUTES' }]
    }),
    deleteSwitchStaticRoutes: build.mutation<StaticRoute, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.deleteStaticRoutes, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'ROUTES' }]
    }),
    getStackMemberList: build.query<StackMemberList, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getMemberList, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getSwitchClientList: build.query<TableResult<SwitchClient>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const headers = arg.enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(arg.enableRbac)
        const listInfo = {
          ...createHttpRequest(switchUrls.getSwitchClientList, arg.params, headers),
          body: JSON.stringify(arg.payload)
        }
        const listQuery = await fetchWithBQ(listInfo)
        const list = listQuery.data as TableResult<SwitchClient>

        const switchesInfo = {
          ...createHttpRequest(switchUrls.getSwitchList, arg.params, headers),
          body: JSON.stringify({
            fields: ['name', 'venueName', 'id', 'switchMac', 'switchName'],
            filters: { id: _.uniq(list.data.map(c => c.switchId)) },
            pageSize: 10000
          })
        }
        const switchesQuery = await fetchWithBQ(switchesInfo)
        const switches = switchesQuery.data as TableResult<SwitchRow>


        const switchPortsInfo = {
          ...createHttpRequest(switchUrls.getSwitchPortlist, arg.params, headers),
          body: JSON.stringify({
            fields: SwitchPortViewModelQueryFields,
            filters: { portId: _.uniq(list.data.map(c=>c.switchPortId)) },
            pageSize: 10000
          })
        }
        const switchPortsQuery = await fetchWithBQ(switchPortsInfo)
        const switchPorts = switchPortsQuery.data as TableResult<SwitchPortViewModel>

        const aggregatedList = aggregatedSwitchClientData(list, switches, switchPorts)

        return listQuery.data
          ? { data: aggregatedList }
          : { error: listQuery.error as FetchBaseQueryError }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchClient', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getSwitchClientDetails: build.query<SwitchClient, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const clientListReq = createHttpRequest(switchUrls.getSwitchClientDetail, params, headers)
        const payload = {
          fields: ['switchId','clientVlan','venueId','switchSerialNumber','clientMac',
            'clientName','clientDesc','clientType','switchPort','vlanName',
            'switchName', 'venueName' ,'cog','id', 'clientIpv4Addr', 'clientIpv6Addr',
            'dhcpClientOsVendorName', 'dhcpClientHostName',
            'dhcpClientDeviceTypeName', 'dhcpClientModelName'],
          filters: {
            id: [_.get(params, 'clientId')]
          }
        }
        return {
          ...clientListReq, body: JSON.stringify(payload)
        }
      },
      transformResponse: (result: SwitchClient | TableResult<SwitchClient>) => {
        const res = _.get(result, 'data')
        return Array.isArray(res) ? res.pop() : result
      }
    }),
    getTroubleshooting: build.query<TroubleshootingResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getTroubleshooting, params, headers)
        return {
          ...req
        }
      },
      transformResponse: (res: TroubleshootingResult | TroubleshootingResponse) => {
        if ('requestId' in res) {
          return res as TroubleshootingResult
        } else {
          return { response: res as TroubleshootingResponse, requestId: '' }
        }
      }
    }),
    getTroubleshootingClean: build.query<{}, RequestPayload>({ // TODO: Karen, Need backend check the API
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getTroubleshootingClean, params, headers)
        return {
          ...req
        }
      }
    }),
    blinkLeds: build.mutation<TroubleshootingResult, RequestPayload>({
      query: ({ params, payload }) => { // RBAC
        const headers = customHeaders.v1
        const req = createHttpRequest(SwitchUrlsInfo.blinkLeds, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    ping: build.mutation<TroubleshootingResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.ping, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    traceRoute: build.mutation<TroubleshootingResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.traceRoute, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    ipRoute: build.mutation<TroubleshootingResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.ipRoute, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    macAddressTable: build.mutation<TroubleshootingResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.macAddressTable, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    updateDhcpServerState: build.mutation<{}, RequestPayload>({ ////
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.updateDhcpServerState, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'Switch', id: 'SWITCH' }
      ]
    }),
    getLagList: build.query<Lag[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getLagList, params, headers)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Switch', id: 'LAG' }]
    }),
    updateLag: build.mutation<Lag, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.updateLag, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LAG' }]
    }),
    addLag: build.mutation<Lag, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.addLag, params, headers)
        return {
          ...req,
          body: JSON.stringify([payload])
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LAG' }]
    }),
    deleteLag: build.mutation<Lag, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.deleteLag, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LAG' }]
    }),
    getDhcpPools: build.query<TableResult<SwitchDhcp>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getDhcpPools, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Switch', id: 'DHCP' }],
      extraOptions: { maxRetries: 5 }
    }),
    getDhcpServer: build.query<SwitchDhcp, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getDhcpServer, params, headers)
        return {
          ...req
        }
      }
    }),
    createDhcpServer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.addDhcpServer, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'DHCP' }]
    }),
    updateDhcpServer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.updateDhcpServer, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'DHCP' }]
    }),
    deleteDhcpServers: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.deleteDhcpServers, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'DHCP' }]
    }),
    getDhcpLeases: build.query<SwitchDhcpLease[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const headers = arg.enableRbac ? customHeaders.v1 : {}
        const switchUrls = getSwitchUrls(arg.enableRbac)
        const doDhcpServerLeaseTableInfo = {
          ...createHttpRequest(switchUrls.dhcpLeaseTable, arg.params, headers),
          body: JSON.stringify(arg.payload)
        }
        const infoResult = await fetchWithBQ(doDhcpServerLeaseTableInfo)
        if (infoResult.error)
          return { error: infoResult.error as FetchBaseQueryError }

        const pollingDhcpLease = async () => {
          const getDhcpLeasesInfo = createHttpRequest(switchUrls.getDhcpLeases, arg.params, headers)
          let ret = await fetchWithBQ(getDhcpLeasesInfo)
          let result = ret.data as TroubleshootingResult

          while (result?.response?.syncing) {
            await wait(2000)
            ret = await fetchWithBQ(getDhcpLeasesInfo)
            result = ret.data as TroubleshootingResult
          }
          return ret
        }

        const getDhcpLeasesQuery = await pollingDhcpLease()
        const leaseResult = getDhcpLeasesQuery.data as TroubleshootingResult

        return leaseResult?.response?.dhcpServerLeaseList
          ? { data: leaseResult.response.dhcpServerLeaseList }
          : { error: getDhcpLeasesQuery.error as FetchBaseQueryError }
      }
    }),
    getCliTemplate: build.query<CliConfiguration, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getCliTemplate, params, headers)
        return {
          ...req,
          body: payload
        }
      },
      keepUnusedDataFor: 0
    }),
    addCliTemplate: build.mutation<CliConfiguration, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.addCliTemplate, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SwitchOnDemandCli', id: 'LIST' }]
    }),
    getCliConfigExamples: build.query<CliTemplateExample[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.getCliConfigExamples, params, headers)
        return {
          ...req
        }
      }
    }),
    updateCliTemplate: build.mutation<CliConfiguration, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const switchUrls = getSwitchUrls(enableRbac)
        const req = createHttpRequest(switchUrls.updateCliTemplate, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SwitchOnDemandCli', id: 'LIST' }]
    }),
    associateCliTemplate: build.mutation<CliConfiguration, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(SwitchRbacUrlsInfo.associateCliTemplate, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    batchAssociateCliTemplate: build.mutation<void, RequestPayload[]>({
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        return batchApi(
          SwitchRbacUrlsInfo.associateCliTemplate, requests, fetchWithBQ, customHeaders.v1
        )
      }
    }),
    disassociateCliTemplate: build.mutation<CliConfiguration, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1 : {}
        const req = createHttpRequest(SwitchRbacUrlsInfo.disassociateCliTemplate, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    batchDisassociateCliTemplate: build.mutation<void, RequestPayload[]>({
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        return batchApi(
          SwitchRbacUrlsInfo.disassociateCliTemplate, requests, fetchWithBQ, customHeaders.v1
        )
      }
    }),
    getCliFamilyModels: build.query<CliFamilyModels[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getCliFamilyModels, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getSwitchConfigProfile: build.query<ConfigurationProfile, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchConfigProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'SwitchProfiles', id: 'DETAIL' }]
    }),
    addSwitchConfigProfile: build.mutation<CliConfiguration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addSwitchConfigProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchProfiles', id: 'LIST' }]
    }),
    updateSwitchConfigProfile: build.mutation<CliConfiguration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateSwitchConfigProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [
        { type: 'SwitchProfiles', id: 'LIST' },
        { type: 'SwitchProfiles', id: 'DETAIL' }
      ]
    }),
    validateUniqueProfileName: build.query<TableResult<SwitchProfile>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getProfiles, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    downloadSwitchsCSV: build.mutation<Blob, {
      payload: SwitchsExportPayload, enableRbac:boolean }>({
        query: ({ payload, enableRbac }) => {
          const switchUrls = getSwitchUrls(enableRbac)
          const headers = enableRbac ? customHeaders.v1 : {}
          const req = createHttpRequest(switchUrls.downloadSwitchsCSV,
            { tenantId: payload.tenantId },
            headers
          )
          return {
            ...req,
            body: payload,
            responseHandler: async (response) => {
              const date = new Date()
              // eslint-disable-next-line max-len
              const nowTime = date.getUTCFullYear() + ('0' + (date.getUTCMonth() + 1)).slice(-2) + ('0' + date.getUTCDate()).slice(-2) + ('0' + date.getUTCHours()).slice(-2) + ('0' + date.getUTCMinutes()).slice(-2) + ('0' + date.getUTCSeconds()).slice(-2)
              const filename = 'Switch Device Inventory - ' + nowTime + '.csv'
              const headerContent = response.headers.get('content-disposition')
              const fileName = headerContent
                ? headerContent.split('filename=')[1]
                : filename
              downloadFile(response, fileName)
            }
          }
        }
      })
    // getCliFamilyModels: build.query<CliProfileFamilyModels[], RequestPayload>({
    //   query: ({ params, payload }) => {
    //     const req = createHttpRequest(SwitchUrlsInfo.getCliFamilyModels, params)
    //     return {
    //       ...req,
    //       body: payload
    //     }
    //   }
    // })
  })
})

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }



const genStackMemberPayload = (switchArg:RequestPayload<unknown>, stack:StackInfo) => {
  const arg: RequestPayload<unknown> = {
    ...switchArg,
    params: {
      ...switchArg.params,
      venueId: stack.venueId,
      switchId: stack.serialNumber
    }
  }
  const switchUrls = getSwitchUrls(arg.enableRbac)
  const headers = arg.enableRbac ? customHeaders.v1 : {}
  return {
    ...createHttpRequest(switchUrls.getMemberList, arg.params, headers),
    ...(arg.enableRbac ? {}: { body: {
      fields: [
        'activeUnitId',
        'unitId',
        'unitStatus',
        'check-all',
        'name',
        'deviceStatus',
        'model',
        'activeSerial',
        'switchMac',
        'ipAddress',
        'venueName',
        'uptime',
        'cog',
        'id',
        'serialNumber',
        'venueId',
        'switchName',
        'configReady',
        'syncedSwitchConfig',
        'syncDataId',
        'operationalWarning',
        'cliApplied',
        'suspendingDeployTime'
      ],
      filters: {
        activeUnitId: [stack.serialNumber]
      }
    } })
  }
}

const aggregatedSwitchGroupByListData = (switches: TableResult<SwitchRow>,
  stackMembers:{ [index:string]: StackMember[] }) => {
  const data = JSON.parse(JSON.stringify(switches.data))
  data.forEach((item:SwitchRow, index:number) => {
    item.isGroup = 'group' + index // for table rowKey
    item.children?.forEach(i => {
      i.isFirstLevel = true
      if (stackMembers[i.serialNumber]) {
        const tmpMember = _.cloneDeep(stackMembers[i.serialNumber])
        tmpMember.forEach((member: StackMember, index: number) => {
          if (member.serialNumber === i.serialNumber) {
            tmpMember[index].unitStatus = STACK_MEMBERSHIP.ACTIVE
          }
        })
        i.children = tmpMember
      }
    })
  })

  return {
    ...switches,
    data
  }
}

const aggregatedSwitchListData = (switches: TableResult<SwitchRow>,
  stackMembers:{ [index:string]: StackMember[] }) => {
  const data:SwitchRow[] = []
  switches.data.forEach(item => {
    const tmp = {
      ...item,
      isFirstLevel: true
    }
    if (stackMembers[item.serialNumber]) {
      const tmpMember = _.cloneDeep(stackMembers[item.serialNumber])
      tmpMember.forEach((member: StackMember, index: number) => {
        if (member.serialNumber === tmp.serialNumber) {
          tmpMember[index].unitStatus = STACK_MEMBERSHIP.ACTIVE
        }
      })
      tmp.children = tmpMember
    }
    data.push(tmp)
  })

  return {
    ...switches,
    data
  }
}

const aggregatedSwitchClientData = (
  clients: TableResult<SwitchClient>,
  switches: TableResult<SwitchRow>,
  switchPortsQuery?: TableResult<SwitchPortViewModel>
) => {
  const data:SwitchClient[] = clients.data.map(item => {
    const target = switches.data.find(s => s.id === item.switchId)
    const switchPortStatus = switchPortsQuery?.data.find(p => p.portId === item.switchPortId)
    const switchId = target ? item.switchId : ''
    return switchPortsQuery ? { ...item, switchId, switchPortStatus } : { ...item, switchId } // use switchId to mark non-exist switch
  })
  return {
    ...clients,
    data
  }
}

export const {
  useSwitchListQuery,
  useStackMemberListQuery,
  useBatchDeleteSwitchMutation,
  useDeleteSwitchesMutation,
  useDeleteStackMemberMutation,
  useAcknowledgeSwitchMutation,
  useSwitchDetailHeaderQuery,
  useLazySwitchDetailHeaderQuery,
  useLazySwitchFrontViewQuery,
  useLazySwitchRearViewQuery,
  useImportSwitchesMutation,
  useGetVlansByVenueQuery,
  useLazyGetVlansByVenueQuery,
  useSwitchPortlistQuery,
  useLazySwitchPortlistQuery,
  useGetPortSettingQuery,
  useLazyGetPortSettingQuery,
  useGetPortsSettingQuery,
  useLazyGetPortsSettingQuery,
  useCyclePoeMutation,
  useLazyGetSwitchRoutedListQuery,
  useLazyGetVenueRoutedListQuery,
  useGetDefaultVlanQuery,
  useLazyGetSwitchVlanUnionByVenueQuery,
  useGetSwitchVlanQuery,
  useLazyGetSwitchVlanQuery,
  useGetSwitchVlansQuery,
  useLazyGetSwitchVlansQuery,
  useGetSwitchesVlanQuery,
  useLazyGetSwitchesVlanQuery,
  useGetTaggedVlansByVenueQuery,
  useLazyGetTaggedVlansByVenueQuery,
  useGetUntaggedVlansByVenueQuery,
  useLazyGetUntaggedVlansByVenueQuery,
  useGetSwitchConfigurationProfileByVenueQuery,
  useLazyGetSwitchConfigurationProfileByVenueQuery,
  useSavePortsSettingMutation,
  useSaveSwitchMutation,
  useAddSwitchMutation,
  useUpdateSwitchMutation,
  useAddStackMemberMutation,
  useConvertToStackMutation,
  useGetSwitchConfigBackupListQuery,
  useAddConfigBackupMutation,
  useRestoreConfigBackupMutation,
  useDownloadConfigBackupMutation,
  useDeleteConfigBackupsMutation,
  useGetSwitchConfigHistoryQuery,
  useGetSwitchListQuery,
  useLazyGetSwitchListQuery,
  useGetVenueRoutedListQuery,
  useGetSwitchRoutedListQuery,
  useGetFreeVePortVlansQuery,
  useLazyGetFreeVePortVlansQuery,
  useGetAclUnionQuery,
  useLazyGetAclUnionQuery,
  useAddVePortMutation,
  useUpdateVePortMutation,
  useGetSwitchQuery,
  useLazyGetSwitchQuery,
  useDeleteVePortsMutation,
  useGetSwitchAclsQuery,
  useGetVlanListBySwitchLevelQuery,
  useGetSwitchStaticRoutesQuery,
  useAddSwitchStaticRouteMutation,
  useUpdateSwitchStaticRouteMutation,
  useDeleteSwitchStaticRoutesMutation,
  useLazyGetStackMemberListQuery,
  useRebootSwitchMutation,
  useSyncDataMutation,
  useSyncSwitchesDataMutation,
  useRetryFirmwareUpdateMutation,
  useLazyGetJwtTokenQuery,
  useGetJwtTokenQuery,
  useGetSwitchClientListQuery,
  useGetSwitchClientDetailsQuery,
  useGetTroubleshootingQuery,
  useBlinkLedsMutation,
  usePingMutation,
  useTraceRouteMutation,
  useIpRouteMutation,
  useMacAddressTableMutation,
  useGetTroubleshootingCleanQuery,
  useLazyGetTroubleshootingCleanQuery,
  useUpdateDhcpServerStateMutation,
  useGetLagListQuery,
  useLazyGetLagListQuery,
  useAddLagMutation,
  useUpdateLagMutation,
  useDeleteLagMutation,
  useGetDhcpPoolsQuery,
  useGetDhcpServerQuery,
  useLazyGetDhcpServerQuery,
  useCreateDhcpServerMutation,
  useUpdateDhcpServerMutation,
  useDeleteDhcpServersMutation,
  useGetDhcpLeasesQuery,
  useLazyValidateUniqueProfileNameQuery,
  useGetCliTemplatesQuery,
  useLazyGetCliTemplatesQuery,
  useGetProfilesQuery,
  useGetCliFamilyModelsQuery,
  useAddCliTemplateMutation,
  useDeleteCliTemplatesMutation,
  useDeleteProfilesMutation,
  useGetCliTemplateQuery,
  useUpdateCliTemplateMutation,
  useAssociateCliTemplateMutation,
  useBatchAssociateCliTemplateMutation,
  useBatchDisassociateCliTemplateMutation,
  useGetCliConfigExamplesQuery,
  useAddAclMutation,
  useAddVlanMutation,
  useGetSwitchConfigProfileQuery,
  useGetSwitchConfigProfileDetailQuery,
  useAddSwitchConfigProfileMutation,
  useUpdateSwitchConfigProfileMutation,
  useGetSwitchModelListQuery,
  useDownloadSwitchsCSVMutation
} = switchApi
