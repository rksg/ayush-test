import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                                     from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListQuery,
  useAdaptivePolicySetListQuery,
  useDeleteAdaptivePolicySetMutation,
  useLazyGetPrioritizedPoliciesQuery, useMacRegListsQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicySet,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType, useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                               from '@acx-ui/user'

export default function AdaptivePolicySetTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const [prioritizedPoliciesMap, setPrioritizedPoliciesMap] = useState(new Map())
  const [assignedMacPools, setAssignedMacPools] = useState(new Map())

  const isMacRegistrationEnabled = useIsSplitOn(Features.MAC_REGISTRATION)

  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicySetListQuery,
    defaultPayload: {}
  })

  // eslint-disable-next-line max-len
  const { data: policyList } = useAdaptivePolicyListQuery({ payload: { page: '1', pageSize: '2147483647' } })

  const [
    deletePolicy,
    { isLoading: isDeletePolicyUpdating }
  ] = useDeleteAdaptivePolicySetMutation()

  const [getPrioritizedPolicies] = useLazyGetPrioritizedPoliciesQuery()

  const { data: macRegList, isLoading: getMacListLoading } = useMacRegListsQuery({
    payload: { pageSize: 10000 }
  }, { skip: !isMacRegistrationEnabled })

  useEffect(() => {
    if(getMacListLoading)
      return
    if(macRegList) {
      const poolsMap = new Map()
      macRegList.data.forEach(item => {
        const setId = item.policySetId
        if(poolsMap.has(setId)) {
          poolsMap.set(setId, poolsMap.get(setId).concat(item.name))
        }else {
          poolsMap.set(setId, Array.of(item.name))
        }
      })
      setAssignedMacPools(poolsMap)
    }
  }, [macRegList])

  useEffect(() => {
    if (tableQuery.isLoading)
      return
    tableQuery.data?.data.forEach(policy => {
      const { id } = policy
      getPrioritizedPolicies({ params: { policySetId: id } })
        .unwrap()
        .then(result => {
          if (result.data) {
            const polices: string [] = result.data.map(item => item.policyId)
            setPrioritizedPoliciesMap(map => new Map(map.set(id, polices)))
          }
        })
    })
  }, [tableQuery.data])

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
        render: function (data, row) {
          return (
            <TenantLink
              to={
                getPolicyDetailsLink({
                  type: PolicyType.ADAPTIVE_POLICY_SET,
                  oper: PolicyOperation.DETAIL,
                  policyId: row.id!
                })}
            >{data}</TenantLink>
          )
        }
      },
      {
        title: $t({ defaultMessage: 'Contained Policies' }),
        key: 'policyCount',
        dataIndex: 'policyCount',
        align: 'center',
        render: (_, row) => {
          const pList: string [] = prioritizedPoliciesMap.get(row.id) ?? []
          const policies: string [] = pList.map((item:string) => {
            return policyList?.data.find(p => p.id === item)?.name ?? ''
          })

          return policies.length === 0 ? '0' :
            <SimpleListTooltip items={policies} displayText={policies.length}/>
        }
      },
      {
        title: $t({ defaultMessage: 'Scope' }),
        key: 'scope',
        dataIndex: 'scope',
        align: 'center',
        render: (_, row) => {
          const pools: string [] = assignedMacPools.get(row.id) ?? []
          return pools.length === 0 ? '0' :
            <SimpleListTooltip items={pools} displayText={pools.length}/>
        }
      }
    ]
    return columns
  }

  const rowActions: TableProps<AdaptivePolicySet>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
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
    label: $t({ defaultMessage: 'Delete' }),
    disabled: (([selectedItem]) =>
      (selectedItem && selectedItem.id)
        ? assignedMacPools.has(selectedItem.id) : false
    ),
    onClick: ([{ name, id }], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Policy Set' }),
          entityValue: name
        },
        onOk: async () => {
          deletePolicy({ params: { policySetId: id } })
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
      })
    }
  }]

  const actions = [{
    label: $t({ defaultMessage: 'Add Set' }),
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

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeletePolicyUpdating }
    ]}>
      <Table
        settingsId='adaptive-policy-set-list-table'
        columns={useColumns()}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={{ type: 'radio' }}
        actions={filterByAccess(actions)}
      />
    </Loader>
  )
}
