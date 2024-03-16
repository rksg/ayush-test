import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { SimpleListTooltip }                             from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteIdentityProviderMutation,
  useGetIdentityProviderListQuery,
  useNetworkListQuery
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
  Network
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                               from '@acx-ui/user'

import { PROFILE_MAX_COUNT } from '../constants'

const defaultPayload = {
  fields: ['id', 'name', 'naiRealms', 'plmns', 'roamingConsortiumOIs',
    'authRadiusId', 'accountingRadiusId', 'networkIds', 'venueIds' ],
  searchString: '',
  filters: {}
}


export default function IdentityProviderTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteIdentityProviderMutation()

  const settingsId = 'policies-identity-provider-table'

  const tableQuery = useTableQuery<IdentityProviderViewModel>({
    useQuery: useGetIdentityProviderListQuery,
    defaultPayload,
    pagination: { settingsId }
  })

  const doDelete = (selectedRows: IdentityProviderViewModel[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Policy' }),
      selectedRows[0].name,
      [{ fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'Network' }) }],
      async () => {
        const ids = selectedRows.map(row => row.id)
        for (let i=0; i<ids.length; i++) {
          const curParams = {
            ...params,
            profileId: ids[i]
          }
          await deleteFn({ params: curParams })
        }
        callback()
      }
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
            policyId: id!
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
      <Loader states={[{ isLoading: false } /*tableQuery*/]}>
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
      key: 'roamConsortiumOI',
      title: $t({ defaultMessage: 'Roaming Consortium OI' }),
      dataIndex: 'roamConsortiumOIs',
      align: 'center',
      sorter: true,
      render: (_, { roamConsortiumOIs }) => (
        roamConsortiumOIs
          ? <SimpleListTooltip
            items={roamConsortiumOIs.map(oi => oi.name + ' (' + oi.organizationId + ')')}
            displayText={(roamConsortiumOIs).length}
            title={$t({ defaultMessage: 'Roaming Consortium OI' })}
          />
          : ''
      )
    },
    {
      key: 'authRadiusCount',
      title: $t({ defaultMessage: 'Auth Service' }),
      dataIndex: 'authRadiusCount',
      align: 'center',
      sorter: false,
      render: (_, { authRadiusId }) => {
        return authRadiusId ? 1 : 0
      }
    },
    {
      key: 'accountingRadiusCount',
      title: $t({ defaultMessage: 'Accounting Service' }),
      dataIndex: 'accountingRadiusCount',
      align: 'center',
      sorter: false,
      render: (_, { accountingRadiusId }) => {
        return accountingRadiusId ? 1 : 0
      }
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      filterKey: 'networkIds',
      filterable: networkNameMap,
      sorter: false,
      render: (_, { networkIds }) => {
        if (!networkIds || networkIds.length === 0) return 0

        return <SimpleListTooltip
          items={networkNameMap.filter(kv => networkIds.includes(kv.key)).map(kv => kv.value)}
          displayText={networkIds.length} />
      }
    }
  ]

  return columns
}
