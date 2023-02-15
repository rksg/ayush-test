import { ReactNode } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { showActionModal, Loader, TableProps, Tooltip, Table  }              from '@acx-ui/components'
import { Features, useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import { useDeleteNetworkMutation }                                          from '@acx-ui/rc/services'
import { NetworkTypeEnum, Network, NetworkType, TableQuery, RequestPayload } from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                         from '@acx-ui/react-router-dom'
import { getIntl, notAvailableMsg }                                          from '@acx-ui/utils'


const disabledType: NetworkTypeEnum[] = []

function getCols (intl: ReturnType<typeof useIntl>, isServicesEnabled: boolean) {
  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: intl.$t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      disable: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
          return data
        }else{
          return (
            <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>
              {data}
              {data !== row.ssid &&
                <> {intl.$t({ defaultMessage: '(SSID: {ssid})' }, { ssid: row.ssid })}</>
              }
            </TenantLink>
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
              to={`/networks/wireless/${row.id}/network-details/venues`}
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
            <TenantLink to={`/networks/wireless/${row.id}/network-details/aps`}>{data}</TenantLink>
          )
        }
      }
    },
    {
      key: 'clients',
      title: intl.$t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      sorter: false,
      align: 'center'
    },
    {
      key: 'services',
      title: intl.$t({ defaultMessage: 'Services' }),
      dataIndex: 'services',
      sorter: true,
      align: 'center',
      show: isServicesEnabled
    },
    {
      key: 'vlan',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      sorter: true,
      render: function (data, row) {
        return transformVLAN(row)
      }
    }
    // { // TODO: Waiting for HEALTH feature support
    //   key: 'health',
    //   title: intl.$t({ defaultMessage: 'Health' }),
    //   dataIndex: 'health',
    //   sorter: true
    // },
    // { // TODO: Waiting for TAG feature support
    //   key: 'tags',
    //   title: intl.$t({ defaultMessage: 'Tags' }),
    //   dataIndex: 'tags',
    //   sorter: true
    // }
  ]
  return columns
}


const transformVLAN = (row: Network) => {
  const { $t } = getIntl()
  if (row.vlanPool) {
    const vlanPool = row.vlanPool
    return $t({ defaultMessage: 'VLAN Pool: {poolName}' }, { poolName: vlanPool?.name ?? '' })
  }
  return $t({ defaultMessage: 'VLAN-{id}' }, { id: row.vlan })
}

export const defaultNetworkPayload = {
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
          title={intl.$t(notAvailableMsg)}>{node}</Tooltip>
      }
      return node
    }
  }
  return params
}

interface NetworkTableProps {
  tableQuery: TableQuery<Network, RequestPayload<unknown>, unknown>,
  selectable?: boolean
}

export function NetworkTable ({ tableQuery, selectable }: NetworkTableProps) {
  const isServicesEnabled = useIsSplitOn(Features.SERVICES)
  const intl = useIntl()
  const { $t } = intl
  const navigate = useNavigate()
  const linkToEditNetwork = useTenantLink('/networks/wireless/')

  const { tenantId } = useParams()
  const [
    deleteNetwork, { isLoading: isDeleteNetworkUpdating }
  ] = useDeleteNetworkMutation()

  if(!isServicesEnabled){
    disabledType.push(NetworkTypeEnum.CAPTIVEPORTAL)
  }

  const rowActions: TableProps<Network>['rowActions'] = [
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
    }
  ]

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteNetworkUpdating }
    ]}>
      <Table
        columns={getCols(intl, isServicesEnabled)}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={selectable ? { type: 'radio', ...rowSelection(intl) } : undefined}
      />
    </Loader>
  )
}
