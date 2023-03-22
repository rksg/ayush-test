import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import {
  useDeleteRadiusAttributeGroupMutation,
  useRadiusAttributeGroupListQuery
} from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink, getPolicyRoutePath,
  PolicyOperation,
  PolicyType, RadiusAttributeGroup,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'


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
      render: function () {
        return '0'
      }
    }
  ]
  return columns
}

export default function RadiusAttributeGroupTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const RadiusAttributeGroupTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useRadiusAttributeGroupListQuery,
      defaultPayload: {}
    })

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
          rowActions={rowActions}
          rowSelection={{ type: 'radio' }}
          actions={[{
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
          }]}
        />
      </Loader>
    )
  }

  return (
    <RadiusAttributeGroupTable />
  )
}
