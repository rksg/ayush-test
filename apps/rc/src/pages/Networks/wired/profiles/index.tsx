import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useDeleteProfilesMutation, useGetProfilesQuery }      from '@acx-ui/rc/services'
import { SwitchProfileModel, usePollingTableQuery }            from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }               from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                           from '@acx-ui/user'

export function ProfilesTab () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const linkToProfiles = useTenantLink('/networks/wired/profiles')

  const [deleteProfiles] = useDeleteProfilesMutation()

  const tableQuery = usePollingTableQuery<SwitchProfileModel>({
    useQuery: useGetProfilesQuery,
    defaultPayload: {}
  })

  const columns: TableProps<SwitchProfileModel>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'Profile Name' }),
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    sorter: true
  },{
    key: 'profileType',
    title: $t({ defaultMessage: 'Type' }),
    dataIndex: 'profileType',
    sorter: true
  },{
    key: 'venueCount',
    title: $t({ defaultMessage: 'Venues' }),
    dataIndex: 'venueCount',
    sorter: true,
    render: function (data, row) {
      if (row.venues) {
        return <Tooltip
          title={row.venues.join('\n')}>
          {row.venues.length}
        </Tooltip>
      }
      return 0
    }
  }]

  const rowActions: TableProps<SwitchProfileModel>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        const row = selectedRows?.[0]
        navigate(`${row?.profileType?.toLowerCase()}/${row?.id}/edit`, { replace: false })
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
              $t({ defaultMessage: 'Profiles' }) : $t({ defaultMessage: 'Profile' }),
            entityValue: selectedRows[0].name,
            numOfEntities: selectedRows.length
          },
          onOk: () => {
            deleteProfiles({
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
        rowSelection={hasAccess() && { type: 'checkbox' }}
        actions={filterByAccess([{
          label: $t({ defaultMessage: 'Add Regular Profile' }),
          onClick: () => navigate(`${linkToProfiles.pathname}/add`)
        },
        {
          label: $t({ defaultMessage: 'Add CLI Profile' }),
          onClick: () => {
            navigate('cli/add', { replace: false })
          }
        }])}
      />
    </Loader></>
  )
}
