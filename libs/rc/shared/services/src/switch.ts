import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import _                       from 'lodash'

import { Filter }                    from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  RequestFormData,
  SaveSwitchProfile,
  SwitchUrlsInfo,
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
  enableNewApi,
  downloadFile,
  SEARCH,
  SORTER
} from '@acx-ui/rc/utils'
import { baseSwitchApi }     from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

export type SwitchsExportPayload = {
  filters: Filter
  tenantId: string
} & SEARCH & SORTER

export const switchApi = baseSwitchApi.injectEndpoints({
  endpoints: (build) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    switchList: build.query<TableResult<SwitchRow>, RequestPayload<any>>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const hasGroupBy = !!arg.payload?.groupBy
        const req = hasGroupBy
          ? createHttpRequest(SwitchUrlsInfo.getSwitchListByGroup, arg.params)
          : createHttpRequest(SwitchUrlsInfo.getSwitchList, arg.params)
        const listInfo = {
          ...req,
          body: arg.payload
        }
        const listQuery = await fetchWithBQ(listInfo)
        const list = listQuery.data as TableResult<SwitchRow>
        const stackMembers:{ [index:string]: StackMember[] } = {}
        const stacks: string[] = []
        if(!list) return { error: listQuery.error as FetchBaseQueryError }

        list.data.forEach(async (item:SwitchRow) => {
          if(hasGroupBy){
            item.children = item.switches
            item.switches?.forEach((i:SwitchRow) => {
              if(i.isStack || i.formStacking){
                stacks.push(i.serialNumber)
              }
            })
          }else if(item.isStack || item.formStacking){
            stacks.push(item.serialNumber)
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allStacksMember:any = await Promise.all(stacks.map(id =>
          fetchWithBQ(genStackMemberPayload(arg, id))
        ))
        stacks.forEach((id:string, index:number) => {
          stackMembers[id] = allStacksMember[index]?.data.data
        })

        const aggregatedList = hasGroupBy
          ? aggregatedSwitchGroupByListData(list, stackMembers)
          : aggregatedSwitchListData(list, stackMembers)

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
            api.dispatch(switchApi.util.invalidateTags([{ type: 'Switch', id: 'LIST' }]))
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
    deleteSwitches: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteSwitches, params)
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
      invalidatesTags: [{ type: 'Switch', id: 'Detail' }, { type: 'Switch', id: 'StackMemberList' }]
    }),
    acknowledgeSwitch: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.acknowledgeSwitch, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'Detail' }, { type: 'Switch', id: 'StackMemberList' }]
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.syncData, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    syncSwitchesData: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.syncSwitchesData, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    retryFirmwareUpdate: build.mutation<SwitchRow, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.retryFirmwareUpdate, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    switchDetailHeader: build.query<SwitchViewModel, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchDetailHeader, params)
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
    switchRearView: build.query<SwitchRearView, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getSwitchRearView,
          params
        )
        return {
          ...req
        }
      }
    }),
    switchPortlist: build.query<TableResult<SwitchPortViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getSwitchPortlist,
          params
        )
        return {
          ...req,
          body: payload
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getCliTemplates,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchOnDemandCli', id: 'LIST' }]
    }),
    deleteCliTemplates: build.mutation<SwitchCliTemplateModel, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteCliTemplates, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchOnDemandCli', id: 'LIST' }]
    }),
    addSwitch: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addSwitch, params)
        return {
          ...req,
          body: enableNewApi(SwitchUrlsInfo.addSwitch) ? [payload] : payload
        }
      }
    }),
    convertToStack: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.convertToStack, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getPortSetting: build.query<PortSettingModel, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getPortSetting, params)
        return enableNewApi(SwitchUrlsInfo.getPortSetting) ? { ...req, body: payload } : { ...req }
      },
      transformResponse: (result: PortsSetting | PortSettingModel) => {
        const res = _.get(result, 'response')
        return Array.isArray(res) ? res.pop() : result
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchPort', id: 'Setting' }]
    }),
    getPortsSetting: build.query<PortsSetting, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getPortsSetting,
          params
        )
        return {
          ...req,
          body: payload
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchPort', id: 'Setting' }]
    }),
    getDefaultVlan: build.query<SwitchDefaultVlan[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getDefaultVlan,
          params
        )
        if (enableNewApi(SwitchUrlsInfo.getDefaultVlan)) {
          payload = { isDefault: true, switchIds: payload }
        }
        return {
          ...req,
          body: payload
        }
      }
    }),
    getSwitchVlanUnionByVenue: build.query<SwitchVlan[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchVlanUnionByVenue, params)
        return {
          ...req
        }
      }
    }),
    getSwitchVlan: build.query<SwitchVlanUnion, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchVlanUnion, params)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchVlan', id: 'LIST' }]
    }),
    getSwitchVlans: build.query<Vlan[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchVlans, params)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchVlan', id: 'LIST' }]
    }),
    getSwitchesVlan: build.query<SwitchVlanUnion, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SwitchUrlsInfo.getSwitchesVlan,
          params
        )
        return {
          ...req,
          body: payload
        }
      }
    }),
    getTaggedVlansByVenue: build.query<SwitchVlans[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getTaggedVlansByVenue, params)
        return enableNewApi(SwitchUrlsInfo.getTaggedVlansByVenue) ?
          { ...req, body: params } : { ...req }
      }
    }),
    getUntaggedVlansByVenue: build.query<SwitchVlans[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getUntaggedVlansByVenue, params)
        return enableNewApi(SwitchUrlsInfo.getUntaggedVlansByVenue) ?
          { ...req, body: params } : { ...req }
      }
    }),
    getSwitchConfigurationProfileByVenue: build.query<SwitchProfile[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchConfigurationProfileByVenue, params)
        return {
          ...req
        }
      }
    }),
    savePortsSetting: build.mutation<SaveSwitchProfile[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.savePortsSetting, params)
        return {
          ...req,
          body: payload
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
      query: ({ params, payload }) => {
        const switchListReq = createHttpRequest(SwitchUrlsInfo.getSwitchList, params)
        return {
          ...switchListReq,
          body: payload
        }
      }
    }),
    getSwitchConfigBackupList: build.query<TableResult<ConfigurationBackup>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchConfigBackupList, params)
        return {
          ...req,
          body: payload
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addBackup, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchBackup', id: 'LIST' }]
    }),
    restoreConfigBackup: build.mutation<ConfigurationBackup, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.restoreBackup, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'SwitchBackup', id: 'LIST' }]
    }),
    downloadConfigBackup: build.mutation<{ response: string }, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.downloadSwitchConfig, params)
        return {
          ...req
        }
      }
    }),
    deleteConfigBackups: build.mutation<ConfigurationBackup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteBackups, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchBackup', id: 'LIST' }]
    }),
    getSwitchConfigHistory: build.query<TableResult<ConfigurationHistory>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchConfigHistory, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (res: { response:{ list:ConfigurationHistory[], totalCount:number } }, meta
        , arg: { payload:{ page:number } }) => {
        return {
          data: res.response.list ? res.response.list.map(item => ({
            ...item,
            startTime: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.startTime),
            configType: transformConfigType(item.configType),
            dispatchStatus: transformConfigStatus(item.dispatchStatus)
          })) : [],
          totalCount: res.response.totalCount,
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
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getVlansByVenue, params)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchVlan', id: 'LIST' }]
    }),
    getSwitchRoutedList: build.query<TableResult<VeViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchRoutedList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Switch', id: 'VE' }],
      extraOptions: { maxRetries: 5 }
    }),
    getVenueRoutedList: build.query<TableResult<VeViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getVenueRoutedList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Switch', id: 'VE' }],
      extraOptions: { maxRetries: 5 }
    }),
    getVlanListBySwitchLevel: build.query<TableResult<Vlan>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getVlanListBySwitchLevel, params)
        return {
          ...req,
          body: payload
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    getSwitchAcls: build.query<TableResult<Acl>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchAcls, params)
        return {
          ...req,
          body: payload
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    getJwtToken: build.query<JwtToken, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getJwtToken, params)
        return {
          ...req
        }
      }
    }),
    saveSwitch: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addSwitch, params)
        return {
          ...req,
          body: enableNewApi(SwitchUrlsInfo.addSwitch) ? [payload] : payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LIST' }]
    }),
    updateSwitch: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateSwitch, params)
        return {
          ...req,
          body: payload
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
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getFreeVePortVlans, params)
        return {
          ...req
        }
      }
    }),
    getAclUnion: build.query<AclUnion, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getAclUnion, params)
        return {
          ...req
        }
      }
    }),
    addAcl: build.mutation<Acl, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addAcl, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    addVlan: build.mutation<Vlan, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addVlan, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    addVePort: build.mutation<VeForm, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addVePort, params)
        return {
          ...req,
          body: enableNewApi(SwitchUrlsInfo.addVePort) ? [payload] : payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'VE' }]
    }),
    updateVePort: build.mutation<VeForm, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateVePort, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'VE' }]
    }),
    getSwitch: build.query<Switch, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitch, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Switch', id: 'SWITCH' }]
    }),
    getSwitchModelList: build.query<TableResult<Switch>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchModelList, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deleteVePorts: build.mutation<VeForm, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteVePorts, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'VE' }]
    }),
    getSwitchStaticRoutes: build.query<StaticRoute[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getStaticRoutes, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Switch', id: 'ROUTES' }]
    }),
    addSwitchStaticRoute: build.mutation<StaticRoute, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addStaticRoute, params)
        return {
          ...req,
          body: enableNewApi(SwitchUrlsInfo.addStaticRoute) ? [payload] : payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'ROUTES' }]
    }),
    updateSwitchStaticRoute: build.mutation<StaticRoute, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateStaticRoute, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'ROUTES' }]
    }),
    deleteSwitchStaticRoutes: build.mutation<StaticRoute, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteStaticRoutes, params)
        return {
          ...req,
          body: payload
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
        const listInfo = {
          ...createHttpRequest(SwitchUrlsInfo.getSwitchClientList, arg.params),
          body: arg.payload
        }
        const listQuery = await fetchWithBQ(listInfo)
        const list = listQuery.data as TableResult<SwitchClient>

        const switchesInfo = {
          ...createHttpRequest(SwitchUrlsInfo.getSwitchList, arg.params),
          body: {
            fields: ['name', 'venueName', 'id', 'switchMac', 'switchName'],
            filters: { id: _.uniq(list.data.map(c=>c.switchId)) },
            pageSize: 10000
          }
        }
        const switchesQuery = await fetchWithBQ(switchesInfo)
        const switches = switchesQuery.data as TableResult<SwitchRow>

        const aggregatedList = aggregatedSwitchClientData(list, switches)

        return listQuery.data
          ? { data: aggregatedList }
          : { error: listQuery.error as FetchBaseQueryError }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SwitchClient', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getSwitchClientDetails: build.query<SwitchClient, RequestPayload>({
      query: ({ params }) => {
        const clientListReq = createHttpRequest(SwitchUrlsInfo.getSwitchClientDetail, params)
        if (enableNewApi(SwitchUrlsInfo.getSwitchClientDetail)) {
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
            ...clientListReq, body: payload
          }
        }
        return {
          ...clientListReq
        }
      },
      transformResponse: (result: SwitchClient | TableResult<SwitchClient>) => {
        const res = _.get(result, 'data')
        return Array.isArray(res) ? res.pop() : result
      }
    }),
    getTroubleshooting: build.query<TroubleshootingResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getTroubleshooting, params)
        return {
          ...req
        }
      }
    }),
    getTroubleshootingClean: build.query<{}, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getTroubleshootingClean, params)
        return {
          ...req
        }
      }
    }),
    ping: build.mutation<TroubleshootingResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.ping, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    traceRoute: build.mutation<TroubleshootingResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.traceRoute, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    ipRoute: build.mutation<TroubleshootingResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.ipRoute, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    macAddressTable: build.mutation<TroubleshootingResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.macAddressTable, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateDhcpServerState: build.mutation<{}, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateDhcpServerState, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'DETAIL' }]
    }),
    getLagList: build.query<Lag[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getLagList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Switch', id: 'LAG' }]
    }),
    updateLag: build.mutation<Lag, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateLag, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LAG' }]
    }),
    addLag: build.mutation<Lag, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addLag, params)
        return {
          ...req,
          body: enableNewApi(SwitchUrlsInfo.addLag) ? [payload] : payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LAG' }]
    }),
    deleteLag: build.mutation<Lag, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteLag, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LAG' }]
    }),
    getDhcpPools: build.query<TableResult<SwitchDhcp>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getDhcpPools, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Switch', id: 'DHCP' }],
      extraOptions: { maxRetries: 5 }
    }),
    getDhcpServer: build.query<SwitchDhcp, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getDhcpServer, params)
        return {
          ...req
        }
      }
    }),
    createDhcpServer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addDhcpServer, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'DHCP' }]
    }),
    updateDhcpServer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateDhcpServer, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'DHCP' }]
    }),
    deleteDhcpServers: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.deleteDhcpServers, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'DHCP' }]
    }),
    getDhcpLeases: build.query<SwitchDhcpLease[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const doDhcpServerLeaseTableInfo = {
          ...createHttpRequest(SwitchUrlsInfo.dhcpLeaseTable, arg.params)
        }
        const infoResult = await fetchWithBQ(doDhcpServerLeaseTableInfo)
        if (infoResult.error)
          return { error: infoResult.error as FetchBaseQueryError }

        const pollingDhcpLease = async () => {
          const getDhcpLeasesInfo = createHttpRequest(SwitchUrlsInfo.getDhcpLeases, arg.params)
          let ret = await fetchWithBQ(getDhcpLeasesInfo)
          let result = ret.data as TroubleshootingResult

          while (result?.response.syncing) {
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getCliTemplate, params)
        return {
          ...req,
          body: payload
        }
      },
      keepUnusedDataFor: 0
    }),
    addCliTemplate: build.mutation<CliConfiguration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addCliTemplate, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchOnDemandCli', id: 'LIST' }]
    }),
    getCliConfigExamples: build.query<CliTemplateExample[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getCliConfigExamples, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateCliTemplate: build.mutation<CliConfiguration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.updateCliTemplate, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SwitchOnDemandCli', id: 'LIST' }]
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
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchProfileList, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    downloadSwitchsCSV: build.mutation<Blob, SwitchsExportPayload>({
      query: (payload) => {
        const req = createHttpRequest(SwitchUrlsInfo.downloadSwitchsCSV,
          { tenantId: payload.tenantId }
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



const genStackMemberPayload = (arg:RequestPayload<unknown>, serialNumber:string) => {
  return {
    ...createHttpRequest(SwitchUrlsInfo.getMemberList, arg.params),
    body: {
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
        activeUnitId: [serialNumber]
      }
    }
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
  switches: TableResult<SwitchRow>
) => {
  const data:SwitchClient[] = clients.data.map(item => {
    const target = switches.data.find(s => s.id === item.switchId)
    return { ...item, switchId: target ? item.switchId : '' } // use switchId to mark non-exist switch
  })
  return {
    ...clients,
    data
  }
}

export const {
  useSwitchListQuery,
  useStackMemberListQuery,
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
  useGetProfilesQuery,
  useGetCliFamilyModelsQuery,
  useAddCliTemplateMutation,
  useDeleteCliTemplatesMutation,
  useDeleteProfilesMutation,
  useGetCliTemplateQuery,
  useUpdateCliTemplateMutation,
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
