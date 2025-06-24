import { useEffect, useState } from 'react'

import { Divider, List, Space } from 'antd'
import moment                   from 'moment-timezone'
import { useIntl }              from 'react-intl'

import { Card, Loader, Subtitle, Tooltip, Descriptions }           from '@acx-ui/components'
import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                               from '@acx-ui/formatter'
import { PassphraseViewer, WifiSignal, networkDisplayTransformer } from '@acx-ui/rc/components'
import {
  useGetPassphraseClientQuery,
  useLazyGetApQuery,
  useLazyGetDpskServiceQuery,
  useLazyGetGuestsListQuery,
  useLazyGetNetworkQuery,
  useLazyGetVenueQuery
} from '@acx-ui/rc/services'
import {
  ApDeep,
  getRssiStatus,
  getOsTypeIcon,
  NetworkSaveData,
  VenueExtended,
  Guest,
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  transformAdvancedDpskExpirationText,
  ExpirationType,
  displayDeviceCountLimit,
  EXPIRATION_TIME_FORMAT,
  ClientInfo,
  transformQosPriorityType,
  QosPriorityEnum,
  transformByte
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }  from '@acx-ui/react-router-dom'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import * as UI from './styledComponents'

type ClientInfoExtended = ClientInfo & {
  hasSwitch: boolean,
  enableLinkToAp: boolean,
  enableLinkToVenue: boolean,
  enableLinkToNetwork: boolean,
  networkName?: string
}

// eslint-disable-next-line max-len
const shouldDisplayDpskPassphraseDetail = (networkType: NetworkTypeEnum | undefined, isExternalDpskClient: boolean) => {
  return networkType === NetworkTypeEnum.DPSK && !isExternalDpskClient
}

// eslint-disable-next-line max-len
const shouldDisplayGuestDetail = (
  networkType: NetworkTypeEnum | undefined,
  guestType: GuestNetworkTypeEnum | undefined
) => {
  if (!networkType || !guestType) return false

  const displayGuestNetworkTypes = [
    GuestNetworkTypeEnum.GuestPass,
    GuestNetworkTypeEnum.HostApproval,
    GuestNetworkTypeEnum.SelfSignIn
  ]

  return (networkType === NetworkTypeEnum.CAPTIVEPORTAL &&
    displayGuestNetworkTypes.includes(guestType))
}
export function RbacClientProperties ({ clientDetails } : { clientDetails: ClientInfo }) {
  const { tenantId } = useParams()
  // eslint-disable-next-line max-len
  const [client, setClient] = useState(undefined as unknown as ClientInfoExtended)
  const [networkType, setNetworkType] = useState<NetworkTypeEnum>()
  const [guestType, setGuestType] = useState<GuestNetworkTypeEnum>()
  const [getAp] = useLazyGetApQuery()
  const [getVenue] = useLazyGetVenueQuery()
  const [getNetwork] = useLazyGetNetworkQuery()
  const [getDpskService] = useLazyGetDpskServiceQuery()
  const [getGuestsList] = useLazyGetGuestsListQuery()

  const [guestDetail, setGuestDetail] = useState({} as Guest)
  const [isExternalDpskClient, setIsExternalDpskClient] = useState(false)

  useEffect(() => {
    if (Object.keys(clientDetails)?.length) {
      let apData = null as unknown as ApDeep
      let venueData = null as unknown as VenueExtended
      let networkData = null as NetworkSaveData | null

      const {
        macAddress, username,
        apInformation, venueInformation, networkInformation
      } = clientDetails || {}

      const serialNumber = apInformation?.serialNumber
      const networkId = networkInformation?.id
      const venueId = venueInformation?.id

      const getDpskServiceData = async () => {
        const dpskService = await getDpskService({ params: { networkId } }, true).unwrap()

        setIsExternalDpskClient(!!(dpskService?.id))
      }

      const getGuestData = async () => {
        const list = (await getGuestsList({
          params: { tenantId },
          payload: getGuestsPayload(macAddress) }, true).unwrap()
        )?.data || []

        if (list.length > 0) {
          const filteredList = list.filter(item => item.wifiNetworkId === networkId)
          let result = filteredList.find(item => item.name === username)
            || filteredList.find(item => item.devicesMac?.includes(macAddress))
          setGuestDetail(result ?? ({} as Guest))
        }
      }

      const getMetaData = async () => {
        try {
          await Promise.all([
            getAp({ params: { venueId, serialNumber }, enableRbac: true }, true),
            getVenue({ params: { venueId }, enableRbac: true }, true),
            getNetwork({ params: { networkId }, enableRbac: true }, true)
          ]).then(([ ap, venue, network ]) => {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            setData(
              ((ap as any)?.data ?? null) as unknown as ApDeep,
              ((venue as any)?.data ?? null) as unknown as VenueExtended,
              ((network as any)?.data ?? null) as unknown as NetworkSaveData
            )
            /* eslint-enable @typescript-eslint/no-explicit-any */
          }).catch((error) => {
            console.log(error) // eslint-disable-line no-console
          })

        } catch {
          setData(apData, venueData, networkData)
        }
      }

      const setData = (apData: ApDeep,
        venueData: VenueExtended,
        networkData: NetworkSaveData | null
      ) => {
        setNetworkType(networkData?.type)
        setGuestType(networkData?.guestPortal?.guestNetworkType)

        setClient({
          ...clientDetails,
          hasSwitch: false, // TODO: this.userProfileService.isSwitchEnabled(profile);
          ...(apData && { apName: apData?.name }),
          ...(venueData && { venueName: venueData?.name }),
          ...(networkData && { networkName: networkData?.name }),
          enableLinkToAp: !!apData,
          enableLinkToVenue: !!venueData,
          enableLinkToNetwork: !!networkData
        })

        if (NetworkTypeEnum.DPSK === networkData?.type) {
          getDpskServiceData()
        }
        else if (NetworkTypeEnum.CAPTIVEPORTAL === networkData?.type) {
          getGuestData()
        }
      }

      getMetaData()

    } else {
      setClient({} as ClientInfoExtended)
    }
  }, [clientDetails])

  const getProperties = (clientMac: string) => {
    const obj = [
      <ClientDetails client={client} />,
      <OperationalData client={client} />,
      <Connection client={client} />,
      (shouldDisplayGuestDetail(networkType, guestType) &&
        <GuestDetails guestDetail={guestDetail} clientMac={clientMac}/>),
      (shouldDisplayDpskPassphraseDetail(networkType, isExternalDpskClient) &&
        <DpskPassphraseDetails
          networkId={client?.networkInformation.id}
          clientMac={client?.macAddress}
          username={client?.username}
        />
      ),
      (client?.wifiCallingEnabled && <WiFiCallingDetails client={client} />)
    ]

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
      isLoading: !client
    }]}>
      { getProperties(clientDetails.macAddress) }
    </Loader>
  </Card>

}


function ClientDetails ({ client }: { client: ClientInfoExtended }) {
  const { $t } = getIntl()

  const {
    macAddress, mldMacAddress, ipAddress,
    osType, hostname, username
  } = client ?? {}

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Client Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'MAC Address' })}
        children={macAddress || noDataDisplay}
      />
      { mldMacAddress &&
        <Descriptions.Item
          label={$t({ defaultMessage: 'MLD MAC Address' })}
          children={mldMacAddress}
        />
      }
      <Descriptions.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={ipAddress || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'OS' })}
        children={osType ?
          <UI.OsType size={4}>
            {getOsTypeIcon(osType)}
            {osType}
          </UI.OsType> : noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Host Name' })}
        children={hostname || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Username' })}
        children={username || noDataDisplay}
      />
      {/* <Descriptions.Item // TODO: Tags
        label={$t({ defaultMessage: 'Tags' })}
        children={noDataDisplay}
      /> */}
    </Descriptions>
  </>
}

function Connection ({ client }: { client: ClientInfoExtended }) {
  const wifiEDAClientRevokeToggle = useIsSplitOn(Features.WIFI_EDA_CLIENT_REVOKE_TOGGLE)
  const intl = useIntl()
  const { $t } = intl
  const {
    enableLinkToAp, hasSwitch, enableLinkToVenue, networkName,
    networkInformation, apInformation, switchInformation, venueInformation
  } = client ?? {}

  const showVni = !!networkInformation?.vni
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
        children={enableLinkToAp ?
          <TenantLink
            to={`devices/wifi/${apInformation?.serialNumber}/details/overview`}>
            {apInformation?.name || noDataDisplay}
          </TenantLink>
          : apInformation?.name || noDataDisplay
        }
      />
      {hasSwitch && <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Switch' })}
        >{$t({ defaultMessage: 'Switch' })}</Tooltip>
        }
        children={
          client?.enableLinkToAp ?
            // eslint-disable-next-line max-len
            <TenantLink to={`devices/switches/${switchInformation?.serialNumber}/details/overview`}>
              {switchInformation?.name || noDataDisplay}
            </TenantLink>
            : switchInformation?.name || noDataDisplay
        }
      />}
      <Descriptions.Item
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={
          enableLinkToVenue ?
            // eslint-disable-next-line max-len
            <TenantLink to={`venues/${client?.venueInformation?.id}/venue-details/overview`}>
              {venueInformation?.name || noDataDisplay}
            </TenantLink>
            : venueInformation?.name || noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Wireless Network' })}
        children={
          client?.enableLinkToNetwork ?
          // eslint-disable-next-line max-len
            <TenantLink to={`networks/wireless/${networkInformation?.id}/network-details/overview`}>
              {networkName || noDataDisplay}
            </TenantLink>
            : networkName || noDataDisplay
        }
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Service Set Identifier' })}
        >{$t({ defaultMessage: 'SSID' })}
        </Tooltip>}
        children={networkInformation?.ssid || noDataDisplay}
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Virtual Local Area Network Identifier' })}
        >{$t({ defaultMessage: 'VLAN ID' })}
        </Tooltip>}
        children={networkInformation?.vlan || noDataDisplay}
      />
      { showVni &&
        <Descriptions.Item
          label={<Tooltip
            placement='bottom'
            title={$t({ defaultMessage: 'VXLAN network identifier' })}
          >{$t({ defaultMessage: 'VNI' })}
          </Tooltip>}
          children={networkInformation?.vni || noDataDisplay}
        />
      }
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Basic Service Set Identifier' })}
        >{$t({ defaultMessage: 'BSSID' })}
        </Tooltip>}
        children={apInformation?.bssid || noDataDisplay}
      />
      { wifiEDAClientRevokeToggle && <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Network Type' })}
        >{$t({ defaultMessage: 'Network Type' })}
        </Tooltip>}
        children={networkDisplayTransformer(intl, networkInformation?.type)}
      /> }
      <Descriptions.Item
        label={$t({ defaultMessage: 'Auth Method' })}
        children={networkInformation?.authenticationMethod || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Auth Status' })}
        children={getAuthStatus(client?.authenticationStatus)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Encryption' })}
        children={networkInformation?.encryptionMethod || noDataDisplay}
      />
    </Descriptions>
  </>
}

function OperationalData ({ client }: { client: ClientInfoExtended }) {
  const intl = useIntl()
  const numberFormatter = formatter('numberWithCommas')
  const { radioStatus, trafficStatus, signalStatus } = client ?? {}

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
        children={radioStatus?.channel || noDataDisplay}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Traffic From Client' })}
        children={trafficStatus?.trafficFromClient ? <Tooltip
          placement='bottom'
          title={`${numberFormatter(trafficStatus.trafficFromClient)} Bytes`}
        >
          {transformByte(trafficStatus.trafficFromClient)}
        </Tooltip> : noDataDisplay}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Packets From Client' })}
        children={trafficStatus?.packetsFromClient ?
          numberFormatter(trafficStatus?.packetsFromClient) : noDataDisplay}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Traffic To Client' })}
        children={trafficStatus?.trafficToClient ? <Tooltip
          placement='bottom'
          title={`${numberFormatter(trafficStatus.trafficToClient)} Bytes`}
        >
          {transformByte(trafficStatus.trafficToClient)}
        </Tooltip> : noDataDisplay}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Packets To Client' })}
        children={trafficStatus?.packetsToClient ?
          numberFormatter(trafficStatus?.packetsToClient) : noDataDisplay}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Frames Dropped' })}
        children={trafficStatus?.framesDropped ?
          numberFormatter(trafficStatus?.framesDropped) : noDataDisplay}
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={intl.$t({ defaultMessage: 'Signal-to-Noise Ratio' })}
        >{intl.$t({ defaultMessage: 'SNR' })}
        </Tooltip>}
        children={<WifiSignal
          snr={signalStatus?.snr}
          text={signalStatus?.snr
            ? signalStatus?.snr + ' dB' : noDataDisplay}
        />}
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={intl.$t({ defaultMessage: 'Received Signal Strength Indicator' })}
        >{intl.$t({ defaultMessage: 'RSSI' })}
        </Tooltip>}
        children={<Space style={{
          color: getRssiStatus(intl, signalStatus?.rssi)?.color
        }}>
          <Tooltip
            placement='bottom'
            title={getRssiStatus(intl, signalStatus?.rssi)?.tooltip}
          >
            {client?.signalStatus?.rssi
              ? client?.signalStatus?.rssi + ' dBm' : noDataDisplay}
          </Tooltip>
        </Space>}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Radio Type' })}
        children={radioStatus?.type ? radioStatus?.type : noDataDisplay}
      />
    </Descriptions>
  </>
}

function WiFiCallingDetails ({ client }: { client: ClientInfoExtended }) {
  const { $t } = getIntl()
  const bytesFormatter = formatter('bytesFormat')
  const { wifiCallingStatus } = client ?? {}

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Wi-Fi Calling Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Carrier Name' })}
        children={wifiCallingStatus.carrierName || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'QoS Priority' })}
        children={
          wifiCallingStatus?.qosPriority
            ? transformQosPriorityType(wifiCallingStatus.qosPriority as QosPriorityEnum)
            : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Total Traffic' })}
        children={
          (wifiCallingStatus.totalTraffic &&
            bytesFormatter(wifiCallingStatus.totalTraffic)) || noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Transmitted Traffic' })}
        children={
          (wifiCallingStatus.trafficToClient &&
            bytesFormatter(wifiCallingStatus.trafficToClient)) || noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Received Traffic' })}
        children={
          (wifiCallingStatus.trafficFromClient &&
            bytesFormatter(wifiCallingStatus.trafficFromClient)) || noDataDisplay
        }
      />
    </Descriptions>
  </>
}

function GuestDetails ({ guestDetail, clientMac }: {
  guestDetail: Guest,
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
        children={guestDetail?.name || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Mobile Phone' })}
        children={guestDetail?.mobilePhoneNumber || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Email' })}
        children={guestDetail?.emailAddress || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Notes' })}
        children={guestDetail?.notes || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest Created' })}
        children={guestDetail?.creationDate
          ? formatter(DateFormatEnum.DateTimeFormat)(guestDetail.creationDate)
          : noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest Expires' })}
        children={guestDetail?.expiryDate
          ? formatter(DateFormatEnum.DateTimeFormat)(guestDetail.expiryDate)
          : noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Max no. of clients' })}
        children={guestDetail?.maxNumberOfClients || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Other devices' })}
        children={guestDetail?.clients?.filter(client => clientMac !== client.macAddress).map(
          client =>
            <TenantLink
              // eslint-disable-next-line max-len
              to={`/users/wifi/clients/${client.macAddress}/details/overview`}
              key={client.macAddress}
            >
              {client.macAddress}
            </TenantLink>) || noDataDisplay}
      />
    </Descriptions>
  </>
}

// eslint-disable-next-line max-len
function DpskPassphraseDetails (props: { networkId: string, clientMac: string, username?: string }) {
  const isSupportWifiWiredClient = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)
  const { networkId, clientMac, username } = props
  const intl = getIntl()
  const { passphraseClient } = useGetPassphraseClientQuery({
    payload: { networkId, mac: clientMac, username: username ?? '' }
  }, {
    selectFromResult: ({ data }) => {
      return {
        passphraseClient: data
          ? { ...data, clientMac: data.clientMac.filter(mac => mac !== clientMac) }
          : undefined
      }
    }
  })

  return <>
    <Subtitle level={4}>
      {intl.$t({ defaultMessage: 'DPSK Passphrase Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Username' })}
        children={passphraseClient?.username}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'No. of Devices' })}
        children={passphraseClient && displayDeviceCountLimit(passphraseClient.numberOfDevices)}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Creation Time' })}
        children={passphraseClient &&
          moment(passphraseClient.createdDate).format(EXPIRATION_TIME_FORMAT)
        }
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Expiration Time' })}
        children={passphraseClient &&
          transformAdvancedDpskExpirationText(intl, {
            expirationType: passphraseClient.expirationDate ? ExpirationType.SPECIFIED_DATE : null,
            expirationDate: passphraseClient.expirationDate,
            displayTime: true
          })
        }
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Passphrase' })}
        children={passphraseClient && <PassphraseViewer passphrase={passphraseClient.passphrase}/>}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Other clients' })}
        children={passphraseClient && passphraseClient.clientMac.length > 0 &&
          <List<string>
            dataSource={passphraseClient.clientMac}
            renderItem={item => {
              const linkPath = isSupportWifiWiredClient
                ? `users/wired/switch/clients/${item}`
                : `users/switch/clients/${item}`
              return <List.Item>
                <TenantLink to={linkPath}>{item}</TenantLink>
              </List.Item>
            }}
          />
        }
      />
    </Descriptions>
  </>
}

function getGuestsPayload (clientMac: string) {
  return {
    searchString: clientMac,
    searchTargetFields: ['devicesMac'],
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
      includeExpired: [true]
    }
  }
}

function getAuthStatus (statusInt: number) {
  const { $t } = getIntl()
  if (isNaN(statusInt)) return noDataDisplay

  let statusText: string = noDataDisplay
  if (statusInt === 1) {
    statusText = $t({ defaultMessage: 'Authorized' })
  } else if (statusInt === 0) {
    statusText = $t({ defaultMessage: 'Unauthorized' })
  } else if (statusInt === -1) {
    statusText = $t({ defaultMessage: 'N/A' })
  }
  return statusText
}
