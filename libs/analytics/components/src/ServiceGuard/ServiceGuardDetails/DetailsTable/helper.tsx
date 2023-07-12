import { defineMessage }                       from '@formatjs/intl'
import { upperFirst, without }                 from 'lodash'
import { FormattedMessage, MessageDescriptor } from 'react-intl'

import { mapCodeToReason }                     from '@acx-ui/analytics/utils'
import { TableProps, cssStr, Tooltip }         from '@acx-ui/components'
import type { TableColumn }                    from '@acx-ui/components'
import { formatter }                           from '@acx-ui/formatter'
import { TenantLink }                          from '@acx-ui/react-router-dom'
import { getIntl, NetworkPath, noDataDisplay } from '@acx-ui/utils'

import { ConnectionEventPopover } from '../../../ClientTroubleshooting/ConnectionEvent'
import * as contents              from '../../contents'
import {
  ClientType,
  TestStage,
  ServiceGuardConfig,
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

export type ConnectionEvent = {
  start: number,
  end: number,
  code: string | null,
  apName: string,
  mac: string,
  radio: string,
  state: string,
  event: string,
  category: string,
  timestamp: string,
  ttc: number | null,
  failedMsgId: string | null,
  ssid?: string | null,
  messageIds?: Array<string>,
  path: NetworkPath
}
export type TrendType = 'success' | 'fail' | 'n/a' | 'error' | 'pending'
const stationAPDetailsText = defineMessage({ defaultMessage: 'Station AP Details' })
const targetApDetailsText = defineMessage({ defaultMessage: 'Target AP Details' })
const apDetails = defineMessage({ defaultMessage: 'AP Details' })
export function getToolTipText ({
  error,
  toolTipText,
  wlanAuthSettings,
  clientType
}: {
  error: string;
  toolTipText: string | null;
  wlanAuthSettings?: WlanAuthSettings;
  clientType?: ClientType;
}) {
  const { $t } = getIntl()

  const toolTipContent =
    error
      ? contents.stagesErrorMappings?.[error]
        ? $t(contents.stagesErrorMappings?.[error]?.text)
        : $t(contents.errorMappings?.[error]?.text)
      : toolTipText
  const errorText = `${toolTipContent} \n \n`
  const noStationAPText = $t(
    defineMessage({
      defaultMessage:
        // eslint-disable-next-line
        '{errorText}An AP with 3 radios is required to test WLAN with WPA2/WPA3-Mixed or WPA3 encryption',
    }),
    { errorText }
  )
  return error === 'WLAN_CONF_ERROR' && clientType ? (
    <>
      <div>{errorText}</div>
      <FormattedMessage
        {...contents.unsupportedAuthMethods[clientType]}
        values={contents.formatValues}
      />
    </>
  ) : (wlanAuthSettings?.wpaVersion || '').match('WPA3') && error === 'NO_STATION_AP' ? (
    noStationAPText
  ) : (
    toolTipContent
  )
}
const getClientFailureInfo = (item: TestResultByAP) => {
  const failure = item.clients[0].failure
  let clientFailure
  if (failure) {
    const { failureType: code, reason, ...partialFailure } = failure
    let event = reason
    if (
      code === 'dhcp' &&
      ['CCD_REASON_DISASSOC_STA_HAS_LEFT', 'CCD_REASON_DEAUTH_LEAVING'].includes(event as string)
    )
      event = `SG_${code.toUpperCase()}_${event}`

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
  isWirelessClient: boolean;
  stagesKeys: TestStage[];
  wlanAuthSettings?: WlanAuthSettings;
  clientType?: ClientType;
  config?: ServiceGuardConfig;
  stages?: Array<{ key: TestStage; title: MessageDescriptor }>;
}) => {
  const { $t } = getIntl()

  const genStageCol = (key: keyof TestResultByAP) =>
    ({
      title: $t(stages?.find((s) => s?.key === key)?.title as MessageDescriptor),
      dataIndex: key,
      key: key,
      align: 'center',
      disable: true,
      width: 100,
      render: function (_, row: TestResultByAP, index: number) {
        const failure = getClientFailureInfo(row)[key]
        const failureCode = failure?.event
        const intl = getIntl()
        const error = row?.error
        const noFailureText =
          contents.noFailureDetailsMap[failureCode as keyof typeof contents.noFailureDetailsMap]
        const toolTipText = !failure
          ? null
          : noFailureText
            ? $t(
              noFailureText
            )
            : $t(
              defineMessage({
                defaultMessage: 'Failure reason: {reason}'
              }),
              { reason: mapCodeToReason(failureCode as string, intl) }
            )
        const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })
        const type = row[key] as TrendType
        return (
          failure?.messageIds ?
            <TableCell
              tooltipContent={wrappedContent}
              type={type}
              displayText={
                <ConnectionEventPopover event={failure as unknown as ConnectionEvent}>
                  {$t(badgeTextMap[type])}
                </ConnectionEventPopover>}
              id={`${key}-${index}`}
            />
            :
            <TableCell
              tooltipContent={wrappedContent}
              type={type}
              displayText={$t(badgeTextMap[type])}
              id={`${key}-${index}`}
            />
        )
      }
    } as TableColumn<TestResultByAP>)
  const genSpeedCol = (key: keyof Pick<TestResultByAP, 'upload' | 'download'>) => {
    return {
      title: upperFirst(key),
      dataIndex: key,
      key: key,
      align: 'center',
      width: 100,
      render: function (text: string, row: TestResultByAP, index : number) {
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
            id={`${key}-${index}`}
          />
        )
      }
    } as TableColumn<TestResultByAP>
  }
  const columns: TableProps<TestResultByAP>['columns'] = [
    {
      title: isWirelessClient
        ? $t(defineMessage({ defaultMessage: 'Target AP Name' }))
        : $t(defineMessage({ defaultMessage: 'AP Name' })),
      dataIndex: 'apName',
      key: 'apName',
      width: 150,
      fixed: 'left',
      render: function (text, row) {
        const { apMac } = row
        return (
          <TenantLink
            to={`devices/wifi/${apMac}/details/overview`}
            title={isWirelessClient ? $t(targetApDetailsText) : $t(apDetails)}
          >{text}</TenantLink>
        )
      }
    },
    {
      title: isWirelessClient
        ? $t(defineMessage({ defaultMessage: 'Target AP MAC' }))
        : $t(defineMessage({ defaultMessage: 'AP MAC' })),
      dataIndex: 'apMac',
      key: 'apMac',
      width: 150,
      render: function (text, _, index) {
        return (
          <span id={`apMac-${index}`}>
            {text}
          </span>
        )
      }
    }
  ]
  if (isWirelessClient) {
    columns.push(
      {
        title: $t(defineMessage({ defaultMessage: 'Station AP Name' })),
        dataIndex: 'stationApName',
        key: 'stationApName',
        width: 150,
        render: function (_, row) {
          const { stationAp } = row
          return stationAp ? (
            <TenantLink
              to={`devices/wifi/${stationAp?.mac}/details/overview`}
              title={$t(stationAPDetailsText)}
            >{stationAp?.name}</TenantLink>
          ) : noDataDisplay
        }
      },
      {
        title: $t(defineMessage({ defaultMessage: 'Station AP MAC' })),
        dataIndex: 'stationApMac',
        key: 'stationApMac',
        width: 150,
        render: function (_, row) {
          const { stationAp } = row
          return stationAp?.mac ?? noDataDisplay
        }
      },
      {
        title: $t(defineMessage({ defaultMessage: 'Station AP SNR' })),
        dataIndex: 'stationApSnr',
        key: 'stationApSnr',
        align: 'center',
        width: 150,
        render: function (_, row, index) {
          const { stationAp } = row
          return (
            <span key={`${stationAp?.snr}-${index}`}>
              {formatter('decibelFormat')(stationAp?.snr || noDataDisplay)}
            </span>
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
      align: 'center',
      width: 100,
      render: function (text: unknown, row,index : number ) {
        const { ping, avgPingTime, pingTotal, pingReceive, error } = row

        const toolTipText =
          ping === 'n/a'
            ? null
            : $t(
              defineMessage({
                defaultMessage: '{pingTotal} packets transmitted, {pingReceive} packets received'
              }),
              { pingTotal, pingReceive }
            )
        const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })
        text = avgPingTime
          ? formatter('durationFormat')(avgPingTime)
          : $t(badgeTextMap[ping as TrendType])

        return (
          <TableCell
            tooltipContent={wrappedContent}
            type={ping as TrendType}
            displayText={text as string}
            id={`ping-${index}`}
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
      align: 'center',
      width: 100,
      render: function (_, row, index : number) {
        const { traceroute, tracerouteLog, error } = row
        const toolTipText = traceroute === 'n/a' ? null : tracerouteLog
        const wrappedContent = getToolTipText({ error, toolTipText, wlanAuthSettings, clientType })
        return (
          <TableCell
            tooltipContent={wrappedContent}
            type={traceroute as TrendType}
            displayText={
              tracerouteLog ? (
                <UI.Eye
                  stroke={cssStr('--acx-primary-white')}
                  height={8}
                  width={12}
                  color={cssStr('--acx-primary-white')}
                />
              ) : (
                $t(badgeTextMap[traceroute as TrendType])
              )
            }
            id={`tracerouteLog-${index}`}

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
  id
}: {
  tooltipContent: string | null | JSX.Element;
  type: TrendType;
  displayText: string | JSX.Element;
  id: string;
}) =>
  type === 'pending' ? (
    <span key={id} style={{ opacity: 0.5 }}>{displayText}</span>
  ) : (
    <Tooltip key={id} title={tooltipContent} overlayStyle={{ maxWidth: 'none' }}>
      <UI.Badge type={type}>{displayText}</UI.Badge>
    </Tooltip>
  )
