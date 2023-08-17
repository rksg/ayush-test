import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                                     from '@acx-ui/rc/components'
import {
  useAdaptivePolicyListQuery,
  useDeleteRadiusAttributeGroupMutation,
  useLazyGetAssignmentsQuery,
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
    const [policyAssignmentMap, setPolicyAssignmentMap] = useState(new Map())
    const [externalServiceMap, setExternalServiceMap] = useState(new Map())

    const tableQuery = useTableQuery({
      useQuery: useRadiusAttributeGroupListByQueryQuery,
      apiParams: { sort: 'name,ASC', excludeContent: 'false' },
      defaultPayload: {}
    })

    const { policyListMap } = useAdaptivePolicyListQuery(
      { payload: { page: 1, pageSize: '2147483647', sort: 'name,ASC' } },
      {
        selectFromResult ({ data }) {
          return {
            policyListMap: new Map(data?.data.map((policy) => [policy.id, policy.name]))
          }
        }
      }
    )

    const [getExternalAssignments] = useLazyGetAssignmentsQuery()

    useEffect( () =>{
      if(tableQuery.isLoading)
        return

      // get the assignments
      tableQuery.data?.data.forEach(group => {
        getExternalAssignments({
          params: { policyId: group.id },
          payload: {
            pageSize: '2000', sortField: 'serviceName', sortOrder: 'ASC'
          }
        }).then(result => {
          if (result.data?.data) {
            const policyIds = [] as string []
            const externalServiceIds = [] as string []
            result.data.data.forEach(assignment => {
              if(assignment.serviceName === 'policy-management') {
                policyIds.push(assignment.externalAssignmentIdentifier)
              } else {
                externalServiceIds.push(assignment.externalAssignmentIdentifier)
              }
            })
            setPolicyAssignmentMap(map => new Map(map.set(group.id, policyIds)))
            setExternalServiceMap(map => new Map(map.set(group.id, externalServiceIds)))
          }
        })
      })
    }, [tableQuery.data])

    const [
      deleteGroup,
      { isLoading: isDeleteMacGroupUpdating }
    ] = useDeleteRadiusAttributeGroupMutation()

    const checkHasExternalServiceAssignment = (id?: string) => {
      if (!id) return false
      const service = externalServiceMap.get(id) ?? [] as string []
      return service.length !== 0
    }

    const checkHasPolicyAssignment = (id?: string) => {
      if (!id) return false
      const policy = policyAssignmentMap.get(id) ?? [] as string []
      return policy.length !== 0
    }

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
      onClick: ([{ name, id }], clearSelection) => {
        if (checkHasPolicyAssignment(id)) {
          showActionModal({
            type: 'error',
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: 'This group is in use by one or more Adaptive Policies.' })
          })
        } else if (checkHasExternalServiceAssignment(id)) {
          showActionModal({
            type: 'error',
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: 'This group is still in use by another service.' })
          })
        } else
        {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'group' }),
              entityValue: name
            },
            onOk: async () => {
              deleteGroup({ params: { policyId: id } })
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
          })
        }
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
          key: 'attributes',
          dataIndex: 'attributes',
          align: 'center',
          render: function (_, row) {
            return row.attributeAssignments.length
          }
        },
        {
          title: $t({ defaultMessage: 'Policies' }),
          key: 'policies',
          dataIndex: 'policies',
          align: 'center',
          render: function (_, row) {
            const policyIds = policyAssignmentMap.get(row.id) ?? [] as string []
            // eslint-disable-next-line max-len
            const policyNames = policyIds.map((id: string) => policyListMap.get(id) ?? '').filter((name: string) => name.length > 0)
            // eslint-disable-next-line max-len
            return policyNames.length === 0 ? '0' : <SimpleListTooltip items={policyNames} displayText={policyNames.length}/>
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
        { isLoading: false, isFetching: isDeleteMacGroupUpdating }
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
