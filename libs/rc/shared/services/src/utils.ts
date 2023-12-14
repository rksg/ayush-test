import { CONFIG_TEMPLATE_TYPE_PARAM_NAME, TableResult }                    from '@acx-ui/rc/utils'
import { ApiInfo, DateRangeFilter, computeRangeFilter, createHttpRequest } from '@acx-ui/utils'

type MetaBase = { id: string }

export function getMetaList<T extends MetaBase> (
  list: TableResult<T>,
  metaListInfo: { urlInfo: ApiInfo, fields: string[] }
) {
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

export function latestTimeFilter (payload: unknown) {
  const { filters, ...body } = payload! as { filters: { dateFilter?: DateRangeFilter } }
  return { ...body, filters: computeRangeFilter(filters, ['fromTime', 'toTime']) }
}


// eslint-disable-next-line max-len
export function createConfigTemplateHttpRequestOrFallback (...args: Parameters<typeof createHttpRequest>) {
  const [ originalApiInfo, params, ...restArgs ] = args

  if (!params || !params.hasOwnProperty(CONFIG_TEMPLATE_TYPE_PARAM_NAME)) {
    return createHttpRequest(...args)
  }

  const newApiInfo: ApiInfo = {
    ...originalApiInfo,
    url: '/templates' + originalApiInfo.url
  }
  return createHttpRequest(newApiInfo, params, ...restArgs)
}