import { useIntl } from 'react-intl'

import { Card, Loader, Table, TableProps }      from '@acx-ui/components'
import { useGetTunnelProfileViewDataListQuery } from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  IpsecViewData,
  PolicyOperation,
  PolicyType,
  transformDisplayNumber,
  TunnelProfileViewData } from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { useTableQuery } from '@acx-ui/utils'

const defaultTunnelProfilePayload = {
  fields: ['id', 'name', 'tunnelType', 'destinationEdgeClusterName', 'sdLanIds'],
  page: 1,
  pageSize: 10_000
}

interface IpsecTunnelDetailProps {
  data: IpsecViewData
}

export default function IpsecTunnelDetail (props: IpsecTunnelDetailProps) {
  const { data } = props
  const { $t } = useIntl()

  const tunnelProfilePayload = {
    ...defaultTunnelProfilePayload,
    filters: { ipsecProfileId: [data.id] }
  }
  const tableQuery = useTableQuery({
    useQuery: useGetTunnelProfileViewDataListQuery,
    defaultPayload: tunnelProfilePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    }
  })

  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({totalCount})' },
        { totalCount: transformDisplayNumber(tableQuery.data?.totalCount) })}>
        <Table<TunnelProfileViewData>
          enableApiFilter={true}
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
        />
      </Card>
    </Loader>
  )
}

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<TunnelProfileViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Tunnel Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return <TenantLink to={getPolicyDetailsLink({
          type: PolicyType.TUNNEL_PROFILE,
          oper: PolicyOperation.DETAIL,
          policyId: row.id
        })}>
          {row.name}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Tunnel Type' }),
      dataIndex: 'tunnelType',
      key: 'tunnelType'
    },
    {
      title: $t({ defaultMessage: 'Destination Cluster' }),
      dataIndex: 'destinationEdgeClusterName',
      key: 'destinationEdgeClusterName'
    },
    {
      title: $t({ defaultMessage: 'SD-LAN' }),
      key: 'sdLanIds',
      dataIndex: 'sdLanIds',
      align: 'center',
      render: (_, row) => {
        return transformDisplayNumber(row.sdLanIds?.length)
      }
    }
  ]
  return columns
}