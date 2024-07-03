/* eslint-disable max-len */
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { MaybePromise } from '@reduxjs/toolkit/dist/query/tsHelpers'
import { FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import { cloneDeep, find, forIn, invert, isNil, set, uniq } from 'lodash'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'
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
  WifiRbacUrlsInfo,
  NewApGroupViewModelResponseType,
  CapabilitiesApModel,
  ApModelTypeEnum,
  ApViewModel,
  RadioProperties,
  ApStatus
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { isPayloadHasField } from './utils'

const getApRadiosInfo = (apRadio: (NewAPModel['radioStatuses'] | ApStatus['APRadio']), enableRbac?: boolean) => {
  const nonRbac = apRadio as ApStatus['APRadio']
  const rbac = apRadio as NewAPModel['radioStatuses']

  const apRadioData = enableRbac ? rbac : nonRbac
  const keyField = (enableRbac ? 'id' : 'radioId') as keyof typeof apRadio

  const apRadio24 = find(apRadioData, r => r.band === ApRadioBands.band24)
  const apRadioU50 = find(apRadioData,
    r => r.band === ApRadioBands.band50 && r[keyField] === 2)
  const apRadio50 = !apRadioU50 && find(apRadioData,
    r => r.band === ApRadioBands.band50 && r[keyField] === 1)
  const apRadio60 = !apRadioU50 && find(apRadioData,
    r => r[keyField] === 2)
  const apRadioL50 = apRadioU50 && find(apRadioData,
    r => r.band === ApRadioBands.band50 && r[keyField] === 1)

  return {
    radio24: apRadio24,
    radioU50: apRadioU50,
    radio50: apRadio50,
    radio60: apRadio60,
    radioL50: apRadioL50
  }
}

const transformApViewModel = (result: ApViewModel) => {
  const ap = JSON.parse(JSON.stringify(result))
  ap.lastSeenTime = ap.lastSeenTime
    ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(ap.lastSeenTime)
    : '--'

  const { APSystem, APRadio } = ap.apStatusData || {}
  // get uptime field.
  if (APSystem && APSystem.uptime) {
    ap.uptime = formatter('longDurationFormat')(APSystem.uptime * 1000)
  } else {
    ap.uptime = '--'
  }

  // set Radio Properties fields.
  if (APRadio) {
    const radios = getApRadiosInfo(APRadio, false)

    ap.channel24 = radios.radio24 as RadioProperties
    ap.channel50 = radios.radio50 as RadioProperties
    ap.channelL50 = radios.radioL50 as RadioProperties
    ap.channelU50 = radios.radioU50 as RadioProperties
    ap.channel60 = radios.radio60 as RadioProperties
  } else {
    ap.channel24 = {
      Rssi: '--',
      channel: '--',
      txPower: '--'
    } as RadioProperties
    ap.channel50 = {
      Rssi: '--',
      channel: '--',
      txPower: '--'
    } as RadioProperties
  }
  return ap
}

const transformApList = (result: TableResult<APExtended, ApExtraParams>) => {
  let channelColumnStatus = {
    channel24: false,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  }

  result.data = result.data.map(item => {
    const { APRadio, lanPortStatus } = item.apStatusData || {}

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
      setAPRadioInfo(item, APRadio, channelColumnStatus, true)
    }

    if (lanPortStatus) {
      setPoEPortStatus(item, lanPortStatus, true)
    }

    return item
  })
  result.extra = channelColumnStatus
  return result
}

const setAPRadioInfo = (
  row: NewAPModelExtended,
  APRadio: NewAPModel['radioStatuses'] | ApStatus['APRadio'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  channelColumnShow: any,
  enableRbac?: boolean
) => {
  const radios = getApRadiosInfo(APRadio, enableRbac)

  row.channel24 = radios.radio24?.channel || undefined
  row.channel50 = (radios.radio50 && radios.radio50.channel) || undefined
  row.channelL50 = radios.radioL50?.channel || undefined
  row.channelU50 = radios.radioU50?.channel || undefined
  row.channel60 = (radios.radio60 && radios.radio60.channel) || undefined

  if (channelColumnShow) {
    if (!channelColumnShow.channel24 && radios.radio24) channelColumnShow.channel24 = true
    if (!channelColumnShow.channel50 && radios.radio50) channelColumnShow.channel50 = true
    if (!channelColumnShow.channelL50 && radios.radioL50) channelColumnShow.channelL50 = true
    if (!channelColumnShow.channelU50 && radios.radioU50) channelColumnShow.channelU50 = true
    if (!channelColumnShow.channel60 && radios.radio60) channelColumnShow.channel60 = true
  }
}

const setPoEPortStatus = (
  row: NewAPModelExtended,
  lanPortStatus: NewAPModel['lanPortStatuses'] | ApStatus['lanPortStatus'],
  enableRbac?: boolean
) => {
  if (!lanPortStatus) {
    return
  }

  const lanPortStatusData = enableRbac ? (lanPortStatus as NewAPModel['lanPortStatuses']) : (lanPortStatus as ApStatus['lanPortStatus'])
  const idField = (enableRbac ? 'id' : 'port') as keyof typeof lanPortStatusData
  const physicalLinkField = (enableRbac ? 'physicalLink' : 'phyLink') as keyof typeof lanPortStatusData

  const poeStatus = find(lanPortStatus, status => status[idField] === row.poePort)
  if (poeStatus) {
    const [poeStatusUp, poePortInfo] = (poeStatus[physicalLinkField] as string).split(' ')
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
    : (apModelCapabilities!.isOutdoor ? ApModelTypeEnum.OUTDOOR : ApModelTypeEnum.INDOOR)
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
  'apStatusData.afcInfo.powerMode': 'afcStatus.powerState', //?
  'apStatusData.afcInfo.afcStatus': 'afcStatus.afcState', //?
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
    newPayload.fields = uniq((newPayload.fields as string[])?.flatMap(field => {
      if (field === 'apStatusData') {
        // TODO: cellularInfo
        return ['networkStatus', 'lanPortStatuses', 'radioStatuses', 'afcStatus']
      } else if (field === 'apStatusData.APSystem') {
        return ['networkStatus', 'supportSecureBoot', 'managementTrafficVlan', 'uptime']
      }

      return getApNewFieldFromOld(field)
    }))
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

const parsingApFromNewType = (rbacAp: Record<string, unknown>, result: APExtended, parentPath: string[] = []) => {
  for (const key in rbacAp) {
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
            switch (key) {
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

export const transformApFromNewType = (rbacAp: NewAPModel | undefined): APExtended | undefined => {
  if (isNil(rbacAp)) return rbacAp

  const oldAp: APExtended = {} as APExtended
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type fetchWithBQType<ResultType> = (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<ResultType, FetchBaseQueryError, FetchBaseQueryMeta>>

const fetchApList = async ({ payload, enableRbac }: RequestPayload, fetchWithBQ: fetchWithBQType<unknown>) => {
  const urlsInfo = enableRbac ? CommonRbacUrlsInfo : CommonUrlsInfo
  const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
  const apsReq = createHttpRequest(urlsInfo.getApsList, undefined, customHeaders)

  try {
    if (enableRbac) {
      const newPayload = getNewApViewmodelPayloadFromOld(payload! as Record<string, unknown>)
      const apListQuery = await fetchWithBQ({ ...apsReq, body: JSON.stringify(newPayload) })
      const apListData = apListQuery.data as TableResult<NewAPModel>

      // fetch venue name
      const venueIds = uniq(apListData.data.map(item => item.venueId).filter(item => item))
      if (venueIds.length && isPayloadHasField(newPayload, 'venueName')) {
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
      if (apGroupIds.length && isPayloadHasField(newPayload, 'apGroupName')) {
        const apGroupsListQuery = await fetchWithBQ({
          ...createHttpRequest(WifiRbacUrlsInfo.getApGroupsList, customHeaders),
          body: JSON.stringify({
            fields: ['name', 'id'],
            pageSize: 10000,
            filters: { id: apGroupIds }
          })
        })
        const apGroupList = apGroupsListQuery.data as TableResult<NewApGroupViewModelResponseType>
        aggregateApGroupInfo(apListData as TableResult<NewAPModelExtended, ApExtraParams>, apGroupList as TableResult<ApGroup>)
      }

      if (isPayloadHasField(newPayload, 'deviceModelType')) {
        const wifiCapabilitiesQuery = await fetchWithBQ(createHttpRequest(WifiRbacUrlsInfo.getWifiCapabilities, customHeaders))
        const capabilitiesList = wifiCapabilitiesQuery.data as Capabilities
        aggregateApDeviceModelTypeInfo(apListData as TableResult<NewAPModelExtended, ApExtraParams>, capabilitiesList)
      }

      const rbacApList = transformRbacApList(transformApListFromNewModel(apListData))
      return { data: rbacApList as TableResult<APExtended, ApExtraParams> }
    } else {
      const apListQuery = await fetchWithBQ({ ...apsReq, body: payload })
      return { data: apListQuery.data as TableResult<APExtended, ApExtraParams> }
    }
  } catch (error) {
    return { error: error as FetchBaseQueryError }
  }
}

export const getApListFn = async (args: RequestPayload, fetchWithBQ: fetchWithBQType<unknown>) => {
  const result = await fetchApList(args, fetchWithBQ)
  if (result.error) {
    return result
  } else {
    result.data = transformApList(result.data)
    return result
  }
}

export const getApViewmodelListFn = async (args: RequestPayload, fetchWithBQ: fetchWithBQType<unknown>) => {
  const result = await fetchApList(args, fetchWithBQ)
  if (result.error) {
    return result
  } else {
    return { data: transformApViewModel((result.data as TableResult<ApViewModel>)?.data[0]) }
  }
}