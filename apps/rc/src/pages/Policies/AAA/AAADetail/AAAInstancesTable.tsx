
import { useIntl } from 'react-intl'

import { Table, TableProps, Card } from '@acx-ui/components'
import { AAADetailInstances }      from '@acx-ui/rc/utils'
import { TenantLink }              from '@acx-ui/react-router-dom'


export default function AAAInstancesTable (
  props:Partial<TableProps<AAADetailInstances>>){

  const { $t } = useIntl()
  const { dataSource } = props
  const columns: TableProps<AAADetailInstances>['columns'] = [
    {
      key: 'NetworkName',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'network',
      sorter: true,
      render: function (_data, row) {
        return (
          <TenantLink
            to={`/networks/${row.network.id}/network-details/aps`}>
            {row.network.name}</TenantLink>
        )
      }
    },
    {
      key: 'Type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      render: function (_data, row) {
        return row.network.captiveType
      }
    }
  ]

  return (
    <Card title={$t({ defaultMessage: 'Instances ({count})' }, { count: dataSource?.length })}>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey='id'
      />
    </Card>
  )
}
