import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, GridRow, GridCol, Descriptions, Loader, Subtitle, Button } from '@acx-ui/components'
import { useGetSwitchClientDetailsQuery, useLazyApListQuery }                   from '@acx-ui/rc/services'
import { exportCSV, SWITCH_CLIENT_TYPE }                                        from '@acx-ui/rc/utils'
import { useParams, TenantLink }                                                from '@acx-ui/react-router-dom'
import { getCurrentDate }                                                       from '@acx-ui/utils'

interface Client {
    title: string | JSX.Element,
    value: string | JSX.Element
}

export function SwitchClientDetails () {
  const { $t } = useIntl()
  const params = useParams()
  const [isManaged, setIsManaged] = useState(false)

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
  }, [data])

  const exportClientToCSV = () => {
    const ClientCSVIgnoreProperty = ['switchId', 'venueId']
    const ClientCSVNamingMapping: Map<string, string> = new Map<string, string>([
      ['clientDesc', 'hostname'],
      ['clientIpv4Addr', 'ip'],
      ['switchPort', 'port']
    ])

    const nowTime = getCurrentDate('YYYYMMDDHHMMSS')
    const filename = 'Client Details - ' +
      data?.clientMac.replace(/:/gi, '') +
      ' - ' + nowTime +
      '.csv'

    // Remove internal properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportClient: any = Object()
    Object.assign(exportClient, data)
    for (const key of ClientCSVIgnoreProperty) {
      delete exportClient[key]
    }

    // Export to CSV and map object key name to user-friendly header name
    exportCSV(filename, exportClient, ClientCSVNamingMapping)
  }

  const clientData: Client[] = [
    {
      title: $t({ defaultMessage: 'Mac Address' }),
      value: data?.clientMac && data?.isRuckusAP && isManaged ?
        <TenantLink
          to={`/devices/switch/${data?.switchId}/${data?.switchSerialNumber}/details/overview`}
        >{data?.switchName}</TenantLink> : <span>{data?.clientMac}</span>
    },
    {
      title: $t({ defaultMessage: 'Device Type' }),
      value: data?.clientType === SWITCH_CLIENT_TYPE.AP ?
        (data?.isRuckusAP ?
          $t({ defaultMessage: 'Ruckus AP' }) :
          $t({ defaultMessage: 'AP' })) :
        (data?.clientType === SWITCH_CLIENT_TYPE.ROUTER ?
          <span>{$t({ defaultMessage: 'Router' })}</span> :
          <span>{data?.clientType || '--'}</span>)
    },
    {
      title: <span>
        {$t({ defaultMessage: 'Hostname' })}
      </span>,
      value: <span>{data?.clientName || '--'}</span>
    },
    {
      title: <span>
        {$t({ defaultMessage: 'Description' })}
      </span>,
      value: <span>{data?.clientDesc || 'N/A'}</span>
    }
  ]

  const clientConnection: Client[] = [
    {
      title: <span>
        {$t({ defaultMessage: 'Switch' })}
      </span>,
      value: <span><TenantLink
        to={`/devices/switch/${data?.switchId}/${data?.switchSerialNumber}/details/overview`}
      >
        {data?.switchName}
      </TenantLink>
      </span>
    },
    {
      title: <span>
        {$t({ defaultMessage: 'Port' })}
      </span>,
      value: <span>{data?.switchPort}</span>
    },
    {
      title: <span>
        {$t({ defaultMessage: 'Venue' })}
      </span>,
      value: <TenantLink to={`/venues/${data?.venueId}/venue-details/overview`}>
        {data?.venueName}</TenantLink>
    },
    {
      title: <span>
        {$t({ defaultMessage: 'VLAN' })}
      </span>,
      value: <span>{data?.vlanName}
        {data?.clientVlan && ` (VLAN-ID: ${data?.clientVlan})` }
      </span>
    }
  ]

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={data?.clientMac}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Switch Users' }), link: '/users/switch' }
        ]}
        extra={[
          <Button key='export' type='link' onClick={exportClientToCSV}>
            {$t({ defaultMessage: 'Download Information' })}</Button>
        ]}
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

