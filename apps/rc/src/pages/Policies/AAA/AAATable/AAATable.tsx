import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                             from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteAAAPolicyListMutation,
  useGetAAAPolicyViewModelListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery,
  useGetIdentityProviderListQuery
} from '@acx-ui/rc/services'
import {
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  AAAViewModalType,
  AAAPurposeEnum,
  AAA_LIMIT_NUMBER,
  getScopeKeyByPolicy,
  filterByAccessForServicePolicyMutation
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'

export default function AAATable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteAAAPolicyListMutation()
  const settingsId = 'policies-aaa-table'
  const radiusMaxiumnNumber = useIsSplitOn(Features.WIFI_INCREASE_RADIUS_INSTANCE_1024)
    ? 1024
    : AAA_LIMIT_NUMBER

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const tableQuery = useTableQuery({
    useQuery: useGetAAAPolicyViewModelListQuery,
    defaultPayload: {
      filters: {}
    },
    search: {
      searchString: '',
      searchTargetFields: ['name']
    },
    pagination: { settingsId },
    enableRbac
  })

  const doDelete = (selectedRows: AAAViewModalType[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Policy' }),
      selectedRows[0].name,
      [
        { fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'Network' }) },
        // eslint-disable-next-line max-len
        { fieldName: 'hotspot20IdentityProviderIds', fieldText: $t({ defaultMessage: 'Identity Provider' }) }
      ],
      async () => deleteFn({
        params: { tenantId },
        payload: selectedRows.map(row => row.id!),
        enableRbac
      }).then(callback)
    )
  }

  const rowActions: TableProps<AAAViewModalType>['rowActions'] = [
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.AAA, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => doDelete(selectedRows, clearSelection)
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.AAA, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows: AAAViewModalType[]) => selectedRows?.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.AAA,
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
          $t({ defaultMessage: 'RADIUS Server ({count})' },
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
            to={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })}
            scopeKey={getScopeKeyByPolicy(PolicyType.AAA, PolicyOperation.CREATE)}
          >
            <Button type='primary'
              disabled={tableQuery.data?.totalCount
                ? tableQuery.data?.totalCount >= radiusMaxiumnNumber
                : false} >{$t({ defaultMessage: 'Add RADIUS Server' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<AAAViewModalType>
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

  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const { $t } = useIntl()
  const params = useParams()
  const emptyResult: { key: string, value: string }[] = []

  const getNetworkListQuery = isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery

  const { networkNameMap } = getNetworkListQuery({
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
      networkNameMap: data?.data
        ? data.data.map(network => ({ key: network.id, value: network.name }))
        : emptyResult
    })
  })
  const { identityProviderNameMap } = useGetIdentityProviderListQuery({
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
      identityProviderNameMap: data?.data
        ? data.data.map(idp => ({ key: idp.id, value: idp.name }))
        : emptyResult
    })
  })
  const columns: TableProps<AAAViewModalType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'RADIUS Type' }),
      dataIndex: 'type',
      sorter: true,
      render: (_, { type }) =>{
        return type ? AAAPurposeEnum[type] : ''
      }
    },
    {
      key: 'primary',
      title: $t({ defaultMessage: 'Primary Server' }),
      dataIndex: 'primary',
      sorter: true
    },
    {
      key: 'secondary',
      title: $t({ defaultMessage: 'Secondary Server' }),
      dataIndex: 'secondary',
      sorter: true
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      filterKey: 'networkIds',
      filterable: networkNameMap,
      sorter: !isWifiRbacEnabled,
      render: (_, row) =>{
        if (!row.networkIds || row.networkIds.length === 0) return 0
        const networkIds = row.networkIds
        // eslint-disable-next-line max-len
        const tooltipItems = networkNameMap.filter(v => networkIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={networkIds.length} />
      }
    },
    {
      key: 'identityProviderCount',
      title: $t({ defaultMessage: 'Identity Providers' }),
      dataIndex: 'identityProviderCount',
      align: 'center',
      filterKey: 'hotspot20IdentityProviderIds',
      filterable: identityProviderNameMap,
      sorter: false,
      render: (_, row) =>{
        const hotspot20IdentityProviderIds = row.hotspot20IdentityProviderIds
        if (!hotspot20IdentityProviderIds || hotspot20IdentityProviderIds.length === 0) return 0
        // eslint-disable-next-line max-len
        const tooltipItems = identityProviderNameMap.filter(v => hotspot20IdentityProviderIds!.includes(v.key || '')).map(v => v.value)
        return <SimpleListTooltip
          items={tooltipItems}
          displayText={hotspot20IdentityProviderIds.length}
        />
      }
    }
  ]

  return columns
}
