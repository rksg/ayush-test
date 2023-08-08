import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                                     from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListByQueryQuery,
  useAdaptivePolicySetListQuery,
  useDeleteAdaptivePolicyMutation,
  useLazyGetPrioritizedPoliciesQuery,
  usePolicyTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy, FILTER,
  getAdaptivePolicyDetailLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType, SEARCH, useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                    from '@acx-ui/user'


export default function AdaptivePolicyTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const [policySetPoliciesMap, setPolicySetPoliciesMap] = useState(new Map())

  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicyListByQueryQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
    defaultPayload: {}
  })

  // eslint-disable-next-line max-len
  const { templateIdMap, templateIsLoading } = usePolicyTemplateListQuery(
    { payload: { page: '1', pageSize: '2147483647' } }, {
      selectFromResult: ({ data, isLoading }) => {
        const templateIds = new Map()
        data?.data.forEach( template => {
          templateIds.set(template.ruleType, template.id)
        })
        return {
          templateIdMap: templateIds,
          templateIsLoading: isLoading
        }
      }
    })

  // eslint-disable-next-line max-len
  const { data: adaptivePolicySetList } = useAdaptivePolicySetListQuery({ payload: { page: '1', pageSize: '2147483647' } })

  const [getPrioritizedPolicies] = useLazyGetPrioritizedPoliciesQuery()

  const [
    deletePolicy,
    { isLoading: isDeletePolicyUpdating }
  ] = useDeleteAdaptivePolicyMutation()

  useEffect(() => {
    if(adaptivePolicySetList) {
      adaptivePolicySetList.data.forEach(policySet => {
        getPrioritizedPolicies({ params: { policySetId: policySet.id } })
          .then(result => {
            if (result.data) {
              const policies : string []= result.data.data.map(p => p.policyId)
              setPolicySetPoliciesMap(map => new Map(map.set(policySet.name, policies)))
            }
          })
      })
    }
  }, [adaptivePolicySetList])

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
          const policySets = [] as string []
          policySetPoliciesMap.forEach((value, key) => {
            if(value.find((item: string) => item === row.id)){
              policySets.push(key)
            }
          })
          return policySets.length === 0 ? '0' :
            <SimpleListTooltip items={policySets} displayText={policySets.length} />
        }
      }
    ]
    return columns
  }

  const rowActions: TableProps<AdaptivePolicy>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate({
        ...tenantBasePath,
        pathname: `${tenantBasePath.pathname}/` + getAdaptivePolicyDetailLink({
          oper: PolicyOperation.EDIT,
          policyId: selectedRows[0].id!,
          templateId: templateIdMap.get(selectedRows[0].policyType)
        })
      })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ([{ name, id, policyType }], clearSelection) => {
      if (checkDelete(id)) {
        showActionModal({
          type: 'error',
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'This policy is in use by one or more Adaptive Policy Sets.' })
        })
      } else {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'policy' }),
            entityValue: name
          },
          onOk: async () => {
            deletePolicy({ params: { policyId: id, templateId: templateIdMap.get(policyType) } })
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
        })
      }
    }
  }]

  const checkDelete = (policyId: string) => {
    // eslint-disable-next-line max-len
    return Array.from(policySetPoliciesMap.values()).filter(item => item.find((p:string) => p === policyId)).length !== 0
  }

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = { ...tableQuery.payload, filters: { name: customSearch?.searchString ?? '' } }
    tableQuery.setPayload(payload)
  }

  return (
    <Loader states={[
      tableQuery,
      { isLoading: templateIsLoading,
        isFetching: isDeletePolicyUpdating }
    ]}>
      <Table
        enableApiFilter
        settingsId='adaptive-policy-list-table'
        columns={useColumns()}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        onFilterChange={handleFilterChange}
        rowSelection={hasAccess() && { type: 'radio' }}
        actions={filterByAccess([{
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
