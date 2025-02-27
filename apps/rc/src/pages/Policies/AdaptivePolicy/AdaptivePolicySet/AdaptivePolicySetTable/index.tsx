import { useIntl } from 'react-intl'

import { Loader, showToast, Table, TableProps }     from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                        from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useAdaptivePolicySetListByQueryQuery,
  useDeleteAdaptivePolicySetMutation, useGetCertificateTemplatesQuery, useGetEnhancedDpskListQuery,
  useSearchMacRegListsQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicySet, FILTER, filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
  getPolicyRoutePath, getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType, RulesManagementUrlsInfo, SEARCH, useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { getOpsApi }                                    from '@acx-ui/utils'

export default function AdaptivePolicySetTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)

  const settingsId = 'adaptive-policy-set-list-table'
  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicySetListByQueryQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
    defaultPayload: {},
    pagination: { settingsId }
  })

  const [
    deletePolicy,
    { isLoading: isDeletePolicyUpdating }
  ] = useDeleteAdaptivePolicySetMutation()

  const { macRegList, getMacListLoading } = useSearchMacRegListsQuery(
    {
      payload: {
        pageSize: 10000,
        dataOption: 'all',
        searchCriteriaList: [{
          filterKey: 'name',
          operation: 'cn',
          value: ''
        }]
      }
    }, {
      selectFromResult: ({ data, isLoading }) => {
        const macRegList = new Map(data?.data.map((mac) =>
          [mac.id, mac.name]))
        return {
          macRegList,
          getMacListLoading: isLoading
        }
      }, skip: !isCloudpathEnabled
    })

  const { dpskList, getDpsksLoading } = useGetEnhancedDpskListQuery(
    {
      payload: { pageSize: 10000 }
    }, {
      selectFromResult: ({ data, isLoading }) => {
        const dpskList = new Map(data?.data.map((dpsk) =>
          [dpsk.id, dpsk.name]))
        return {
          dpskList,
          getDpsksLoading: isLoading
        }
      }, skip: !isCloudpathEnabled
    })

  // eslint-disable-next-line max-len
  const { certificateTemplateList, getCertificateTemplateLoading } = useGetCertificateTemplatesQuery(
    {
      payload: { pageSize: 10000 }
    }, {
      selectFromResult: ({ data, isLoading }) => {
        const certificateTemplateList = new Map(data?.data.map((template) =>
          [template.id, template.name]))
        return {
          certificateTemplateList,
          getCertificateTemplateLoading: isLoading
        }
      }, skip: !isCertificateTemplateEnabled
    })

  function useColumns () {
    const { $t } = useIntl()
    const columns: TableProps<AdaptivePolicySet>['columns'] = [
      {
        title: $t({ defaultMessage: 'Name' }),
        key: 'name',
        dataIndex: 'name',
        sorter: true,
        searchable: true,
        defaultSortOrder: 'ascend',
        render: function (_, row) {
          return (
            <TenantLink
              to={
                getPolicyDetailsLink({
                  type: PolicyType.ADAPTIVE_POLICY_SET,
                  oper: PolicyOperation.DETAIL,
                  policyId: row.id!
                })}
            >{row.name}</TenantLink>
          )
        }
      },
      {
        title: $t({ defaultMessage: 'Contained Policies' }),
        key: 'mappedPolicyCount',
        dataIndex: 'mappedPolicyCount',
        align: 'center',
        sorter: true,
        render: (_, row) => {
          if(row.mappedPolicyCount === 0) return 0
          const policies = row.policyNames ?? []
          return <SimpleListTooltip items={policies}
            displayText={row.mappedPolicyCount}
            totalCountOfItems={row.mappedPolicyCount}/>
        }
      },
      {
        title: $t({ defaultMessage: 'Scope' }),
        key: 'assignmentCount',
        dataIndex: 'assignmentCount',
        align: 'center',
        sorter: true,
        render: (_, row) => {
          if(row.assignmentCount === 0) return 0
          const macAssignments = row.externalAssignments
            .map(assignment => assignment.identityId).flat()
            .filter(id => macRegList.has(id))
            .map(id => macRegList.get(id) ?? '') ?? []

          const dpskAssignments = row.externalAssignments
            .map(assignment => assignment.identityId).flat()
            .filter(id => dpskList.has(id))
            .map(id => dpskList.get(id) ?? '') ?? []

          const certTemplateAssignments = row.externalAssignments
            .map(assignment => assignment.identityId).flat()
            .filter(id => certificateTemplateList.has(id))
            .map(id => certificateTemplateList.get(id) ?? '') ?? []

          // eslint-disable-next-line max-len
          return <SimpleListTooltip items={[...macAssignments, ...dpskAssignments, ...certTemplateAssignments]}
            displayText={row.assignmentCount}
            totalCountOfItems={row.assignmentCount}/>
        }
      }
    ]
    return columns
  }

  const rowActions: TableProps<AdaptivePolicySet>['rowActions'] = [{
    scopeKey: getScopeKeyByPolicy(PolicyType.ADAPTIVE_POLICY_SET, PolicyOperation.EDIT),
    rbacOpsIds: [getOpsApi(RulesManagementUrlsInfo.updatePolicySet)],
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
          type: PolicyType.ADAPTIVE_POLICY_SET,
          oper: PolicyOperation.EDIT,
          policyId: selectedRows[0].id!
        })
      })
    }
  },
  {
    scopeKey: getScopeKeyByPolicy(PolicyType.ADAPTIVE_POLICY_SET, PolicyOperation.DELETE),
    rbacOpsIds: [getOpsApi(RulesManagementUrlsInfo.deletePolicySet)],
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([selectedRow], clearSelection) => {
      const name = selectedRow.name
      doProfileDelete(
        [selectedRow],
        $t({ defaultMessage: 'Policy Set' }),
        name,
        [
          // eslint-disable-next-line max-len
          { fieldName: 'assignmentCount', fieldText: $t({ defaultMessage: 'other services' }) }
        ],
        async () => {
          deletePolicy({ params: { policySetId: selectedRow.id } })
            .unwrap()
            .then(() => {
              showToast({
                type: 'success',
                content: $t({ defaultMessage: 'Policy Set {name} was deleted' }, { name })
              })
              clearSelection()
            }).catch((error) => {
              console.log(error) // eslint-disable-line no-console
            })
        }
      )
    }
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add Set' }),
    scopeKey: getScopeKeyByPolicy(PolicyType.ADAPTIVE_POLICY_SET, PolicyOperation.CREATE),
    rbacOpsIds: [getOpsApi(RulesManagementUrlsInfo.createPolicySet)],
    onClick: () => {
      navigate({
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getPolicyRoutePath({
          type: PolicyType.ADAPTIVE_POLICY_SET,
          oper: PolicyOperation.CREATE
        })
      })
    }
  }]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = { ...tableQuery.payload, filters: { name: customSearch?.searchString ?? '' } }
    tableQuery.setPayload(payload)
  }

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <Loader states={[
      tableQuery,
      { isLoading: getMacListLoading || getDpsksLoading || getCertificateTemplateLoading,
        isFetching: isDeletePolicyUpdating }
    ]}>
      <Table
        enableApiFilter
        settingsId={settingsId}
        columns={useColumns()}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={allowedRowActions}
        onFilterChange={handleFilterChange}
        rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
        actions={filterByAccessForServicePolicyMutation(actions)}
      />
    </Loader>
  )
}
