import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useNetworkListQuery, useDeleteNetworkMutation, Network }         from '@acx-ui/rc/services'
import {
  VLAN_PREFIX,
  NetworkTypeEnum,
  GuestNetworkTypeEnum,
  WlanSecurityEnum,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { networkTypes } from '../NetworkForm/contentsMap'

function getCols (intl: ReturnType<typeof useIntl>) {
  const columns: TableProps<Network>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/${row.id}/network-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      title: intl.$t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: function (data, row) {
        return transformNetworkType(String(data), row, intl)
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Venues' }),
      dataIndex: ['venues', 'count'],
      sorter: true,
      align: 'center',
      render: function (count, row) {
        return (
          <TenantLink
            to={`/networks/${row.id}/network-details/venues`}
            children={count ? count : 0}
          />
        )
      }
    },
    {
      title: intl.$t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/${row.id}/network-details/aps`}>{data}</TenantLink>
        )
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      sorter: true,
      align: 'center'
    },
    {
      title: intl.$t({ defaultMessage: 'Services' }),
      dataIndex: 'services',
      sorter: true,
      align: 'center'
    },
    {
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      sorter: true,
      render: function (data, row) {
        return transformVLAN(row)
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Health' }),
      dataIndex: 'health',
      sorter: true
    },
    {
      title: intl.$t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      sorter: true
    }
  ]
  return columns
}


const transformVLAN = (row: Network) => {
  if (row.vlanPool) {
    const vlanPool = row.vlanPool
    return VLAN_PREFIX.POOL + (vlanPool ? vlanPool.name : '')
  }
  return VLAN_PREFIX.VLAN + row.vlan
}

const transformNetworkType = (value: Network['nwSubType'], row: Network,
  { $t }: ReturnType<typeof useIntl>) => {
  let displayValue = ''
  const captiveType = row.captiveType
  const wlan = row?.deepNetwork?.wlan
  switch (value) {
    case NetworkTypeEnum.OPEN:
      displayValue = $t(networkTypes.open)
      break

    case NetworkTypeEnum.PSK:
      displayValue = $t(networkTypes.psk)
      if (wlan && wlan.wlanSecurity) {
        displayValue += getWlanSecurity(wlan.wlanSecurity)
      }
      break

    case NetworkTypeEnum.DPSK:
      displayValue = $t(networkTypes.dpsk)
      if (wlan && wlan.wlanSecurity) {
        displayValue += getWlanSecurity(wlan.wlanSecurity)
      }
      break

    case NetworkTypeEnum.AAA:
      displayValue = $t(networkTypes.aaa)
      if (wlan && wlan.wlanSecurity) {
        displayValue += getWlanSecurity(wlan.wlanSecurity)
      }
      break

    case NetworkTypeEnum.CAPTIVEPORTAL:
      displayValue = wlan ? $t({ defaultMessage: 'Captive' }) + ' ' : ''
      switch (captiveType) {
        case GuestNetworkTypeEnum.ClickThrough:
          displayValue += $t({ defaultMessage: 'Portal - Click-Through' })
          break
        case GuestNetworkTypeEnum.GuestPass:
          displayValue += $t({ defaultMessage: 'Portal - Managed Guest Pass' })
          break
        case GuestNetworkTypeEnum.SelfSignIn:
          displayValue += $t({ defaultMessage: 'Portal - Self Sign-In' })
          break
        case GuestNetworkTypeEnum.HostApproval:
          displayValue += $t({ defaultMessage: 'Portal - Host Approval' })
          break
        case GuestNetworkTypeEnum.WISPr:
          displayValue += $t({ defaultMessage: 'Portal - 3rd Party Captive Portal (WISPr)' })
          break
        default:
          displayValue += $t({ defaultMessage: 'Portal - Captive Portal' })
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
  const { $t } = useIntl()
  const NetworksTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useNetworkListQuery,
      defaultPayload
    })
    const { tenantId } = useParams()
    const [
      deleteNetwork,
      { isLoading: isDeleteNetworkUpdating }
    ] = useDeleteNetworkMutation()

    const actions: TableProps<Network>['actions'] = [{
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Network' }),
            entityValue: name
          },
          onOk: () => deleteNetwork({ params: { tenantId, networkId: id } })
            .then(clearSelection)
        })
      }
    }]

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteNetworkUpdating }
      ]}>
        <Table
          columns={getCols(useIntl())}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          actions={actions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Networks' })}
        extra={[
          <TenantLink to='/networks/create' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Wi-Fi Network' }) }</Button>
          </TenantLink>
        ]}
      />
      <NetworksTable />
    </>
  )
}
