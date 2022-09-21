import { ReactNode } from 'react'

import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useNetworkListQuery, useDeleteNetworkMutation }                  from '@acx-ui/rc/services'
import {
  VLAN_PREFIX,
  NetworkTypeEnum,
  useTableQuery,
  Network,
  NetworkType
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'

const disabledType = [NetworkTypeEnum.DPSK, NetworkTypeEnum.CAPTIVEPORTAL]

function getCols (intl: ReturnType<typeof useIntl>) {
  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return data
        }else{
          return (
            <TenantLink to={`/networks/${row.id}/network-details/overview`}>{data}</TenantLink>
          )
        }
      }
    },
    {
      key: 'description',
      title: intl.$t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      key: 'nwSubType',
      title: intl.$t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (data: unknown, row) => <NetworkType
        networkType={data as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'venues',
      title: intl.$t({ defaultMessage: 'Venues' }),
      dataIndex: ['venues', 'count'],
      sorter: true,
      align: 'center',
      render: function (count, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return count
        }else{
          return (
            <TenantLink
              to={`/networks/${row.id}/network-details/venues`}
              children={count ? count : 0}
            />
          )
        }
      }
    },
    {
      key: 'aps',
      title: intl.$t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return data
        }else{
          return (
            <TenantLink to={`/networks/${row.id}/network-details/aps`}>{data}</TenantLink>
          )
        }
      }
    },
    {
      key: 'clients',
      title: intl.$t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      sorter: true,
      align: 'center'
    },
    {
      key: 'services',
      title: intl.$t({ defaultMessage: 'Services' }),
      dataIndex: 'services',
      sorter: true,
      align: 'center'
    },
    {
      key: 'vlan',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      sorter: true,
      render: function (data, row) {
        return transformVLAN(row)
      }
    },
    {
      key: 'health',
      title: intl.$t({ defaultMessage: 'Health' }),
      dataIndex: 'health',
      sorter: true
    },
    {
      key: 'tags',
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

const rowSelection = (intl: ReturnType<typeof useIntl>) => {
  const params = {
    getCheckboxProps: (record: Network) => ({
      disabled: disabledType.indexOf(record.nwSubType as NetworkTypeEnum) > -1
    }),
    renderCell (checked: boolean, record: Network, index: number, node: ReactNode) {
      if (disabledType.indexOf(record.nwSubType as NetworkTypeEnum) > -1) {
        return <Tooltip 
          title={intl.$t({ defaultMessage: 'Not available in Beta1' })}>{node}</Tooltip>
      }
      return node
    }
  }
  return params
}
export function NetworksTable () {
  const { $t } = useIntl()
  const NetworksTable = () => {
    const navigate = useNavigate()
    const linkToEditNetwork = useTenantLink('/networks/')
    const tableQuery = useTableQuery({
      useQuery: useNetworkListQuery,
      defaultPayload
    })
    const { tenantId } = useParams()
    const [
      deleteNetwork,
      { isLoading: isDeleteNetworkUpdating }
    ] = useDeleteNetworkMutation()

    const actions: TableProps<Network>['actions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        onClick: (selectedRows) => {
          navigate(`${linkToEditNetwork.pathname}/${selectedRows[0].id}/edit`, { replace: false })
        }
      },
      {
        label: $t({ defaultMessage: 'Clone' }),
        onClick: (selectedRows) => {
          navigate(`${linkToEditNetwork.pathname}/${selectedRows[0].id}/clone`, { replace: false })
        }
      },
      {
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
          rowSelection={{
            type: 'radio',
            ...rowSelection(useIntl())
          }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Networks' })}
        extra={[
          <TenantLink to='/networks/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Wi-Fi Network' }) }</Button>
          </TenantLink>
        ]}
      />
      <NetworksTable />
    </>
  )
}