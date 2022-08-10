import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useServiceListQuery, Service, useDeleteServiceMutation }         from '@acx-ui/rc/services'
import {
  ServiceType,
  useTableQuery,
  ServiceTechnology,
  ServiceStatus,
  ServiceAdminState
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { serviceAdminStateLabelMapping, serviceStatusLabelMapping, serviceTechnologyabelMapping, serviceTypeLabelMapping } from '../contentsMap'

const columns: TableProps<Service>['columns'] = [
  {
    title: 'Service Name',
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
    title: 'Service Type',
    dataIndex: 'type',
    sorter: true,
    render: function (data) {
      return serviceTypeLabelMapping[data as ServiceType]
    }
  },
  {
    title: 'Status',
    dataIndex: 'status',
    sorter: true,
    render: function (data) {
      return serviceStatusLabelMapping[data as ServiceStatus]
    }
  },
  {
    title: 'Admin State',
    dataIndex: 'adminState',
    sorter: true,
    render: function (data) {
      return serviceAdminStateLabelMapping[data as ServiceAdminState]
    }
  },
  {
    title: 'Technology',
    dataIndex: 'technology',
    sorter: true,
    render: function (data) {
      return serviceTechnologyabelMapping[data as ServiceTechnology]
    }
  },
  {
    title: 'Scope',
    dataIndex: 'scope',
    sorter: true,
    align: 'center'
  },
  {
    title: 'Health',
    dataIndex: 'health',
    sorter: true
  },
  {
    title: 'Tags',
    dataIndex: 'tags',
    sorter: true
  }
]

const defaultPayload = {
  searchString: '',
  fields: [
    'check-all',
    'id',
    'name',
    'type',
    'category',
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

    const actions: TableProps<Service>['actions'] = [{
      label: 'Delete',
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: 'Service',
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
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          actions={actions}
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title='Services'
        extra={[
          <TenantLink to='/services/create' key='add'>
            <Button type='primary'>Add Service</Button>
          </TenantLink>
        ]}
      />
      <ServicesTable />
    </>
  )
}
