/* eslint-disable max-len */
import { find, uniqueId } from 'lodash'

import {
  ApExtraParams,
  ApRadioBands,
  Capabilities,
  NewAPExtendedGrouped,
  NewApGroupViewModelResponseType,
  NewAPModel,
  NewAPModelExtended,
  TableResult,
  Venue
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'


export const transformApListFromNewModel = (
  result: TableResult<NewAPModelExtended, ApExtraParams>
) => {
  let channelColumnStatus = {
    channel24: false,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  }

  result.data = result.data.map(item => {
    const APRadio = item.radioStatuses
    const lanPortStatus = item.lanPortStatuses

    if (APRadio) {
      setAPRadioInfo(item, APRadio, channelColumnStatus)
    }

    if (lanPortStatus) {
      setPoEPortStatus(item, lanPortStatus)
    }

    return item
  })
  result.extra = channelColumnStatus
  return result
}

export const transformGroupByListFromNewModel = (
  groupedApList: TableResult<NewAPExtendedGrouped, ApExtraParams>,
  apGroupList?: TableResult<NewApGroupViewModelResponseType>
) => {
  const result = {
    ...groupedApList
  } as TableResult<NewAPExtendedGrouped, ApExtraParams>
  const { $t } = getIntl()
  let channelColumnStatus = {
    channel24: false,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  }

  result.data = groupedApList.data?.map(item => {
    let newItem = { ...item, children: [] as NewAPModelExtended[], serialNumber: uniqueId() }
    let clientCount = 0
    const aps = item.aps?.map(ap => {
      clientCount += (ap.clientCount ?? 0)
      const APRadio = item.radioStatuses
      const lanPortStatus = item.lanPortStatuses

      if (APRadio) {
        setAPRadioInfo(ap, APRadio, channelColumnStatus)
      }
      if (lanPortStatus) {
        setPoEPortStatus(ap, lanPortStatus)
      }
      return ap
    })
    newItem.children = aps
    newItem.members = aps?.length ?? 0
    newItem.incidents = 0 // not implemented in the legacy version, so it returns 0 as well
    newItem.clients = clientCount
    newItem.networks = { count: calculateNetworkCount(aps, apGroupList?.data) }
    const firstApItem = aps?.[0]
    switch(item.groupedField) {
      case 'status':
        newItem.status = firstApItem?.status
        break
      case 'model':
        if(item.groupedValue) {
          newItem.model = firstApItem?.model ?? ''
        } else {
          newItem.model = $t({ defaultMessage: 'Ungrouped APs' })
        }
        break
      case 'apGroupId':
        const targetApGroup = apGroupList?.data.find(apGroup =>
          apGroup.id === item.groupedValue)
        newItem.apGroupName = targetApGroup?.name
        newItem.apGroupId = item.groupedValue
        newItem.deviceGroupName = targetApGroup?.name // For the legacy usage of editing/deleting apGroup
        newItem.deviceGroupId = item.groupedValue // For the legacy usage of editing/deleting apGroup
        newItem.venueId = targetApGroup?.venueId // For the legacy usage of editing/deleting apGroup
        break
    }
    return newItem
  }).filter(item => item) as NewAPExtendedGrouped[]
  result.extra = channelColumnStatus
  return result
}

const setAPRadioInfo = (
  row: NewAPModelExtended,
  APRadio: NewAPModel['radioStatuses'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  channelColumnShow: any
) => {

  const apRadio24 = find(APRadio, r => r.band === ApRadioBands.band24)
  const apRadioU50 = find(APRadio,
    r => r.band === ApRadioBands.band50 && r.id === 2)
  const apRadio50 = !apRadioU50 && find(APRadio,
    r => r.band === ApRadioBands.band50 && r.id === 1)
  const apRadio60 = !apRadioU50 && find(APRadio,
    r => r.id === 2)
  const apRadioL50 = apRadioU50 && find(APRadio,
    r => r.band === ApRadioBands.band50 && r.id === 1)

  row.channel24 = apRadio24?.channel || undefined
  row.channel50 = (apRadio50 && apRadio50.channel) || undefined
  row.channelL50 = apRadioL50?.channel || undefined
  row.channelU50 = apRadioU50?.channel || undefined
  row.channel60 = (apRadio60 && apRadio60.channel) || undefined


  if (channelColumnShow) {
    if (!channelColumnShow.channel24 && apRadio24) channelColumnShow.channel24 = true
    if (!channelColumnShow.channel50 && apRadio50) channelColumnShow.channel50 = true
    if (!channelColumnShow.channelL50 && apRadioL50) channelColumnShow.channelL50 = true
    if (!channelColumnShow.channelU50 && apRadioU50) channelColumnShow.channelU50 = true
    if (!channelColumnShow.channel60 && apRadio60) channelColumnShow.channel60 = true
  }

}

const setPoEPortStatus = (
  row: NewAPModelExtended,
  lanPortStatus: NewAPModel['lanPortStatuses']
) => {
  //console.log(row, lanPortStatus)
  if (!lanPortStatus) {
    return
  }

  const poeStatus = find(lanPortStatus, status => status.id === row.poePort)
  if (poeStatus) {
    const [poeStatusUp, poePortInfo] = poeStatus.physicalLink.split(' ')
    row.hasPoeStatus = !!poeStatus
    row.isPoEStatusUp = poeStatusUp.includes('Up')
    row.poePortInfo = poePortInfo
  }
}

const calculateNetworkCount = (
  aps: NewAPModelExtended[],
  apGroupList?: NewApGroupViewModelResponseType[]
) => {
  const networkSet = new Set<string>()
  aps.forEach(ap => {
    const targetApGroup = apGroupList?.find(apGroup => apGroup.id === ap.apGroupId)
    targetApGroup?.wifiNetworkIds?.forEach(networkSet.add, networkSet)
  })
  return networkSet.size
}

export const aggregateVenueInfo = (
  apList?: TableResult<NewAPModelExtended|NewAPExtendedGrouped, ApExtraParams>,
  venueList?: TableResult<Venue>
) => {
  const apListData = apList?.data
  const venueListData = venueList?.data
  apListData?.forEach(apItem => {
    if(apItem.hasOwnProperty('groupedField')) {
      (apItem as NewAPExtendedGrouped).aps.forEach(groupedAp => {
        groupedAp.venueName = venueListData?.find(venueItem =>
          venueItem.id === groupedAp.venueId)?.name
      })
    } else {
      apItem.venueName = venueListData?.find(venueItem =>
        venueItem.id === apItem.venueId)?.name
    }
  })
}

export const aggregatePoePortInfo = (
  apList?: TableResult<NewAPModelExtended|NewAPExtendedGrouped, ApExtraParams>,
  capabilities?: Capabilities
) => {
  const apListData = apList?.data
  const apModels = capabilities?.apModels
  apListData?.forEach(apItem => {
    if(apItem.hasOwnProperty('groupedField')) {
      (apItem as NewAPExtendedGrouped).aps.forEach(groupedAp => {
        const portId = apModels?.find(apModelItem =>
          apModelItem.model === groupedAp.model)?.lanPorts
          .find(lanPort => lanPort.isPoePort)?.id
        groupedAp.poePort = String(Number(portId) - 1)
      })
    } else {
      const portId = apModels?.find(apModelItem =>
        apModelItem.model === apItem.model)?.lanPorts
        .find(lanPort => lanPort.isPoePort)?.id
      apItem.poePort = String(Number(portId) - 1)
    }
  })
}

export const aggregateApGroupInfo = (
  apList?: TableResult<NewAPModelExtended|NewAPExtendedGrouped, ApExtraParams>,
  apGroupList?: TableResult<NewApGroupViewModelResponseType>
) => {
  const apListData = apList?.data
  const apGroupListData = apGroupList?.data
  apListData?.forEach(apItem => {
    if(apItem.hasOwnProperty('groupedField')) {
      (apItem as NewAPExtendedGrouped).aps.forEach(groupedAp => {
        groupedAp.apGroupName = apGroupListData?.find(apGroupItem =>
          apGroupItem.id === groupedAp.apGroupId)?.name
      })
    } else {
      apItem.apGroupName = apGroupListData?.find(apGroupItem =>
        apGroupItem.id === apItem.apGroupId)?.name
    }
  })
}