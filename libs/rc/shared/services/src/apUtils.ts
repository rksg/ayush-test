/* eslint-disable max-len */
import { QueryReturnValue }                                                from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { MaybePromise }                                                    from '@reduxjs/toolkit/dist/query/tsHelpers'
import { FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta }              from '@reduxjs/toolkit/query'
import { cloneDeep, find, forIn, invert, isNil, set, uniq, get, uniqueId } from 'lodash'

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
  ApStatus,
  FloorPlanMeshAP,
  ApPosition,
  APExtendedGrouped
} from '@acx-ui/rc/utils'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { isFulfilled, isPayloadHasField } from './utils'

const getApRadiosInfo = (apRadio: (NewAPModel['radioStatuses'] | ApStatus['APRadio']), enableRbac?: boolean) => {
  const nonRbac = apRadio as ApStatus['APRadio']
  const rbac = apRadio as NewAPModel['radioStatuses']

  const apRadioData = enableRbac ? rbac : nonRbac
  const keyField = (enableRbac ? 'id' : 'radioId') as keyof typeof apRadio

  const apRadio24 = find(apRadioData, r => get(r, 'band') === ApRadioBands.band24)
  const apRadioU50 = find(apRadioData,
    r => get(r, 'band') === ApRadioBands.band50 && r[keyField] === 2)
  const apRadio50 = !apRadioU50 && find(apRadioData,
    r => get(r, 'band') === ApRadioBands.band50 && r[keyField] === 1)
  const apRadio60 = !apRadioU50 && find(apRadioData,
    r => r[keyField] === 2)
  const apRadioL50 = apRadioU50 && find(apRadioData,
    r => get(r, 'band') === ApRadioBands.band50 && r[keyField] === 1)

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
      setAPRadioInfo(item as unknown as NewAPModelExtended, APRadio, channelColumnStatus)
    }

    if (lanPortStatus) {
      setPoEPortStatus(item as unknown as NewAPModelExtended, lanPortStatus)
    }

    return item
  })
  result.extra = channelColumnStatus
  return result
}

const transformGroupByList = (result: TableResult<APExtendedGrouped, ApExtraParams>) => {
  let channelColumnStatus = {
    channel24: false,
    channel50: false,
    channelL50: false,
    channelU50: false,
    channel60: false
  }
  result.data = result.data.map(item => {
    let newItem = { ...item, children: [] as APExtended[], serialNumber: uniqueId() }
    const aps = (item as unknown as { aps: APExtended[] }).aps?.map(ap => {
      const { APRadio, lanPortStatus } = ap.apStatusData || {}

      if (APRadio) {
        setAPRadioInfo(ap as unknown as NewAPModelExtended, APRadio, channelColumnStatus)
      }
      if (lanPortStatus) {
        setPoEPortStatus(ap as unknown as NewAPModelExtended, lanPortStatus)
      }
      return ap
    })
    newItem.children = aps as unknown as APExtended[]
    return newItem
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

  row.channel24 = get(radios.radio24, 'channel') || undefined
  row.channel50 = get(radios.radio50, 'channel') || undefined
  row.channelL50 = get(radios.radioL50, 'channel') || undefined
  row.channelU50 = get(radios.radioU50, 'channel') || undefined
  row.channel60 = get(radios.radio60, 'channel') || undefined

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

const apSystemNamePathHeading = 'apStatusData.APSystem'
const cellularInfoNamePathHeading = 'apStatusData.cellularInfo'
const apOldNewFieldsMapping: Record<string, string> = {
  'apMac': 'macAddress',
  'deviceStatus': 'status',
  'deviceStatusSeverity': 'statusSeverity',
  'fwVersion': 'firmwareVersion',
  'deviceGroupId': 'apGroupId',
  'deviceGroupName': 'apGroupName',
  'IP': 'networkStatus.ipAddress',
  'extIp': 'networkStatus.externalIpAddress',
  'clients': 'clientCount',
  'isMeshEnable': 'meshEnabled',
  'apRadioDeploy': 'radioStatuses',
  'lastUpdTime': 'lastUpdatedTime',
  'apStatusData.lanPortStatus': 'lanPortStatuses',
  'apStatusData.APRadio': 'radioStatuses',
  [`${apSystemNamePathHeading}.uptime`]: 'uptime',
  [`${apSystemNamePathHeading}.ipType`]: 'networkStatus.ipAddressType',
  [`${apSystemNamePathHeading}.netmask`]: 'networkStatus.netmask',
  [`${apSystemNamePathHeading}.gateway`]: 'networkStatus.gateway',
  [`${apSystemNamePathHeading}.primaryDnsServer`]: 'networkStatus.primaryDnsServer',
  [`${apSystemNamePathHeading}.secondaryDnsServer`]: 'networkStatus.secondaryDnsServer',
  [`${apSystemNamePathHeading}.secureBootEnabled`]: 'supportSecureBoot',
  [`${apSystemNamePathHeading}.managementVlan`]: 'networkStatus.managementTrafficVlan',
  'apStatusData.afcInfo.powerMode': 'afcStatus.powerState', //?
  'apStatusData.afcInfo.afcStatus': 'afcStatus.afcState', //?
  [cellularInfoNamePathHeading]: 'cellularStatus',
  [`${cellularInfoNamePathHeading}.cellularCountry`]: 'cellularStatus.country',
  [`${cellularInfoNamePathHeading}.cellularOperator`]: 'cellularStatus.operator',
  [`${cellularInfoNamePathHeading}.cellularActiveSim`]: 'cellularStatus.activeSim',
  [`${cellularInfoNamePathHeading}.cellularIMEI`]: 'cellularStatus.imei',
  [`${cellularInfoNamePathHeading}.cellularLTEFirmware`]: 'cellularStatus.lteFirmware',
  [`${cellularInfoNamePathHeading}.cellularConnectionStatus`]: 'cellularStatus.connectionStatus',
  [`${cellularInfoNamePathHeading}.cellular3G4GChannel`]: 'cellularStatus.connectionChannel',
  [`${cellularInfoNamePathHeading}.cellularBand`]: 'cellularStatus.rfBand',
  [`${cellularInfoNamePathHeading}.cellularWanInterface`]: 'cellularStatus.wanInterface',
  [`${cellularInfoNamePathHeading}.cellularIPaddress`]: 'cellularStatus.ipAddress',
  [`${cellularInfoNamePathHeading}.cellularSubnetMask`]: 'cellularStatus.netmask',
  [`${cellularInfoNamePathHeading}.cellularDefaultGateway`]: 'cellularStatus.gateway',
  [`${cellularInfoNamePathHeading}.cellularRoamingStatus`]: 'cellularStatus.roamingStatus',
  [`${cellularInfoNamePathHeading}.cellularRadioUptime`]: 'cellularStatus.radioUptime',
  [`${cellularInfoNamePathHeading}.cellularUplinkBandwidth`]: 'cellularStatus.uplinkBandwidth',
  [`${cellularInfoNamePathHeading}.cellularDownlinkBandwidth`]: 'cellularStatus.downlinkBandwidth',
  [`${cellularInfoNamePathHeading}.cellularSignalStrength`]: 'cellularStatus.signalStrength',
  [`${cellularInfoNamePathHeading}.cellularECIO`]: 'cellularStatus.ecio',
  [`${cellularInfoNamePathHeading}.cellularRSCP`]: 'cellularStatus.rscp',
  [`${cellularInfoNamePathHeading}.cellularRSRP`]: 'cellularStatus.rsrp',
  [`${cellularInfoNamePathHeading}.cellularRSRQ`]: 'cellularStatus.rsrq',
  [`${cellularInfoNamePathHeading}.cellularSINR`]: 'cellularStatus.sinr'
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
    const newFields: string[] = uniq((newPayload.fields as string[])?.flatMap(field => {
      if (field === 'apStatusData') {
        return ['networkStatus', 'lanPortStatuses', 'radioStatuses', 'afcStatus', 'cellularStatus']
      } else if (field === apSystemNamePathHeading) {
        return ['networkStatus', 'supportSecureBoot', 'uptime']
      }

      return getApNewFieldFromOld(field)
    }))

    if (!newFields.includes('venueId'))
      newFields.push('venueId')

    if (newFields.includes('apGroupName') && !newFields.includes('apGroupId'))
      newFields.push('apGroupId')

    if ((newFields.includes('xPercent') || newFields.includes('yPercent')) && !newFields.includes('floorplanId'))
      newFields.push('floorplanId')

    newPayload.fields = newFields
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

const parsingCellularSimStatusFromNewType = (result: APExtended, namePathStr: string, value: unknown) => {
  const simIdx = namePathStr === 'cellularStatus.primarySimStatus' ? 0 : 1

  Object.entries(value as Record<string, unknown>).map(([fieldKey, fieldVal]) => {
    let targetOldFieldName:string = ''
    let newVal = fieldVal
    switch(fieldKey) {
      case 'iccid':
        targetOldFieldName = `cellularICCIDSIM${simIdx}`
        break
      case 'imsi':
        targetOldFieldName = `cellularIMSISIM${simIdx}`
        break
      case 'txBytes':
        targetOldFieldName = `cellularTxBytesSIM${simIdx}`
        newVal = (fieldVal ?? 0)+''
        break
      case 'rxBytes':
        targetOldFieldName = `cellularRxBytesSIM${simIdx}`
        newVal = (fieldVal ?? 0)+''
        break
      case 'cardRemovalCount':
        targetOldFieldName = `cellularCardRemovalCountSIM${simIdx}`
        newVal = (fieldVal ?? 0)+''
        break
      case 'dhcpTimeoutCount':
        targetOldFieldName = `cellularDHCPTimeoutCountSIM${simIdx}`
        newVal = (fieldVal ?? 0)+''
        break
      case 'networkLostCount':
        targetOldFieldName = `cellularNWLostCountSIM${simIdx}`
        newVal = (fieldVal ?? 0)+''
        break
      case 'switchCount':
        targetOldFieldName = `cellularSwitchCountSIM${simIdx}`
        newVal = (fieldVal ?? 0)+''
        break
      default:
        break
    }

    if (targetOldFieldName)
      set(result, `${cellularInfoNamePathHeading}.${targetOldFieldName}`, newVal)
  })
}

const parsingCellularStatusFromNewType = (result: APExtended, value: unknown) => {
  const isSim0Present = isNil(get(value, 'primarySimStatus')) ? 'NO' : 'YES'
  set(result, `${cellularInfoNamePathHeading}.cellularIsSIM0Present`, isSim0Present)

  const isSim1Present = isNil(get(value, 'secondarySimStatus')) ? 'NO' : 'YES'
  set(result, `${cellularInfoNamePathHeading}.cellularIsSIM1Present`, isSim1Present)

  Object.entries(value as Record<string, unknown>).forEach(([fieldKey, fieldVal]) => {
    const namePathStr = ['cellularStatus'].concat(fieldKey).join('.')

    if (fieldKey === 'primarySimStatus' || fieldKey === 'secondarySimStatus') {
      parsingCellularSimStatusFromNewType(result, namePathStr, fieldVal)
    } else {
      const oldApFieldName = getApOldFieldFromNew(namePathStr)
      set(result, oldApFieldName, fieldVal)
    }
  })
}

const parsingApFromNewType = (rbacAp: Record<string, unknown>, result: APExtended, parentPath: string[] = []) => {
  for (const key in rbacAp) {
    const value = rbacAp[key]
    const namePath = parentPath.concat(key)
    const namePathStr = namePath.join('.')
    const oldApFieldNameExist = isNil(apNewOldFieldsMapping[namePathStr]) === false
    const oldApFieldName = getApOldFieldFromNew(namePathStr)

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (['lanPortStatuses', 'radioStatuses', 'tags'].includes(key) === false) continue

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
      } else if (key === 'cellularStatus') {
        parsingCellularStatusFromNewType(result, value)
      } else if (oldApFieldNameExist) {
        // const oldApFieldName = getApOldFieldFromNew(namePath.join('.'))
        set(result, oldApFieldName, value)
      } else {
        parsingApFromNewType(value as Record<string, unknown>, result, namePath)
      }
    } else {
      // const oldApFieldName = getApOldFieldFromNew(namePath.join('.'))
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

const fetchApList = async ({ params, payload, enableRbac }: RequestPayload, fetchWithBQ: fetchWithBQType<unknown>) => {
  try {
    const typedPayload = payload as Record<string, unknown>
    if (enableRbac) {
      const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
      const apsReq = createHttpRequest(CommonRbacUrlsInfo.getApsList, undefined, customHeaders)

      const newPayload = getNewApViewmodelPayloadFromOld(typedPayload)
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

      if (isPayloadHasField(newPayload, 'xPercent') || isPayloadHasField(newPayload, 'yPercent')) {
        await fetchAppendApPositions(apListData as TableResult<FloorPlanMeshAP>, fetchWithBQ)
      }

      const rbacApList = transformRbacApList(transformApListFromNewModel(apListData as TableResult<NewAPModelExtended, ApExtraParams>))
      return { data: rbacApList as TableResult<APExtended, ApExtraParams> }
    } else {
      const hasGroupBy = typedPayload?.groupBy
      const fields = hasGroupBy ? typedPayload.groupByFields : typedPayload.fields
      const apsReq = hasGroupBy
        ? createHttpRequest(CommonUrlsInfo.getApGroupsListByGroup, params)
        : createHttpRequest(CommonUrlsInfo.getApsList, params)

      const apListQuery = await fetchWithBQ({ ...apsReq, body: { ...typedPayload, fields } })
      return { data: apListQuery.data as TableResult<APExtended | APExtendedGrouped, ApExtraParams> }
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
    if((args?.payload as Record<string, unknown>)?.groupBy) {
      result.data = transformGroupByList(result.data as TableResult<APExtendedGrouped, ApExtraParams>)
    } else {
      result.data = transformApList(result.data)
    }
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

export const fetchAppendApPositions = async (apListData: TableResult<FloorPlanMeshAP>, fetchWithBQ: fetchWithBQType<unknown>) => {
  const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
  const floorPlanAps = apListData.data.filter(item => item.floorplanId)

  const positionReqs = floorPlanAps.map(ap => {
    if (!ap.floorplanId) return

    const floorplanReq = createHttpRequest(
      CommonRbacUrlsInfo.GetApPosition,
      {
        venueId: ap.venueId,
        floorplanId: ap.floorplanId,
        serialNumber: ap.serialNumber
      },
      customHeaders
    )
    return fetchWithBQ(floorplanReq)
  })

  const allData = await Promise.allSettled(positionReqs)
  allData.filter(isFulfilled).forEach((p, idx) => {
    const targetIdx = apListData.data.findIndex(item => item.serialNumber === floorPlanAps[idx].serialNumber)
    apListData.data[targetIdx].xPercent = (p.value?.data as ApPosition).xPercent
    apListData.data[targetIdx].yPercent = (p.value?.data as ApPosition).yPercent
  })
}