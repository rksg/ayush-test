/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ClientList,
  TableQuery,
  ClientInfo,
  NetworkTypeEnum,
  networkTypes
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'
import { noDataDisplay }  from '@acx-ui/utils'

import { ClientsTable }     from './ClientsTable'
import { RbacClientsTable } from './RbacClientsTable'

export const defaultClientPayload = {
  searchString: '',
  searchTargetFields: ['clientMac','mldAddr','ipAddress','Username','hostname','ssid','clientVlan','osType','vni'],
  filters: {},
  fields: [
    'hostname','osType','healthCheckStatus','clientMac','ipAddress','Username','serialNumber','venueId','switchSerialNumber',
    'ssid','wifiCallingClient','sessStartTime','clientAnalytics','clientVlan','deviceTypeStr','modelName','totalTraffic',
    'trafficToClient','trafficFromClient','receiveSignalStrength','rssi','radio.mode','cpeMac','authmethod','status',
    'encryptMethod','packetsToClient','packetsFromClient','packetsDropFrom','radio.channel',
    'cog','venueName','apName','clientVlan','networkId','switchName','healthStatusReason','lastUpdateTime', 'networkType', 'mldAddr', 'vni', 'apMac']
}

export const defaultRbacClientPayload = {
  searchString: '',
  searchTargetFields: ['macAddress','mldMacAddress','ipAddress','username','hostname','osType','networkInformation.ssid','networkInformation.vni', 'networkInfornation.vlan'],
  filters: {},
  fields: [
    'modelName', 'deviceType', 'osType', 'username', 'hostname',
    'macAddress', 'ipAddress','mldMacAddress', 'cpeMacAddress',
    'connectedTime', 'lastUpdatedTime',
    'venueInformation', 'apInformation', 'networkInformation', 'switchInformation',
    'signalStatus', 'radioStatus', 'trafficStatus', 'authenticationStatus', 'band'
  ]
}


export const networkDisplayTransformer = (intl: ReturnType<typeof useIntl>, networkType?: string) => {
  if(!networkType) return noDataDisplay
  const displayText = networkTypes[networkType as NetworkTypeEnum]
  if(displayText) {
    return intl.$t(displayText)
  } else {
    return networkType
  }
}

export const isEqualCaptivePortal = (networkType?: string) : boolean => {
  if(!networkType){
    return false
  }
  return networkType === NetworkTypeEnum.CAPTIVEPORTAL
}


export interface ClientsTableProps<T> {
  showAllColumns?: boolean,
  searchString?: string,
  setConnectedClientCount?: (connectClientCount: number) => void,
  tableQuery?: TableQuery<T, RequestPayload<unknown>, unknown>
}

export const ConnectedClientsTable = (props: ClientsTableProps<ClientList|ClientInfo>) => {
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  return (isWifiRbacEnabled?
    <RbacClientsTable {...(props as ClientsTableProps<ClientInfo>)} /> :
    <ClientsTable {...(props as ClientsTableProps<ClientList>)} />
  )
}
