/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { PageHeader, TableProps, Loader, Table, Button } from '@acx-ui/components'
import {
  SimpleListTooltip,
  LBS_SERVER_PROFILE_MAX_COUNT
} from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteLbsServerProfileMutation,
  useGetLbsServerProfileListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  KeyValue,
  PolicyOperation,
  PolicyType,
  LbsServerProfileViewModel,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  useTableQuery,
  Venue,
  getScopeKeyByPolicy,
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const defaultPayload = {
  fields: ['id', 'name', 'tenantId', 'lbsServerVenueName', 'server', 'venueIds'],
  searchString: '',
  filters: {}
}

export default function LbsServerProfileTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [deleteFn] = useDeleteLbsServerProfileMutation()

  const settingsId = 'policies-lbs-server-profile-table'
  const tableQuery = useTableQuery<LbsServerProfileViewModel>({
    useQuery: useGetLbsServerProfileListQuery,
    defaultPayload,
    pagination: { settingsId }
  })

  const doDelete = (selectedRows: LbsServerProfileViewModel[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Profile(s)' }),
      selectedRows[0].name,
      [{
        fieldName: 'venueIds',
        fieldText: $t({ defaultMessage: '<VenueSingular></VenueSingular>' })
      }],
      async () =>
        Promise.all(selectedRows.map(row => deleteFn({ params: { policyId: row.id } })))
          .then(callback)
    )
  }

  const rowActions: TableProps<LbsServerProfileViewModel>['rowActions'] = [{
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: getScopeKeyByPolicy(PolicyType.LBS_SERVER_PROFILE, PolicyOperation.DELETE),
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.LBS_SERVER_PROFILE, PolicyOperation.DELETE),
    onClick: (selectedRows: LbsServerProfileViewModel[], clearSelection) => {
      doDelete(selectedRows, clearSelection)
    }
  }, {
    label: $t({ defaultMessage: 'Edit' }),
    scopeKey: getScopeKeyByPolicy(PolicyType.LBS_SERVER_PROFILE, PolicyOperation.EDIT),
    rbacOpsIds: getPolicyAllowedOperation(PolicyType.LBS_SERVER_PROFILE, PolicyOperation.EDIT),
    visible: (selectedRows) => selectedRows?.length === 1,
    onClick: ([{ id }]) => {
      navigate({
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
          type: PolicyType.LBS_SERVER_PROFILE,
          oper: PolicyOperation.EDIT,
          policyId: id
        })
      })
    }
  }]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={$t(
          { defaultMessage: 'Location Based Service ({count})' },
          { count: tableQuery.data?.totalCount }
        )}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByPolicy(PolicyType.LBS_SERVER_PROFILE, PolicyOperation.CREATE)}
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.LBS_SERVER_PROFILE, PolicyOperation.CREATE)}
            to={getPolicyRoutePath({
              type: PolicyType.LBS_SERVER_PROFILE,
              oper: PolicyOperation.CREATE
            })}>
            <Button
              type='primary'
              disabled={tableQuery.data?.totalCount! >= LBS_SERVER_PROFILE_MAX_COUNT}>
              {$t({ defaultMessage: 'Add LBS Server' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<LbsServerProfileViewModel>
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
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const params = useParams()
  const emptyResult: KeyValue<string, string>[] = []
  // eslint-disable-next-line max-len
  const { veneuNameMap }: { veneuNameMap: KeyValue<string, string>[] } = useVenuesListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }: { data?: { data: Venue[] } }) => ({
      veneuNameMap: data?.data
        ? data.data.map(venue => ({ key: venue.id, value: venue.name }))
        : emptyResult
    })
  })

  const columns: TableProps<LbsServerProfileViewModel>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left',
      render: (_, row, __, highlightFn) => (
        <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.LBS_SERVER_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: row.id!
          })}>
          {highlightFn(row.name || '--')}
        </TenantLink>
      )
    },
    {
      key: 'lbsServerVenueName',
      // Not support VenueSingular for Hospitality Vertical
      // eslint-disable-next-line custom/enforce-venue-placeholder
      title: $t({ defaultMessage: 'LBS Server Venue Name' }),
      dataIndex: 'lbsServerVenueName',
      sorter: true
    },
    {
      key: 'server',
      title: $t({ defaultMessage: 'Server' }),
      dataIndex: 'server',
      sorter: true
    },
    {
      key: 'venueIds',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venueIds',
      align: 'center',
      filterKey: 'venueIds',
      filterable: veneuNameMap,
      sorter: true,
      render: (_, { venueIds }) => {
        if (!venueIds || venueIds.length === 0) return 0

        return <SimpleListTooltip
          items={veneuNameMap.filter(kv => venueIds.includes(kv.key)).map(kv => kv.value)}
          displayText={venueIds.length} />
      }
    }
  ]

  return columns
}
