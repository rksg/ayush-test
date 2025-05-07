import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Card, Loader, Table, TableProps }                                                             from '@acx-ui/components'
import { useGetNetworkTemplateListQuery, useWifiNetworkListQuery }                                     from '@acx-ui/rc/services'
import { ConfigTemplateType, Network, NetworkType, NetworkTypeEnum, useConfigTemplate, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                  from '@acx-ui/react-router-dom'

import { renderConfigTemplateDetailsComponent } from '../../../../configTemplates'

interface SamlIdpInstanceTableProps {
    networkIds?: string[]
}
export const SamlIdpInstanceTable = (props: SamlIdpInstanceTableProps) => {
  const { $t } = useIntl()
  const { networkIds } = props
  const { isTemplate } = useConfigTemplate()
  const useQuery = isTemplate ? useGetNetworkTemplateListQuery : useWifiNetworkListQuery
  const tableQuery = useTableQuery<Network>({
    useQuery,
    defaultPayload: {
      fields: ['name', 'id', 'captiveType', 'nwSubType'],
      filters: { id: networkIds }
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 10000
    },
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    },
    option: {
      skip: !networkIds || networkIds.length === 0
    }
  })

  useEffect(() => {
    if (networkIds?.length && networkIds.length > 0) {
      tableQuery.setPayload({
        ...tableQuery.payload,
        filters: { id: networkIds }
      })
    }
  }, [networkIds])

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: function (_, row) {
        return isTemplate ?
          renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, row.name) :
          <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>
            {row.name}
          </TenantLink>
      }
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: networkIds?.length || 0 })}>
        <Table
          columns={columns}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='id'
          onFilterChange={tableQuery.handleFilterChange}
        />
      </Card>
    </Loader>
  )
}