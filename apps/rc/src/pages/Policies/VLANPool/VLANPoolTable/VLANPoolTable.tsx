import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useDelVLANPoolPolicyMutation, useGetVLANPoolPolicyListQuery }    from '@acx-ui/rc/services'
import {
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  VLANPoolPolicyType
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'

const defaultPayload = {
}

export default function VLANPoolTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDelVLANPoolPolicyMutation()
  const VLAN_LIMIT_NUMBER = 64
  const tableQuery = useTableQuery({
    useQuery: useGetVLANPoolPolicyListQuery,
    defaultPayload
  })

  const rowActions: TableProps<VLANPoolPolicyType>['rowActions'] = [
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
            deleteFn({ params: { ...params, policyId: id } }).then(clearSelection)
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
            type: PolicyType.VLAN_POOL,
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
            defaultMessage: 'VLAN Pools ({count})'
          },
          {
            count: tableQuery.data?.totalCount
          })
        }
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.CREATE })} key='add'>
            <Button type='primary'
              disabled={tableQuery.data?.totalCount
                ? tableQuery.data?.totalCount >= VLAN_LIMIT_NUMBER
                : false} >{$t({ defaultMessage: 'Add VLAN Pool' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<VLANPoolPolicyType>
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

  const columns: TableProps<VLANPoolPolicyType>['columns'] = [
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
              type: PolicyType.VLAN_POOL,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'vlanMembers',
      title: $t({ defaultMessage: 'VLANs' }),
      dataIndex: 'vlanMembers',
      sorter: true,
      render: (data) =>{
        return data?.toString()
      }
    }
  ]

  return columns
}
