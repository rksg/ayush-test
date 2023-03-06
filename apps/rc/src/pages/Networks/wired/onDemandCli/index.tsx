import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps, Tooltip }    from '@acx-ui/components'
import { useDeleteCliTemplatesMutation, useGetCliTemplatesQuery } from '@acx-ui/rc/services'
import { SwitchCliTemplateModel, usePollingTableQuery }           from '@acx-ui/rc/utils'
import { useParams }                                              from '@acx-ui/react-router-dom'
import { useNavigate }                                            from '@acx-ui/react-router-dom'
import { filterByAccess }                                         from '@acx-ui/user'

export function OnDemandCliTab () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [deleteCliTemplates] = useDeleteCliTemplatesMutation()

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
      let switchArray: string[] = []
      row.venueSwitches?.forEach(venue => {
        venue.switches?.forEach(switchName => {
          switchArray.push(switchName)
        })
      })

      if (row.venueSwitches) {
        return <Tooltip
          title={switchArray.join('\n')}>
          {row.venueSwitches.length}
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
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: selectedRows.length > 1 ?
              $t({ defaultMessage: 'CLI templates' }) : $t({ defaultMessage: 'CLI template' }),
            entityValue: selectedRows[0].name,
            numOfEntities: selectedRows.length
          },
          onOk: () => {
            deleteCliTemplates({
              params: { tenantId },
              payload: selectedRows.map(r => r.id)
            }).then(clearSelection)
          }
        })
      }
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
        rowActions={filterByAccess(rowActions)}
        rowSelection={{ type: 'checkbox' }}
        actions={filterByAccess([{
          label: $t({ defaultMessage: 'Add CLI Template' }),
          onClick: () => {
            navigate('add', { replace: false })
          }
        }])}
      />
    </Loader></>
  )
}
