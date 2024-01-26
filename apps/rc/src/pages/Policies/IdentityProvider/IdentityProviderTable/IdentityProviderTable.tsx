import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { SimpleListTooltip }                             from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteIdentityProviderListMutation,
  useGetEnhancedIdentityProviderListQuery,
  useNetworkListQuery,
  useGetVenuesQuery
} from '@acx-ui/rc/services'
import {
  KeyValue,
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  IdentityProviderViewModel,
  Network,
  Venue
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                               from '@acx-ui/user'

import { PROFILE_MAX_COUNT } from '../constants'

const defaultPayload = {
  fields: ['id', 'name', 'tenantId', 'clientEntries', 'venueIds', 'description'],
  searchString: '',
  filters: {}
}

export default function IdentityProviderTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteIdentityProviderListMutation()

  const settingsId = 'policies-identity-provider-table'
  const tableQuery = useTableQuery<IdentityProviderViewModel>({
    useQuery: useGetEnhancedIdentityProviderListQuery,
    defaultPayload,
    pagination: { settingsId }
  })

  const doDelete = (selectedRows: IdentityProviderViewModel[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Policy' }),
      selectedRows[0].name,
      [{ fieldName: 'venueIds', fieldText: $t({ defaultMessage: 'Venue' }) }],
      async () => deleteFn({ params, payload: selectedRows.map(row => row.id) }).then(callback)
    )
  }

  const rowActions: TableProps<IdentityProviderViewModel>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows: IdentityProviderViewModel[], clearSelection) => {
        doDelete(selectedRows, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows?.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.IDENTITY_PROVIDER,
            oper: PolicyOperation.EDIT,
            policyId: id
          })
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Identity Provider' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.CREATE })}>
            <Button
              type='primary'
              disabled={tableQuery.data?.totalCount! >= PROFILE_MAX_COUNT}>
              {$t({ defaultMessage: 'Add Identity Provider' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<IdentityProviderViewModel>
          settingsId={settingsId}
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'checkbox' }}
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
  const { networkNameMap }: { networkNameMap: KeyValue<string, string>[] } = useNetworkListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }: { data?: { data: Network[] } }) => ({
      networkNameMap: data?.data
        ? data.data.map(network => ({ key: network.id, value: network.name }))
        : emptyResult
    })
  })
  const { venueNameMap }: { venueNameMap: KeyValue<string, string>[] } = useGetVenuesQuery({
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
      venueNameMap: data?.data
        ? data.data.map(venue => ({ key: venue.id, value: venue.name }))
        : emptyResult
    })
  })

  const columns: TableProps<IdentityProviderViewModel>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: (_, row) => (
        <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.IDENTITY_PROVIDER,
            oper: PolicyOperation.DETAIL,
            policyId: row.id!
          })}>
          {row.name}
        </TenantLink>
      )
    },
    {
      key: 'naiRealm',
      title: $t({ defaultMessage: 'NAI Realm' }),
      dataIndex: 'naiRealms',
      sorter: true,
      render: (_, { naiRealms }) => naiRealms.map(realm => realm.name).join(', ')
    },
    {
      key: 'plmn',
      title: $t({ defaultMessage: 'PLMN' }),
      dataIndex: 'plmns',
      align: 'center',
      sorter: true,
      render: (_, { plmns }) => (
        plmns
          ? <SimpleListTooltip
            items={plmns.map(plmn => 'MCC: ' + plmn.mcc + ', MNC: ' + plmn.mnc)}
            displayText={(plmns).length}
            title={$t({ defaultMessage: 'PLMN' })}
          />
          : ''
      )
    },
    {
      key: 'roamingConsortiumOI',
      title: $t({ defaultMessage: 'Roaming Consortium OI' }),
      dataIndex: 'roamingConsortiumOIs',
      align: 'center',
      sorter: true,
      render: (_, { roamingConsortiumOIs }) => (
        roamingConsortiumOIs
          ? <SimpleListTooltip
            items={roamingConsortiumOIs.map(oi => oi.name + ' (' + oi.organizationId + ')')}
            displayText={(roamingConsortiumOIs).length}
            title={$t({ defaultMessage: 'Roaming Consortium OI' })}
          />
          : ''
      )
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      filterKey: 'networkIds',
      filterable: networkNameMap,
      sorter: true,
      render: (_, { networkIds }) => {
        if (!networkIds || networkIds.length === 0) return 0

        return <SimpleListTooltip
          items={networkNameMap.filter(kv => networkIds.includes(kv.key)).map(kv => kv.value)}
          displayText={networkIds.length} />
      }
    },
    {
      key: 'venueCount',
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venueCount',
      align: 'center',
      filterKey: 'venueIds',
      filterable: venueNameMap,
      sorter: true,
      render: (_, { venueIds }) => {
        if (!venueIds || venueIds.length === 0) return 0

        return <SimpleListTooltip
          items={venueNameMap.filter(kv => venueIds.includes(kv.key)).map(kv => kv.value)}
          displayText={venueIds.length} />
      }
    }
  ]

  return columns
}
