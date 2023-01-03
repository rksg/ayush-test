import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import _                                                  from 'lodash'

import {
  createHttpRequest,
  RequestFormData,
  RequestPayload,
  SwitchUrlsInfo,
  SwitchViewModel,
  Acl,
  Vlan,
  SwitchPortViewModel,
  TableResult,
  Switch,
  STACK_MEMBERSHIP,
  onSocketActivityChanged,
  showActivityMessage,
  SwitchRow,
  StackMember,
  VeViewModel,
  VlanVePort,
  AclUnion,
  VeForm,
  TroubleshootingResult
} from '@acx-ui/rc/utils'

export const baseSwitchApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'switchApi',
  tagTypes: ['Switch'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
})

export const switchApi = baseSwitchApi.injectEndpoints({
  endpoints: (build) => ({
    switchList: build.query<TableResult<SwitchRow>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const listInfo = {
          ...createHttpRequest(SwitchUrlsInfo.getSwitchList, arg.params),
          body: arg.payload
        }
        const listQuery = await fetchWithBQ(listInfo)
        const list = listQuery.data as TableResult<SwitchRow>
        const stackMembers:{ [index:string]: StackMember[] } = {}
        const stacks: string[] = []
        list.data.forEach(async (item:SwitchRow) => {
          if(item.isStack || item.formStacking){
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

        const aggregatedList = aggregatedSwitchListData(list, stackMembers)

        return listQuery.data
          ? { data: aggregatedList }
          : { error: listQuery.error as FetchBaseQueryError }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Switch', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'Delete Switch'
          ]
          showActivityMessage(msg, activities, () => {
            api.dispatch(switchApi.util.invalidateTags([{ type: 'Switch', id: 'LIST' }]))
          })
        })
      }
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
      }
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
    switchDetailHeader: build.query<SwitchViewModel, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchDetailHeader, params)
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
      }
    }),
    addSwitch: build.mutation<Switch, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addSwitch, params)
        return {
          ...req,
          body: payload
        }
      }
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
      }
    }),
    getSwitchRoutedList: build.query<TableResult<VeViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchRoutedList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Switch', id: 'VE' }]
    }),
    getVenueRoutedList: build.query<TableResult<VeViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getVenueRoutedList, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getVlanListBySwitchLevel: build.query<TableResult<Vlan>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getVlanListBySwitchLevel, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getSwitchAcls: build.query<Acl[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.getSwitchAcls, params)
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
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Switch', id: 'LIST' }]
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
    addVePort: build.mutation<VeForm, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SwitchUrlsInfo.addVePort, params)
        return {
          ...req,
          body: payload
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
        const req = createHttpRequest(SwitchUrlsInfo.getTroubleshooting, params)
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
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.ipRoute, params)
        return {
          ...req
        }
      }
    }),
    macTable: build.query<TroubleshootingResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SwitchUrlsInfo.macTable, params)
        return {
          ...req
        }
      }
    })

  })
})

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

export const aggregatedSwitchListData = (switches: TableResult<SwitchRow>,
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

export const {
  useSwitchListQuery,
  useStackMemberListQuery,
  useDeleteSwitchesMutation,
  useSwitchDetailHeaderQuery,
  useImportSwitchesMutation,
  useGetVlansByVenueQuery,
  useLazyGetVlansByVenueQuery,
  useSwitchPortlistQuery,
  useSaveSwitchMutation,
  useAddSwitchMutation,
  useAddStackMemberMutation,
  useGetSwitchListQuery,
  useLazyGetSwitchListQuery,
  useGetVenueRoutedListQuery,
  useGetSwitchRoutedListQuery,
  useGetFreeVePortVlansQuery,
  useLazyGetFreeVePortVlansQuery,
  useGetAclUnionQuery,
  useAddVePortMutation,
  useUpdateVePortMutation,
  useGetSwitchQuery,
  useDeleteVePortsMutation,
  useGetSwitchAclsQuery,
  useGetVlanListBySwitchLevelQuery
} = switchApi
