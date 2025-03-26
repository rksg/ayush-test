import { useIntl } from 'react-intl'

import {
  Loader,
  showActionModal,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useBatchDeleteProfilesMutation,
  useDeleteProfilesMutation,
  useGetProfilesQuery
}      from '@acx-ui/rc/services'
import {
  SwitchProfileModel,
  ProfileTypeEnum,
  usePollingTableQuery,
  SwitchUrlsInfo,
  SwitchRbacUrlsInfo
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
}                     from '@acx-ui/react-router-dom'
import { SwitchScopes } from '@acx-ui/types'
import {
  hasCrossVenuesPermission,
  filterByAccess,
  hasPermission

}   from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

export function ProfilesTab () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const linkToProfiles = useTenantLink('/networks/wired/profiles')

  const [deleteProfiles] = useDeleteProfilesMutation()
  const [batchDeleteProfiles] = useBatchDeleteProfilesMutation()

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const typeFilterOptions = Object.values(ProfileTypeEnum).map(key => ({
    key, value: key
  }))

  const tableQuery = usePollingTableQuery<SwitchProfileModel>({
    useQuery: useGetProfilesQuery,
    enableRbac: isSwitchRbacEnabled,
    defaultPayload: {},
    search: {
      searchString: '',
      searchTargetFields: ['name']
    }
  })

  const columns: TableProps<SwitchProfileModel>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'Profile Name' }),
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    searchable: true,
    sorter: true
  },{
    key: 'profileType',
    title: $t({ defaultMessage: 'Type' }),
    dataIndex: 'profileType',
    filterMultiple: false,
    filterValueNullable: false,
    filterable: typeFilterOptions,
    sorter: true
  },{
    key: 'venueCount',
    title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
    dataIndex: 'venueCount',
    sorter: true,
    render: function (_, row) {
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
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchUrlsInfo.updateSwitchConfigProfile)],
      onClick: (selectedRows) => {
        const row = selectedRows?.[0]
        navigate(`${row?.profileType?.toLowerCase()}/${row?.id}/edit`, { replace: false })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: [SwitchScopes.DELETE],
      rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteSwitchProfile)],
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
          onOk: async () => {
            if (isSwitchRbacEnabled) {
              const requests = selectedRows.map(row => ({ params: { switchProfileId: row.id } }))
              await batchDeleteProfiles(requests).then(clearSelection)
            } else {
              deleteProfiles({
                params: { tenantId },
                payload: selectedRows.map(r => r.id)
              }).then(clearSelection)
            }
          }
        })
      }
    }
  ]

  const isSelectionVisible = hasPermission({
    scopes: [SwitchScopes.UPDATE, SwitchScopes.DELETE],
    rbacOpsIds: [
      getOpsApi(SwitchRbacUrlsInfo.deleteSwitchProfile),
      getOpsApi(SwitchUrlsInfo.updateSwitchConfigProfile)
    ]
  })

  return (
    <> <Loader states={[
      tableQuery
    ]}>
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
          label: $t({ defaultMessage: 'Add Regular Profile' }),
          scopeKey: [SwitchScopes.CREATE],
          rbacOpsIds: [getOpsApi(SwitchUrlsInfo.addSwitchConfigProfile)],
          onClick: () => navigate(`${linkToProfiles.pathname}/add`)
        },
        {
          label: $t({ defaultMessage: 'Add CLI Profile' }),
          scopeKey: [SwitchScopes.CREATE],
          rbacOpsIds: [getOpsApi(SwitchUrlsInfo.addSwitchConfigProfile)],
          onClick: () => {
            navigate('cli/add', { replace: false })
          }
        }]) : []}
      />
    </Loader></>
  )
}
