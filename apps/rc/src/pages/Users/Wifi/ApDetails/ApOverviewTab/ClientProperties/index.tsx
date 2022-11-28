import React, { useEffect, useState } from 'react'

import { Divider, Form, Space } from 'antd'
import { useIntl }              from 'react-intl'

import { Card, Loader, Subtitle, Tooltip } from '@acx-ui/components'
import { WifiSignal }                      from '@acx-ui/rc/components'
import {
  useLazyGetClientDetailsQuery,
  useLazyGetApQuery,
  useLazyGetNetworkQuery,
  useLazyGetVenueQuery,
  // TODO:
  // useLazyGetDpskPassphraseByQueryQuery,
  useLazyGetHistoricalClientDetailsQuery
} from '@acx-ui/rc/services'
import {
  Client,
  ClientStatusEnum,
  getNoiseFloorStatus,
  getRssiStatus,
  getOsTypeIcon,
  transformQosPriorityType,
  QosPriorityEnum
} from '@acx-ui/rc/utils'
import { TenantLink, useParams, useSearchParams } from '@acx-ui/react-router-dom'
import { formatter }                              from '@acx-ui/utils'
import { getIntl }                                from '@acx-ui/utils'

import * as UI from '../styledComponents'

const historicalPayload = {
  fields: ['clientMac', 'clientIP', 'userId', 'hostname', 'venueId',
    'serialNumber', 'networkId', 'disconnectTime', 'ssid', 'osType',
    'sessionDuration', 'venueName', 'apName', 'bssid'],
  sortField: 'event_datetime',
  searchTargetFields: ['clientMac']
}

interface ClientExtended extends Client {
  hasSwitch: boolean,
  enableLinkToAp: boolean,
  enableLinkToVenue: boolean,
  enableLinkToNetwork: boolean
}

export function ClientProperties () {
  const { tenantId, userId: clientId } = useParams()
  const [searchParams] = useSearchParams()

  const [clientStatus, setClientStatus]
    = useState(searchParams.get('clientStatus') || ClientStatusEnum.CONNECTED)
  const [clientDetails, setClientDetails] = useState({} as ClientExtended)
  const [client, setClient] = useState({} as ClientExtended)
  const [networkType, setNetworkType] = useState('')

  const [getClientDetails] = useLazyGetClientDetailsQuery()
  const [getAp] = useLazyGetApQuery()
  const [getVenue] = useLazyGetVenueQuery()
  const [getNetwork] = useLazyGetNetworkQuery()
  const [getHistoricalClientDetails] = useLazyGetHistoricalClientDetailsQuery()

  // TODO: dpsk
  // const [getDpskPassphraseByQuery] = useLazyGetDpskPassphraseByQueryQuery()

  useEffect(() => {
    const getClientData = async () => {
      try {
        const clientData = await getClientDetails({
          params: { tenantId, clientId }
        }, true)?.unwrap()
        setClientDetails(clientData as ClientExtended)
      } catch {
        setClientStatus(ClientStatusEnum.HISTORICAL)
        getHistoricalClientData()
      }
    }

    const getHistoricalClientData = async () => {
      const historicalisData = await getHistoricalClientDetails({
        params: { tenantId },
        payload: {
          ...historicalPayload,
          searchString: clientId
        }
      }, true)?.unwrap()
      setClientDetails(historicalisData as ClientExtended)
    }

    clientStatus === ClientStatusEnum.CONNECTED
      ? getClientData()
      : getHistoricalClientData()

  }, [])


  useEffect(() => {
    if (clientDetails) {
      const serialNumber = clientDetails?.apSerialNumber || clientDetails?.serialNumber
      const setData = async () => {
        const apData = await getAp({
          params: { tenantId, serialNumber }
        }, true).unwrap()

        const venueData = await getVenue({
          params: { tenantId, venueId: clientDetails?.venueId }
        }, true).unwrap()

        const networkData = await getNetwork({
          params: { tenantId, networkId: clientDetails?.networkId }
        }, true).unwrap()

        setNetworkType(networkData?.type || '')
        setClient({
          ...clientDetails,
          apName: apData?.name,
          venueName: venueData?.name,
          networkName: networkData?.name || clientDetails.networkName,
          hasSwitch: false, // TODO: this.userProfileService.isSwitchEnabled(profile);
          enableLinkToAp: !!apData,
          enableLinkToVenue: !!venueData,
          enableLinkToNetwork: !!networkData
        })

        // TODO: get dpsk/guest data
        // if (networkData?.type === 'dpsk') {
        //   const dpskData = await getDpskPassphraseByQuery({
        //     params: { tenantId }, payload: {}
        //   }, true).unwrap()
        // }
      }

      serialNumber && setData()
    }
  }, [clientDetails])

  const getProperties = (clientStatus: string, networkType: string) => {
    let obj = null
    switch (clientStatus) {
      case ClientStatusEnum.CONNECTED:
        obj = [
          <ClientDetails client={client} />,
          <Connection client={client} />,
          <OperationalData client={client} />,
          (networkType === 'guest' && <GuestDetails />),
          (networkType === 'dpsk' && <DpskPassphraseDetails />),
          <WiFiCallingDetails client={client} />
        ]
        break
      case ClientStatusEnum.HISTORICAL:
        obj = [
          <ClientDetails client={client} />,
          <LastSession client={client} />,
          (networkType === 'guest' && <GuestDetails />),
          (networkType === 'dpsk' && <DpskPassphraseDetails />),
          <WiFiCallingDetails client={client} />
        ]
        break
    }

    const divider = <Divider style={{ margin: '12px 0' }} />
    const objLength = obj ? obj?.filter(item => item)?.length - 1 : 0
    return obj?.filter(item => item)?.map((item, index) => (
      <>
        { item }
        { index !== objLength && divider }
      </>
    ))
  }

  return <Card>
    <Loader states={[{
      isLoading: !Object.keys(client).length
    }]}>
      <UI.Form
        labelCol={{ span: 12 }}
        labelAlign='left'
      >{
          getProperties(clientStatus, networkType)
        }</UI.Form>
    </Loader>
  </Card>
}

function ClientDetails ({ client }: { client: ClientExtended }) {
  const { $t } = getIntl()

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Client Details' })}
    </Subtitle>
    <Form.Item
      label={$t({ defaultMessage: 'MAC Address' })}
      children={client?.clientMac}
    />
    <Form.Item
      label={$t({ defaultMessage: 'IP Address' })}
      children={client?.ipAddress || client?.clientIP}
    />
    <Form.Item
      label={$t({ defaultMessage: 'OS' })}
      children={<UI.OsType size={4}>
        {getOsTypeIcon(client?.osType || '')}
        {client?.osType}
      </UI.OsType>}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Host Name' })}
      children={client?.hostname || '--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Username' })}
      children={client?.username || client?.userId || '--'}
    />
    <Form.Item // TODO
      label={$t({ defaultMessage: 'Tags' })}
      children={'--'}
    />
  </>
}

function Connection ({ client }: { client: ClientExtended }) {
  const { $t } = getIntl()

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Connection' })}
    </Subtitle>
    <Form.Item
      label={<Tooltip
        placement='bottom'
        title={$t({ defaultMessage: 'Access Point' })}
      >{$t({ defaultMessage: 'AP' })}</Tooltip>
      }
      children={
        client?.enableLinkToAp
          ? <TenantLink to={`devices/aps/${client.apSerialNumber}/details/overview`}>
            {client?.apName || '--'}
          </TenantLink>
          : client?.apName || '--'
      }
    />
    {client?.hasSwitch && <Form.Item
      label={<Tooltip
        placement='bottom'
        title={$t({ defaultMessage: 'Switch' })}
      >{$t({ defaultMessage: 'Switch' })}</Tooltip>
      }
      children={
        client?.enableLinkToAp
          ? <TenantLink to={`devices/switches/${client.switchSerialNumber}/details/overview`}>
            {client?.switchName || '--'}
          </TenantLink>
          : client?.switchName || '--'
      }
    />}
    <Form.Item
      label={$t({ defaultMessage: 'Venue' })}
      children={
        client?.enableLinkToVenue
          ? <TenantLink to={`venues/${client.venueId}/venue-details/overview`}>
            {client?.venueName || '--'}
          </TenantLink>
          : client?.venueName || '--'
      }
    />
    <Form.Item
      label={$t({ defaultMessage: 'Wireless Network' })}
      children={
        client?.enableLinkToNetwork
          ? <TenantLink to={`networks/${client.networkId}/network-details/overview`}>
            {client?.networkName || '--'}
          </TenantLink>
          : client?.networkName || '--'
      }
    />
    <Form.Item
      label={<Tooltip
        placement='bottom'
        title={$t({ defaultMessage: 'Service Set Identifier' })}
      >{$t({ defaultMessage: 'SSID' })}
      </Tooltip>}
      children={client?.networkSsid}
    />
    <Form.Item
      label={<Tooltip
        placement='bottom'
        title={$t({ defaultMessage: 'Virtual Local Area Network Identifier' })}
      >{$t({ defaultMessage: 'VLAN ID' })}
      </Tooltip>}
      children={client?.vlan}
    />
    <Form.Item
      label={<Tooltip
        placement='bottom'
        title={$t({ defaultMessage: 'Basic Service Set Identifier' })}
      >{$t({ defaultMessage: 'BSSID' })}
      </Tooltip>}
      children={client?.bssid}
    />
  </>
}

function OperationalData ({ client }: { client: ClientExtended }) {
  const intl = useIntl()
  const bytesFormatter = formatter('bytesFormat')
  const numberFormatter = formatter('numberWithCommas')

  return <>
    <Subtitle level={4}>
      {intl.$t({ defaultMessage: 'Operational Data (Current)' })}
    </Subtitle>
    <Form.Item
      label={<Tooltip
        placement='bottom'
        title={intl.$t({ defaultMessage: 'Radio Frequency Channel' })}
      >{intl.$t({ defaultMessage: 'RF Channel' })}
      </Tooltip>}
      children={client?.rfChannel}
    />
    <Form.Item
      label={intl.$t({ defaultMessage: 'Traffic From Client' })}
      children={<Tooltip
        placement='bottom'
        title={`${numberFormatter(client?.transmittedBytes)} B`}
      >
        {bytesFormatter(client?.transmittedBytes)}
      </Tooltip>}
    />
    <Form.Item
      label={intl.$t({ defaultMessage: 'Packets From Client' })}
      children={numberFormatter(client?.transmittedPackets)}
    />
    <Form.Item
      label={intl.$t({ defaultMessage: 'Traffic To Client' })}
      children={<Tooltip
        placement='bottom'
        title={`${numberFormatter(client?.receivedBytes)} B`}
      >{bytesFormatter(client?.receivedBytes)}
      </Tooltip>}
    />
    <Form.Item
      label={intl.$t({ defaultMessage: 'Packets To Client' })}
      children={numberFormatter(client?.receivedPackets)}
    />
    <Form.Item
      label={intl.$t({ defaultMessage: 'Frames Dropped' })}
      children={numberFormatter(client?.framesDropped)}
    />
    <Form.Item
      label={<Tooltip
        placement='bottom'
        title={intl.$t({ defaultMessage: 'Signal-to-Noise Ratio' })}
      >{intl.$t({ defaultMessage: 'SNR' })}
      </Tooltip>}
      children={<WifiSignal
        snr={client?.snr_dB}
        text={client?.snr_dB ? client.snr_dB + ' dB' : '--'}
      />}
    />
    <Form.Item
      label={<Tooltip
        placement='bottom'
        title={intl.$t({ defaultMessage: 'Received Signal Strength Indicator' })}
      >{intl.$t({ defaultMessage: 'RSSI' })}
      </Tooltip>}
      children={<Space style={{
        color: getRssiStatus(intl, client?.receiveSignalStrength_dBm)?.color
      }}>
        <Tooltip
          placement='bottom'
          title={getRssiStatus(intl, client?.receiveSignalStrength_dBm)?.tooltip}
        >
          {client?.receiveSignalStrength_dBm ? client?.receiveSignalStrength_dBm + ' dBm' : '--'}
        </Tooltip>
      </Space>}
    />
    <Form.Item
      label={intl.$t({ defaultMessage: 'Noise Floor' })}
      children={<Space style={{ color: getNoiseFloorStatus(intl, client?.noiseFloor_dBm)?.color }}>
        <Tooltip
          placement='bottom'
          title={getNoiseFloorStatus(intl, client?.noiseFloor_dBm)?.tooltip}
        >
          {client?.noiseFloor_dBm ? client.noiseFloor_dBm + ' dBm' : '--'}
        </Tooltip>
      </Space>
      }
    />
  </>
}

function WiFiCallingDetails ({ client }: { client: ClientExtended }) {
  const { $t } = getIntl()
  const bytesFormatter = formatter('bytesFormat')

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'WiFi Calling Details' })}
    </Subtitle>
    <Form.Item
      label={$t({ defaultMessage: 'Carrier Name' })}
      children={client?.wifiCallingCarrierName || '--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'QoS Priority' })}
      children={
        client?.wifiCallingQosPriority
          ? transformQosPriorityType(client?.wifiCallingQosPriority as QosPriorityEnum)
          : '--'
      }
    />
    <Form.Item
      label={$t({ defaultMessage: 'Total Traffic' })}
      children={
        (client?.wifiCallingTotal && bytesFormatter(client?.wifiCallingTotal)) || '--'
      }
    />
    <Form.Item
      label={$t({ defaultMessage: 'Transmitted Traffic' })}
      children={
        (client?.wifiCallingTx && bytesFormatter(client?.wifiCallingTx)) || '--'
      }
    />
    <Form.Item
      label={$t({ defaultMessage: 'Recieved Traffic' })}
      children={
        (client?.wifiCallingRx && bytesFormatter(client?.wifiCallingRx)) || '--'
      }
    />
  </>
}

function LastSession ({ client }: { client: ClientExtended }) {
  const { $t } = getIntl()
  const durationFormatter = formatter('durationFormat')
  const calendarFormatter = formatter('calendarFormat')

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Last Session' })}
    </Subtitle>
    <Form.Item
      label={$t({ defaultMessage: 'Start Time' })}
      children={
        client?.disconnectTime && client?.sessionDuration
          ? calendarFormatter(client.disconnectTime * 1000 - client.sessionDuration * 1000)
          : '--'
      }
    />
    <Form.Item
      label={$t({ defaultMessage: 'End Time' })}
      children={
        client.disconnectTime
          ? calendarFormatter(client.disconnectTime * 1000)
          : '--'
      }
    />
    <Form.Item
      label={$t({ defaultMessage: 'Session duration' })}
      children={
        client?.sessionDuration
          ? durationFormatter(client?.sessionDuration * 1000)
          : '--'
      }
    />
    <Form.Item
      label={<Tooltip
        placement='bottom'
        title={$t({ defaultMessage: 'Last AP' })}
      >{$t({ defaultMessage: 'AP' })}</Tooltip>
      }
      children={
        client?.enableLinkToAp
          ? <TenantLink to={`devices/aps/${client.serialNumber}/details/overview`}>
            {client?.apName || '--'}
          </TenantLink>
          : client?.apName || '--'
      }
    />
    <Form.Item
      label={$t({ defaultMessage: 'Last Venue' })}
      children={
        client?.enableLinkToVenue
          ? <TenantLink to={`venues/${client.venueId}/venue-details/overview`}>
            {client?.venueName || '--'}
          </TenantLink>
          : client?.venueName || '--'
      }
    />
    <Form.Item
      label={$t({ defaultMessage: 'Last SSID' })}
      children={
        client?.enableLinkToNetwork
          ? <TenantLink to={`networks/${client.networkId}/network-details/overview`}>
            {client?.ssid || '--'}
          </TenantLink>
          : client?.ssid || '--'
      }
    />
  </>
}

// TODO
function GuestDetails () {
  const { $t } = getIntl()
  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Guest Details' })}
    </Subtitle>
    <Form.Item
      label={$t({ defaultMessage: 'Guest Name' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Mobile Phone' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Email' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Notes' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Guest Created' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Guest Expires' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Max no. of clients' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Other devices' })}
      children={'--'}
    />
  </>
}

// TODO
function DpskPassphraseDetails () {
  const { $t } = getIntl()
  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'DPSK Passphrase Details' })}
    </Subtitle>
    <Form.Item
      label={$t({ defaultMessage: 'Username' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'No. of Devices' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Creation Time' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Expireation Time' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Passphrase' })}
      children={'--'}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Other clients' })}
      children={'--'}
    />
  </>
}