import { useIntl } from 'react-intl'

import { Loader, showToast, Table, TableProps }          from '@acx-ui/components'
import { Features, useIsTierAllowed }                    from '@acx-ui/feature-toggle'
import { SimpleListTooltip, useDpskNewConfigFlowParams } from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useAdaptivePolicySetLisByQueryQuery,
  useDeleteAdaptivePolicySetMutation, useGetDpskListQuery,
  useMacRegListsQuery
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
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

  const tableQuery = useTableQuery({
    useQuery: useAdaptivePolicySetLisByQueryQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
    defaultPayload: {}
  })

  const [
    deletePolicy,
    { isLoading: isDeletePolicyUpdating }
  ] = useDeleteAdaptivePolicySetMutation()

  const { macRegList, getMacListLoading } = useMacRegListsQuery(
    { payload: { pageSize: 10000 } }, {
      selectFromResult: ({ data, isLoading }) => {
        const macRegList = new Map(data?.data.map((mac) =>
          [mac.id, mac.name]))
        return {
          macRegList,
          getMacListLoading: isLoading
        }
      }, skip: !isCloudpathEnabled
    })

  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()
  const { dpskList, getDpsksLoading } = useGetDpskListQuery(
    {
      params: dpskNewConfigFlowParams,
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

          return <SimpleListTooltip items={[...macAssignments, ...dpskAssignments]}
            displayText={row.assignmentCount}
            totalCountOfItems={row.assignmentCount}/>
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
    onClick: ([selectedRow], clearSelection) => {
      const name = selectedRow.name
      doProfileDelete(
        [selectedRow],
        $t({ defaultMessage: 'policy set' }),
        name,
        [
          // eslint-disable-next-line max-len
          { fieldName: 'assignmentCount', fieldText: $t({ defaultMessage: 'Mac Registration Lists or DPSK' }) }
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
      { isLoading: getMacListLoading || getDpsksLoading, isFetching: isDeletePolicyUpdating }
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
