import { useEffect, useState } from 'react'

import { Divider, List, Space } from 'antd'
import moment                   from 'moment-timezone'

import { Card, Loader, Subtitle, Tooltip, Descriptions } from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                     from '@acx-ui/formatter'
import { PassphraseViewer }                              from '@acx-ui/rc/components'
import {
  useGetPassphraseClientQuery,
  useLazyGetApQuery,
  useLazyGetGuestsListQuery,
  useLazyGetNetworkQuery,
  useLazyGetVenueQuery,
  useLazyGetDpskServiceQuery
} from '@acx-ui/rc/services'
import {
  ApDeep,
  Client,
  getOsTypeIcon,
  NetworkSaveData,
  transformQosPriorityType,
  QosPriorityEnum,
  VenueExtended,
  Guest,
  GuestNetworkTypeEnum,
  NetworkTypeEnum,
  transformAdvancedDpskExpirationText,
  ExpirationType,
  displayDeviceCountLimit,
  EXPIRATION_TIME_FORMAT
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }  from '@acx-ui/react-router-dom'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import * as UI from './styledComponents'

interface ClientExtended extends Client {
  hasSwitch: boolean,
  enableLinkToAp: boolean,
  enableLinkToVenue: boolean,
  enableLinkToNetwork: boolean
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

// It will be rename to HistoricalClientProperties
export function ClientProperties ({ clientDetails }: { clientDetails: Client }) {
  const { tenantId } = useParams()
  const [client, setClient] = useState(undefined as unknown as ClientExtended)
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

      const serialNumber = clientDetails?.serialNumber
      const networkId = clientDetails?.networkId
      const venueId = clientDetails?.venueId

      const getDpskServiceData = async () => {
        const dpskService = await getDpskService({ params: { networkId } }, true).unwrap()

        setIsExternalDpskClient(!!(dpskService?.id))
      }

      const getGuestData = async () => {
        const list = (await getGuestsList({
          params: { tenantId },
          payload: getGuestsPayload(clientDetails) }, true).unwrap()
        )?.data || []

        if (list.length > 0) {
          const name = getClientUsername(clientDetails)
          setGuestDetail(list.filter(item => (
            item.wifiNetworkId === networkId
            && item.name === name
          ))[0])
        }
      }

      const getMetaData = async () => {
        try {
          const shouldGetAp = serialNumber && !clientDetails.hasOwnProperty('isApExists')
          const shouldGetVenue = !clientDetails.hasOwnProperty('isVenueExists')

          await Promise.all([
            ...( shouldGetAp
              ? [getAp({ params: { venueId, serialNumber } }, true)] : [[]]
            ),
            ...( shouldGetVenue
              ? [getVenue({ params: { venueId } }, true)] : [[]]
            ),
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
          enableLinkToAp: clientDetails.hasOwnProperty('isApExists') ?
            !!clientDetails.isApExists : !!apData,
          enableLinkToVenue: clientDetails.hasOwnProperty('isVenueExists') ?
            !!clientDetails.isVenueExists : !!venueData,
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
      setClient({} as ClientExtended)
    }
  }, [clientDetails])


  const getProperties = (clientMac: string) => {
    const obj = [
      <ClientDetails client={client} />,
      <LastSession client={client} />,
      (shouldDisplayGuestDetail(networkType, guestType) &&
            <GuestDetails guestDetail={guestDetail} clientMac={clientMac}/>),
      (shouldDisplayDpskPassphraseDetail(networkType, isExternalDpskClient) &&
            <DpskPassphraseDetails
              networkId={client.networkId}
              clientMac={client.clientMac}
              username={getClientUsername(client)}
            />),
      (client?.wifiCallingClient && <WiFiCallingDetails client={client} />)
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
      { getProperties(clientDetails.clientMac) }
    </Loader>
  </Card>
}

function ClientDetails ({ client }: { client: ClientExtended }) {
  const { $t } = getIntl()

  const { clientMac, mldAddr, ipAddress, clientIP, osType, hostname } = client ?? {}

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Client Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'MAC Address' })}
        children={clientMac || noDataDisplay}
      />
      {mldAddr &&
        <Descriptions.Item
          label={$t({ defaultMessage: 'MLD MAC Address' })}
          children={mldAddr}
        />
      }
      <Descriptions.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={ipAddress || clientIP || noDataDisplay}
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
        children={getClientUsername(client) || client?.userId || noDataDisplay}
      />
      {/* <Descriptions.Item // TODO: Tags
        label={$t({ defaultMessage: 'Tags' })}
        children={'--'}
      /> */}
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
        children={client?.wifiCallingCarrierName || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'QoS Priority' })}
        children={
          client?.wifiCallingQosPriority
            ? transformQosPriorityType(client?.wifiCallingQosPriority as QosPriorityEnum)
            : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Total Traffic' })}
        children={
          (client?.wifiCallingTotal && bytesFormatter(client?.wifiCallingTotal)) || noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Transmitted Traffic' })}
        children={
          (client?.wifiCallingTx && bytesFormatter(client?.wifiCallingTx)) || noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Received Traffic' })}
        children={
          (client?.wifiCallingRx && bytesFormatter(client?.wifiCallingRx)) || noDataDisplay
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

  const { 
    disconnectTime, sessionDuration,
    enableLinkToAp, serialNumber, apName,
    enableLinkToVenue, venueId, venueName,
    enableLinkToNetwork, networkId, ssid
  } = client ?? {}

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Last Session' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Start Time' })}
        children={
          disconnectTime && sessionDuration
            ? getTimeFormat(disconnectTime - sessionDuration)
            : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'End Time' })}
        children={
          disconnectTime
            ? getTimeFormat(disconnectTime)
            : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Session duration' })}
        children={
          sessionDuration
            ? durationFormatter(sessionDuration * 1000)
            : noDataDisplay
        }
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Last AP' })}
        >{$t({ defaultMessage: 'AP' })}</Tooltip>
        }
        children={
          enableLinkToAp
            ? <TenantLink to={`devices/wifi/${serialNumber}/details/overview`}>
              {apName || noDataDisplay}
            </TenantLink>
            : apName || noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last <VenueSingular></VenueSingular>' })}
        children={
          enableLinkToVenue
            ? <TenantLink to={`venues/${venueId}/venue-details/overview`}>
              {venueName || noDataDisplay}
            </TenantLink>
            : venueName || noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last SSID' })}
        children={
          enableLinkToNetwork
            ? <TenantLink to={`networks/wireless/${networkId}/network-details/overview`}>
              {ssid || noDataDisplay}
            </TenantLink>
            : ssid || noDataDisplay
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
        children={
          formatter(DateFormatEnum.DateTimeFormat)(guestDetail?.creationDate) || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest Expires' })}
        children={
          formatter(DateFormatEnum.DateTimeFormat)(guestDetail?.expiryDate) || noDataDisplay}
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

function getGuestsPayload ({ clientMac }: Client) {
  return {
    searchString: clientMac,
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
}

function getClientUsername (client?: Client): string | undefined {
  return client?.userName || client?.username
}

function getAuthStatus (client?: Client) {
  const { $t } = getIntl()
  const statusInt = parseInt(client?.status ?? '', 10)
  if (isNaN(statusInt)) return '--'

  let statusText = '--'
  if (statusInt === 1) {
    statusText = $t({ defaultMessage: 'Authorized' })
  } else if (statusInt === 0) {
    statusText = $t({ defaultMessage: 'Unauthorized' })
  } else if (statusInt === -1) {
    statusText = $t({ defaultMessage: 'N/A' })
  }
  return statusText
}
