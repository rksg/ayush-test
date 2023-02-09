import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip }           from '@acx-ui/components'
import { useGetCliTemplatesQuery }                      from '@acx-ui/rc/services'
import { SwitchCliTemplateModel, usePollingTableQuery } from '@acx-ui/rc/utils'

export function OnDemandCliTab () {
  const { $t } = useIntl()

  const tableQuery = usePollingTableQuery<SwitchCliTemplateModel>({
    useQuery: useGetCliTemplatesQuery,
    defaultPayload: {}
  })

  const columns: TableProps<SwitchCliTemplateModel>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'CLI Template Name' }),
    dataIndex: 'name',
    sorter: true
  },{
    key: 'switches',
    title: $t({ defaultMessage: 'Switches' }),
    dataIndex: 'switches',
    sorter: true,
    render: function (data, row) {
      if (row.switches) {
        return <Tooltip
          title={row.switches.join('\n')}>
          {row.switches.length}
        </Tooltip>
      }
      return 0
    }
  }]

  const rowActions: TableProps<SwitchCliTemplateModel>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      disabled: true, //Waiting for support
      label: $t({ defaultMessage: 'Edit' }),
      onClick: () => { }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: true, //Waiting for support
      onClick: () => {}
    }
  ]

  return (
    <> <Loader states={[
      tableQuery
    ]}>
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
        actions={[{
          label: $t({ defaultMessage: 'Add CLI Template' }),
          disabled: true //Waiting for support
          // onClick: () => {}
        }]}
      />
    </Loader></>
  )
}
