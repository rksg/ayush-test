import { useIntl } from 'react-intl'

import { Loader, showToast, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                    from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useAdaptivePolicyListQuery,
  useDeleteRadiusAttributeGroupMutation,
  useRadiusAttributeGroupListByQueryQuery
} from '@acx-ui/rc/services'
import {
  FILTER,
  getPolicyDetailsLink, getPolicyRoutePath,
  PolicyOperation,
  PolicyType, RadiusAttributeGroup, SEARCH,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                    from '@acx-ui/user'

export default function RadiusAttributeGroupTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const RadiusAttributeGroupTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useRadiusAttributeGroupListByQueryQuery,
      apiParams: { sort: 'name,ASC', excludeContent: 'false' },
      defaultPayload: {}
    })

    const { policyListMap, getPolicyIsLoading } = useAdaptivePolicyListQuery(
      { payload: { page: 1, pageSize: '2147483647', sort: 'name,ASC' } },
      {
        selectFromResult ({ data, isLoading }) {
          return {
            policyListMap: new Map(data?.data.map((policy) => [policy.id, policy.name])),
            getPolicyIsLoading: isLoading
          }
        }
      }
    )

    const [
      deleteGroup,
      { isLoading: isDeleteMacGroupUpdating }
    ] = useDeleteRadiusAttributeGroupMutation()

    const rowActions: TableProps<RadiusAttributeGroup>['rowActions'] = [{
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
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
          $t({ defaultMessage: 'group' }),
          name,
          [
            // eslint-disable-next-line max-len
            { fieldName: 'externalAssignmentsCount', fieldText: $t({ defaultMessage: 'Policies' }) }
          ],
          async () => {
            deleteGroup({ params: { policyId: selectedRow.id } })
              .unwrap()
              .then(() => {
                showToast({
                  type: 'success',
                  content: $t({ defaultMessage: 'Group {name} was deleted' }, { name })
                })
                clearSelection()
              }).catch((error) => {
                console.log(error) // eslint-disable-line no-console
              })
          }
        )
      }
    }]

    function useColumns () {
      const { $t } = useIntl()
      const columns: TableProps<RadiusAttributeGroup>['columns'] = [
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
                to={getPolicyDetailsLink({
                  type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
                  oper: PolicyOperation.DETAIL,
                  policyId: row.id!
                })}
              >{row.name}</TenantLink>
            )
          }
        },
        {
          title: $t({ defaultMessage: 'Attributes' }),
          key: 'attributeCount',
          dataIndex: 'attributeCount',
          align: 'center',
          sorter: true
        },
        {
          title: $t({ defaultMessage: 'Policies' }),
          key: 'externalAssignmentsCount',
          dataIndex: 'externalAssignmentsCount',
          align: 'center',
          sorter: true,
          render: function (_, row) {
            if(row.externalAssignmentsCount === 0) return 0
            // eslint-disable-next-line max-len
            const policyNames = row.externalServiceAssignments.map(assignment => assignment.externalAssignmentIdentifier).flat()
              .filter(id => policyListMap.has(id)).map(id => policyListMap.get(id) ?? '')
            return <SimpleListTooltip items={policyNames} displayText={policyNames.length}/>
          }
        }
      ]
      return columns
    }

    const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
      const payload = { ...tableQuery.payload, filters: { name: customSearch?.searchString ?? '' } }
      tableQuery.setPayload(payload)
    }

    return (
      <Loader states={[
        tableQuery,
        { isLoading: getPolicyIsLoading, isFetching: isDeleteMacGroupUpdating }
      ]}>
        <Table
          enableApiFilter
          settingsId='radius-attribute-group-list-table'
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          onFilterChange={handleFilterChange}
          rowSelection={hasAccess() && { type: 'radio' }}
          actions={filterByAccess([{
            label: $t({ defaultMessage: 'Add Group' }),
            onClick: () => {
              navigate({
                ...tenantBasePath,
                pathname: `${tenantBasePath.pathname}/` + getPolicyRoutePath({
                  type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
                  oper: PolicyOperation.CREATE
                })
              })
            }
          }])}
        />
      </Loader>
    )
  }

  return (
    <RadiusAttributeGroupTable />
  )
}
