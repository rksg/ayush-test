import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, GridRow, GridCol, Descriptions, Loader, Subtitle, Button }        from '@acx-ui/components'
import { Features, useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { useGetSwitchClientDetailsQuery, useLazyApListQuery }                          from '@acx-ui/rc/services'
import { exportCSV, getOsTypeIcon, getClientIpAddr, SwitchClient, SWITCH_CLIENT_TYPE } from '@acx-ui/rc/utils'
import { useParams, TenantLink }                                                       from '@acx-ui/react-router-dom'
import { getCurrentDate }                                                              from '@acx-ui/utils'

import * as UI from './styledComponents'

interface Client {
    title: string | JSX.Element,
    value: string | JSX.Element
}

export function SwitchClientDetails () {
  const { $t } = useIntl()
  const params = useParams()
  const [isManaged, setIsManaged] = useState(false)
  const [clientDetails, setClientDetails] = useState({} as SwitchClient)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const isDhcpClientsEnabled = useIsSplitOn(Features.SWITCH_DHCP_CLIENTS)
  const { data, isLoading } = useGetSwitchClientDetailsQuery({ params })


  const [apList] = useLazyApListQuery()

  const isManagedRuckusAP = async (ruckusAPMac: string) => {
    const payload = {
      entityType: 'apList',
      fields: ['serialNumber', 'name', 'apMac'],
      filters: { apMac: [ruckusAPMac] },
      pageSize: 10000
    }
    const { data } = await apList({ params, payload }, true)
    if(data?.data && data?.data.length > 0){
      setIsManaged(true)
    }
  }

  useEffect(() => {
    if(data?.clientType === SWITCH_CLIENT_TYPE.AP){
      isManagedRuckusAP(data?.clientMac)
    }
    if (data) {
      setClientDetails({
        ...data,
        clientName: data?.dhcpClientHostName || data?.clientName,
        clientType: data?.dhcpClientDeviceTypeName || data?.clientType
      } as SwitchClient)
    }
  }, [data])

  const exportClientToCSV = () => {
    const ClientCSVIgnoreProperty = [
      'switchId', 'venueId', 'id', 'switchSerialNumber',
      'dhcpClientHostName', 'dhcpClientDeviceTypeName'
    ]
    const ClientCSVNamingMapping: Map<string, string> = new Map<string, string>([
      ['clientMac', $t({ defaultMessage: 'Mac Address' })],
      (isDhcpClientsEnabled
        ? ['dhcpClientOsVendorName', $t({ defaultMessage: 'OS' })] : ['', '']),
      ['clientType', $t({ defaultMessage: 'Device Type' })],
      (isDhcpClientsEnabled
        ? ['dhcpClientModelName', $t({ defaultMessage: 'Model Name' })] : ['', '']),
      ['clientName', $t({ defaultMessage: 'Hostname' })],
      ['switchName', $t({ defaultMessage: 'Switch Name' })],
      ['venueName', $t({ defaultMessage: 'Venue Name' })],
      ['clientVlan', $t({ defaultMessage: 'Vlan ID' })],
      ['vlanName', $t({ defaultMessage: 'Vlan' })],
      ['switchSerialNumber', $t({ defaultMessage: 'Switch Serial Number' })],
      ['clientDesc', $t({ defaultMessage: 'Description' })],
      ['clientIpv4Addr', $t({ defaultMessage: 'IP Address' })],
      ['switchPort', $t({ defaultMessage: 'Port' })]
    ])

    const nowTime = getCurrentDate('YYYYMMDDHHMMSS')
    const filename = 'Client Details - ' +
    clientDetails?.clientMac.replace(/:/gi, '') +
      ' - ' + nowTime +
      '.csv'

    // Remove internal properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportClient: any = Object()
    const statusLabel = $t({ defaultMessage: 'Status' })
    Object.assign(exportClient, {
      [statusLabel]: $t({ defaultMessage: 'Connected' }), ...clientDetails
    })
    for (const key of ClientCSVIgnoreProperty) {
      delete exportClient[key]
    }

    // Export to CSV and map object key name to user-friendly header name
    exportCSV(filename, exportClient, ClientCSVNamingMapping)
  }

  const getDeviceType = (data?: SwitchClient) => {
    const deviceType = data?.clientType
    return deviceType === SWITCH_CLIENT_TYPE.AP ?
      (data?.isRuckusAP ?
        $t({ defaultMessage: 'RUCKUS AP' }) :
        $t({ defaultMessage: 'AP' })) :
      (deviceType === SWITCH_CLIENT_TYPE.ROUTER ?
        <span>{$t({ defaultMessage: 'Router' })}</span> :
        <span>{deviceType || '--'}</span>)
  }

  const clientData: Client[] = [
    {
      title: $t({ defaultMessage: 'Mac Address' }),
      value: clientDetails?.clientMac && clientDetails?.isRuckusAP && isManaged ?
        <TenantLink
        // eslint-disable-next-line max-len
          to={`/devices/switch/${clientDetails?.switchId}/${clientDetails?.switchSerialNumber}/details/overview`}
        >{clientDetails?.switchName}</TenantLink> : <span>{clientDetails?.clientMac}</span>
    },
    ...(isDhcpClientsEnabled ? [{
      title: <span>
        {$t({ defaultMessage: 'OS' })}
      </span>,
      value: <UI.OsType>
        { !!clientDetails?.dhcpClientOsVendorName
        && getOsTypeIcon(clientDetails?.dhcpClientOsVendorName) }
        { clientDetails?.dhcpClientOsVendorName || '--' }
      </UI.OsType>
    }] : []),
    {
      title: $t({ defaultMessage: 'Device Type' }),
      value: getDeviceType(clientDetails)
    },
    {
      title: <span>
        {$t({ defaultMessage: 'Description' })}
      </span>,
      value: <span>{clientDetails?.clientDesc || '--'}</span>
    },
    ...(isDhcpClientsEnabled ? [{
      title: <span>
        {$t({ defaultMessage: 'Model Name' })}
      </span>,
      value: <span>{clientDetails?.dhcpClientModelName || '--'}</span>
    }] : [])
  ]

  const clientConnection: Client[] = [
    ...(isDhcpClientsEnabled ? [{
      title: <span>
        {$t({ defaultMessage: 'IP Address' })}
      </span>,
      value: <span>{getClientIpAddr(clientDetails)}</span>
    }] : []),
    {
      title: <span>
        {$t({ defaultMessage: 'Switch' })}
      </span>,
      value: <span><TenantLink
      // eslint-disable-next-line max-len
        to={`/devices/switch/${clientDetails?.switchId}/${clientDetails?.switchSerialNumber}/details/overview`}
      >
        {clientDetails?.switchName}
      </TenantLink>
      </span>
    },
    {
      title: <span>
        {$t({ defaultMessage: 'Port' })}
      </span>,
      value: <span>{clientDetails?.switchPort}</span>
    },
    {
      title: <span>
        {$t({ defaultMessage: 'Venue' })}
      </span>,
      value: <TenantLink to={`/venues/${clientDetails?.venueId}/venue-details/overview`}>
        {clientDetails?.venueName}</TenantLink>
    },
    {
      title: <span>
        {$t({ defaultMessage: 'VLAN' })}
      </span>,
      value: <span>{clientDetails?.vlanName}
        {clientDetails?.clientVlan && ` (VLAN-ID: ${clientDetails?.clientVlan})` }
      </span>
    }
  ]

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={clientDetails?.clientName}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Clients' }) },
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Wired Clients List' }), link: '/users/switch' }
        ] : [{ text: $t({ defaultMessage: 'Switch Users' }), link: '/users/switch' }]}
        extra={
          <Button
            type='link'
            onClick={exportClientToCSV}
          >
            {$t({ defaultMessage: 'Download Information' })}</Button>
        }
      />

      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Descriptions labelWidthPercent={7}>
            <Descriptions.Item
              label={<Subtitle level={4}>
                {$t({ defaultMessage: 'Status' })}</Subtitle>}
              children={<span>
                {$t({ defaultMessage: 'Connected' })}</span>} />
          </Descriptions>

          <Subtitle level={4} style={{ fontWeight: 600, marginTop: '1em' }}>
            {$t({ defaultMessage: 'Client Details' })}</Subtitle>


          <Descriptions labelWidthPercent={7}>{
            clientData.map(({ title, value }, i) => <Descriptions.Item
              key={i}
              label={title}
              children={value}
            />)
          }</Descriptions>
        </GridCol>
      </GridRow>

      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Subtitle level={4} style={{ fontWeight: 600, marginTop: '2em' }}>
            {$t({ defaultMessage: 'Connection' })}</Subtitle>
          <Descriptions labelWidthPercent={7}>{
            clientConnection.map(({ title, value }, i) => <Descriptions.Item
              key={i}
              label={title}
              children={value}
            />)
          }</Descriptions>
        </GridCol>
      </GridRow>
    </Loader>
  )
}

