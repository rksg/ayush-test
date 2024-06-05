import {
  NewAPModel,
  NewApGroupViewModelExtended,
  TableResult,
  Venue,
  WifiNetwork
} from '@acx-ui/rc/utils'

export const aggregateApGroupVenueInfo = (
  apGroupList: TableResult<NewApGroupViewModelExtended>,
  venueList: TableResult<Venue>
) => {
  const apGroupListData = apGroupList.data
  const venueListData = venueList.data
  apGroupListData.forEach(apGroupItem => {
    apGroupItem.venueName = venueListData.find(venueItem =>
      venueItem.id === apGroupItem.venueId)?.name
  })
}

export const aggregateApGroupNetworkInfo = (
  apGroupList: TableResult<NewApGroupViewModelExtended>,
  networks: TableResult<WifiNetwork>
) => {
  apGroupList.data.forEach(apGroupItem => {
    apGroupItem.networkInfos = apGroupItem.wifiNetworkIds?.reduce(
      (result, currentValue) => {
        result[currentValue] = networks.data?.find(n => n.id === currentValue)?.name || ''
        return result
      }, {} as Record<string, string>)
  })
}

export const aggregateApGroupApInfo = (
  apGroupList: TableResult<NewApGroupViewModelExtended>,
  apList: TableResult<NewAPModel>
) => {
  apGroupList.data.forEach(apGroupItem => {
    apGroupItem.apInfos = apGroupItem.apSerialNumbers?.reduce(
      (result, apSerialNumber) => {
        result[apSerialNumber] = apList.data
          ?.find(n => n.serialNumber === apSerialNumber)?.name || ''
        return result
      }, {} as Record<string, string>)
  })
}