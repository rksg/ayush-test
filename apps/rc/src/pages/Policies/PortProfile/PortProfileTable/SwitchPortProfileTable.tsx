import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import { CountAndNamesTooltip }                                from '@acx-ui/rc/components'
import {
  useDeleteSwitchPortProfileMutation,
  useSwitchPortProfilesListQuery,
  useVenuesListQuery
}from '@acx-ui/rc/services'
import {
  FILTER,
  getScopeKeyByPolicy,
  getPolicyAllowedOperation,
  GROUPBY,
  PolicyOperation,
  PolicyType,
  SEARCH,
  SwitchPortProfiles,
  useTableQuery,
  vlanPortsParser
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import {
  filterByAccess,
  hasCrossVenuesPermission
} from '@acx-ui/user'

export default function SwitchPortProfileTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteSwitchPortProfile ] = useDeleteSwitchPortProfileMutation()
  const settingsId = 'switch-port-profile-table'

  const defaultPayload = {
    fields: [ 'id', 'name' ],
    pagination: { settingsId }
  }

  const tableQuery = useTableQuery<SwitchPortProfiles>({
    useQuery: useSwitchPortProfilesListQuery,
    defaultPayload,
    search: {
      searchString: '',
      searchTargetFields: ['name']
    }
  })

  const { venueFilterOptions } = useVenuesListQuery({
    payload: {
      fields: ['name', 'country', 'latitude', 'longitude', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueFilterOptions: data?.data
        .map(v => ({ key: v.id, value: v.name }))
        .sort((a, b) => a.value.localeCompare(b.value)) || true
    })
  })

  function useColumns () {
    const { $t } = useIntl()
    const columns: TableProps<SwitchPortProfiles>['columns'] = [
      {
        key: 'name',
        title: $t({ defaultMessage: 'Name' }),
        dataIndex: 'name',
        sorter: true,
        searchable: true,
        defaultSortOrder: 'ascend',
        render: function (_, row, index, highlightFn) {
          return (
            <TenantLink
              to={`/policies/portProfile/switch/profiles/${row.id}/detail`}>
              {highlightFn(row.name)}
            </TenantLink>
          )
        }
      },
      {
        key: 'type',
        title: $t({ defaultMessage: 'Type' }),
        dataIndex: 'type'
      },
      {
        key: 'untaggedVlan',
        title: $t({ defaultMessage: 'Untagged VLAN' }),
        dataIndex: 'untaggedVlan'
      },
      {
        key: 'taggedVlans',
        title: $t({ defaultMessage: 'Tagged VLAN' }),
        dataIndex: 'taggedVlans',
        render: (_, row) => {
          return <Tooltip
            // eslint-disable-next-line max-len
            title={row.taggedVlans ? vlanPortsParser(row.taggedVlans?.join(' ') || '', 200, $t({ defaultMessage: 'Tagged VLANs' })) : ''}
            dottedUnderline={row.taggedVlans?.length ? true : false}
            placement='bottom'
          >
            {row.taggedVlans ? row.taggedVlans.length : 0}
          </Tooltip>
        }
      },
      {
        key: 'macOuis',
        title: $t({ defaultMessage: 'MAC OUI' }),
        dataIndex: 'macOuis',
        render: (_, row) => {
          return <CountAndNamesTooltip
            data={{ count: row.macOuis?.length ||
              0, names: row.macOuis?.map(item=> item.oui) || [] }}
            maxShow={25}
          />
        }
      },
      {
        key: 'lldpTlvs',
        title: $t({ defaultMessage: 'LLDP TLV' }),
        dataIndex: 'lldpTlvs',
        render: (_, row) => {
          return <CountAndNamesTooltip
            data={{ count: row.lldpTlvs?.length ||
              0, names: row.lldpTlvs?.map(item=> item.systemName) || [] }}
            maxShow={25}
          />
        }
      },
      {
        key: 'dot1x',
        title: $t({ defaultMessage: '802.1x' }),
        dataIndex: 'dot1x',
        show: false,
        render: function (_, row) {
          return row.dot1x ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
        }
      },
      {
        key: 'macAuth',
        title: $t({ defaultMessage: 'MAC Auth' }),
        dataIndex: 'macAuth',
        show: false,
        render: function (_, row) {
          return row.macAuth ?
            $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
        }
      },
      {
        key: 'switches',
        title: $t({ defaultMessage: 'Switches' }),
        dataIndex: 'switches',
        render: (_, row) => {
          return <CountAndNamesTooltip
            data={{ count: row.appliedSwitchesInfo?.length ||
              0, names: row.appliedSwitchesInfo?.map(item=> item.switchName) || [] }}
            maxShow={25}
          />
        }
      },
      {
        key: 'venues',
        title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
        dataIndex: 'venues',
        filterable: venueFilterOptions,
        filterKey: 'venueId',
        render: (_, row) => {
          return <CountAndNamesTooltip
            data={{ count: row.appliedSwitchesInfo?.length ||
              0, names: row.appliedSwitchesInfo?.map(item=> item.venueName) || [] }}
            maxShow={25}
          />
        }
      }
    ]
    return columns
  }

  const rowActions: TableProps<SwitchPortProfiles>['rowActions'] = [
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.EDIT),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows?.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/policies/portProfile/switch/profiles/${id}/edit`
        })
      }
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.DELETE),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows: SwitchPortProfiles[], clearSelection) => {
        const appliedSwitchesCount = selectedRows.reduce(
          (count, row) => count + (row.appliedSwitchesInfo?.length || 0), 0)

        if(appliedSwitchesCount > 0){
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete ICX Port Profile(s)?' }),
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: 'Deleting this profile(s) will cause the associated ports to lose the configuration.' }),
            okText: $t({ defaultMessage: 'Delete' }),
            cancelText: $t({ defaultMessage: 'Cancel' }),
            onOk: () => {
              Promise.all(selectedRows.map(selectedRows =>
                deleteSwitchPortProfile({ params: { portProfileId: selectedRows.id } })))
                .then(clearSelection)
            }
          })
        }else{
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete {portProfileTitle}?' },
              { portProfileTitle: selectedRows.length === 1 ?
                selectedRows[0].name : $t({ defaultMessage: 'ICX Port Profiles' }) }),
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: 'Are you sure you want to delete {count, plural, one {this profile} other {these profiles}}?' }, { count: selectedRows.length }),
            okText: $t({ defaultMessage: 'Delete' }),
            cancelText: $t({ defaultMessage: 'Cancel' }),
            onOk: () => {
              Promise.all(selectedRows.map(selectedRows =>
                deleteSwitchPortProfile({ params: { portProfileId: selectedRows.id } })))
                .then(clearSelection)
            }
          })
        }
      }
    }
  ]

  const allowedRowActions = hasCrossVenuesPermission() ? filterByAccess(rowActions) : []

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH, groupBy?: GROUPBY) => {
    tableQuery.handleFilterChange(customFilters, customSearch, groupBy)
  }

  return (
    <Loader states={[tableQuery]}>
      <Table<SwitchPortProfiles>
        settingsId={settingsId}
        columns={useColumns()}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={allowedRowActions}
        rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
        onFilterChange={handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}
