
import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import {
  useDeleteSwitchPortProfileMutation,
  // useDeleteDirectoryServerMutation,
  useSwitchPortProfilesListQuery
}from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  SwitchPortProfiles,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

export default function SwitchPortProfileTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteSwitchPortProfile ] = useDeleteSwitchPortProfileMutation()
  const settingsId = 'switch-port-profile-table'

  const defaultPayload = {
    fields: [ 'id' ],
    pagination: { settingsId }
  }

  const tableQuery = useTableQuery<SwitchPortProfiles>({
    useQuery: useSwitchPortProfilesListQuery,
    defaultPayload
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
        render: function (_, row) {
          return (
            <TenantLink
              to={`/policies/portProfile/switch/profiles/${row.id}/detail`}>
              {row.name}
            </TenantLink>
          )
        }
      },
      {
        key: 'type',
        title: $t({ defaultMessage: 'Server Type' }),
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
            title={row.taggedVlans?.join(', ')}
            dottedUnderline={row.taggedVlans?.length ? true : false}
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
          return <Tooltip
            title={row.macOuis?.map(item=> item.oui).join('\n')}
            dottedUnderline={row.macOuis?.length ? true : false}
          >
            {row.macOuis ? row.macOuis.length : 0}
          </Tooltip>
        }
      },
      {
        key: 'lldpTlvs',
        title: $t({ defaultMessage: 'LLDP TLV' }),
        dataIndex: 'lldpTlvs',
        render: (_, row) => {
          return <Tooltip
            title={row.lldpTlvs?.map(item=> item.systemName).join('\n')}
            dottedUnderline={row.lldpTlvs?.length ? true : false}
          >
            {row.lldpTlvs ? row.lldpTlvs.length : 0}
          </Tooltip>
        }
      },
      {
        key: 'dot1x',
        title: $t({ defaultMessage: '802.1x' }),
        dataIndex: 'dot1x',
        show: false,
        render: function (_, row) {
          return row.dot1x ? $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })
        }
      },
      {
        key: 'macAuth',
        title: $t({ defaultMessage: 'Mac Auth' }),
        dataIndex: 'macAuth',
        show: false,
        render: function (_, row) {
          return row.dot1x ? $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })
        }
      },
      {
        key: 'switches',
        title: $t({ defaultMessage: 'Switches' }),
        dataIndex: 'switches',
        render: (_, row) => {
          return <Tooltip
            title={row.appliedSwitchesInfo?.map(item=> item.switchName).join('\n')}
            dottedUnderline={row.appliedSwitchesInfo?.length ? true : false}
          >
            {row.appliedSwitchesInfo ? row.appliedSwitchesInfo.length : 0}
          </Tooltip>
        }
      },
      {
        key: 'venues',
        title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
        dataIndex: 'venues',
        render: (_, row) => {
          return <Tooltip
            title={row.appliedSwitchesInfo?.map(item=> item.venueName).join('\n')}
            dottedUnderline={row.appliedSwitchesInfo?.length ? true : false}
          >
            {row.appliedSwitchesInfo ? row.appliedSwitchesInfo.length : 0}
          </Tooltip>
        }
      }
    ]
    return columns
  }

  const rowActions: TableProps<SwitchPortProfiles>['rowActions'] = [
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.DELETE),
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
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows?.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/policies/portProfile/switch/profiles/${id}/edit`
        })
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

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
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}
