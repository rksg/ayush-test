/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import {
  ClientList,
  ClientInfo,
  NetworkTypeEnum,
  networkTypes
} from '@acx-ui/rc/utils'
import { RequestPayload }            from '@acx-ui/types'
import { TableQuery, noDataDisplay } from '@acx-ui/utils'

import { RbacClientsTable } from './RbacClientsTable'

export const defaultRbacClientPayload = {
  searchString: '',
  searchTargetFields: [
    'macAddress','mldMacAddress','ipAddress',
    'username','hostname','osType',
    'networkInformation.ssid','networkInformation.vni', 'networkInformation.vlan'
  ],
  filters: {},
  fields: [
    'modelName', 'deviceType', 'osType', 'username', 'hostname',
    'macAddress', 'ipAddress','mldMacAddress', 'cpeMacAddress',
    'connectedTime', 'lastUpdatedTime',
    'venueInformation', 'apInformation', 'networkInformation', 'switchInformation',
    'signalStatus', 'radioStatus', 'trafficStatus', 'authenticationStatus', 'band',
    'identityId', 'identityName', 'identityGroupId', 'identityGroupName'
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
  return (
    <RbacClientsTable {...(props as ClientsTableProps<ClientInfo>)} />
  )
}
