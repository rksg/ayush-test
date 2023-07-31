import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import { Features, useIsTierAllowed }                            from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                                     from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListQuery, useAdaptivePolicySetLisByQueryQuery,
  useDeleteAdaptivePolicySetMutation, useGetDpskListQuery,
  useLazyGetPrioritizedPoliciesQuery, useMacRegListsQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicySet, FILTER,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType, SEARCH, useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                    from '@acx-ui/user'

export default function AdaptivePolicySetTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const [prioritizedPoliciesMap, setPrioritizedPoliciesMap] = useState(new Map())
  const [assignedMacPools, setAssignedMacPools] = useState(new Map())
  const [assignedDpsks, setAssignedDpsks] = useState(new Map())

  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicySetLisByQueryQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
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
  }, { skip: !isCloudpathEnabled })

  const { data: dpskList, isLoading: getDpsksLoading } = useGetDpskListQuery({
    payload: { pageSize: 10000 }
  }, { skip: !isCloudpathEnabled })

  useEffect(() => {
    if(getMacListLoading)
      return
    if(macRegList) {
      const poolsMap = new Map()
      macRegList.data.forEach(item => {
        const setId = item.policySetId
        if(poolsMap.has(setId)) {
          poolsMap.set(setId, [ ...poolsMap.get(setId), item.name])
        }else {
          poolsMap.set(setId, [item.name])
        }
      })
      setAssignedMacPools(poolsMap)
    }
  }, [macRegList])

  useEffect(() => {
    if(getDpsksLoading || !dpskList) return
    const dpsksMap = new Map()
    dpskList.data.forEach(item => {
      const { policySetId } = item
      if(dpsksMap.has(policySetId)) {
        dpsksMap.set(policySetId, [ ...dpsksMap.get(policySetId), item.name])
      }else {
        dpsksMap.set(policySetId, [item.name])
      }
    })
    setAssignedDpsks(dpsksMap)
  }, [dpskList])

  useEffect(() => {
    if (tableQuery.isLoading)
      return
    tableQuery.data?.data.forEach(policy => {
      const { id } = policy
      getPrioritizedPolicies({ params: { policySetId: id } })
        .unwrap()
        .then(result => {
          if (result.data) {
            // eslint-disable-next-line max-len
            const polices: string [] = [...result.data].sort((p1, p2) => p1.priority - p2.priority).map(item => item.policyId)
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
          // eslint-disable-next-line max-len
          const policies: string [] = prioritizedPoliciesMap.has(row.id) ? prioritizedPoliciesMap.get(row.id).map((item:string) => {
            return policyList?.data.find(p => p.id === item)?.name ?? ''
          }) : []

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
          let items = [] as string []
          const pools: string [] = assignedMacPools.get(row.id) ?? []
          const dpsks: string [] = assignedDpsks.get(row.id) ?? []
          if(dpsks.length > 0) {
            // eslint-disable-next-line max-len
            items = [...items, $t({ defaultMessage: 'DPSK Pools ({size})' }, { size: dpsks.length }), ...dpsks]
          }
          if(pools.length > 0){
            // eslint-disable-next-line max-len
            items = [...items, $t({ defaultMessage: 'Mac Registration Lists ({size})' }, { size: pools.length }), ...pools]
          }
          const totalCount = pools.length + dpsks.length
          return totalCount === 0 ? '0' :
            <SimpleListTooltip items={items} displayText={totalCount}/>
        }
      }
    ]
    return columns
  }

  const rowActions: TableProps<AdaptivePolicySet>['rowActions'] = [{
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
    onClick: ([{ name, id }], clearSelection) => {
      if (assignedMacPools.has(id) || assignedDpsks.has(id)) {
        showActionModal({
          type: 'error',
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'This set is in use by one or more Mac Registrations Lists and one or more DPSK.' })
        })
      } else {
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

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = { ...tableQuery.payload, filters: { name: customSearch?.searchString ?? '' } }
    tableQuery.setPayload(payload)
  }

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeletePolicyUpdating }
    ]}>
      <Table
        enableApiFilter
        settingsId='adaptive-policy-set-list-table'
        columns={useColumns()}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        onFilterChange={handleFilterChange}
        rowSelection={hasAccess() && { type: 'radio' }}
        actions={filterByAccess(actions)}
      />
    </Loader>
  )
}
