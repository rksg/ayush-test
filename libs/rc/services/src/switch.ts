import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import _                                                  from 'lodash'

import {
  createHttpRequest,
  RequestFormData,
  RequestPayload,
  SwitchUrlsInfo,
  SwitchViewModel,
  SwitchPortViewModel,
  TableResult,
  STACK_MEMBERSHIP,
  onSocketActivityChanged,
  showActivityMessage
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
    switchList: build.query<TableResult<any>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const listInfo = {
          ...createHttpRequest(SwitchUrlsInfo.getSwitchList, arg.params),
          body: arg.payload
        }
        const listQuery = await fetchWithBQ(listInfo)
        const list = listQuery.data as TableResult<any>
        const stackMembers:{ [index:string]: any } = {}
        const stacks: string[] = []
        list.data.forEach(async (item:any) => {
          if(item.isStack || item.formStacking){
            stacks.push(item.serialNumber)
          }
        })
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
    deleteSwitches: build.mutation<any, RequestPayload>({
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

export const aggregatedSwitchListData = (switches: TableResult<any>,
  stackMembers:any) => {
  const data:any[] = []
  switches.data.forEach(item => {
    const tmp = {
      ...item,
      isFirstLevel: true
    }
    if (stackMembers[item.serialNumber]) {
      const tmpMember = _.cloneDeep(stackMembers[item.serialNumber])
      tmpMember.forEach((member:any, index:number) => {
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
  useDeleteSwitchesMutation,
  useSwitchDetailHeaderQuery,
  useSwitchPortlistQuery,
  useImportSwitchesMutation
} = switchApi
