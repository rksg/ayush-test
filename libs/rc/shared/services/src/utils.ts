import { CommonResult, TableResult, Transaction, TxStatus, onSocketActivityChanged } from '@acx-ui/rc/utils'
import { ApiInfo, DateRangeFilter, computeRangeFilter }                              from '@acx-ui/utils'

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
  callback?: unknown,
  failedCallback?: unknown
) {
  try {
    if (!callback || typeof callback !== 'function') return

    const response = await api.cacheDataLoaded

    if (!response) return

    // eslint-disable-next-line max-len
    if ((response?.data as CommonResult)?.requestId === activityData.requestId && activityData.useCase === targetUseCase) {
      const status = activityData.steps?.find((step) => (step.id === targetUseCase))?.status

      if (status === TxStatus.FAIL) {
        ((failedCallback || callback) as Function)?.(response.data)
      } else if (status === TxStatus.SUCCESS) {
        (callback as Function)?.(response.data)
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}