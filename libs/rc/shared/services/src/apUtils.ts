/* eslint-disable max-len */
import { cloneDeep, find, forIn, invert, set } from 'lodash'

import {
  ApRadioBands,
  ApExtraParams,
  ApGroup,
  Capabilities,
  NewAPModel,
  NewAPModelExtended,
  Venue,
  TableResult,
  FILTER,
  APExtended
} from '@acx-ui/rc/utils'


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

export const aggregateVenueInfo = (
  apList?: TableResult<NewAPModelExtended, ApExtraParams>,
  venueList?: TableResult<Venue>
) => {
  const apListData = apList?.data
  const venueListData = venueList?.data
  apListData?.forEach(apItem => {
    apItem.venueName = venueListData?.find(venueItem =>
      venueItem.id === apItem.venueId)?.name
  })
}

export const aggregatePoePortInfo = (
  apList?: TableResult<NewAPModelExtended, ApExtraParams>,
  capabilities?: Capabilities
) => {
  const apListData = apList?.data
  const apModels = capabilities?.apModels
  apListData?.forEach(apItem => {
    const portId = apModels?.find(apModelItem =>
      apModelItem.model === apItem.model)?.lanPorts
      .find(lanPort => lanPort.isPoePort)?.id
    apItem.poePort = String(Number(portId) - 1)
  })
}

export const aggregateApGroupInfo = (
  apList?: TableResult<NewAPModelExtended, ApExtraParams>,
  apGroupList?: TableResult<ApGroup>
) => {
  const apListData = apList?.data
  const apGroupListData = apGroupList?.data
  apListData?.forEach(apItem => {
    apItem.apGroupName = apGroupListData?.find(apGroupItem =>
      apGroupItem.id === apItem.apGroupId)?.name
  })
}

const apOldNewFieldsMapping: Record<string, string> = {
  'apMac': 'macAddress',
  'deviceStatus': 'status',
  'deviceStatusSeverity': 'statusSeverity',
  'fwVersion': 'firmwareVersion',
  'deviceGroupId': 'apGroupId',
  'IP': 'networkStatus.ipAddress',
  'clients': 'clientCount',
  'apStatusData.lanPortStatus': 'lanPortStatuses'
}

const apNewOldFieldsMapping = invert(apOldNewFieldsMapping)

export const getApNewFieldFromOld = (oldFieldName: string) => {
  return apOldNewFieldsMapping[oldFieldName] ?? oldFieldName
}

export const getApOldFieldFromNew = (newFieldName: string) => {
  return apNewOldFieldsMapping[newFieldName] ?? newFieldName
}

export const getNewApViewmodelPayloadFromOld = (payload: Record<string, unknown>) => {
  const newPayload = cloneDeep(payload) as Record<string, unknown>

  if (newPayload.fields) {
    // eslint-disable-next-line max-len
    newPayload.fields = (newPayload.fields as string[])?.map(field => getApNewFieldFromOld(field))
  }
  if (newPayload.searchTargetFields) {
  // eslint-disable-next-line max-len
    newPayload.searchTargetFields = (newPayload.searchTargetFields as string[])?.map(field => getApNewFieldFromOld(field))
  }

  newPayload.sortField = getApNewFieldFromOld(payload.sortField as string)

  if (payload.filters) {
    const filters = {} as FILTER
    forIn(payload.filters, (val, key) => {
      filters[getApNewFieldFromOld(key)] = val
    })
    newPayload.filters = filters
  }

  return newPayload
}

export const transformApFromNewType = (rbacAp: NewAPModel): APExtended => {
  const oldAp = {} as Record<string, unknown>
  for(const [key, value] of Object.entries(rbacAp)) {
    const oldApFieldName = getApOldFieldFromNew(key)
    set(oldAp, oldApFieldName, value)
  }
  return oldAp as unknown as APExtended
}

export const transformRbacApList = (rbacApList: TableResult<NewAPModel>): TableResult<APExtended, ApExtraParams> => {
  return {
    ...rbacApList,
    data: rbacApList.data.map(ap => transformApFromNewType(ap))
  } as TableResult<APExtended, ApExtraParams>
}