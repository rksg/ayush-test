import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps, Tooltip }    from '@acx-ui/components'
import { useDeleteCliTemplatesMutation, useGetCliTemplatesQuery } from '@acx-ui/rc/services'
import { SwitchCliTemplateModel, usePollingTableQuery }           from '@acx-ui/rc/utils'
import { useParams }                                              from '@acx-ui/react-router-dom'
import { useNavigate }                                            from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                              from '@acx-ui/user'

import { Notification  } from './styledComponents'

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
    defaultSortOrder: 'ascend',
    sorter: true
  },{
    key: 'switches',
    title: $t({ defaultMessage: 'Switches' }),
    dataIndex: 'switchCount',
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
          {switchArray.length}
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
      <Notification>
        { // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Update the CLI templates to reflect the CLI changes in FastIron 09.0.10f release. After upgrading to FastIron 09.0.10f release, using CLI templates with deprecated commands would result in configuration failures. Refer to the ' })
        }
        <a target='_blank'
          // eslint-disable-next-line max-len
          href={'https://support.ruckuswireless.com/documents/4486-ruckus-icx-fastiron-09-0-10f-ga-release-notes'}
          rel='noreferrer'> {$t({ defaultMessage: 'FastIron 09.0.10f release notes' })} </a>
        {
          $t({ defaultMessage: ' for a list of deprecated CLI commands.' })
        }
      </Notification>
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'checkbox' }}
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
