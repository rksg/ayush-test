import { upperFirst, without }                  from 'lodash'
import { FormattedMessage , MessageDescriptor } from 'react-intl'


import { mapCodeToReason } from '@acx-ui/analytics/utils'
import { TableProps }      from '@acx-ui/components'
import { cssStr }          from '@acx-ui/components'
import { Tooltip }         from '@acx-ui/components'
import { EyeOpenSolid }    from '@acx-ui/icons'
import { TenantLink }      from '@acx-ui/react-router-dom'
import { getIntl }         from '@acx-ui/utils'
import {  formatter }      from '@acx-ui/utils'

import * as contents  from '../../contents'
import {
  AuthenticationMethod,
  ClientType,
  TestStage,
  NetworkHealthConfig,
  TestResultByAP,
  WlanAuthSettings

} from '../../types'

import * as UI from './styledComponents'

const badgeTextMap = {
  'success': 'Pass',
  'error': 'Error',
  'fail': 'Fail',
  'n/a': 'N/A',
  'pending': 'Pending'
}
export type TrendType = 'success' | 'fail' | 'n/a' | 'error' | 'pending'

export function getToolTipText ({
  error,
  toolTipText,
  wlanAuthSettings,
  clientType
}: {
  error: string;
  toolTipText: string;
  wlanAuthSettings: WlanAuthSettings;
  clientType: ClientType;
}) {
  const toolTipContent =
    contents.stagesErrorMappings?.[error]?.text ||
    contents.errorMappings?.[error]?.text ||
    toolTipText
  const errorText = `${toolTipContent} \n \n`
  // eslint-disable-next-line
  const noStationAPText = `${errorText}An AP with 3 radios is required to test WLAN with WPA2/WPA3-Mixed or WPA3 encryption`;
  return error === 'WLAN_CONF_ERROR' ? (
    <FormattedMessage
      {...contents.unsupportedAuthMethods[clientType]}
      values={contents.formatValues}
    />
  ) : (wlanAuthSettings?.wpaVersion || '').match('WPA3') && error === 'NO_STATION_AP' ? (
    noStationAPText
  ) : (
    toolTipContent
  )
}
const getClientFailureInfo = (item : TestResultByAP) => {
  const failure = item.clients[0].failure
  let clientFailure
  if (failure) {
    const { failureType: code, reason, ...partialFailure } = failure

    let event = reason
    if (code === 'dhcp' && [
      'CCD_REASON_DISASSOC_STA_HAS_LEFT',
      'CCD_REASON_DEAUTH_LEAVING'
    ].includes(event as string)) event = `SG_${code.toUpperCase()}_${event}`

    clientFailure = {
      [code as string]: {
        apName: item.apName,
        mac: item.apMac,
        category: 'failure',
        ...partialFailure,
        code,
        event
      }
    }
  } else {
    clientFailure = {}
  }
  return clientFailure
}

export const getTableColumns = ({
  isWirelessClient,
  stagesKeys,
  wlanAuthSettings,
  clientType,
  config,
  stages
}: {
  isWirelessClient : boolean,
  stagesKeys : TestStage[],
  wlanAuthSettings : WlanAuthSettings,
  clientType : ClientType,
  config : NetworkHealthConfig,
  stages : Array<{ key: TestStage, title: MessageDescriptor }>

}) => {
  const { $t } = getIntl()

  const genStageCol = (key: string) => ({
    title: $t(stages?.find((s) => s?.key === key)?.title).replace('Authentication', 'Auth'),
    dataIndex: key,
    key: key,
    filterable: false,
    searchable: true,
    render: function (text: string, row : TestResultByAP ) {
      const failure = getClientFailureInfo(row)[key]?.event
      const noFailureDetailsMap = {
        PROCESSING: 'Failure reason pending',
        UNKNOWN: 'Failure reason unavailable'
      }
      const error = row?.error
      const toolTipText = !failure
        ? null
        : noFailureDetailsMap[failureCode] || `Failure reason: ${mapCodeToReason(failureCode)}`
      const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })
      return (
        <TableCell
          tooltipContent={wrappedContent}
          type={row[key]}
          displayText={badgeTextMap[row[key]]}
          key={key}
        />
      )
    }
  })
  const genSpeedCol = (key : string) => {
    return {
      title: upperFirst(key),
      dataIndex: key,
      key: key,
      filterable: false,
      searchable: false,
      render: function (text: string, row : any) {
        const { speedTest, speedTestServer } = row
        const error = row?.error || row?.speedTestFailure

        const toolTipText = speedTest === 'n/a' ? null : `speedtest.net: ${speedTestServer}`
        text =
          speedTest === 'success'
            ? formatter('networkSpeedFormat')(row[key])
            : badgeTextMap[speedTest]
        const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })
        return (
          <TableCell
            tooltipContent={wrappedContent}
            type={speedTest}
            displayText={text}
            key={key}
          />
        )
      }
    }
  }
  const columns: TableProps<TestResultByAP>['columns'] = [
    {
      title: isWirelessClient ? 'Target AP Name' : 'AP Name',
      dataIndex: 'apName',
      key: 'apName',
      filterable: false,
      searchable: true,
      render: function (text, row) {
        const { apMac } = row
        return (
          <UI.VenueName>
            <TenantLink
              to={`devices/wifi/${apMac}/details/overview`}
              title={isWirelessClient ? 'Target AP Details' : ('AP Details')}>
              {text}
            </TenantLink>
          </UI.VenueName>
        )
      }
    },
    {
      title: isWirelessClient ? 'Target AP MAC' : 'AP MAC',
      dataIndex: 'apMac',
      key: 'apMac',
      filterable: false,
      searchable: true,

      render: function (text, row) {
        const { apMac } = row
        return (
          <UI.VenueName>
            <TenantLink
              to={`devices/wifi/${apMac}/details/overview`}
              title={isWirelessClient ? 'Target AP Details' : ('AP Details')}>
              {text}
            </TenantLink>
          </UI.VenueName>
        )
      }
    }
  ]
  if (isWirelessClient) {
    columns.push(
      {
        title: 'Station AP Name',
        dataIndex: 'stationAp',
        key: 'stationAp',
        filterable: false,
        searchable: true,
        render: function (text: unknown, row) {
          const { stationAp } = row
          return (
            <UI.VenueName>
              <TenantLink
                to={`devices/wifi/${stationAp?.mac}/details/overview`}
                title={'Station AP Details' as string}>
                {stationAp?.name as string}
              </TenantLink>
            </UI.VenueName>
          )
        }
      },
      {
        title: 'Station AP MAC',
        dataIndex: 'stationAp',
        key: 'stationAp',
        filterable: false,
        searchable: true,
        render: function (text: unknown, row) {
          const { stationAp } = row
          return (
            <UI.VenueName>
              <TenantLink
                to={`devices/wifi/${stationAp?.mac}/details/overview`}
                title={'Station AP Details' as string}>
                {stationAp?.mac as string}
              </TenantLink>
            </UI.VenueName>
          )
        }
      },
      {
        title: 'Station AP SNR',
        dataIndex: 'stationAp',
        key: 'stationAp',
        filterable: false,
        searchable: true,
        render: function (text: unknown, row) {
          const { stationAp } = row
          return (
            <span>{stationAp ? formatter('decibelFormat')(stationAp?.snr) : ('' as string)}</span>
          )
        }
      }
    )
  }
  columns.push(
    ...without(stagesKeys, 'ping', 'traceroute', 'speedTest').map((s) => genStageCol(s))
  )
  if (stagesKeys.includes('ping')) {
    columns.push({
      title: $t(stages?.find((s) => s.key === 'ping').title),
      dataIndex: 'ping',
      key: 'ping',
      filterable: false,
      searchable: false,
      render: function (text: unknown, row) {
        const { ping, avgPingTime, pingTotal, pingReceive, error } = row

        const toolTipText =
          ping === 'n/a'
            ? null
            : `${pingTotal} packets transmitted, ${pingReceive} packets received`
        const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })

        text = avgPingTime ? formatter('durationFormat')(avgPingTime) : badgeTextMap[ping]

        return (
          <TableCell tooltipContent={wrappedContent} type={ping} displayText={text} key={'ping'} />
        )
      }
    })
  }
  if (config?.tracerouteAddress) {
    columns.push({
      title: $t(stages?.find((s) => s.key === 'traceroute').title),
      dataIndex: 'tracerouteLog',
      key: 'tracerouteLog',
      filterable: false,
      searchable: false,
      render: function (text: unknown, row) {
        const { traceroute, tracerouteLog, error } = row
        const toolTipText = traceroute === 'n/a' ? null : tracerouteLog
        const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })
        return (
          <TableCell
            tooltipContent={wrappedContent}
            type={traceroute}
            displayText={
              tracerouteLog ? (
                <EyeOpenSolid
                  stroke={cssStr('--acx-primary-white')}
                  height={12}
                  width={12}
                  color={cssStr('--acx-primary-white')}
                />
              ) : (
                badgeTextMap[traceroute]
              )
            }
            key={'tracerouteLog'}
          />
        )
      }
    })
  }
  if (config?.speedTestEnabled) {
    columns.push(genSpeedCol('upload'), genSpeedCol('download'))
  }
  return columns
}

export const TableCell = ({
  tooltipContent,
  type,
  displayText,
  key
}: {
  tooltipContent: string;
  type: TrendType;
  displayText: string;
  key: string;
}) =>
  type === 'pending' ? (
    <span style={{ opacity: 0.5 }}>{displayText}</span>
  ) : (
    <Tooltip key={key} title={tooltipContent}>
      <UI.Badge type={type}>{displayText}</UI.Badge>
    </Tooltip>
  )