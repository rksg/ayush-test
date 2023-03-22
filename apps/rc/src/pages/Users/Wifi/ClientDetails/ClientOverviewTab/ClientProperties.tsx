import React, { useEffect, useState } from 'react'

import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'

import { Card, Loader, Subtitle, Tooltip, Descriptions }                       from '@acx-ui/components'
import { DateFormatEnum, formatter }                                           from '@acx-ui/formatter'
import { WifiSignal }                                                          from '@acx-ui/rc/components'
import {
  useLazyGetApQuery,
  useLazyGetGuestsListQuery,
  useLazyGetNetworkQuery,
  useLazyGetVenueQuery
  // TODO:
  // useLazyGetDpskPassphraseByQueryQuery,
} from '@acx-ui/rc/services'
import {
  ApDeep,
  Client,
  ClientStatusEnum,
  getNoiseFloorStatus,
  getRssiStatus,
  getOsTypeIcon,
  NetworkSaveData,
  transformQosPriorityType,
  QosPriorityEnum,
  VenueExtended,
  Guest
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { getIntl }               from '@acx-ui/utils'

import * as UI from './styledComponents'

interface ClientExtended extends Client {
  hasSwitch: boolean,
  enableLinkToAp: boolean,
  enableLinkToVenue: boolean,
  enableLinkToNetwork: boolean
}

export function ClientProperties ({ clientStatus, clientDetails }: {
  clientStatus: string,
  clientDetails: Client
}) {
  const { tenantId } = useParams()
  const [client, setClient] = useState({} as ClientExtended)
  const [networkType, setNetworkType] = useState('')

  const [getAp] = useLazyGetApQuery()
  const [getVenue] = useLazyGetVenueQuery()
  const [getNetwork] = useLazyGetNetworkQuery()
  const [getGuestsList] = useLazyGetGuestsListQuery()
  const [guestDetail, setGuestDetail] = useState({} as Guest)

  // TODO: dpsk
  // const [getDpskPassphraseByQuery] = useLazyGetDpskPassphraseByQueryQuery()

  useEffect(() => {
    if (Object.keys(clientDetails)?.length) {
      let apData = null as unknown as ApDeep
      let venueData = null as unknown as VenueExtended
      let networkData = null as NetworkSaveData | null
      const serialNumber = clientDetails?.apSerialNumber || clientDetails?.serialNumber

      const payload = {
        searchString: clientDetails.clientMac,
        searchTargetFields: [
          'devicesMac'
        ],
        fields: [
          'creationDate',
          'name',
          'mobilePhoneNumber',
          'emailAddress',
          'guestType',
          'ssid',
          'expiryDate',
          'guestStatus',
          'id',
          'networkId',
          'maxNumberOfClients',
          'devicesMac',
          'guestStatus',
          'socialLogin',
          'clients',
          'notes'
        ],
        filters: {
          includeExpired: [
            true
          ]
        }
      }

      const getGuestData = async () => {
        const list = (await getGuestsList({ params: { tenantId: tenantId }, payload }, true)
          .unwrap()).data || []
        if (list.length === 1) {
          setGuestDetail(list[0])
        }
      }

      const getMetaData = async () => {
        try {
          if (serialNumber && !clientDetails.hasOwnProperty('isApExists')) {
            apData = await getAp({
              params: { tenantId, serialNumber }
            }, true).unwrap()
          }
          if (!clientDetails.hasOwnProperty('isVenueExists')) {
            venueData = await getVenue({
              params: { tenantId, venueId: clientDetails?.venueId }
            }, true).unwrap()
          }
          networkData = await getNetwork({
            params: { tenantId, networkId: clientDetails?.networkId }
          }, true).unwrap()
          setData(apData, venueData, networkData)
        } catch {
          setData(apData, venueData, networkData)
        }
      }

      const setData = (apData: ApDeep, venueData: VenueExtended, networkData: NetworkSaveData | null
      ) => {
        setNetworkType(networkData?.type || '')
        setClient({
          ...clientDetails,
          hasSwitch: false, // TODO: this.userProfileService.isSwitchEnabled(profile);
          ...(apData && { apName: apData?.name }),
          ...(venueData && { venueName: venueData?.name }),
          ...(networkData && { networkName: networkData?.name }),
          enableLinkToAp: clientDetails.hasOwnProperty('isApExists') ?
            !!clientDetails.isApExists : !!apData,
          enableLinkToVenue: clientDetails.hasOwnProperty('isVenueExists') ?
            !!clientDetails.isVenueExists : !!venueData,
          enableLinkToNetwork: !!networkData
        })

        if ('guest' === networkData?.type) {
          getGuestData()
        }
      }

      getMetaData()
      // TODO: get dpsk/guest data
      // if (networkData?.type === 'dpsk') {
      //   const dpskData = await getDpskPassphraseByQuery({
      //     params: { tenantId }, payload: {}
      //   }, true).unwrap()
      // }
    }
  }, [clientDetails])

  const getProperties = (clientStatus: string, networkType: string, clientMac: string) => {
    let obj = null
    switch (clientStatus) {
      case ClientStatusEnum.CONNECTED:
        obj = [
          <ClientDetails client={client} />,
          <OperationalData client={client} />,
          <Connection client={client} />,
          (networkType === 'guest' &&
            <GuestDetails guestDetail={guestDetail} clientMac={clientMac}/>),
          (networkType === 'dpsk' && <DpskPassphraseDetails />),
          <WiFiCallingDetails client={client} />
        ]
        break
      case ClientStatusEnum.HISTORICAL:
        obj = [
          <ClientDetails client={client} />,
          <LastSession client={client} />,
          (networkType === 'guest' &&
            <GuestDetails guestDetail={guestDetail} clientMac={clientMac}/>),
          (networkType === 'dpsk' && <DpskPassphraseDetails />),
          <WiFiCallingDetails client={client} />
        ]
        break
    }

    const divider = <Divider />
    const objLength = obj ? obj?.filter(item => item)?.length - 1 : 0
    return obj?.filter(item => item)?.map((item, index) => (
      <Space key={`detail_${index}`} style={{ display: 'block' }}>
        { item }
        { index !== objLength && divider }
      </Space>
    ))
  }

  return <Card>
    <Loader states={[{
      isLoading: !Object.keys(client).length
    }]}>
      { getProperties(clientStatus, networkType, clientDetails.clientMac) }
    </Loader>
  </Card>
}

function ClientDetails ({ client }: { client: ClientExtended }) {
  const { $t } = getIntl()

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Client Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'MAC Address' })}
        children={client?.clientMac || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={client?.ipAddress || client?.clientIP || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'OS' })}
        children={client?.osType ? <UI.OsType size={4}>
          {getOsTypeIcon(client?.osType || '')}
          {client?.osType}
        </UI.OsType> : '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Host Name' })}
        children={client?.hostname || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Username' })}
        children={client?.username || client?.userId || '--'}
      />
      <Descriptions.Item // TODO
        label={$t({ defaultMessage: 'Tags' })}
        children={'--'}
      />
    </Descriptions>
  </>
}

function Connection ({ client }: { client: ClientExtended }) {
  const { $t } = getIntl()

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Connection' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Access Point' })}
        >{$t({ defaultMessage: 'AP' })}</Tooltip>
        }
        children={
          client?.enableLinkToAp
            ? <TenantLink to={`devices/wifi/${client.apSerialNumber}/details/overview`}>
              {client?.apName || '--'}
            </TenantLink>
            : client?.apName || '--'
        }
      />
      {client?.hasSwitch && <Descriptions.Item
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
      <Descriptions.Item
        label={$t({ defaultMessage: 'Venue' })}
        children={
          client?.enableLinkToVenue
            ? <TenantLink to={`venues/${client.venueId}/venue-details/overview`}>
              {client?.venueName || '--'}
            </TenantLink>
            : client?.venueName || '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Wireless Network' })}
        children={
          client?.enableLinkToNetwork
            ? <TenantLink to={`networks/wireless/${client.networkId}/network-details/overview`}>
              {client?.networkName || '--'}
            </TenantLink>
            : client?.networkName || '--'
        }
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Service Set Identifier' })}
        >{$t({ defaultMessage: 'SSID' })}
        </Tooltip>}
        children={client?.networkSsid || '--'}
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Virtual Local Area Network Identifier' })}
        >{$t({ defaultMessage: 'VLAN ID' })}
        </Tooltip>}
        children={client?.vlan || '--'}
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Basic Service Set Identifier' })}
        >{$t({ defaultMessage: 'BSSID' })}
        </Tooltip>}
        children={client?.bssid || '--'}
      />
    </Descriptions>
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
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={intl.$t({ defaultMessage: 'Radio Frequency Channel' })}
        >{intl.$t({ defaultMessage: 'RF Channel' })}
        </Tooltip>}
        children={client?.rfChannel || '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Traffic From Client' })}
        children={client?.transmittedBytes ? <Tooltip
          placement='bottom'
          title={`${numberFormatter(client?.transmittedBytes)} B`}
        >
          {bytesFormatter(client?.transmittedBytes)}
        </Tooltip> : '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Packets From Client' })}
        children={client?.transmittedPackets ? numberFormatter(client?.transmittedPackets) : '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Traffic To Client' })}
        children={client?.receivedBytes ? <Tooltip
          placement='bottom'
          title={`${numberFormatter(client?.receivedBytes)} B`}
        >{bytesFormatter(client?.receivedBytes)}
        </Tooltip> : '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Packets To Client' })}
        children={client?.receivedPackets ? numberFormatter(client?.receivedPackets) : '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Frames Dropped' })}
        children={client?.framesDropped ? numberFormatter(client?.framesDropped) : '--'}
      />
      <Descriptions.Item
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
      <Descriptions.Item
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
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Noise Floor' })}
        children={<Space
          style={{ color: getNoiseFloorStatus(intl, client?.noiseFloor_dBm)?.color }}
        >
          <Tooltip
            placement='bottom'
            title={getNoiseFloorStatus(intl, client?.noiseFloor_dBm)?.tooltip}
          >
            {client?.noiseFloor_dBm ? client.noiseFloor_dBm + ' dBm' : '--'}
          </Tooltip>
        </Space>
        }
      />
    </Descriptions>
  </>
}

function WiFiCallingDetails ({ client }: { client: ClientExtended }) {
  const { $t } = getIntl()
  const bytesFormatter = formatter('bytesFormat')

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Wi-Fi Calling Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Carrier Name' })}
        children={client?.wifiCallingCarrierName || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'QoS Priority' })}
        children={
          client?.wifiCallingQosPriority
            ? transformQosPriorityType(client?.wifiCallingQosPriority as QosPriorityEnum)
            : '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Total Traffic' })}
        children={
          (client?.wifiCallingTotal && bytesFormatter(client?.wifiCallingTotal)) || '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Transmitted Traffic' })}
        children={
          (client?.wifiCallingTx && bytesFormatter(client?.wifiCallingTx)) || '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Recieved Traffic' })}
        children={
          (client?.wifiCallingRx && bytesFormatter(client?.wifiCallingRx)) || '--'
        }
      />
    </Descriptions>
  </>
}

function LastSession ({ client }: { client: ClientExtended }) {
  const { $t } = getIntl()
  const durationFormatter = formatter('durationFormat')
  const getTimeFormat = (data: number) =>
    formatter(DateFormatEnum.DateTimeFormat)(data * 1000)

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Last Session' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Start Time' })}
        children={
          client?.disconnectTime && client?.sessionDuration
            ? getTimeFormat(client.disconnectTime - client.sessionDuration)
            : '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'End Time' })}
        children={
          client.disconnectTime
            ? getTimeFormat(client.disconnectTime)
            : '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Session duration' })}
        children={
          client?.sessionDuration
            ? durationFormatter(client?.sessionDuration * 1000)
            : '--'
        }
      />
      <Descriptions.Item
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
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last Venue' })}
        children={
          client?.enableLinkToVenue
            ? <TenantLink to={`venues/${client.venueId}/venue-details/overview`}>
              {client?.venueName || '--'}
            </TenantLink>
            : client?.venueName || '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last SSID' })}
        children={
          client?.enableLinkToNetwork
            ? <TenantLink to={`networks/wireless/${client.networkId}/network-details/overview`}>
              {client?.ssid || '--'}
            </TenantLink>
            : client?.ssid || '--'
        }
      />
    </Descriptions>
  </>
}

function GuestDetails ({ guestDetail, clientMac }: {
                        guestDetail: Guest
                        clientMac: string
                      }) {
  const { $t } = getIntl()
  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Guest Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest Name' })}
        children={guestDetail?.name || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Mobile Phone' })}
        children={guestDetail?.mobilePhoneNumber || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Email' })}
        children={guestDetail?.emailAddress || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Notes' })}
        children={guestDetail?.notes || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest Created' })}
        children={formatter(DateFormatEnum.DateTimeFormat)(guestDetail?.creationDate) || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest Expires' })}
        children={formatter(DateFormatEnum.DateTimeFormat)(guestDetail?.expiryDate) || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Max no. of clients' })}
        children={guestDetail?.maxNumberOfClients || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Other devices' })}
        children={guestDetail?.clients?.filter(client => clientMac !== client.clientMac).map(
          client =>
            <TenantLink
              // eslint-disable-next-line max-len
              to={`/users/wifi/clients/${client.clientMac}/details/overview?hostname=${client.hostname}`}>
              {client.clientMac}
            </TenantLink>) || '--'}
      />
    </Descriptions>
  </>
}

// TODO
function DpskPassphraseDetails () {
  const { $t } = getIntl()
  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'DPSK Passphrase Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Username' })}
        children={'--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'No. of Devices' })}
        children={'--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Creation Time' })}
        children={'--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Expireation Time' })}
        children={'--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Passphrase' })}
        children={'--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Other clients' })}
        children={'--'}
      />
    </Descriptions>
  </>
}
