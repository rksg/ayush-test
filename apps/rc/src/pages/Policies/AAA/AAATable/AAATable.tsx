import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { hasAccesses }                                   from '@acx-ui/rbac'
import { usePolicyListQuery }                            from '@acx-ui/rc/services'
import {
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  Policy,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const defaultPayload = {
  searchString: '',
  filters: {
    type: [PolicyType.AAA]
  },
  fields: [
    'id',
    'name',
    'type',
    'scope',
    'cog'
  ]
}

export default function AAATable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const tableQuery = useTableQuery({
    useQuery: usePolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<Policy>['rowActions'] = [
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
            type: PolicyType.AAA,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          $t({
            defaultMessage: 'AAA Server'
          })
        }
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) }
        ]}
        extra={hasAccesses([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add AAA Server' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<Policy>
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={hasAccesses(rowActions)}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<Policy>['columns'] = [
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
              type: PolicyType.AAA,
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
