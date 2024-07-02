/* eslint-disable max-len */
import { FetchBaseQueryError }                              from '@reduxjs/toolkit/query'
import { cloneDeep, find, forIn, invert, isNil, set, uniq } from 'lodash'


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
  APExtended,
  GetApiVersionHeader,
  CommonRbacUrlsInfo,
  ApiVersionEnum,
  CommonUrlsInfo,
  CommonResult,
  WifiRbacUrlsInfo,
  NewApGroupViewModelResponseType,
  CapabilitiesApModel,
  ApModelTypeEnum
} from '@acx-ui/rc/utils'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { QueryFn }           from './servicePolicy.utils'
import { isPayloadHasField } from './utils'


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

const getApDeviceModelType = (apModelCapabilities?: CapabilitiesApModel) => {
  return isNil(apModelCapabilities?.isOutdoor)
    ? undefined
    : (apModelCapabilities.isOutdoor ? ApModelTypeEnum.OUTDOOR : ApModelTypeEnum.INDOOR)
}

export const aggregateApDeviceModelTypeInfo = (
  apList?: TableResult<NewAPModelExtended, ApExtraParams>,
  wifiCapabilities?: Capabilities
) => {
  const apListData = apList?.data
  apListData?.forEach(apItem => {
    apItem.deviceModelType = getApDeviceModelType(wifiCapabilities?.apModels.find(cap =>
      cap.model === apItem.model))
  })
}

const apOldNewFieldsMapping: Record<string, string> = {
  'apMac': 'macAddress',
  'deviceStatus': 'status',
  'deviceStatusSeverity': 'statusSeverity',
  'fwVersion': 'firmwareVersion',
  'deviceGroupId': 'apGroupId',
  'IP': 'networkStatus.ipAddress',
  'extIp': 'externalIpAddress',
  'clients': 'clientCount',
  'isMeshEnable': 'meshEnabled',
  'apRadioDeploy': 'radioStatuses',
  'apStatusData.lanPortStatus': 'lanPortStatuses',
  'apStatusData.APRadio': 'radioStatuses',
  'apStatusData.APSystem.uptime': 'uptime',
  'apStatusData.APSystem.ipType': 'networkStatus.ipAddressType',
  'apStatusData.APSystem.netmask': 'networkStatus.netmask',
  'apStatusData.APSystem.gateway': 'networkStatus.gateway',
  'apStatusData.APSystem.primaryDnsServer': 'networkStatus.primaryDnsServer',
  'apStatusData.APSystem.secondaryDnsServer': 'networkStatus.secondaryDnsServer',
  'apStatusData.APSystem.secureBootEnabled': 'supportSecureBoot',
  'apStatusData.APSystem.managementVlan': 'managementTrafficVlan',
  'apStatusData.afcInfo': 'afcStatus',
  'lastUpdTime': 'lastUpdatedTime'
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
    newPayload.fields = uniq((newPayload.fields as string[])?.map(field => getApNewFieldFromOld(field)))
  }
  if (newPayload.searchTargetFields) {
  // eslint-disable-next-line max-len
    newPayload.searchTargetFields = uniq((newPayload.searchTargetFields as string[])?.map(field => getApNewFieldFromOld(field)))
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

const parsingApFromNewType = (rbacAp: Record<string, unknown>, result:APExtended, parentPath: string[] = []) => {
  for(const key in rbacAp) {
    const value = rbacAp[key]
    const namePath = parentPath.concat(key)
    const oldApFieldNameExist = isNil(apNewOldFieldsMapping[namePath.join('.')]) === false

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (['lanPortStatuses', 'radioStatuses', 'tags'].includes(key) === false) continue
        const oldApFieldName = getApOldFieldFromNew(namePath.join('.'))

        if (key === 'tags') {
          set(result, oldApFieldName, value.join(','))
        } else {
          set(result, oldApFieldName, value.map(item => {
            switch(key) {
              case 'lanPortStatuses':
                return {
                  port: item.id,
                  phyLink: item.physicalLink
                }
              case 'radioStatuses':
                return {
                  radioId: item.id,
                  operativeChannelBandwidth: item.channelBandwidth,
                  Rssi: item.rssi,
                  band: item.band,
                  channel: item.channel,
                  txPower: item.transmitterPower
                }
              default:
                return undefined
            }
          }))
        }
      } else if (oldApFieldNameExist) {
        const oldApFieldName = getApOldFieldFromNew(namePath.join('.'))
        set(result, oldApFieldName, value)
      } else {
        parsingApFromNewType(value as Record<string, unknown>, result, namePath)
      }
    } else {
      const oldApFieldName = getApOldFieldFromNew(namePath.join('.'))
      set(result, oldApFieldName, value)
    }
  }
}

export const transformApFromNewType = (rbacAp: NewAPModel | undefined): APExtended | undefined=> {
  if (isNil(rbacAp)) return rbacAp

  const oldAp = {} as unknown as APExtended
  parsingApFromNewType(rbacAp as unknown as Record<string, unknown>, oldAp)
  oldAp.apRadioDeploy = rbacAp.radioStatuses?.length === 3 ? '2-5-6' : ''
  return oldAp
}

export const transformRbacApList = (rbacApList: TableResult<NewAPModel>): TableResult<APExtended, ApExtraParams> => {
  return {
    ...rbacApList,
    data: rbacApList.data.map(ap => transformApFromNewType(ap))
  } as TableResult<APExtended, ApExtraParams>
}

export const getApViewmodelListFn = (): QueryFn<CommonResult, RequestPayload> => {
  return async ({ payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const urlsInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
      const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
      const apsReq = createHttpRequest(urlsInfo.getApsList, undefined, customHeaders)

      const newPayload = enableRbac
        ? JSON.stringify(getNewApViewmodelPayloadFromOld(payload as Record<string, unknown>))
        : payload

      const apListQuery = await fetchWithBQ({ ...apsReq, body: newPayload })
      const apListData = apListQuery.data as TableResult<NewAPModel>

      // fetch venue name
      const venueIds = uniq(apListData.data.map(item => item.venueId).filter(item => item))
      if (venueIds.length && isPayloadHasField(payload, 'venueName')) {
        const venueListQuery = await fetchWithBQ({
          ...createHttpRequest(CommonRbacUrlsInfo.getVenuesList),
          body: {
            fields: ['name', 'id'],
            pageSize: 10000,
            filters: { id: venueIds }
          }
        })
        const venueList = venueListQuery.data as TableResult<Venue>
        aggregateVenueInfo(apListData as TableResult<NewAPModelExtended, ApExtraParams>, venueList)
      }

      const apGroupIds = uniq(apListData.data.map(item => item.apGroupId).filter(item => item))
      if (apGroupIds.length && isPayloadHasField(payload, 'apGroupName')) {
        const apGroupsListQuery = await fetchWithBQ({
          ...createHttpRequest(WifiRbacUrlsInfo.getApGroupsList),
          body: {
            fields: ['name', 'id'],
            pageSize: 10000,
            filters: { id: apGroupIds }
          }
        })
        const apGroupList = apGroupsListQuery.data as TableResult<NewApGroupViewModelResponseType>
        aggregateApGroupInfo(apListData as TableResult<NewAPModelExtended, ApExtraParams>, apGroupList as TableResult<ApGroup>)
      }

      if (isPayloadHasField(payload, 'deviceModelType')) {
        const wifiCapabilitiesQuery = await fetchWithBQ(createHttpRequest(WifiRbacUrlsInfo.getWifiCapabilities))
        const capabilitiesList = wifiCapabilitiesQuery.data as Capabilities
        aggregateApDeviceModelTypeInfo(apListData as TableResult<NewAPModelExtended, ApExtraParams>, capabilitiesList)
      }

      return { data: apListData }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}