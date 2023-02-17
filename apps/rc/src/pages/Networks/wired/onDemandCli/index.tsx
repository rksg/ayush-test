import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip }           from '@acx-ui/components'
import { useGetCliTemplatesQuery }                      from '@acx-ui/rc/services'
import { SwitchCliTemplateModel, usePollingTableQuery } from '@acx-ui/rc/utils'
import { useNavigate }                                  from '@acx-ui/react-router-dom'

export function OnDemandCliTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()

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
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate(`${selectedRows[0].id}/edit`, { replace: false })
      }
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
          onClick: () => {
            navigate('add', { replace: false })
          }
        }]}
      />
    </Loader></>
  )
}
