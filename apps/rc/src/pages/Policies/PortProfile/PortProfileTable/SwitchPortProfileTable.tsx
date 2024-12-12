
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip } from '@acx-ui/components'
import {
  // useDeleteDirectoryServerMutation,
  useSwitchPortProfilesListQuery
}from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
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
  // const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  // const [ deleteFn ] = useDeleteDirectoryServerMutation()
  const settingsId = 'switch-port-profile-table'

  const defaultPayload = {
    fields: [ 'id' ],
    pagination: { settingsId }
  }

  const tableQuery = useTableQuery<SwitchPortProfiles>({
    useQuery: useSwitchPortProfilesListQuery,
    defaultPayload
  })

  // const doDelete = (selectedRows: SwitchPortProfiles[], callback: () => void) => {
  // doProfileDelete(
  //   selectedRows,
  //   $t({ defaultMessage: 'Port Profile(s)' }),
  //   selectedRows[0].name,
  //   [{ fieldName: 'id', fieldText: $t({ defaultMessage: 'Switch Port' }) }],
  //   async () => deleteFn({
  //     params, payload: selectedRows.map(row => row.id) }).then(callback)
  // )
  // }

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
        sorter: true,
        render: (_, row) => {
          return <Tooltip
            title={row.taggedVlans?.join('\n')}
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
        sorter: true,
        render: (_, row) => {
          return <Tooltip
            title={row.macOuis?.map(item=> item.note).join('\n')}
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
        sorter: true,
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
        key: 'regularProfiles',
        title: $t({ defaultMessage: 'Switches' }),
        dataIndex: 'regularProfiles',
        sorter: true,
        render: (_, row) => {
          return <Tooltip
            title={row.regularProfiles?.join('\n')}
            dottedUnderline={row.regularProfiles?.length ? true : false}
          >
            {row.regularProfiles ? row.regularProfiles.length : 0}
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
      onClick: () => {
      // onClick: (selectedRows: SwitchPortProfiles[], clearSelection) => {
        // doDelete(selectedRows, clearSelection)
      }
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows?.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.SWITCH_PORT_PROFILE,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
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
