import { useIntl }                      from 'react-intl'
import { Path, useNavigate, useParams } from 'react-router-dom'

import { Button, Loader, PageHeader, SimpleListTooltip, Table, TableProps } from '@acx-ui/components'
import { Features }                                                         from '@acx-ui/feature-toggle'
import {
  useDeleteIpsecMutation,
  useGetIpsecViewDataListQuery,
  useGetTunnelProfileViewDataListQuery,
  useGetVenuesQuery
} from '@acx-ui/rc/services'
import {
  IpsecViewData,
  PolicyOperation,
  PolicyType,
  usePoliciesBreadcrumb,
  getPolicyRoutePath,
  getPolicyDetailsLink,
  getScopeKeyByPolicy,
  filterByAccessForServicePolicyMutation,
  IpSecAuthEnum,
  IpSecProposalTypeEnum,
  getPolicyAllowedOperation,
  doProfileDelete,
  useIsEdgeFeatureReady,
  IpSecTunnelUsageTypeEnum,
  getTunnelUsageTypeDisplayName,
  getEspProposalsDisplayText,
  getIkeProposalsDisplayText
} from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink } from '@acx-ui/react-router-dom'
import { useTableQuery }             from '@acx-ui/utils'


const defaultPayload = {
  fields: [
    'id',
    'name',
    'serverAddress',
    'authenticationType',
    'ikeProposalType',
    'ikeProposals',
    'espProposalType',
    'espProposals',
    'activations',
    'venueActivations',
    'apActivations'
  ],
  filters: {}
}

export default function IpsecTable () {
  const { $t } = useIntl()
  const isEdgeVxLanIpsecReady = useIsEdgeFeatureReady(Features.EDGE_IPSEC_VXLAN_TOGGLE)

  const navigate = useNavigate()
  const basePath: Path = useTenantLink('')

  const settingsId = 'policies-ipsec-table'
  const [ deleteIpsecFn ] = useDeleteIpsecMutation()

  const tableQuery = useTableQuery<IpsecViewData>({
    useQuery: useGetIpsecViewDataListQuery,
    defaultPayload: {
      ...defaultPayload,
      ...isEdgeVxLanIpsecReady ? {
        fields: [...defaultPayload.fields, 'tunnelUsageType', 'tunnelActivations']
      } : {}
    },
    search: {
      searchString: '',
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })

  const rowActions: TableProps<IpsecViewData>['rowActions'] = [
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.IPSEC, PolicyOperation.EDIT),
      scopeKey: getScopeKeyByPolicy(PolicyType.IPSEC, PolicyOperation.EDIT),
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.IPSEC,
            oper: PolicyOperation.EDIT,
            policyId: selectedRows[0].id
          })
        })
      }
    },
    {
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.IPSEC, PolicyOperation.DELETE),
      scopeKey: getScopeKeyByPolicy(PolicyType.IPSEC, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        doProfileDelete(
          selectedRows,
          $t({ defaultMessage: 'Profile{plural}' },
            { plural: selectedRows.length > 1 ? 's' : '' }),
          selectedRows[0].name,
          [{
            fieldName: 'activations',
            fieldText: $t({ defaultMessage: 'Network with <VenueSingular></VenueSingular>' })
          }, {
            fieldName: 'apActivations',
            fieldText: $t({ defaultMessage: 'AP LAN Port with <VenueSingular></VenueSingular>' })
          }, {
            fieldName: 'venueActivations',
            fieldText: $t({ defaultMessage: '<VenueSingular></VenueSingular> LAN Port' })
          }
          ],
          async () =>
            Promise.all(selectedRows.map(row => deleteIpsecFn({ params: { policyId: row.id } })))
              .then(clearSelection)
        )
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'IPsec ({count})' },
            { count: tableQuery.data?.totalCount ?? 0 }
          )
        }
        breadcrumb={usePoliciesBreadcrumb()}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={getPolicyRoutePath({ type: PolicyType.IPSEC, oper: PolicyOperation.CREATE })}
            scopeKey={getScopeKeyByPolicy(PolicyType.IPSEC, PolicyOperation.CREATE)}
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.IPSEC, PolicyOperation.CREATE)}
          >
            <Button type='primary'>{$t({ defaultMessage: 'Add IPsec Profile' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<IpsecViewData>
          rowKey='id'
          settingsId={settingsId}
          columns={useColumns()}
          rowActions={allowedRowActions}
          rowSelection={
            allowedRowActions.length > 0 && { type: 'checkbox' }
          }
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const isEdgeVxLanIpsecReady = useIsEdgeFeatureReady(Features.EDGE_IPSEC_VXLAN_TOGGLE)

  const { $t } = useIntl()
  const params = useParams()
  const emptyNameMap: { key: string, value: string }[] = []

  const { venueNameMap } = useGetVenuesQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10_000
    }
  }, {
    selectFromResult: ({ data }) => {
      return {
        venueNameMap: data?.data?.map(venue =>
          ({ key: venue.id, value: venue.name })) ?? emptyNameMap
      }
    }
  })

  const { tunnelProfileNameMap } = useGetTunnelProfileViewDataListQuery({
    payload: {
      fields: ['name', 'id'],
      page: 1,
      pageSize: 10_000
    }
  }, {
    skip: !isEdgeVxLanIpsecReady,
    selectFromResult: ({ data }) => {
      return {
        tunnelProfileNameMap: data?.data?.map(tp =>
          ({ key: tp.id, value: tp.name })) ?? emptyNameMap
      }
    }
  })

  const softGreInstancesRenderer = (data: IpsecViewData) => {
    let venueIds: Set<string> = new Set()
    data?.activations?.forEach(activation => venueIds.add(activation.venueId))
    data?.venueActivations?.forEach(activation => venueIds.add(activation.venueId))
    data?.apActivations?.forEach(activation => venueIds.add(activation.venueId))
    if (venueIds.size === 0) return 0
    // eslint-disable-next-line max-len
    const tooltipItems = venueNameMap?.filter(v => venueIds.has(v.key)).map(v => v.value)
    // eslint-disable-next-line max-len
    return <SimpleListTooltip items={tooltipItems} displayText={venueIds.size} />
  }

  const vxlanInstancesRenderer = (data: IpsecViewData) => {
    const tunnelProfileIds = data.tunnelActivations?.map(ta => ta.tunnelProfileId)
    if (!tunnelProfileIds?.length) return 0
    // eslint-disable-next-line max-len
    const tooltipItems = tunnelProfileNameMap?.filter(v => tunnelProfileIds.includes(v.key)).map(v => v.value)
    return <SimpleListTooltip items={tooltipItems} displayText={tunnelProfileIds.length} />
  }

  const columns: TableProps<IpsecViewData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.IPSEC,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    ...isEdgeVxLanIpsecReady ? [{
      key: 'tunnelUsageType',
      title: $t({ defaultMessage: 'Tunnel Usage Type' }),
      dataIndex: 'tunnelUsageType',
      sorter: true,
      render: (_: React.ReactNode, row: IpsecViewData) => {
        // eslint-disable-next-line max-len
        return getTunnelUsageTypeDisplayName(row.tunnelUsageType ?? IpSecTunnelUsageTypeEnum.SOFT_GRE)
      }
    }] : [],
    {
      key: 'serverAddress',
      title: $t({ defaultMessage: 'Security Gateway' }),
      dataIndex: 'serverAddress',
      sorter: true,
      render: (_, row) => {
        return isEdgeVxLanIpsecReady && row.tunnelUsageType === IpSecTunnelUsageTypeEnum.VXLAN_GPE
          ? $t({ defaultMessage: 'N/A' })
          : row.serverAddress
      }
    },
    {
      key: 'authenticationType',
      title: $t({ defaultMessage: 'Authentication' }),
      dataIndex: 'authenticationType',
      sorter: true,
      render: (_, row) => {
        return row.authenticationType === IpSecAuthEnum.PSK ?
          $t({ defaultMessage: 'Pre-shared Key' }) : $t({ defaultMessage: 'Certificate' })
      }
    },
    {
      title: $t({ defaultMessage: 'IKE Proposal' }),
      key: 'ikeProposalType',
      dataIndex: 'ikeProposalType',
      sorter: true,
      align: 'left',
      render: (_, row) => {
        const proposals = row.ikeProposals?.length === 0 ?
          ['All'] : getIkeProposalsDisplayText(row.ikeProposals)
        return <SimpleListTooltip
          items={proposals}
          displayText={
            row.ikeProposalType === IpSecProposalTypeEnum.DEFAULT ?
              $t({ defaultMessage: 'Default' }) :
              $t({ defaultMessage: 'Custom' })} />
      }
    },
    {
      title: $t({ defaultMessage: 'ESP Proposal' }),
      key: 'espProposalType',
      dataIndex: 'espProposalType',
      sorter: true,
      align: 'left',
      render: (_, row) => {
        const proposals = row.espProposals?.length === 0 ?
          ['All'] : getEspProposalsDisplayText(row.espProposals)
        return <SimpleListTooltip
          items={proposals}
          displayText={
            row.espProposalType === IpSecProposalTypeEnum.DEFAULT ?
              $t({ defaultMessage: 'Default' }) :
              $t({ defaultMessage: 'Custom' })} />
      }
    },
    ...isEdgeVxLanIpsecReady ? [{
      key: 'instances',
      title: $t({ defaultMessage: 'Instances' }),
      dataIndex: 'instances',
      render: (_: React.ReactNode, row: IpsecViewData) => {
        return row.tunnelUsageType === IpSecTunnelUsageTypeEnum.VXLAN_GPE
          ? vxlanInstancesRenderer(row)
          : softGreInstancesRenderer(row)
      }
    }] : [{
      key: 'venueCount',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venueCount',
      align: 'center' as const,
      filterKey: 'activations.venueId',
      filterable: venueNameMap,
      sorter: true,
      render: function (_: React.ReactNode, row: IpsecViewData) {
        return softGreInstancesRenderer(row)
      }
    }]
  ]
  return columns
}
