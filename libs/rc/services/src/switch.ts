import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import {
  createHttpRequest,
  RequestFormData,
  RequestPayload,
  SwitchUrlsInfo,
  SwitchViewModel,
  SwitchPortViewModel,
  TableResult,
  STACK_MEMBERSHIP
} from '@acx-ui/rc/utils'
import _ from 'lodash'

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
        list.data.forEach(async(item:any, index:number) => {
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
      }
    }),
    stackMemberList: build.query<TableResult<any>, RequestPayload>({
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
        "activeUnitId",
        "unitId",
        "unitStatus",
        "check-all",
        "name",
        "deviceStatus",
        "model",
        "activeSerial",
        "switchMac",
        "ipAddress",
        "venueName",
        "uptime",
        "cog",
        "id",
        "serialNumber",
        "venueId",
        "switchName",
        "configReady",
        "syncedSwitchConfig",
        "syncDataId",
        "operationalWarning",
        "cliApplied",
        "suspendingDeployTime"
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
  useStackMemberListQuery,
  useSwitchDetailHeaderQuery,
  useSwitchPortlistQuery,
  useImportSwitchesMutation
} = switchApi
