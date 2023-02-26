import { defineMessage }                        from '@formatjs/intl'
import { upperFirst, without }                  from 'lodash'
import { FormattedMessage , MessageDescriptor } from 'react-intl'


import { mapCodeToReason }             from '@acx-ui/analytics/utils'
import { TableProps, cssStr, Tooltip } from '@acx-ui/components'
import type { TableColumn }            from '@acx-ui/components'
import { EyeOpenSolid }                from '@acx-ui/icons'
import { TenantLink }                  from '@acx-ui/react-router-dom'
import { getIntl, formatter }          from '@acx-ui/utils'

import * as contents  from '../../contents'
import {
  ClientType,
  TestStage,
  NetworkHealthConfig,
  TestResultByAP,
  WlanAuthSettings

} from '../../types'

import * as UI from './styledComponents'

const badgeTextMap = {
  'success': defineMessage({ defaultMessage: 'Pass' }),
  'error': defineMessage({ defaultMessage: 'Error' }),
  'fail': defineMessage({ defaultMessage: 'Fail' }),
  'n/a': defineMessage({ defaultMessage: 'N/A' }),
  'pending': defineMessage({ defaultMessage: 'Pending' })
}
export type TrendType = 'success' | 'fail' | 'n/a' | 'error' | 'pending'

export function getToolTipText ({
  error,
  toolTipText,
  wlanAuthSettings,
  clientType
}: {
  error: string;
  toolTipText: string |null;
  wlanAuthSettings?: WlanAuthSettings;
  clientType?: ClientType;
}) {
  const { $t } = getIntl()

  const toolTipContent = error && error !== 'WLAN_CONF_ERROR'?
    ($t(contents.stagesErrorMappings?.[error]?.text) ||
  $t(contents.errorMappings?.[error]?.text)) :
    toolTipText
  const errorText = `${toolTipContent} \n \n`
  // eslint-disable-next-line
  const noStationAPText = $t(defineMessage({ defaultMessage:'{errorText}An AP with 3 radios is required to test WLAN with WPA2/WPA3-Mixed or WPA3 encryption'}),{ errorText})
  return error === 'WLAN_CONF_ERROR' && clientType ? (
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
  wlanAuthSettings? : WlanAuthSettings,
  clientType? : ClientType,
  config? : NetworkHealthConfig,
  stages? : Array<{ key: TestStage, title: MessageDescriptor }>

}) => {
  const { $t } = getIntl()

  const genStageCol = (key: keyof TestResultByAP) => ({
    title: $t(stages?.find((s) => s?.key === key)?.title as MessageDescriptor),
    dataIndex: key,
    key: key,
    filterable: false,
    searchable: true,
    align: 'center',
    render: function (text: string, row : TestResultByAP ) {
      const failure = getClientFailureInfo(row)[key]
      const failureCode = failure?.event
      const intl = getIntl()
      const error = row?.error
      const toolTipText = !failure
        ? null
        : $t(
          contents.noFailureDetailsMap[failureCode as keyof typeof contents.noFailureDetailsMap]
        ) || `Failure reason: ${mapCodeToReason(failureCode as string, intl)}`
      const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })
      const type = row[key] as TrendType
      return (
        <TableCell
          tooltipContent={wrappedContent}
          type={type}
          displayText={$t(badgeTextMap[type])}
          key={key}
        />
      )
    }
  } as TableColumn<TestResultByAP>)
  const genSpeedCol = (key :keyof Pick<TestResultByAP, 'upload' | 'download'>) => {
    return {
      title: upperFirst(key),
      dataIndex: key,
      key: key,
      filterable: false,
      searchable: false,
      align: 'center',
      render: function (text: string, row : TestResultByAP) {
        const { speedTest, speedTestServer } = row
        const error = row?.error || row.speedTestFailure

        const toolTipText = speedTest === 'n/a' ? null : `speedtest.net: ${speedTestServer}`
        text =
          speedTest === 'success'
            ? formatter('networkSpeedFormat')(row[key])
            : $t(badgeTextMap[speedTest as keyof typeof badgeTextMap])
        const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })
        return (
          <TableCell
            tooltipContent={wrappedContent}
            type={speedTest as TrendType}
            displayText={text}
            key={key}
          />
        )
      }
    } as TableColumn<TestResultByAP>
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
        align: 'center',
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
        align: 'center',
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
        align: 'center',
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
      title: $t(stages?.find((s) => s.key === 'ping')?.title as MessageDescriptor),
      dataIndex: 'ping',
      key: 'ping',
      filterable: false,
      searchable: false,
      align: 'center',
      render: function (text: unknown, row) {
        const { ping, avgPingTime, pingTotal, pingReceive, error } = row

        const toolTipText =
          ping === 'n/a'
            ? null
            : `${pingTotal} packets transmitted, ${pingReceive} packets received`
        const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })

        text = avgPingTime
          ? formatter('durationFormat')(avgPingTime)
          : $t(badgeTextMap[ping as TrendType])

        return (
          <TableCell
            tooltipContent={wrappedContent}
            type={ping as TrendType}
            displayText={text as string}
            key={'ping'}
          />
        )
      }
    })
  }
  if (config?.tracerouteAddress) {
    columns.push({
      title: $t(stages?.find((s) => s.key === 'traceroute')?.title as MessageDescriptor),
      dataIndex: 'tracerouteLog',
      key: 'tracerouteLog',
      filterable: false,
      searchable: false,
      align: 'center',
      render: function (text: unknown, row) {
        const { traceroute, tracerouteLog, error } = row
        const toolTipText = traceroute === 'n/a' ? null : tracerouteLog
        const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })
        return (
          <TableCell
            tooltipContent={wrappedContent}
            type={traceroute as TrendType}
            displayText={
              tracerouteLog ? (
                <EyeOpenSolid
                  stroke={cssStr('--acx-primary-white')}
                  height={8}
                  width={12}
                  color={cssStr('--acx-primary-white')}
                />
              ) : (
                $t(badgeTextMap[traceroute as TrendType])
              )
            }
            key={'tracerouteLog'}
          />
        )
      }
    })
  }
  if (config?.speedTestEnabled) {
    columns.push(
      genSpeedCol('upload'),
      genSpeedCol('download')
    )
  }
  return columns
}

export const TableCell = ({
  tooltipContent,
  type,
  displayText,
  key
}: {
  tooltipContent: string | null | JSX.Element;
  type: TrendType;
  displayText: string | JSX.Element;
  key: string;
}) =>
  type === 'pending' ? (
    <span style={{ opacity: 0.5 }}>{displayText}</span>
  ) : (
    <Tooltip key={key} title={tooltipContent}>
      <UI.Badge type={type}>{displayText}</UI.Badge>
    </Tooltip>
  )