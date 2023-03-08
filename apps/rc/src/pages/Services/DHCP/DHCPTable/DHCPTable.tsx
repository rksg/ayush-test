import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useDeleteDHCPServiceMutation, useServiceListQuery }              from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  getServiceDetailsLink,
  ServiceOperation,
  Service,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'

const defaultPayload = {
  searchString: '',
  filters: {
    type: [ServiceType.DHCP]
  },
  fields: [
    'id',
    'name',
    'type',
    'scope',
    'cog'
  ]
}

export default function DHCPTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteDHCPServiceMutation()

  const tableQuery = useTableQuery({
    useQuery: useServiceListQuery,
    defaultPayload
  })

  const rowActions: TableProps<Service>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Service' }),
            entityValue: name
          },
          onOk: () => {
            deleteFn({ params: { tenantId, serviceId: id } }).then(clearSelection)
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.DHCP,
            oper: ServiceOperation.EDIT,
            serviceId: id!
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
            defaultMessage: 'DHCP ({count})'
          },
          {
            count: tableQuery.data?.totalCount
          })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add DHCP Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<Service>
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

  const columns: TableProps<Service>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.DHCP,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
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
