import { omit, uniq, cloneDeep, forIn } from 'lodash'

import {
  ApDeep,
  ApGroup,
  ApGroupViewModel,
  CountAndNames,
  FILTER,
  NewAPModel,
  NewApGroupViewModelResponseType,
  NewGetApGroupResponseType,
  TableResult,
  Venue,
  WifiNetwork
} from '@acx-ui/rc/utils'

const apGroupOldNewFieldsMapping: Record<string, string> = {
  aps: 'apSerialNumbers',
  members: 'apSerialNumbers',
  networks: 'wifiNetworkIds',
  clients: 'clientCount'
}

export const getApGroupNewFieldFromOld = (oldFieldName: string) => {
  return apGroupOldNewFieldsMapping[oldFieldName] ?? oldFieldName
}

export const getNewApGroupViewmodelPayloadFromOld = (payload: Record<string, unknown>) => {
  const newPayload = cloneDeep(payload) as Record<string, unknown>

  if (newPayload.fields) {
    // eslint-disable-next-line max-len
    newPayload.fields = uniq((newPayload.fields as string[])?.map(field => getApGroupNewFieldFromOld(field)))
  }
  if (newPayload.searchTargetFields) {
  // eslint-disable-next-line max-len
    newPayload.searchTargetFields = uniq((newPayload.searchTargetFields as string[])?.map(field => getApGroupNewFieldFromOld(field)))
  }

  newPayload.sortField = getApGroupNewFieldFromOld(payload.sortField as string)

  if (payload.filters) {
    const filters = {} as FILTER
    forIn((payload.filters as FILTER), (val, key) => {
      filters[getApGroupNewFieldFromOld(key)] = val
    })
    newPayload.filters = filters
  }

  return newPayload
}

export const transformApGroupFromNewType = (newApGroup: NewGetApGroupResponseType,
  apsList: TableResult<NewAPModel>)=> {
  return {
    ...omit(newApGroup, ['apSerialNumbers']),
    aps: apsList.data
  } as unknown as ApGroup
}

export const aggregateApGroupVenueInfo = (
  apGroupList: TableResult<ApGroupViewModel>,
  venueList: TableResult<Venue>
) => {
  const venueListData = venueList.data
  apGroupList.data.forEach(apGroupItem => {
    apGroupItem.venueName = venueListData.find(venueItem =>
      venueItem.id === apGroupItem.venueId)?.name
  })
}

export const aggregateApGroupNetworkInfo = (
  apGroupList: TableResult<ApGroupViewModel>,
  rbacApGroupList: TableResult<NewApGroupViewModelResponseType>,
  networks: TableResult<WifiNetwork>
) => {
  apGroupList.data.forEach(apGroupItem => {
    const groupItem = rbacApGroupList.data.find(item => item.id === apGroupItem.id)
    apGroupItem.networks = {
      count: groupItem?.wifiNetworkIds?.length ?? 0,
      names: groupItem?.wifiNetworkIds?.map((id) => {
        return networks.data?.find(n => n.id === id)?.name
      }).filter(i => !!i) ?? []
    } as CountAndNames
  })
}

export const aggregateApGroupApInfo = (
  apGroupList: TableResult<ApGroupViewModel>,
  rbacApGroupList: TableResult<NewApGroupViewModelResponseType>,
  apList: TableResult<NewAPModel>
) => {
  apGroupList.data.forEach(apGroupItem => {
    const groupItem = rbacApGroupList.data.find(item => item.id === apGroupItem.id)
    apGroupItem.aps = groupItem?.apSerialNumbers?.map((apSerialNumber) => ({
      serialNumber: apSerialNumber,
      name: apList.data?.find(n => n.serialNumber === apSerialNumber)?.name
    }) as ApDeep)
    apGroupItem.members = {
      count: groupItem?.apSerialNumbers?.length ?? 0,
      names: groupItem?.apSerialNumbers?.map((apSerialNumber) => {
        return apList.data
          ?.find(n => n.serialNumber === apSerialNumber)?.name
      }).filter(i => !!i) ?? []
    } as CountAndNames
  })
}