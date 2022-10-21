import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useDeleteWifiCallingServiceMutation, useServiceListQuery }       from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  Service,
  ServiceTechnology
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { serviceTypeLabelMapping, serviceTechnologyLabelMapping } from '../contentsMap'
import { getServiceDetailsLink, ServiceOperation }                from '../serviceRouteUtils'


function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<Service>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Service Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: row.type as ServiceType,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Service Type' }),
      dataIndex: 'type',
      sorter: true,
      render: function (data) {
        return $t(serviceTypeLabelMapping[data as ServiceType])
      }
    },
    // # The fields have not been defined
    // {
    //   key: 'status',
    //   title: $t({ defaultMessage: 'Status' }),
    //   dataIndex: 'status',
    //   sorter: true,
    //   render: function (data) {
    //     return $t(serviceStatusLabelMapping[data as ServiceStatus])
    //   }
    // },
    // {
    //   key: 'adminState',
    //   title: $t({ defaultMessage: 'Admin State' }),
    //   dataIndex: 'adminState',
    //   sorter: true,
    //   render: function (data) {
    //     return $t(serviceAdminStateLabelMapping[data as ServiceAdminState])
    //   }
    // },
    {
      key: 'technology',
      title: $t({ defaultMessage: 'Technology' }),
      dataIndex: 'technology',
      sorter: true,
      render: function (data) {
        return $t(serviceTechnologyLabelMapping[data as ServiceTechnology])
      }
    },
    {
      key: 'scope',
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'scope',
      sorter: true,
      align: 'center'
    },
    // # The field has not been defined
    // {
    //   key: 'health',
    //   title: $t({ defaultMessage: 'Health' }),
    //   dataIndex: 'health',
    //   sorter: true
    // },
    {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      sorter: true
    }
  ]

  return columns
}

const defaultPayload = {
  searchString: '',
  fields: [
    'check-all',
    'id',
    'name',
    'type',
    'status',
    'adminState',
    'technology',
    'scope',
    'cog',
    'health',
    'tags'
  ]
}

export function ServicesTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const ServicesTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useServiceListQuery,
      defaultPayload
    })
    const deleteServiceFnMapping = {
      [ServiceType.DHCP]: [], // TODO: API not ready
      [ServiceType.DPSK]: [], // TODO: API not ready
      [ServiceType.MDNS_PROXY]: [], // TODO: API not ready
      [ServiceType.PORTAL]: [], // TODO: API not ready
      [ServiceType.WIFI_CALLING]: useDeleteWifiCallingServiceMutation()
    }

    const rowActions: TableProps<Service>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Delete' }),
        onClick: ([{ id, name, type }], clearSelection) => {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Service' }),
              entityValue: name
            },
            onOk: () => {
              const [ deleteFn ] = deleteServiceFnMapping[type]
              deleteFn({ params: { tenantId, serviceId: id } }).then(clearSelection)
            }
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Edit' }),
        onClick: ([{ type, id }]) => {
          navigate({
            ...tenantBasePath,
            pathname: `${tenantBasePath.pathname}/` + getServiceDetailsLink({
              type: type as ServiceType,
              oper: ServiceOperation.EDIT,
              serviceId: id
            })
          })
        }
      }
    ]

    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Services' })}
        extra={[
          <TenantLink to='/services/select' key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add Service' })}</Button>
          </TenantLink>
        ]}
      />
      <ServicesTable />
    </>
  )
}