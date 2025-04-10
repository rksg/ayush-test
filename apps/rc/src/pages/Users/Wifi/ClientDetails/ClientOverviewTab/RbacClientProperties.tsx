import React, { useEffect, useState } from 'react'

import { Divider, List, Space } from 'antd'
import { parseInt }             from 'lodash'
import moment                   from 'moment-timezone'
import { useIntl }              from 'react-intl'

import { Card, Loader, Subtitle, Tooltip, Descriptions }           from '@acx-ui/components'
import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                               from '@acx-ui/formatter'
import { PassphraseViewer, WifiSignal, networkDisplayTransformer } from '@acx-ui/rc/components'
import {
  useGetPassphraseClientQuery,
  useLazyGetApQuery,
  useLazyGetGuestsListQuery,
  useLazyGetNetworkQuery,
  useLazyGetVenueQuery,
  useLazyGetClientsQuery
} from '@acx-ui/rc/services'
import {
  ApDeep,
  ClientStatusEnum,
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
  QosPriorityEnum
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { getIntl }               from '@acx-ui/utils'

import * as UI from './styledComponents'

interface ClientInfoExtended extends ClientInfo {
  hasSwitch: boolean,
  enableLinkToAp: boolean,
  enableLinkToVenue: boolean,
  enableLinkToNetwork: boolean,
  radioType: string
}

// eslint-disable-next-line
const getRadioTypeFromRbacAndNonRbacAPI = (nonRbacRadioType: any, rbacRadioType: any, ff: boolean) : string => {
  let radioType = undefined
  if (ff) {
    radioType = rbacRadioType?.data.data[0]?.radioStatus?.type
  } else {
    radioType = nonRbacRadioType?.data?.data[0]?.radio?.mode
  }

  if(radioType === undefined || radioType === '') {
    radioType = '--'
  }
  return radioType
}

export function RbacClientProperties ({ clientStatus, clientInfo } : {
  clientStatus: string,
  clientInfo: ClientInfo
}) {

  const { tenantId } = useParams()
  // eslint-disable-next-line max-len
  const [stateOfClientInfo, setStateOfClientInfo] = useState(undefined as unknown as ClientInfoExtended)
  const [networkType, setNetworkType] = useState<NetworkTypeEnum>()
  const [guestType, setGuestType] = useState<GuestNetworkTypeEnum>()
  const [getAp] = useLazyGetApQuery()
  const [getVenue] = useLazyGetVenueQuery()
  const [getNetwork] = useLazyGetNetworkQuery()
  const [getGuestsList] = useLazyGetGuestsListQuery()
  const [getClientRbac] = useLazyGetClientsQuery()
  const [guestDetail, setGuestDetail] = useState({} as Guest)
  const [isExternalDpskClient, setIsExternalDpskClient] = useState(false)

  useEffect(() => {
    if (Object.keys(clientInfo)?.length) {
      let apData = null as unknown as ApDeep
      let venueData = null as unknown as VenueExtended
      let networkData = null as NetworkSaveData | null
      let radioType = null as string | null
      const serialNumber = clientInfo?.apInformation?.serialNumber

      const getGuestData = async () => {
        const list = (await getGuestsList({
          params: { tenantId },
          payload: getGuestsPayload(clientInfo?.macAddress) }, true).unwrap()
        )?.data || []

        if (list.length > 0) {
          const networkId = clientInfo?.networkInformation?.id
          const name = clientInfo?.username
          const mac = clientInfo?.macAddress
          let result = list.find(item => item.wifiNetworkId === networkId && item.name === name)
            || list.find(item => item.wifiNetworkId === networkId && item.devicesMac?.includes(mac))
          setGuestDetail(result ?? ({} as Guest))
        }
      }

      const getMetaData = async () => {
        try {

          await Promise.all([
            getAp({ params: { tenantId, serialNumber } }, true),
            getVenue({ params: { tenantId, venueId: clientInfo?.venueInformation?.id } }, true),
            // eslint-disable-next-line max-len
            getNetwork({ params: { tenantId, networkId: clientInfo?.networkInformation?.id } }, true),
            getClientRbac({ payload: {
              fields: [
                'macAddress','radioStatus.type'
              ],
              filters: {
                macAddress: [clientInfo?.macAddress]
              }
            } })
          ]).then(([ ap, venue, network, rbacRadioType ]) => {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            setData(
              ((ap as any)?.data ?? null) as unknown as ApDeep,
              ((venue as any)?.data ?? null) as unknown as VenueExtended,
              ((network as any)?.data ?? null) as unknown as NetworkSaveData,
              getRadioTypeFromRbacAndNonRbacAPI(undefined, rbacRadioType, true)
            )
            /* eslint-enable @typescript-eslint/no-explicit-any */
          }).catch((error) => {
            console.log(error) // eslint-disable-line no-console
          })

        } catch {
          setData(apData, venueData, networkData, radioType)
        }
      }

      const setData = (apData: ApDeep,
        venueData: VenueExtended,
        networkData: NetworkSaveData | null,
        clientMacAndRadioType: string | null
      ) => {
        setNetworkType(networkData?.type)
        setGuestType(networkData?.guestPortal?.guestNetworkType)

        setStateOfClientInfo({
          ...clientInfo,
          hasSwitch: false, // TODO: this.userProfileService.isSwitchEnabled(profile);
          ...(apData && { apName: apData?.name }),
          ...(venueData && { venueName: venueData?.name }),
          ...(networkData && { networkName: networkData?.name }),
          enableLinkToAp: !!apData,
          enableLinkToVenue: !!venueData,
          enableLinkToNetwork: !!networkData,
          radioType: (clientMacAndRadioType === null ? '--' : clientMacAndRadioType)
        })

        setIsExternalDpskClient(!networkData?.dpskServiceProfileId)

        if ('guest' === networkData?.type) {
          getGuestData()
        }
      }

      getMetaData()

    } else {
      setStateOfClientInfo({} as ClientInfoExtended)
    }
  }, [clientInfo])

  const shouldDisplayDpskPassphraseDetail = () => {
    return networkType === NetworkTypeEnum.DPSK && !isExternalDpskClient
  }

  const shouldDisplayGuestDetail = () => {
    return networkType === NetworkTypeEnum.CAPTIVEPORTAL && (
      guestType === GuestNetworkTypeEnum.GuestPass ||
      guestType === GuestNetworkTypeEnum.HostApproval ||
      guestType === GuestNetworkTypeEnum.SelfSignIn
    )
  }

  const getProperties = (clientStatus: string, clientMac: string) => {
    let obj = null
    switch (clientStatus) {
      case ClientStatusEnum.CONNECTED:
        obj = [
          <ClientDetails clientInfo={stateOfClientInfo} />,
          <OperationalData clientInfo={stateOfClientInfo} />,
          <Connection clientInfo={stateOfClientInfo} />,
          (shouldDisplayGuestDetail() &&
            <GuestDetails guestDetail={guestDetail} clientMac={clientMac}/>),
          (shouldDisplayDpskPassphraseDetail() &&
            <DpskPassphraseDetails
              networkId={clientInfo?.networkInformation.id}
              clientMac={clientInfo?.macAddress}
              username={clientInfo?.username}
            />
          ),
          // eslint-disable-next-line max-len
          (stateOfClientInfo?.wifiCallingEnabled && <WiFiCallingDetails clientInfo={stateOfClientInfo} />)
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
      isLoading: !stateOfClientInfo
    }]}>
      { getProperties(clientStatus, clientInfo.macAddress) }
    </Loader>
  </Card>

}


function ClientDetails ({ clientInfo }: { clientInfo: ClientInfoExtended }) {
  const { $t } = getIntl()

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Client Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'MAC Address' })}
        children={clientInfo?.macAddress || '--'}
      />
      { clientInfo?.mldMacAddress &&
        <Descriptions.Item
          label={$t({ defaultMessage: 'MLD MAC Address' })}
          children={clientInfo?.mldMacAddress}
        />
      }
      <Descriptions.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={clientInfo?.ipAddress || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'OS' })}
        children={clientInfo?.osType ? <UI.OsType size={4}>
          {getOsTypeIcon(clientInfo?.osType || '')}
          {clientInfo?.osType}
        </UI.OsType> : '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Host Name' })}
        children={clientInfo?.hostname || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Username' })}
        children={clientInfo?.username || '--'}
      />
      {/* <Descriptions.Item // TODO: Tags
        label={$t({ defaultMessage: 'Tags' })}
        children={'--'}
      /> */}
    </Descriptions>
  </>
}

function Connection ({ clientInfo }: { clientInfo: ClientInfoExtended }) {
  const wifiEDAClientRevokeToggle = useIsSplitOn(Features.WIFI_EDA_CLIENT_REVOKE_TOGGLE)
  const intl = useIntl()
  const { $t } = intl
  const showVni = !!clientInfo?.networkInformation?.vni
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
          clientInfo?.enableLinkToAp ?
            <TenantLink
              to={`devices/wifi/${clientInfo.apInformation?.serialNumber}/details/overview`}>
              {clientInfo?.apInformation?.name || '--'}
            </TenantLink>
            : clientInfo?.apInformation?.name || '--'
        }
      />
      {clientInfo?.hasSwitch && <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Switch' })}
        >{$t({ defaultMessage: 'Switch' })}</Tooltip>
        }
        children={
          clientInfo?.enableLinkToAp ?
            // eslint-disable-next-line max-len
            <TenantLink to={`devices/switches/${clientInfo?.switchInformation?.serialNumber}/details/overview`}>
              {clientInfo?.switchInformation?.name || '--'}
            </TenantLink>
            : clientInfo?.switchInformation?.name || '--'
        }
      />}
      <Descriptions.Item
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={
          clientInfo?.enableLinkToVenue ?
            // eslint-disable-next-line max-len
            <TenantLink to={`venues/${clientInfo?.venueInformation?.id}/venue-details/overview`}>
              {clientInfo?.venueInformation?.name || '--'}
            </TenantLink>
            : clientInfo?.venueInformation?.name || '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Wireless Network' })}
        children={
          clientInfo?.enableLinkToNetwork ?
          // eslint-disable-next-line max-len
            <TenantLink to={`networks/wireless/${clientInfo?.networkInformation?.id}/network-details/overview`}>
              {clientInfo?.networkInformation?.ssid || '--'}
            </TenantLink>
            : clientInfo?.networkInformation?.ssid || '--'
        }
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Service Set Identifier' })}
        >{$t({ defaultMessage: 'SSID' })}
        </Tooltip>}
        children={clientInfo?.networkInformation?.ssid || '--'}
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Virtual Local Area Network Identifier' })}
        >{$t({ defaultMessage: 'VLAN ID' })}
        </Tooltip>}
        children={clientInfo?.networkInformation?.vlan || '--'}
      />
      { showVni &&
        <Descriptions.Item
          label={<Tooltip
            placement='bottom'
            title={$t({ defaultMessage: 'VXLAN network identifier' })}
          >{$t({ defaultMessage: 'VNI' })}
          </Tooltip>}
          children={clientInfo?.networkInformation?.vni || '--'}
        />
      }
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Basic Service Set Identifier' })}
        >{$t({ defaultMessage: 'BSSID' })}
        </Tooltip>}
        children={clientInfo?.apInformation?.bssid || '--'}
      />
      { wifiEDAClientRevokeToggle && <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={$t({ defaultMessage: 'Network Type' })}
        >{$t({ defaultMessage: 'Network Type' })}
        </Tooltip>}
        children={networkDisplayTransformer(intl, clientInfo?.networkInformation?.type)}
      /> }
      <Descriptions.Item
        label={$t({ defaultMessage: 'Auth Method' })}
        children={clientInfo?.networkInformation?.authenticationMethod || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Auth Status' })}
        children={getAuthStatus(clientInfo?.authenticationStatus)}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Encryption' })}
        children={clientInfo?.networkInformation?.encryptionMethod || '--'}
      />
    </Descriptions>
  </>
}

function OperationalData ({ clientInfo }: { clientInfo: ClientInfoExtended }) {
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
        children={clientInfo?.radioStatus?.channel || '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Traffic From Client' })}
        children={clientInfo?.trafficStatus?.trafficFromClient ? <Tooltip
          placement='bottom'
          title={`${numberFormatter(parseInt(clientInfo?.trafficStatus?.trafficFromClient))} B`}
        >
          {bytesFormatter(parseInt(clientInfo?.trafficStatus?.trafficFromClient))}
        </Tooltip> : '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Packets From Client' })}
        children={clientInfo?.trafficStatus?.packetsFromClient ?
          numberFormatter(clientInfo?.trafficStatus?.packetsFromClient) : '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Traffic To Client' })}
        children={clientInfo?.trafficStatus?.trafficToClient ? <Tooltip
          placement='bottom'
          title={`${numberFormatter(parseInt(clientInfo?.trafficStatus?.trafficToClient))} B`}
        >{bytesFormatter(parseInt(clientInfo?.trafficStatus?.trafficToClient))}
        </Tooltip> : '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Packets To Client' })}
        children={clientInfo?.trafficStatus?.packetsToClient ?
          numberFormatter(clientInfo?.trafficStatus?.packetsToClient) : '--'}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Frames Dropped' })}
        children={clientInfo?.trafficStatus?.framesDropped ?
          numberFormatter(clientInfo?.trafficStatus?.framesDropped) : '--'}
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={intl.$t({ defaultMessage: 'Signal-to-Noise Ratio' })}
        >{intl.$t({ defaultMessage: 'SNR' })}
        </Tooltip>}
        children={<WifiSignal
          snr={clientInfo?.signalStatus?.snr}
          text={clientInfo?.signalStatus?.snr ? clientInfo?.signalStatus?.snr + ' dB' : '--'}
        />}
      />
      <Descriptions.Item
        label={<Tooltip
          placement='bottom'
          title={intl.$t({ defaultMessage: 'Received Signal Strength Indicator' })}
        >{intl.$t({ defaultMessage: 'RSSI' })}
        </Tooltip>}
        children={<Space style={{
          color: getRssiStatus(intl, clientInfo?.signalStatus?.rssi)?.color
        }}>
          <Tooltip
            placement='bottom'
            title={getRssiStatus(intl, clientInfo?.signalStatus?.rssi)?.tooltip}
          >
            {clientInfo?.signalStatus?.rssi ? clientInfo?.signalStatus?.rssi + ' dBm' : '--'}
          </Tooltip>
        </Space>}
      />
      <Descriptions.Item
        label={intl.$t({ defaultMessage: 'Radio Type' })}
        children={clientInfo?.radioStatus?.type ? clientInfo?.radioStatus?.type : '--'}
      />
    </Descriptions>
  </>
}

function WiFiCallingDetails ({ clientInfo }: { clientInfo: ClientInfoExtended }) {
  const { $t } = getIntl()
  const bytesFormatter = formatter('bytesFormat')

  return <>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Wi-Fi Calling Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Carrier Name' })}
        children={clientInfo?.wifiCallingStatus.carrierName || '--'}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'QoS Priority' })}
        children={
          clientInfo?.wifiCallingStatus.qosPriority
            ? transformQosPriorityType(clientInfo?.wifiCallingStatus.qosPriority as QosPriorityEnum)
            : '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Total Traffic' })}
        children={
          (clientInfo?.wifiCallingStatus.totalTraffic &&
            bytesFormatter(clientInfo?.wifiCallingStatus.totalTraffic)) || '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Transmitted Traffic' })}
        children={
          (clientInfo?.wifiCallingStatus.trafficToClient &&
            bytesFormatter(clientInfo?.wifiCallingStatus.trafficToClient)) || '--'
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Received Traffic' })}
        children={
          (clientInfo?.wifiCallingStatus.trafficFromClient &&
            bytesFormatter(clientInfo?.wifiCallingStatus.trafficFromClient)) || '--'
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
        children={guestDetail?.clients?.filter(client => clientMac !== client.macAddress).map(
          client =>
            <TenantLink
              // eslint-disable-next-line max-len
              to={`/users/wifi/clients/${client.macAddress}/details/overview`}
              key={client.macAddress}
            >
              {client.macAddress}
            </TenantLink>) || '--'}
      />
    </Descriptions>
  </>
}

// eslint-disable-next-line max-len
function DpskPassphraseDetails (props: { networkId: string, clientMac: string, username?: string }) {
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
              return <List.Item>
                <TenantLink to={`users/switch/clients/${item}`}>{item}</TenantLink>
              </List.Item>
            }}
          />
        }
      />
    </Descriptions>
  </>
}

function getGuestsPayload (clientMacAddress: string) {
  return {
    searchString: clientMacAddress,
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

function getAuthStatus (statusInt: number) {
  const { $t } = getIntl()
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
