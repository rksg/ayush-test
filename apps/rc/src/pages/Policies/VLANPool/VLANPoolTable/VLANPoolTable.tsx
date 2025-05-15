import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, showActionModal, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                                              from '@acx-ui/rc/components'
import {
  useDelVLANPoolPolicyMutation,
  useGetVenuesQuery,
  useGetVLANPoolPolicyViewModelListQuery
} from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  VLAN_LIMIT_NUMBER,
  VLANPoolViewModelType
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

export default function VLANPoolTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDelVLANPoolPolicyMutation()
  const settingsId = 'policies-vlan-pool-table'
  const isPolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const tableQuery = useTableQuery({
    useQuery: useGetVLANPoolPolicyViewModelListQuery,
    enableRbac: isPolicyRbacEnabled,
    defaultPayload: {
      fields: isPolicyRbacEnabled ? [
        'id',
        'name',
        'vlanMembers',
        'wifiNetworkIds',
        'wifiNetworkVenueApGroups'
      ] : [
        'id',
        'name',
        'vlanMembers',
        'venueApGroups',
        'venueIds'
      ],
      filters: {}
    },
    search: {
      searchString: '',
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })

  const rowActions: TableProps<VLANPoolViewModelType>['rowActions'] = [
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.VLAN_POOL, PolicyOperation.DELETE),
      scopeKey: getScopeKeyByPolicy(PolicyType.VLAN_POOL, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: name
          },
          onOk: () => {
            deleteFn({ params: { ...params, policyId: id }, enableRbac: isPolicyRbacEnabled })
              .then(clearSelection)
          }
        })
      }
    },
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.VLAN_POOL, PolicyOperation.EDIT),
      scopeKey: getScopeKeyByPolicy(PolicyType.VLAN_POOL, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.VLAN_POOL,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'VLAN Pools ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.CREATE })}
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.VLAN_POOL, PolicyOperation.CREATE)}
            scopeKey={getScopeKeyByPolicy(PolicyType.VLAN_POOL, PolicyOperation.CREATE)}
          >
            <Button type='primary'
              disabled={tableQuery.data?.totalCount
                ? tableQuery.data?.totalCount >= VLAN_LIMIT_NUMBER
                : false} >{$t({ defaultMessage: 'Add VLAN Pool' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<VLANPoolViewModelType>
          settingsId={settingsId}
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const params = useParams()
  const emptyVenues: { key: string, value: string }[] = []
  const { venueNameMap } = useGetVenuesQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueNameMap: data?.data
        ? data.data.map(venue => ({ key: venue.id, value: venue.name }))
        : emptyVenues
    })
  })
  const columns: TableProps<VLANPoolViewModelType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.VLAN_POOL,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'vlanMembers',
      title: $t({ defaultMessage: 'VLANs' }),
      dataIndex: 'vlanMembers',
      sorter: true,
      render: (_, { vlanMembers }) =>{
        return vlanMembers?.toString()
      }
    },
    {
      key: 'venueIds',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venueIds',
      filterable: venueNameMap,
      sorter: false,
      render: (__, row) =>{
        if (!row.venueIds || row.venueIds.length === 0) return 0
        const venueIds = row.venueIds
        const venueApGroups = row.venueApGroups
        // eslint-disable-next-line max-len
        const filterVenues = venueNameMap.filter(v => venueIds!.includes(v.key)).map(v => v)
        const tooltipItems = filterVenues.map(v => {
          const venueApGroup = _.find(venueApGroups,{ id: v.key })
          if(venueApGroup?.apGroups.length===1&&venueApGroup.apGroups[0].allApGroups){
            return $t({ defaultMessage: '{value} (All APs)' }, { value: v.value })
          }
          return $t({ defaultMessage: '{value} ({count} AP Groups)' },
            { value: v.value, count: venueApGroup?.apGroups.length })
        })
        return <SimpleListTooltip items={tooltipItems} displayText={venueIds.length} />
      }
    }
  ]

  return columns
}
