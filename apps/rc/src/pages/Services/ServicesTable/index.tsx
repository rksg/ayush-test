import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useServiceListQuery, useDeleteServiceMutation }                  from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  Service,
  ServiceTechnology,
  ServiceStatus,
  ServiceAdminState
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { serviceTypeLabelMapping, serviceStatusLabelMapping, serviceAdminStateLabelMapping, serviceTechnologyLabelMapping } from '../contentsMap'


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
          <TenantLink to={`/services/${row.id}/service-details/overview`}>{data}</TenantLink>
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
    {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: true,
      render: function (data) {
        return $t(serviceStatusLabelMapping[data as ServiceStatus])
      }
    },
    {
      key: 'adminState',
      title: $t({ defaultMessage: 'Admin State' }),
      dataIndex: 'adminState',
      sorter: true,
      render: function (data) {
        return $t(serviceAdminStateLabelMapping[data as ServiceAdminState])
      }
    },
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
    {
      key: 'health',
      title: $t({ defaultMessage: 'Health' }),
      dataIndex: 'health',
      sorter: true
    },
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

  const ServicesTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useServiceListQuery,
      defaultPayload
    })
    const { tenantId } = useParams()
    const [
      deleteService,
      { isLoading: isDeleteServiceUpdating }
    ] = useDeleteServiceMutation()

    const rowActions: TableProps<Service>['rowActions'] = [{
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Service' }),
            entityValue: name
          },
          onOk: () => deleteService({ params: { tenantId, serviceId: id } })
            .then(clearSelection)
        })
      }
    }]

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteServiceUpdating }
      ]}>
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
