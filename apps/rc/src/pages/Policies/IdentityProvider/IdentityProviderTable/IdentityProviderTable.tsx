/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Table, TableProps, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { SimpleListTooltip }         from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteIdentityProviderMutation,
  useGetAAAPolicyViewModelListQuery,
  useGetIdentityProviderListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  KeyValue,
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  IdentityProviderViewModel,
  Network,
  AAAViewModalType,
  getScopeKeyByPolicy,
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const defaultPayload = {
  fields: ['id', 'name',
    'naiRealms', 'plmns', 'roamConsortiumOIs',
    'authRadiusId', 'accountingRadiusId', 'wifiNetworkIds' ],
  searchString: '',
  searchTargetFields: ['name'],
  filters: {},
  sortField: 'name',
  sortOrder: 'ASC'
}


export default function IdentityProviderTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
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
      $t({ defaultMessage: 'Profile(s)' }),
      selectedRows[0].name,
      [{ fieldName: 'wifiNetworkIds', fieldText: $t({ defaultMessage: 'Network' }) }],
      async () => {
        Promise.all(selectedRows.map(row => deleteFn({ params: { policyId: row.id } })))
          .then(callback)
      }
    )
  }

  const rowActions: TableProps<IdentityProviderViewModel>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      scopeKey: getScopeKeyByPolicy(PolicyType.IDENTITY_PROVIDER, PolicyOperation.DELETE),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.IDENTITY_PROVIDER, PolicyOperation.DELETE),
      onClick: (selectedRows: IdentityProviderViewModel[], clearSelection) => {
        doDelete(selectedRows, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      scopeKey: getScopeKeyByPolicy(PolicyType.IDENTITY_PROVIDER, PolicyOperation.EDIT),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.IDENTITY_PROVIDER, PolicyOperation.EDIT),
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

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <Loader states={[tableQuery]}>
      <Table<IdentityProviderViewModel>
        settingsId={settingsId}
        columns={useColumns()}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={allowedRowActions}
        rowSelection={(allowedRowActions.length > 0) && { type: 'checkbox' }}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const params = useParams()
  const emptyResult: KeyValue<string, string>[] = []
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const getNetworkListQuery = isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery
  // eslint-disable-next-line max-len
  const { networkNameMap }: { networkNameMap: KeyValue<string, string>[] } = getNetworkListQuery({
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

  // eslint-disable-next-line max-len
  const { radiusNameMap }: { radiusNameMap: KeyValue<string, string>[] } = useGetAAAPolicyViewModelListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10000
    },
    enableRbac: enableServicePolicyRbac
  }, {
    selectFromResult: ({ data }: { data?: { data: AAAViewModalType[] } }) => ({
      radiusNameMap: data?.data
        ? data.data.map(radius => ({ key: radius.id!, value: radius.name }))
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
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (_, row, __, highlightFn) => (
        <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.IDENTITY_PROVIDER,
            oper: PolicyOperation.DETAIL,
            policyId: row.id!
          })}>
          {highlightFn(row.name || '--')}
        </TenantLink>
      )
    },
    {
      key: 'naiRealm',
      title: $t({ defaultMessage: 'NAI Realm' }),
      dataIndex: 'naiRealms',
      //sorter: true,
      render: (_, { naiRealms }) => naiRealms.map(realm => realm.name).join(', ')
    },
    {
      key: 'plmn',
      title: $t({ defaultMessage: 'PLMN' }),
      dataIndex: 'plmns',
      align: 'center',
      //sorter: true,
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
      //sorter: true,
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
      key: 'authRadiusId',
      title: $t({ defaultMessage: 'Auth Service' }),
      dataIndex: 'authRadiusId',
      sorter: false,
      render: (_, { authRadiusId }) => {
        return (!authRadiusId)
          ? ''
          : (
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: authRadiusId })}>
              {radiusNameMap.find(radius => radius.key === authRadiusId)?.value || ''}
            </TenantLink>)
      }
    },
    {
      key: 'accountingRadiusId',
      title: $t({ defaultMessage: 'Accounting Service' }),
      dataIndex: 'accountingRadiusId',
      sorter: false,
      render: (_, { accountingRadiusId }) => {
        return (!accountingRadiusId)
          ? ''
          : (
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: accountingRadiusId })}>
              {radiusNameMap.find(radius => radius.key === accountingRadiusId)?.value || ''}
            </TenantLink>)
      }
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      filterKey: 'wifiNetworkIds',
      filterable: networkNameMap,
      sorter: false,
      render: (_, { wifiNetworkIds }) => {
        if (!wifiNetworkIds || wifiNetworkIds.length === 0) return 0

        return <SimpleListTooltip
          items={networkNameMap.filter(kv => wifiNetworkIds.includes(kv.key)).map(kv => kv.value)}
          displayText={wifiNetworkIds.length} />
      }
    }
  ]

  return columns
}
