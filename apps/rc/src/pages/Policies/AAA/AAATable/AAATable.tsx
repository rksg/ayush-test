import { ReactNode } from 'react'

import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader }            from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { CheckMark }                                                from '@acx-ui/icons'
import { CertificateToolTip, SimpleListTooltip, useEnforcedStatus } from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteAAAPolicyListMutation,
  useGetAAAPolicyViewModelListQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery,
  useGetIdentityProviderListQuery,
  useGetCertificateListQuery,
  useGetCertificateAuthoritiesQuery
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
  filterByAccessForServicePolicyMutation,
  CertificateStatusType,
  getPolicyAllowedOperation,
  ConfigTemplateType
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
  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus(ConfigTemplateType.RADIUS)

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
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.AAA, PolicyOperation.DELETE),
      scopeKey: getScopeKeyByPolicy(PolicyType.AAA, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      disabled: (selectedRows) => hasEnforcedItem(selectedRows),
      tooltip: (selectedRows) => getEnforcedActionMsg(selectedRows),
      onClick: (selectedRows, clearSelection) => doDelete(selectedRows, clearSelection)
    },
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.AAA, PolicyOperation.EDIT),
      scopeKey: getScopeKeyByPolicy(PolicyType.AAA, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows: AAAViewModalType[]) => selectedRows?.length === 1,
      onClick: ([{ id, networkIds }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.AAA,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        }, { state: {
          networkIds: networkIds
        } })
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
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.AAA, PolicyOperation.CREATE)}
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
  const supportRadsec = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)

  const { $t } = useIntl()
  const params = useParams()
  const emptyResult: { key: string, value: string }[] = []
  const emptyCertificateResult:
    { key: string, value: string, status: CertificateStatusType[] }[] = []

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

  const { certificateAuthorityNameMap } = useGetCertificateAuthoritiesQuery({
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
      certificateAuthorityNameMap: data?.data
        ? data.data.map(ca => ({ key: ca.id, value: ca.name }))
        : emptyResult
    })
  })

  const { certificateMap } = useGetCertificateListQuery({
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
      certificateMap: data?.data
        ? data.data.map(cc => ({ key: cc.id, value: cc.name, status: cc.status }))
        : emptyCertificateResult
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
      width: 160,
      render: (_, { type }) =>{
        return type ?
          (supportRadsec ?
            AAAPurposeEnum[type].replace(' RADIUS Server', '') : AAAPurposeEnum[type]) : ''
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
    ...(supportRadsec ? [{
      key: 'radSecOptions.tlsEnabled',
      title: $t({ defaultMessage: 'RadSec' }),
      dataIndex: 'radSecOptions.tlsEnabled',
      sorter: false,
      align: 'center' as AlignType,
      width: 80,
      render: (data: ReactNode, row: AAAViewModalType) => {
        return (row.radSecOptions?.tlsEnabled ?
          <CheckMark style={{ width: '18px', paddingTop: '4px' }}/> : null)
      }
    },
    {
      key: 'radSecOptions.certificateAuthorityId',
      title: $t({ defaultMessage: 'CA' }),
      dataIndex: 'radSecOptions.certificateAuthorityId',
      filterable: certificateAuthorityNameMap,
      render: (data: ReactNode, row: AAAViewModalType) => {
        return (!row.radSecOptions?.certificateAuthorityId)
          ? ''
          : (<TenantLink to={getPolicyRoutePath({
            type: PolicyType.CERTIFICATE_AUTHORITY,
            oper: PolicyOperation.LIST
          })}>
            {certificateAuthorityNameMap.find(
              c => c.key === row?.radSecOptions?.certificateAuthorityId)?.value || ''}
          </TenantLink>)
      }
    },
    {
      key: 'radSecOptions.clientCertificateId',
      title: $t({ defaultMessage: 'Client Certificate' }),
      dataIndex: 'radSecOptions.clientCertificateId',
      filterable: certificateMap,
      render: (data: ReactNode, row: AAAViewModalType) => {
        return (!row.radSecOptions?.clientCertificateId)
          ? ''
          : (<>
            <TenantLink to={getPolicyRoutePath({
              type: PolicyType.SERVER_CERTIFICATES,
              oper: PolicyOperation.LIST })}>
              {certificateMap.find(
                c => c.key === row.radSecOptions?.clientCertificateId)?.value || ''}
            </TenantLink>
            {certificateMap.find(
              c => c.key === row.radSecOptions?.clientCertificateId)?.status?.find(
              (s) => s === CertificateStatusType.EXPIRED || s === CertificateStatusType.REVOKED) ?
              <CertificateToolTip
                placement='bottom'
                status={certificateMap.find(
                  c => c.key === row.radSecOptions?.clientCertificateId)?.status}
              /> : []}
          </> )
      }
    },
    {
      key: 'radSecOptions.serverCertificateId',
      title: $t({ defaultMessage: 'Server Certificate' }),
      dataIndex: 'radSecOptions.serverCertificateId',
      filterable: certificateMap,
      sorter: false,
      render: (_: ReactNode, row: AAAViewModalType) => {
        const serverCert = certificateMap.find(
          cert => cert.key === row.radSecOptions?.serverCertificateId)
        return (!row.radSecOptions?.serverCertificateId)
          ? ''
          : (<>
            <TenantLink
              to={getPolicyRoutePath({
                type: PolicyType.SERVER_CERTIFICATES,
                oper: PolicyOperation.LIST
              })}>
              {serverCert?.value || ''}
            </TenantLink>
            {serverCert?.status && !serverCert?.status.includes(CertificateStatusType.VALID) ?
              <CertificateToolTip
                placement='bottom'
                policyType={PolicyType.SERVER_CERTIFICATES}
                status={serverCert.status} /> : []}
          </>
          )
      }
    }] : []),
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
