import { Button }    from 'antd'
import { SortOrder } from 'antd/lib/table/interface'
import styled        from 'styled-components/macro'

import { PageHeader, Table, Loader } from '@acx-ui/components'
import { useNetworkListQuery }       from '@acx-ui/rc/services'
import {
  VLAN_PREFIX,
  NetworkTypeEnum,
  GuestNetworkTypeEnum,
  WlanSecurityEnum,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

const PageLink = styled.span`
  color: var(--acx-accents-blue-50);
`

const columns = [
  {
    title: 'Network Name',
    dataIndex: 'name',
    sorter: true,
    defaultSortOrder: 'ascend' as SortOrder,
    render: function (data: any) {
      return <PageLink>{data}</PageLink>
    }
  },
  {
    title: 'Description',
    dataIndex: 'description',
    sorter: true
  },
  {
    title: 'Type',
    dataIndex: 'nwSubType',
    sorter: true,
    render: function (data: any, row: any) {
      return transformNetworkType(data, row)
    }
  },
  {
    title: 'Venues',
    dataIndex: 'venues',
    sorter: true,
    render: function (data: any) {
      return <PageLink>{data ? data.count : 0}</PageLink>
    }
  },
  {
    title: 'APs',
    dataIndex: 'aps',
    sorter: true,
    render: function (data: any) {
      return <PageLink>{data}</PageLink>
    }
  },
  {
    title: 'Clients',
    dataIndex: 'clients',
    sorter: true
  },
  {
    title: 'VLAN',
    dataIndex: 'vlan',
    sorter: true,
    render: function (data: any, row: any) {
      return transformVLAN(row)
    }
  }
]

const transformVLAN = (row: any) => {
  if (row.vlanPool) {
    const vlanPool = row.vlanPool
    return VLAN_PREFIX.POOL + (vlanPool ? vlanPool.name : '')
  }
  return VLAN_PREFIX.VLAN + row.vlan
}

const transformNetworkType = (value: any, row: any) => {
  let displayValue = ''
  const captiveType = row.captiveType
  const wlan = row?.deepNetwork?.wlan
  switch (value) {
    case NetworkTypeEnum.OPEN:
      displayValue = 'Open Network'
      break

    case NetworkTypeEnum.PSK:
      displayValue = 'Pre-Shared Key (PSK)'
      if (wlan && wlan.wlanSecurity) {
        displayValue += getWlanSecurity(wlan.wlanSecurity)
      }
      break

    case NetworkTypeEnum.DPSK:
      displayValue = 'Dynamic Pre-Shared Key (DPSK)'
      if (wlan && wlan.wlanSecurity) {
        displayValue += getWlanSecurity(wlan.wlanSecurity)
      }
      break

    case NetworkTypeEnum.AAA:
      displayValue = 'Enterprise AAA (802.1X)'
      if (wlan && wlan.wlanSecurity) {
        displayValue += getWlanSecurity(wlan.wlanSecurity)
      }
      break

    case NetworkTypeEnum.CAPTIVEPORTAL:
      displayValue = wlan ? 'Captive ' : ''
      switch (captiveType) {
        case GuestNetworkTypeEnum.ClickThrough:
          displayValue += 'Portal - Click-Through'
          break
        case GuestNetworkTypeEnum.GuestPass:
          displayValue += 'Portal - Managed Guest Pass'
          break
        case GuestNetworkTypeEnum.SelfSignIn:
          displayValue += 'Portal - Self Sign-In'
          break
        case GuestNetworkTypeEnum.HostApproval:
          displayValue += 'Portal - Host Approval'
          break
        case GuestNetworkTypeEnum.WISPr:
          displayValue += 'Portal - 3rd Party Captive Portal (WISPr)'
          break
        default:
          displayValue += 'Portal - Captive Portal'
      }
      break
  }
  return displayValue
}

const getWlanSecurity = (wlanSecurity: WlanSecurityEnum) => {
  const securityMap: any = {
    [WlanSecurityEnum.Open]: ' - Open',
    [WlanSecurityEnum.WPAPersonal]: ' - WPA',
    [WlanSecurityEnum.WPA2Personal]: ' - WPA2',
    [WlanSecurityEnum.WPAEnterprise]: ' - WPA Enterprise',
    [WlanSecurityEnum.WPA2Enterprise]: ' - WPA2 Enterprise',
    [WlanSecurityEnum.OpenCaptivePortal]: ' - Open Captive Portal',
    [WlanSecurityEnum.WEP]: ' - WEP',
    [WlanSecurityEnum.WPA23Mixed]: ' - WPA3/WPA2 Mixed',
    [WlanSecurityEnum.WPA3]: ' - WPA3'
  }

  return securityMap[wlanSecurity] || ''
}

const defaultPayload = {
  searchString: '',
  fields: [
    'check-all',
    'name',
    'description',
    'nwSubType',
    'venues',
    'aps',
    'clients',
    'vlan',
    'cog',
    'ssid',
    'vlanPool',
    'captiveType',
    'id'
  ]
}

export function NetworksTable () {
  const NetworksTable = () => {
    const params = useParams()
    const tableQuery = useTableQuery({
      api: useNetworkListQuery,
      apiParams: params,
      defaultPayload
    })

    if (tableQuery.isLoading) return <div>Loading...</div>
    if (tableQuery.error) return <div role='alert'>Error</div>
    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={columns}
          dataSource={tableQuery.data.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title='Networks'
        footer={
          <PageHeader.FooterWithDivider
            extra={[
              <TenantLink to='/networks/create'>
                <Button>Add Network</Button>
              </TenantLink>
            ]}
          >
            <div />
          </PageHeader.FooterWithDivider>
        }
      />
      <NetworksTable />
    </>
  )
}
