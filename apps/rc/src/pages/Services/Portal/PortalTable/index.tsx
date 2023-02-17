import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useDeletePortalMutation, useGetPortalProfileListQuery }          from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceRoutePath,
  getServiceListRoutePath,
  Portal
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

export default function PortalTable () {
  const intl = useIntl()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')
  const [ deletePortal ] = useDeletePortalMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetPortalProfileListQuery,
    defaultPayload: {}
  })

  const rowActions: TableProps<Portal>['rowActions'] = [
    {
      label: intl.$t({ defaultMessage: 'Delete' }),
      onClick: ([{ id, serviceName }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: intl.$t({ defaultMessage: 'Portal Service' }),
            entityValue: serviceName
          },
          onOk: () => {
            deletePortal({ params: { serviceId: id } }).then(clearSelection)
          }
        })
      }
    },
    {
      label: intl.$t({ defaultMessage: 'Edit' }),
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
            type: ServiceType.PORTAL,
            oper: ServiceOperation.EDIT,
            serviceId: id!
          })
        })
      }
    }
  ]

  const columns: TableProps<Portal>['columns'] = [
    {
      key: 'serviceName',
      title: intl.$t({ defaultMessage: 'Name' }),
      dataIndex: 'serviceName',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.PORTAL,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      // TODO
      key: 'language',
      title: intl.$t({ defaultMessage: 'Language' }),
      dataIndex: 'language',
      sorter: true
    },
    {
      // TODO
      key: 'demo',
      title: intl.$t({ defaultMessage: 'Preview' }),
      dataIndex: 'demo',
      align: 'center'
    },
    {
      // TODO
      key: 'networkCount',
      title: intl.$t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      align: 'center'
    }
  ]

  return (
    <>
      <PageHeader
        title={
          // eslint-disable-next-line max-len
          intl.$t({ defaultMessage: 'Guest Portal ({count})' }, { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={[
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })} key='add'>
            <Button type='primary'>{intl.$t({ defaultMessage: 'Add Guest Portal' })}</Button>
          </TenantLink>
        ]}
      />
      <Loader states={[tableQuery]}>
        <Table<Portal>
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    </>
  )
}
