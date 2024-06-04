import { NewApGroupViewModelExtended, TableResult, Venue } from '@acx-ui/rc/utils'

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
  const apGroupListData = apGroupList.data
  const apModels = networks
  apGroupListData.forEach(apGroupItem => {
    apGroupItem.networkNames = venueListData.find(venueItem =>
      venueItem.id === apGroupItem.venueId)?.name
  })
}

export const aggregateApGroupApInfo = (
  apGroupList: TableResult<NewApGroupViewModelExtended>,
  apList: TableResult<NewAPModel>
) => {
  const apListData = apGroupList.data
  const apGroupListData = apGroupList.data
  apListData.forEach(apItem => {
    apItem.apGroupName = apGroupListData.find(apGroupItem =>
      apGroupItem.id === apItem.apGroupId)?.name
  })
}