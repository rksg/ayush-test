import { find } from 'lodash'

import {
  CommonResult,
  TableResult,
  Transaction,
  TxStatus,
  onSocketActivityChanged,
  NetworkVenue,
  NetworkApGroup
} from '@acx-ui/rc/utils'
import { RequestPayload }                               from '@acx-ui/types'
import { ApiInfo, DateRangeFilter, computeRangeFilter } from '@acx-ui/utils'

import { ActionItem, comparePayload } from './servicePolicy.utils'


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

export async function handleCallbackWhenActivityDone (
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

// eslint-disable-next-line max-len
export const isPayloadHasField = (payload: RequestPayload['payload'], fields: string[] | string): boolean => {
  const typedPayload = payload as Record<string, unknown>
  const hasGroupBy = typedPayload?.groupBy
  // eslint-disable-next-line max-len
  const payloadFields = (hasGroupBy ? typedPayload.groupByFields : typedPayload.fields) as (string[] | undefined)
  return (Array.isArray(fields)
    ? fields.some(a => payloadFields?.includes(a))
    : payloadFields?.includes(fields)) ?? false
}

export function isFulfilled <T,> (p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> {
  return p.status === 'fulfilled'
}

export const apGroupsChangeSet = (newPayload: NetworkVenue, oldPayload: NetworkVenue) => {
  // eslint-disable-next-line max-len
  const itemProcessFn = (currentPayload: Record<string, unknown>, oldPayload: Record<string, unknown> | null, key: string, id: string) => {
    return {
      [key]: { new: currentPayload[key], old: oldPayload?.[key], id: id }
    } as ActionItem
  }

  const newApGroups = newPayload.apGroups as NetworkApGroup[]
  const oldApGroups = oldPayload.apGroups as NetworkApGroup[]

  const updateApGroups = [] as NetworkApGroup[]
  const addApGroups = [] as NetworkApGroup[]
  const deleteApGroups = [] as NetworkApGroup[]

  newApGroups.forEach((newApGroup: NetworkApGroup) => {
    const apGroupId = newApGroup.apGroupId as string
    const oldApGroup = find(oldApGroups, { apGroupId })
    const comparisonResult = comparePayload(
      newApGroup as unknown as Record<string, unknown>,
      oldApGroup as unknown as Record<string, unknown> || {},
      apGroupId,
      itemProcessFn
    )
    if (!oldApGroup) addApGroups.push(newApGroup)
    if (comparisonResult.updated.length) updateApGroups.push(newApGroup)
  })

  oldApGroups.forEach((oldApGroup: NetworkApGroup) => {
    const apGroupId = oldApGroup.apGroupId as string
    const newApGroup = find(newApGroups, { apGroupId })
    if (!newApGroup) deleteApGroups.push(oldApGroup)
  })

  // When user switch from "All APs" to "Select specific AP Groups" but the content remains the same
  if (addApGroups.length + updateApGroups.length + deleteApGroups.length === 0
    && oldPayload.isAllApGroups === true
    && newPayload.isAllApGroups === false) {
    addApGroups.push(...newApGroups)
  }

  return { addApGroups, updateApGroups, deleteApGroups }
}
