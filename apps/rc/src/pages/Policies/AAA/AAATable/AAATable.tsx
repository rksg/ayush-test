import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { usePolicyListQuery, useDeleteAAAPolicyMutation }                 from '@acx-ui/rc/services'
import {
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  Policy,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'

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
  const { tenantId } = useParams()
  const tenantBasePath: Path = useTenantLink('')

  const tableQuery = useTableQuery({
    useQuery: usePolicyListQuery,
    defaultPayload
  })
  const [ deleteFn ] = useDeleteAAAPolicyMutation()
  const rowActions: TableProps<Policy>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: name
          },
          onOk: () => {
            deleteFn({ params: { tenantId, policyId: id } }).then(clearSelection)
          }
        })
      }
    },
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
        extra={filterByAccess([
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
          rowActions={filterByAccess(rowActions)}
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
