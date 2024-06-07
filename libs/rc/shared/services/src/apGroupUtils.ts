import { omit } from 'lodash'

import {
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
      return'apSerialNumbers'
    case 'networks':
      return 'wifiNetworkIds'
    case 'clients':
      return 'clientCount'
    default:
      return oldFieldName
  }
}

export const getNewApGroupViewmodelFieldsFromOld = (oldFields?: string[]) => {
  return oldFields?.map(field => getApGroupNewFieldFromOld(field))
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
    apGroupItem.members = {
      count: groupItem?.wifiNetworkIds?.length ?? 0,
      names: groupItem?.wifiNetworkIds?.map((id) => {
        return networks.data?.find(n => n.id === id)?.name
      }).filter(i => !!i)
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
    apGroupItem.networks = {
      count: groupItem?.apSerialNumbers?.length ?? 0,
      names: groupItem?.apSerialNumbers?.map((apSerialNumber) => {
        return apList.data
          ?.find(n => n.serialNumber === apSerialNumber)?.name
      }).filter(i => !!i)
    } as CountAndNames
  })
}