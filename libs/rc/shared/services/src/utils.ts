import { TableResult, Transaction, onSocketActivityChanged } from '@acx-ui/rc/utils'
import { ApiInfo, DateRangeFilter, computeRangeFilter }      from '@acx-ui/utils'

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


type SocketActivityChangedParams = Parameters<typeof onSocketActivityChanged>

export async function handleCallbackWhenActivitySuccess (
  api: SocketActivityChangedParams[1],
  activityData: Transaction,
  targetUseCase: string,
  callback?: unknown
) {
  try {
    if (!callback || typeof callback !== 'function') return

    const response = await api.cacheDataLoaded

    if (!response) return

    if (
      activityData.useCase === targetUseCase &&
      activityData.steps?.find(step => step.id === targetUseCase)?.status !== 'IN_PROGRESS'
    ) {
      callback()
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

export function isJson (str: string) {
  try {
    JSON.parse(str)
    return true
  } catch (error) {
    return false
  }
}