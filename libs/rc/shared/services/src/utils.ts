import { find, isEqual, omit } from 'lodash'

import {
  CommonResult,
  TableResult,
  Transaction,
  TxStatus,
  onSocketActivityChanged,
  NetworkVenue,
  NetworkApGroup,
  EventBase
} from '@acx-ui/rc/utils'
import { RequestPayload }                               from '@acx-ui/types'
import { ApiInfo, DateRangeFilter, computeRangeFilter } from '@acx-ui/utils'


type MetaBase = { id: string }

export function getMetaList<T extends MetaBase> (
  list: TableResult<T>,
  metaListInfo: { urlInfo: ApiInfo, fields: string[], filters?: { [key: string]: unknown; } }
) {
  const httpRequest = metaListInfo.urlInfo
  const body = {
    fields: metaListInfo.fields,
    filters: {
      id: list.data.map((item: { id: string }) => item.id),
      fromTime: metaListInfo.filters?.['fromTime'],
      toTime: metaListInfo.filters?.['toTime'],
      alarmType: metaListInfo.filters?.['alarmType']
    }
  }
  return {
    ...httpRequest, body
  }
}

export function getMetaDetailsList<T extends EventBase> (
  list: TableResult<T>,
  metaListInfo: { urlInfo: ApiInfo, fields: string[], filters?: { [key: string]: unknown; } }
) {
  const httpRequest = metaListInfo.urlInfo
  const body = {
    fields: metaListInfo.fields,
    filters: {
      idIndex: list.data.map((item) => ({
        index: item.indexName,
        id: item.id
      }))
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
interface handleCallbackWhenActivityProps {
  api: SocketActivityChangedParams[1],
  activityData: Transaction,
  useCase: string,
  stepName?: string,
  callback?: unknown,
  failedCallback?: unknown
}
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
      activityData.steps?.find(step => step.id === targetUseCase)?.status !== TxStatus.IN_PROGRESS
    ) {
      callback()
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

export async function handleCallbackWhenActivityDone (props: handleCallbackWhenActivityProps) {
  const { api, activityData, useCase, stepName, callback, failedCallback } = props

  try {
    if (!callback || typeof callback !== 'function') return

    const response = await api.cacheDataLoaded

    if (!response) return

    const targetStepName = stepName || useCase
    // eslint-disable-next-line max-len
    if ((response?.data as CommonResult)?.requestId === activityData.requestId && activityData.useCase === useCase) {
      const status = activityData.steps?.find((step) => (step.id === targetStepName))?.status

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

type ApGroupVlanPoolParams = {
  venueId?: string
  networkId?: string
  apGroupId?: string
  profileId: string
}

export const compareApGroupPayload = (
  currentPayload: NetworkApGroup,
  oldPayload: NetworkApGroup
) => {
  const skipCompareFieldName = ['vlanPoolId', 'vlanPoolName']
  const newApGroup = omit(currentPayload, skipCompareFieldName)
  const oldApGroup = omit(oldPayload, skipCompareFieldName)

  return isEqual(newApGroup, oldApGroup)
}

export const apGroupsChangeSet = (newPayload: NetworkVenue, oldPayload: NetworkVenue) => {
  const newApGroups = newPayload.apGroups as NetworkApGroup[]
  const oldApGroups = oldPayload.apGroups as NetworkApGroup[]

  const updateApGroups = [] as NetworkApGroup[]
  const addApGroups = [] as NetworkApGroup[]
  const deleteApGroups = [] as NetworkApGroup[]
  const activatedVlanPoolParamsList = [] as ApGroupVlanPoolParams[]
  const deactivatedVlanPoolParamsList = [] as ApGroupVlanPoolParams[]

  newApGroups.forEach((newApGroup: NetworkApGroup) => {
    const apGroupId = newApGroup.apGroupId as string
    const oldApGroup = find(oldApGroups, { apGroupId })

    if (!oldApGroup) {
      addApGroups.push(newApGroup)
      // activiate vlan pooling
      if (newApGroup.vlanPoolId) {
        activatedVlanPoolParamsList.push({
          venueId: newApGroup.venueId ?? newPayload.venueId,
          networkId: newApGroup.networkId ?? newPayload.networkId,
          apGroupId: newApGroup.apGroupId,
          profileId: newApGroup.vlanPoolId
        })
      }
    } else {
      const isTheSame = compareApGroupPayload(newApGroup, oldApGroup)
      if (!isTheSame) updateApGroups.push(newApGroup)

      if (!newApGroup.vlanPoolId && oldApGroup.vlanPoolId) {
        deactivatedVlanPoolParamsList.push({
          venueId: oldApGroup.venueId ?? oldPayload.venueId,
          networkId: oldApGroup.networkId ?? oldPayload.networkId,
          apGroupId: oldApGroup.apGroupId,
          profileId: oldApGroup.vlanPoolId
        })
      } else if (newApGroup.vlanPoolId && (newApGroup.vlanPoolId !== oldApGroup.vlanPoolId)) {
        activatedVlanPoolParamsList.push({
          venueId: newApGroup.venueId ?? newPayload.venueId,
          networkId: newApGroup.networkId ?? newPayload.networkId,
          apGroupId: newApGroup.apGroupId,
          profileId: newApGroup.vlanPoolId
        })
      }
    }
  })

  oldApGroups.forEach((oldApGroup: NetworkApGroup) => {
    const apGroupId = oldApGroup.apGroupId as string
    const newApGroup = find(newApGroups, { apGroupId })
    if (!newApGroup) deleteApGroups.push(oldApGroup)
  })

  return {
    addApGroups,
    updateApGroups,
    deleteApGroups,
    activatedVlanPoolParamsList,
    deactivatedVlanPoolParamsList
  }
}
