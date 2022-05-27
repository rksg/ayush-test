import { FetchBaseQueryError }               from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery }         from '@reduxjs/toolkit/query/react'
import { ApiInfo, createHttpRequest }        from 'libs/rc/utils/src/api.service'
import { CommonUrlsInfo }                    from 'libs/rc/utils/src/common.urls'

export const alarmsListApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'alarmsListApi',
  tagTypes: ['Alarms'],
  endpoints: (build) => ({
    alarmsList: build.query<any, any>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const alarmsListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getAlarmsList, arg.params),
          body: arg.payload
        }
        const baseListQuery = await fetchWithBQ(alarmsListInfo)
        const baseList = baseListQuery.data as any

        const metaListInfo = {
          urlInfo: createHttpRequest(CommonUrlsInfo.getAlarmsListMeta, arg.params),
          fields: ['venueName', 'apName', 'switchName']
        } as any
        const metaListQuery = await fetchWithBQ(getMetaList(baseList, metaListInfo))
        const metaList = metaListQuery.data as any

        const aggregatedList = getAggregatedList(baseList, metaList)
        return metaListQuery.data
          ? { data: aggregatedList }
          : { error: metaListQuery.error as FetchBaseQueryError }
      }
    })
  })
})
export const {
  useAlarmsListQuery
} = alarmsListApi


export const getMetaList = function (list: any,
  metaListInfo: { urlInfo: ApiInfo, fields: string[]}) {
  const httpRequest = metaListInfo.urlInfo
  const body = {
    fields: metaListInfo.fields,
    filters: {
      id: list.data.map((item: { id: string }) => item.id)
    }
  }
  return {
    ...httpRequest, body
  }
}

export const getAggregatedList = function (baseList: { data: [] }, metaList: { data: [] }) {
  baseList.data.forEach((result: any) => {
    let msg = JSON.parse(result.message).message_template
    let msgMeta = metaList.data.filter((d: any) => d.id === result.id)[0]
    Object.assign(result, msgMeta)
    const placeholder = '@@'
    const matches = msg.match(new RegExp(`${placeholder}\\w+`, 'g'))
    for (const match of matches) {
      const key = match.replace(placeholder, '')
      msg = msg.replace(match, result[key])
    }
    result.message = msg
  })

  return baseList
}
