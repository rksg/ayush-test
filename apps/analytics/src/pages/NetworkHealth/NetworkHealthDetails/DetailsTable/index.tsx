import { MessageDescriptor } from 'react-intl'

import { Table, Loader } from '@acx-ui/components'

import { authMethodsByCode }            from '../../authMethods'
import {  useNetworkHealthTestResults } from '../../services'
import { stage }                        from '../../stages'
import {
  ClientType,
  NetworkHealthConfig,
  TestResultByAP,
  TestStage
} from '../../types'

import {  getTableColumns } from './helper'

const mockItems = [
  {
    apName: 'W-02',
    apMac: 'D8:38:FC:38:4A:C0',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: '10',
          messageIds: [
            '2',
            '3',
            '4',
            '5',
            '21',
            '22',
            '23',
            '24',
            '31',
            '31',
            '10'
          ],
          ssid: 'DENSITY-NSS',
          radio: '5',
          reason: 'CCD_REASON_DEAUTH_LEAVING',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  },
  {
    apName: 'W-03',
    apMac: '28:B3:71:22:6B:20',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: null,
          messageIds: null,
          ssid: null,
          radio: null,
          reason: 'UNKNOWN',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  },
  {
    apName: 'W-03-BKP',
    apMac: 'EC:8C:A2:18:11:00',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: '10',
          messageIds: [
            '2',
            '3',
            '4',
            '5',
            '21',
            '22',
            '23',
            '24',
            '31',
            '31',
            '31',
            '31',
            '31',
            '10'
          ],
          ssid: 'DENSITY-NSS',
          radio: '5',
          reason: 'CCD_REASON_DEAUTH_LEAVING',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  },
  {
    apName: 'W-04',
    apMac: '0C:F4:D5:13:3A:F0',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: '10',
          messageIds: [
            '2',
            '3',
            '4',
            '5',
            '21',
            '22',
            '23',
            '24',
            '31',
            '31',
            '10'
          ],
          ssid: 'DENSITY-NSS',
          radio: '5',
          reason: 'CCD_REASON_DEAUTH_LEAVING',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  },
  {
    apName: 'W-05',
    apMac: '0C:F4:D5:18:41:B0',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: '10',
          messageIds: [
            '2',
            '3',
            '4',
            '5',
            '21',
            '22',
            '23',
            '24',
            '31',
            '31',
            '10'
          ],
          ssid: 'DENSITY-NSS',
          radio: '5',
          reason: 'CCD_REASON_DEAUTH_LEAVING',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  },
  {
    apName: 'W-06',
    apMac: '18:7C:0B:1F:95:C0',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: '10',
          messageIds: [
            '2',
            '3',
            '4',
            '5',
            '21',
            '22',
            '23',
            '24',
            '31',
            '31',
            '31',
            '31',
            '31',
            '10'
          ],
          ssid: 'DENSITY-NSS',
          radio: '5',
          reason: 'CCD_REASON_DEAUTH_LEAVING',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  },
  {
    apName: 'W-07',
    apMac: 'B4:79:C8:12:86:50',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: '10',
          messageIds: [
            '2',
            '3',
            '4',
            '5',
            '21',
            '22',
            '23',
            '24',
            '31',
            '31',
            '10'
          ],
          ssid: 'DENSITY-NSS',
          radio: '5',
          reason: 'CCD_REASON_DEAUTH_LEAVING',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  },
  {
    apName: 'W-08',
    apMac: 'E8:1D:A8:2F:E2:90',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: '10',
          messageIds: [
            '2',
            '3',
            '4',
            '5',
            '21',
            '22',
            '23',
            '24',
            '31',
            '31',
            '10'
          ],
          ssid: 'DENSITY-NSS',
          radio: '5',
          reason: 'CCD_REASON_DEAUTH_LEAVING',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  },
  {
    apName: 'W-09',
    apMac: '18:7C:0B:1F:95:D0',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: '10',
          messageIds: [
            '2',
            '3',
            '4',
            '5',
            '21',
            '22',
            '23',
            '24',
            '31',
            '31',
            '31',
            '31',
            '31',
            '10'
          ],
          ssid: 'DENSITY-NSS',
          radio: '5',
          reason: 'CCD_REASON_DEAUTH_LEAVING',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  },
  {
    apName: 'W-10',
    apMac: 'E8:1D:A8:2F:E4:20',
    auth: 'success',
    assoc: 'success',
    eap: 'success',
    radius: 'success',
    dhcp: 'fail',
    userAuth: 'n/a',
    dns: 'n/a',
    ping: 'n/a',
    traceroute: 'n/a',
    speedTest: 'n/a',
    pingReceive: null,
    pingTotal: null,
    avgPingTime: null,
    error: null,
    speedTestFailure: null,
    speedTestServer: null,
    download: null,
    upload: null,
    tracerouteLog: null,
    state: 'fail',
    clients: [
      {
        failure: {
          failedMsgId: '10',
          messageIds: [
            '2',
            '3',
            '4',
            '5',
            '21',
            '22',
            '23',
            '24',
            '31',
            '31',
            '10'
          ],
          ssid: 'DENSITY-NSS',
          radio: '5',
          reason: 'CCD_REASON_DEAUTH_LEAVING',
          failureType: 'dhcp'
        }
      }
    ],
    stationAp: null
  }
]
const mockConfig = {
  authenticationMethod: 'WPA2_PERSONAL',
  pingAddress: '8.8.8.8',
  tracerouteAddress: '8.8.8.8',
  speedTestEnabled: true
}
const Details = () => {
  const { tableQuery, onPageChange, pagination } = useNetworkHealthTestResults()
  const queryResults = tableQuery
  const config = mockConfig as NetworkHealthConfig
  const clientType = (queryResults?.data)?.spec?.clientType
  const items = (queryResults?.data)?.aps?.items
  const wlanAuthSettings = (queryResults?.data)?.wlanAuthSettings
  const isWirelessClient = clientType === ClientType.VirtualWirelessClient
  const stagesFromConfig = (config : NetworkHealthConfig) => {
    if (!config?.authenticationMethod) { return [] }
    const stages = [...authMethodsByCode[config.authenticationMethod].stages,stage('dns')]
    if (config?.pingAddress) { stages.push(stage('ping')) }
    if (config?.tracerouteAddress) { stages.push(stage('traceroute')) }
    if (config?.speedTestEnabled) { stages.push(stage('speedTest')) }
    return stages
  }
  const stages = stagesFromConfig(config)?.map(
    ({ key, title }: { key: TestStage; title: MessageDescriptor }) => ({
      key,
      title
    })
  )
  const stagesKeys = stages.map(s => s.key) as TestStage[]
  return (
    <Loader states={[queryResults]}>
      <Table<TestResultByAP>
        columns={getTableColumns({
          isWirelessClient,
          stagesKeys,
          wlanAuthSettings,
          clientType,
          config,
          stages
        })}
        dataSource={mockItems}
        onChange={onPageChange}
        pagination={{ ...pagination, total: items?.length || 0 }}
      />
    </Loader>
  )
}

export { Details }



