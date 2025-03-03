import { useIntl } from 'react-intl'

import { Loader, showToast, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                    from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useAdaptivePolicyListByQueryQuery,
  useDeleteAdaptivePolicyMutation,
  usePolicyTemplateListByQueryQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy, FILTER,
  getAdaptivePolicyDetailLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType, SEARCH, useTableQuery, getScopeKeyByPolicy,
  filterByAccessForServicePolicyMutation, RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { getOpsApi }                                    from '@acx-ui/utils'


export default function AdaptivePolicyTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const settingsId = 'adaptive-policy-list-table'
  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListByQueryQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
    defaultPayload: {},
    pagination: { settingsId }
  })

  // eslint-disable-next-line max-len
  const { templateIdMap, templateIsLoading } = usePolicyTemplateListByQueryQuery(
    { payload: { page: '1', pageSize: '1000' } }, {
      selectFromResult: ({ data, isLoading }) => {
        const templateIds = new Map(data?.data.map((template) =>
          [template.ruleType.toString(), template.id]))
        return {
          templateIdMap: templateIds,
          templateIsLoading: isLoading
        }
      }
    })

  const [
    deletePolicy,
    { isLoading: isDeletePolicyUpdating }
  ] = useDeleteAdaptivePolicyMutation()

  function useColumns () {
    const { $t } = useIntl()
    const columns: TableProps<AdaptivePolicy>['columns'] = [
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
                getAdaptivePolicyDetailLink({
                  oper: PolicyOperation.DETAIL,
                  policyId: row.id!,
                  templateId: templateIdMap.get(row.policyType) ?? ''
                })}
              rbacOpsIds={[getOpsApi(RulesManagementUrlsInfo.getPolicyByTemplate)]}
            >{row.name}</TenantLink>
          )
        }
      },
      {
        title: $t({ defaultMessage: 'Policy Type' }),
        key: 'policyType',
        dataIndex: 'policyType',
        sorter: true
      },
      {
        title: $t({ defaultMessage: 'Access Conditions' }),
        key: 'conditionsCount',
        dataIndex: 'conditionsCount',
        align: 'center',
        sorter: true
      },
      {
        title: $t({ defaultMessage: 'Policy Set Membership' }),
        key: 'policySetCount',
        dataIndex: 'policySetCount',
        align: 'center',
        sorter: true,
        render: (_, row) => {
          const policySets = row.policySetNames ?? []
          return policySets.length === 0 ? '0' :
            <SimpleListTooltip items={policySets} displayText={policySets.length} />
        }
      }
    ]
    return columns
  }

  const rowActions: TableProps<AdaptivePolicy>['rowActions'] = [{
    scopeKey: getScopeKeyByPolicy(PolicyType.ADAPTIVE_POLICY, PolicyOperation.EDIT),
    rbacOpsIds: [getOpsApi(RulesManagementUrlsInfo.updatePolicy),
      getOpsApi(RulesManagementUrlsInfo.addConditions),
      getOpsApi(RulesManagementUrlsInfo.deleteConditions),
      getOpsApi(RulesManagementUrlsInfo.updateConditions)],
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getAdaptivePolicyDetailLink({
          oper: PolicyOperation.EDIT,
          policyId: selectedRows[0].id!,
          templateId: templateIdMap.get(selectedRows[0].policyType) ?? ''
        })
      })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: getScopeKeyByPolicy(PolicyType.ADAPTIVE_POLICY, PolicyOperation.DELETE),
    rbacOpsIds: [getOpsApi(RulesManagementUrlsInfo.deletePolicy)],
    onClick: ([selectedRow], clearSelection) => {
      const name = selectedRow.name
      doProfileDelete(
        [selectedRow],
        $t({ defaultMessage: 'policy' }),
        name,
        [
          { fieldName: 'policySetNames', fieldText: $t({ defaultMessage: 'Adaptive Policy Sets' }) }
        ],
        async () => {
          deletePolicy({ params: { policyId: selectedRow.id,
            templateId: templateIdMap.get(selectedRow.policyType) } })
            .unwrap()
            .then(() => {
              showToast({
                type: 'success',
                content: $t({ defaultMessage: 'Policy {name} was deleted' }, { name })
              })
              clearSelection()
            }).catch((error) => {
              console.log(error) // eslint-disable-line no-console
            })
        }
      )
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
      { isLoading: templateIsLoading,
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
        // eslint-disable-next-line max-len
        rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
        actions={filterByAccessForServicePolicyMutation([{
          scopeKey: getScopeKeyByPolicy(PolicyType.ADAPTIVE_POLICY, PolicyOperation.CREATE),
          // eslint-disable-next-line max-len
          rbacOpsIds: [getOpsApi(RulesManagementUrlsInfo.createPolicy), getOpsApi(RulesManagementUrlsInfo.addConditions)],
          label: $t({ defaultMessage: 'Add Policy' }),
          onClick: () => {
            navigate({
              ...tenantBasePath,
              pathname: `${tenantBasePath.pathname}/` + getPolicyRoutePath({
                type: PolicyType.ADAPTIVE_POLICY,
                oper: PolicyOperation.CREATE
              })
            })
          }
        }])}
      />
    </Loader>
  )
}
