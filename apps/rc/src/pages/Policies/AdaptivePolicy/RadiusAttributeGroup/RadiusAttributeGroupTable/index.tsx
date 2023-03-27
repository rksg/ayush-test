import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                                     from '@acx-ui/rc/components'
import {
  useDeleteRadiusAttributeGroupMutation,
  useLazyAdaptivePolicyListByQueryQuery,
  useRadiusAttributeGroupListQuery
} from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink, getPolicyRoutePath,
  PolicyOperation,
  PolicyType, RadiusAttributeGroup,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                               from '@acx-ui/user'

export default function RadiusAttributeGroupTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const RadiusAttributeGroupTable = () => {
    const [policyMap, setPolicyMap] = useState(new Map())

    const tableQuery = useTableQuery({
      useQuery: useRadiusAttributeGroupListQuery,
      defaultPayload: {}
    })

    const [getPolicySetList] = useLazyAdaptivePolicyListByQueryQuery()

    useEffect( () =>{
      if(tableQuery.isLoading)
        return

      tableQuery.data?.data.forEach(item => {
        getPolicySetList({
          params: { excludeContent: 'false' },
          payload: {
            fields: [ 'name' ],
            page: 0, pageSize: 2000,
            filters: { onMatchResponse: item.id }
          }
        }).then(result => {
          if (result.data) {
            const policies : string []= result.data.data.map(p => p.name)
            setPolicyMap(map => new Map(map.set(item.id, policies)))
          }
        })
      })
    }, [tableQuery.data])

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
      // eslint-disable-next-line max-len
      disabled: (([selectedItem]) => selectedItem ? policyMap.get(selectedItem.id).length !== 0 : false),
      onClick: ([{ name, id }], clearSelection) => {
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
          render: function (data, row) {
            return (
              <TenantLink
                to={getPolicyDetailsLink({
                  type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
                  oper: PolicyOperation.DETAIL,
                  policyId: row.id!
                })}
              >{data}</TenantLink>
            )
          }
        },
        {
          title: $t({ defaultMessage: 'Attributes' }),
          key: 'attributes',
          dataIndex: 'attributes',
          align: 'center',
          render: function (data, row) {
            return row.attributeAssignments.length
          }
        },
        {
          title: $t({ defaultMessage: 'Policies' }),
          key: 'policies',
          dataIndex: 'policies',
          align: 'center',
          render: function (data, row) {
            const policies = policyMap.get(row.id) ?? [] as string []
            return policies.length === 0 ? '0' :
              <SimpleListTooltip items={policies} displayText={policies.length}/>
          }
        }
      ]
      return columns
    }

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteMacGroupUpdating }
      ]}>
        <Table
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
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
