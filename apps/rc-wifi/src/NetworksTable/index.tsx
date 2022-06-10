import { SortOrder } from 'antd/lib/table/interface'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { useNetworkListQuery, Network }                  from '@acx-ui/rc/services'
import {
  VLAN_PREFIX,
  NetworkTypeEnum,
  GuestNetworkTypeEnum,
  WlanSecurityEnum,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

const columns: TableProps<Network>['columns'] = [
  {
    title: 'Network Name',
    dataIndex: 'name',
    sorter: true,
    defaultSortOrder: 'ascend' as SortOrder,
    render: function (data, row) {
      return (
        <TenantLink to={`/networks/${row.id}/network-details/overview`}>{data}</TenantLink>
      )
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
    render: function (data, row) {
      return transformNetworkType(data, row)
    }
  },
  {
    title: 'Venues',
    dataIndex: 'venues',
    sorter: true,
    render: function (data, row) {
      return (
        <TenantLink
          to={`/networks/${row.id}/network-details/venues`}
          children={data ? data.count : 0}
        />
      )
    }
  },
  {
    title: 'APs',
    dataIndex: 'aps',
    sorter: true,
    render: function (data, row) {
      return (
        <TenantLink to={`/networks/${row.id}/network-details/aps`}>{data}</TenantLink>
      )
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
    render: function (data, row) {
      return transformVLAN(row)
    }
  }
]

const transformVLAN = (row: Network) => {
  if (row.vlanPool) {
    const vlanPool = row.vlanPool
    return VLAN_PREFIX.POOL + (vlanPool ? vlanPool.name : '')
  }
  return VLAN_PREFIX.VLAN + row.vlan
}

const transformNetworkType = (value: Network['nwSubType'], row: Network) => {
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
  const securityMap = {
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
    const tableQuery = useTableQuery({
      useQuery: useNetworkListQuery,
      defaultPayload
    })

    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
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
        extra={[
          <TenantLink to='/networks/create'>
            <Button type='primary'>Add Wi-Fi Network</Button>
          </TenantLink>
        ]}
      />
      <NetworksTable />
    </>
  )
}
