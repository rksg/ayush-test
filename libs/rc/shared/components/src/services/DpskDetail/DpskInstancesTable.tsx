import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Card }                                                             from '@acx-ui/components'
import { useGetNetworkTemplateListQuery, useNetworkListQuery }                                         from '@acx-ui/rc/services'
import { ConfigTemplateType, Network, NetworkType, NetworkTypeEnum, useConfigTemplate, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                  from '@acx-ui/react-router-dom'

import { renderConfigTemplateDetailsComponent } from '../../configTemplates'

export default function DpskInstancesTable (props: { networkIds?: string[] }) {
  const { $t } = useIntl()
  const { networkIds } = props
  const { isTemplate } = useConfigTemplate()
  const useQuery = isTemplate ? useGetNetworkTemplateListQuery : useNetworkListQuery
  const tableQuery = useTableQuery<Network>({
    useQuery,
    defaultPayload: {
      fields: ['check-all', 'name', 'description', 'nwSubType', 'venues', 'id'],
      filters: { id: networkIds && networkIds?.length > 0 ? networkIds : [''] }
    }
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { id: networkIds && networkIds.length > 0 ? networkIds : [''] }
    })
  }, [networkIds, tableQuery.data?.data])

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return isTemplate
          ? renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, row.name)
          // eslint-disable-next-line max-len
          : <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>{row.name}</TenantLink>
      }
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      sorter: true
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => {
        return <NetworkType networkType={row.nwSubType as NetworkTypeEnum} row={row} />
      }
    },
    {
      key: 'venues',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: ['venues', 'count'],
      sorter: true,
      render: function (_, row) {
        const value = row.venues?.count ?? 0
        return isTemplate
          // eslint-disable-next-line max-len
          ? renderConfigTemplateDetailsComponent(ConfigTemplateType.NETWORK, row.id, value, 'venues')
          // eslint-disable-next-line max-len
          : <TenantLink to={`/networks/wireless/${row.id}/network-details/venues`}>{value}</TenantLink>
      }
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Card.Title>
        {$t({
          defaultMessage: 'Instances ({instanceCount})'
        },
        {
          instanceCount: tableQuery.data?.totalCount
        })}
      </Card.Title>
      <Table<Network>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Loader>
  )
}
