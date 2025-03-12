import { useIntl } from 'react-intl'

import {
  Loader,
  showActionModal,
  Table,
  TableProps,
  Tooltip

}     from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useDeleteCliTemplatesMutation,
  useGetCliTemplatesQuery

}  from '@acx-ui/rc/services'
import {
  SwitchCliTemplateModel,
  SwitchUrlsInfo,
  usePollingTableQuery
}            from '@acx-ui/rc/utils'
import { useParams }    from '@acx-ui/react-router-dom'
import { useNavigate }  from '@acx-ui/react-router-dom'
import { SwitchScopes } from '@acx-ui/types'
import {
  hasCrossVenuesPermission,
  filterByAccess,
  hasPermission

} from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

import { Notification  } from './styledComponents'

export function OnDemandCliTab () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [deleteCliTemplates] = useDeleteCliTemplatesMutation()

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const tableQuery = usePollingTableQuery<SwitchCliTemplateModel>({
    useQuery: useGetCliTemplatesQuery,
    defaultPayload: {},
    enableRbac: isSwitchRbacEnabled,
    search: {
      searchString: '',
      searchTargetFields: ['name']
    }
  })

  const columns: TableProps<SwitchCliTemplateModel>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'CLI Template Name' }),
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    searchable: true,
    sorter: true
  },{
    key: 'switches',
    title: $t({ defaultMessage: 'Switches' }),
    dataIndex: 'switchCount',
    sorter: true,
    render: function (_, row) {
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
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchUrlsInfo.updateCliTemplate)],
      onClick: (selectedRows) => {
        navigate(`${selectedRows[0].id}/edit`, { replace: false })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [SwitchScopes.DELETE],
      rbacOpsIds: [getOpsApi(SwitchUrlsInfo.deleteCliTemplates)],
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
              payload: selectedRows.map(r => r.id),
              enableRbac: isSwitchRbacEnabled
            }).then(clearSelection)
          }
        })
      }
    }
  ]

  const isSelectionVisible = hasPermission({
    scopes: [SwitchScopes.UPDATE, SwitchScopes.DELETE],
    rbacOpsIds: [
      getOpsApi(SwitchUrlsInfo.updateCliTemplate),
      getOpsApi(SwitchUrlsInfo.deleteCliTemplates)
    ]
  })

  return (
    <> <Loader states={[
      tableQuery
    ]}>
      <Notification>
        { // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Update the CLI templates to reflect the CLI changes in FastIron 09.0.10h release. After upgrading to FastIron 09.0.10h release, using CLI templates with deprecated commands would result in configuration failures. Refer to the ' })
        }
        <a target='_blank'
          // eslint-disable-next-line max-len
          href={'https://support.ruckuswireless.com/documents/4620'}
          rel='noreferrer'> {$t({ defaultMessage: 'FastIron 09.0.10h release notes' })} </a>
        {
          $t({ defaultMessage: ' for a list of deprecated CLI commands.' })
        }
      </Notification>
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasCrossVenuesPermission() && isSelectionVisible && { type: 'checkbox' }}
        actions={hasCrossVenuesPermission() ? filterByAccess([{
          label: $t({ defaultMessage: 'Add CLI Template' }),
          scopeKey: [SwitchScopes.CREATE],
          rbacOpsIds: [getOpsApi(SwitchUrlsInfo.addCliTemplate)],
          onClick: () => {
            navigate('add', { replace: false })
          }
        }]) : []}
      />
    </Loader></>
  )
}
