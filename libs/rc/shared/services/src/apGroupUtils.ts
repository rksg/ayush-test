import { omit } from 'lodash'
import _        from 'lodash'

import {
  ApDeep,
  ApGroup,
  ApGroupViewModel,
  CountAndNames,
  NewAPModel,
  NewApGroupViewModelResponseType,
  NewGetApGroupResponseType,
  TableResult,
  Venue,
  WifiNetwork
} from '@acx-ui/rc/utils'

export const getApGroupNewFieldFromOld = (oldFieldName: string) => {
  switch(oldFieldName) {
    case 'members':
    case 'aps':
      return'apSerialNumbers'
    case 'networks':
      return 'wifiNetworkIds'
    case 'clients':
      return 'clientCount'
    default:
      return oldFieldName
  }
}

export const getNewApGroupViewmodelPayloadFromOld = (payload: Record<string, unknown>) => {
  const newPayload = _.cloneDeep(payload) as Record<string, unknown>

  if (newPayload.fields) {
    // eslint-disable-next-line max-len
    newPayload.fields = _.uniq((newPayload.fields as string[])?.map(field => getApGroupNewFieldFromOld(field)))
  }
  if (newPayload.searchTargetFields) {
  // eslint-disable-next-line max-len
    newPayload.searchTargetFields = _.uniq((newPayload.searchTargetFields as string[])?.map(field => getApGroupNewFieldFromOld(field)))
  }

  newPayload.sortField = getApGroupNewFieldFromOld(payload.sortField as string)

  if (payload.filters) {
    const filters = {} as Record<string, unknown>
    _.forIn(payload.filters, (val, key) => {
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