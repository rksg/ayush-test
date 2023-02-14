import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                                     from '@acx-ui/components'
import { useL2AclPolicyListQuery }                                                       from '@acx-ui/rc/services'
import { getPolicyDetailsLink, L2AclPolicy, PolicyOperation, PolicyType, useTableQuery } from '@acx-ui/rc/utils'
import { Path, TenantLink, useTenantLink, useNavigate }                                  from '@acx-ui/react-router-dom'


const defaultPayload = {
  searchString: '',
  filters: {
    type: [PolicyType.LAYER_2_POLICY]
  },
  fields: [
    'id',
    'name',
    'type',
    'scope',
    'cog'
  ]
}

const Layer2 = () => {
  const { $t } = useIntl()
  const tenantBasePath: Path = useTenantLink('')
  const navigate = useNavigate()

  const tableQuery = useTableQuery({
    useQuery: useL2AclPolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<L2AclPolicy>['rowActions'] = [
    // TODO Need to implement delete function
    // {
    //   label: $t({ defaultMessage: 'Delete' }),
    //   onClick: ([{ name }], clearSelection) => {
    //     showActionModal({
    //       type: 'confirm',
    //       customContent: {
    //         action: 'DELETE',
    //         entityName: $t({ defaultMessage: 'Policy' }),
    //         entityValue: name
    //       },
    //       onOk: () => {
    //         clearSelection()
    //       }
    //     })
    //   }
    // },
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.LAYER_2_POLICY,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    }
  ]

  return <Loader states={[tableQuery]}>
    <Table<L2AclPolicy>
      columns={useColumns()}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='id'
      rowActions={rowActions}
      rowSelection={{ type: 'radio' }}
    />
  </Loader>
}

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<L2AclPolicy>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.ACCESS_CONTROL,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'scope',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'scope',
      sorter: true,
      align: 'center'
    }
  ]

  return columns
}


export default Layer2
