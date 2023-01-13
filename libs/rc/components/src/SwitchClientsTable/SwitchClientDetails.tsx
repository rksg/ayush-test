import { useEffect, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

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
      title: <Typography.Title level={5}>
        {$t({ defaultMessage: 'Mac Address' })}
      </Typography.Title>,
      value: data?.clientMac && data?.isRuckusAP && isManaged ?
        <Typography.Title level={5}>
          <TenantLink
            to={`/devices/switch/${data?.switchId}/${data?.switchSerialNumber}/details/overview`}
          >
            {data?.switchName}
          </TenantLink>
        </Typography.Title> : <Typography.Title level={5}>{data?.clientMac}</Typography.Title>
    },
    {
      title: <Typography.Title level={5}>
        {$t({ defaultMessage: 'Device Type' })}
      </Typography.Title>,
      value: data?.clientType === SWITCH_CLIENT_TYPE.AP ?
        (data?.isRuckusAP ?
          <Typography.Title level={5}>{$t({ defaultMessage: 'Ruckus AP' })}</Typography.Title> :
          <Typography.Title level={5}>{$t({ defaultMessage: 'AP' })}</Typography.Title>) :
        (data?.clientType === SWITCH_CLIENT_TYPE.ROUTER ?
          <Typography.Title level={5}>{$t({ defaultMessage: 'Router' })}</Typography.Title> :
          <Typography.Title level={5}>{data?.clientType || '--'}</Typography.Title>)
    },
    {
      title: <Typography.Title level={5}>
        {$t({ defaultMessage: 'Hostname' })}
      </Typography.Title>,
      value: <Typography.Title level={5}>{data?.clientName || '--'}</Typography.Title>
    },
    {
      title: <Typography.Title level={5}>
        {$t({ defaultMessage: 'Description' })}
      </Typography.Title>,
      value: <Typography.Title level={5}>{data?.clientDesc || 'N/A'}</Typography.Title>
    }
  ]

  const clientConnection: Client[] = [
    {
      title: <Typography.Title level={5}>
        {$t({ defaultMessage: 'Switch' })}
      </Typography.Title>,
      value: <Typography.Title level={5}><TenantLink
        to={`/devices/switch/${data?.switchId}/${data?.switchSerialNumber}/details/overview`}
      >
        {data?.switchName}
      </TenantLink>
      </Typography.Title>
    },
    {
      title: <Typography.Title level={5}>
        {$t({ defaultMessage: 'Port' })}
      </Typography.Title>,
      value: <Typography.Title level={5}>{data?.switchPort}</Typography.Title>
    },
    {
      title: <Typography.Title level={5}>
        {$t({ defaultMessage: 'Venue' })}
      </Typography.Title>,
      value: <TenantLink to={`/venues/${data?.venueId}/venue-details/overview`}>
        {data?.venueName}</TenantLink>
    },
    {
      title: <Typography.Title level={5}>
        {$t({ defaultMessage: 'VLAN' })}
      </Typography.Title>,
      value: <Typography.Title level={5}>{data?.vlanName}
        {data?.clientVlan && ` (VLAN-ID: ${data?.clientVlan})` }
      </Typography.Title>
    }
  ]

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={data?.clientMac}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Switches' }), link: '/devices/switch' }
        ]}
        extra={[
          <Button key='export' type='link' onClick={exportClientToCSV}>
            {$t({ defaultMessage: 'Download Information' })}</Button>
        ]}
      />

      <GridRow>
        <GridCol col={{ span: 5 }}>
          <Descriptions>
            <Descriptions.Item
              label={<Subtitle level={4}>
                {$t({ defaultMessage: 'Status' })}</Subtitle>}
              children={<Typography.Title level={5}>
                {$t({ defaultMessage: 'Connected' })}</Typography.Title>} />
          </Descriptions>

          <Subtitle level={4} style={{ fontWeight: 600, marginTop: '1em' }}>
            {$t({ defaultMessage: 'Client Details' })}</Subtitle>


          <Descriptions>{
            clientData.map(({ title, value }, i) => <Descriptions.Item
              key={i}
              label={title}
              children={value}
            />)
          }</Descriptions>
        </GridCol>
      </GridRow>

      <GridRow>
        <GridCol col={{ span: 5 }}>
          <Subtitle level={4} style={{ fontWeight: 600, marginTop: '2em' }}>
            {$t({ defaultMessage: 'Connection' })}</Subtitle>
          <Descriptions>{
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

