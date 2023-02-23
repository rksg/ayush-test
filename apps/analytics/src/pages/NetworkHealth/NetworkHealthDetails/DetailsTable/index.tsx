/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable comma-dangle */
import { upperFirst, without }        from 'lodash'
import { MessageDescriptor, useIntl } from 'react-intl'
import { FormattedMessage }           from 'react-intl'

import { mapCodeToReason }   from '@acx-ui/analytics/utils'
import { Table, TableProps } from '@acx-ui/components'
import { cssStr }            from '@acx-ui/components'
import { Tooltip }           from '@acx-ui/components'
import { EyeOpenSolid }      from '@acx-ui/icons'
import { TenantLink }        from '@acx-ui/react-router-dom'
import {  formatter }        from '@acx-ui/utils'

import { authMethodsByCode }            from '../../authMethods'
import * as contents                    from '../../contents'
import {  useNetworkHealthTestResults } from '../../services'
import { stage }                        from '../../stages'

import * as UI from './styledComponents'

type RecordType = {
  key: string
  name: string
  givenName: string
  surname: string
  age: number
  description: string
  address: string,
  children?: RecordType[]
}

const badgeTextMap = {
  'success': 'Pass',
  'error': 'Error',
  'fail': 'Fail',
  'n/a': 'N/A',
  'pending': 'Pending'
}

export const columns: TableProps<RecordType>['columns'] = [
  {
    title: 'AP Name',
    dataIndex: 'name',
    key: 'name',
    filterable: true,
    searchable: true
  },
  {
    title: 'AP MAC',
    dataIndex: 'age',
    key: 'age',
    align: 'center',
    filterable: true
  },
  {
    title: '802.11 Auth',
    dataIndex: 'description',
    key: 'description',
    render: (text, _, __, highlightFn) => <u>{highlightFn(text as string)}</u>,
    searchable: true
  },
  {
    title: 'Association',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  },
  {
    title: 'EAP',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  },
  {
    title: 'RADIUS',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  },
  {
    title: 'DHCP',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  },
  {
    title: 'DNS',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  }
]

const Details = () => {

  const { $t } = useIntl()

  const queryResults = useNetworkHealthTestResults()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (queryResults?.data as any)?.config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientType = (queryResults?.data as any)?.spec?.clientType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (queryResults?.data as any)?.aps?.items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wlanAuthSettings = (queryResults?.data as any)?.wlanAuthSettings

  const isWirelessClient = clientType === 'virtual-wireless-client'
  const stagesFromConfig = (config : any) => {
    if (!config?.authenticationMethod) { return [] }
    const stages = [...authMethodsByCode[config.authenticationMethod].stages,stage('dns')]
    if (config?.pingAddress) { stages.push(stage('ping')) }
    if (config?.tracerouteAddress) { stages.push(stage('traceroute')) }
    if (config?.speedTestEnabled) { stages.push(stage('speedTest')) }
    return stages
  }

  const stages = stagesFromConfig(config)?.map(
    ({ key, title }: { key: any; title: MessageDescriptor }) => ({
      key,
      title
    })
  )
  const genStageCol = (key : any) => ({
    title: $t(stages?.find((s : any) => s?.key === key)?.title).replace('Authentication', 'Auth'),
    dataIndex: key,
    key: key,
    filterable: false,
    searchable: true,
    render: function (text: unknown, row) {
      const failure = row?.clientFailure?.[key]?.get('event')
      const noFailureDetailsMap = {
        PROCESSING: 'Failure reason pending',
        UNKNOWN: 'Failure reason unavailable'
      }
      const error = row?.error
      const toolTipText = !failure
        ? null
        : noFailureDetailsMap[failureCode] || `Failure reason: ${mapCodeToReason(failureCode)}`
      const toolTipContent = contents.stagesErrorMappings?.[error]?.text ||
      contents.errorMappings?.[error]?.text ||
      toolTipText
      const errorText = `${toolTipContent} \n \n`
      const noStationAPText = `${errorText}An AP with 3 radios is required to test WLAN with WPA2/WPA3-Mixed or WPA3 encryption`
      const wrappedContent = (error === 'WLAN_CONF_ERROR')
        ? (<FormattedMessage
          {...contents.unsupportedAuthMethods[clientType]}
          values={contents.formatValues}
        />)
        : (((wlanAuthSettings?.wpaVersion || '').match('WPA3') && error === 'NO_STATION_AP')
          ? noStationAPText : toolTipContent)

      return (
        <Tooltip key={text} title={wrappedContent}>
          <UI.Badge type={row[key]}>{badgeTextMap[row[key]]}</UI.Badge>
        </Tooltip>
      )
    }
  })
  const genSpeedCol = key => {
    return {
      title: upperFirst(key),
      dataIndex: key,
      key: key,
      filterable: false,
      searchable: false,
      render: function (text: unknown, row) {
        const { speedTest, speedTestServer } = row
        const error = row?.error || row?.speedTestFailure

        const toolTipText = speedTest === 'n/a' ? null : `speedtest.net: ${speedTestServer}`
        const toolTipContent = contents.stagesErrorMappings?.[error]?.text ||
        contents.errorMappings?.[error]?.text ||
        toolTipText
        text=speedTest === 'success'
          ? formatter('networkSpeedFormat')(row[key])
          : badgeTextMap[speedTest]
        const errorText = `${toolTipContent} \n \n`
        const noStationAPText = `${errorText}An AP with 3 radios is required to test WLAN with WPA2/WPA3-Mixed or WPA3 encryption`
        const wrappedContent = (error === 'WLAN_CONF_ERROR')
          ? $t(contents.unsupportedAuthMethods[clientType])
          : (((wlanAuthSettings?.wpaVersion || '').match('WPA3') && error === 'NO_STATION_AP')
            ? noStationAPText : toolTipContent)
        return (
          <Tooltip key={text} title={wrappedContent}>
            <UI.Badge type={speedTest}>{text}</UI.Badge>
          </Tooltip>
        )
      }
    }
  }
  const columns: TableProps<RecordType>['columns'] = [
    {
      title: isWirelessClient ? ('Target AP Name') : ('AP Name'),
      dataIndex: 'apName',
      key: 'apName',
      filterable: false,
      searchable: true,
      render: function (text: unknown, row) {
        const { apMac } = row
        return (
          <UI.VenueName>
            <TenantLink
              to={`devices/wifi/${apMac}/details/overview`}
              title={isWirelessClient ? 'Target AP Details' : 'AP Details' as string}>
              {text as string}
            </TenantLink>
          </UI.VenueName>
        )
      }
    },
    {
      title: isWirelessClient ? ('Target AP MAC') : ('AP MAC'),
      dataIndex: 'apMac',
      key: 'apMac',
      align: 'center',
      filterable: false,
      render: function (text: unknown, row) {
        const { apMac } = row
        return (
          <UI.VenueName>
            <TenantLink
              to={`devices/wifi/${apMac}/details/overview`}
              title={isWirelessClient ? 'Target AP Details' : 'AP Details' as string}>
              {text as string}
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
          const { stationAp, apMac } = row
          return (
            <UI.VenueName>
              <TenantLink
                to={`devices/wifi/${stationAp.mac}/details/overview`}
                title={'Station AP Details' as string}>
                {stationAp.name as string}
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
          const { apMac, stationAp } = row
          return (
            <UI.VenueName>
              <TenantLink
                to={`devices/wifi/${stationAp.mac}/details/overview`}
                title={'Station AP Details' as string}>
                {stationAp.mac as string}
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
            <span>
              {stationAp ? formatter('decibelFormat')(stationAp.snr) : '' as string}
            </span>
          )
        }
      }
    )
  }
  const stagesKeys = stages.map(s => s.key)
  columns.push(...without(stagesKeys, 'ping', 'traceroute', 'speedTest').map(s => genStageCol(s)))

  if (stagesKeys.includes('ping')) {
    columns.push({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      title: $t(stages.find((s : any) => s.key === 'ping').title),
      dataIndex: 'ping',
      key: 'ping',
      filterable: false,
      searchable: false,
      render: function (text: unknown, row) {
        const { ping, avgPingTime, pingTotal, pingReceive, error } = row

        const toolTipText =ping === 'n/a'
          ? null
          : `${pingTotal} packets transmitted, ${pingReceive} packets received`
        const toolTipContent = contents.stagesErrorMappings?.[error]?.text ||
          contents.errorMappings?.[error]?.text ||
          toolTipText

        const errorText = `${toolTipContent} \n \n`
        const noStationAPText = `${errorText}An AP with 3 radios is required to test WLAN with WPA2/WPA3-Mixed or WPA3 encryption`
        const wrappedContent = (error === 'WLAN_CONF_ERROR')
          ? $t(contents.unsupportedAuthMethods[clientType])
          : (((wlanAuthSettings?.wpaVersion || '').match('WPA3') && error === 'NO_STATION_AP')
            ? noStationAPText : toolTipContent)
        text= avgPingTime
          ? formatter('durationFormat')(avgPingTime)
          : badgeTextMap[ping]

        return (
          <Tooltip key={text} title={wrappedContent}>
            <UI.Badge type={ping}>{text}</UI.Badge>
          </Tooltip>
        )
      }
    })
  }
  if (config?.tracerouteAddress) {
    columns.push({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      title: $t(stages.find((s : any) => s.key === 'traceroute').title),
      dataIndex: 'tracerouteLog',
      key: 'tracerouteLog',
      filterable: false,
      searchable: false,
      render: function (text: unknown, row) {
        const { traceroute, tracerouteLog, error } = row
        const toolTipText = traceroute === 'n/a' ? null : tracerouteLog
        const toolTipContent = contents.stagesErrorMappings?.[error]?.text ||
        contents.errorMappings?.[error]?.text ||
        toolTipText
        const errorText = `${toolTipContent} \n \n`
        const noStationAPText = `${errorText}An AP with 3 radios is required to test WLAN with WPA2/WPA3-Mixed or WPA3 encryption`
        const wrappedContent = (error === 'WLAN_CONF_ERROR')
          ? $t(contents.unsupportedAuthMethods[clientType])
          : (((wlanAuthSettings?.wpaVersion || '').match('WPA3') && error === 'NO_STATION_AP')
            ? noStationAPText : toolTipContent)
        return (
          <Tooltip key={text} title={wrappedContent}>

            <UI.Badge type={traceroute}>
              {tracerouteLog ? (
                <EyeOpenSolid
                  stroke={cssStr('--acx-primary-white')}
                  height={12}
                  width={12}
                  color={cssStr('--acx-primary-white')}
                />
              ) : (
                badgeTextMap[traceroute]
              )}
            </UI.Badge>
          </Tooltip>
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
  return <Table<RecordType>
    columns={columns}
    dataSource={items}
  />
}

export { Details }



