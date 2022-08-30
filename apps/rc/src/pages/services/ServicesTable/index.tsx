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

import { serviceAdminStateLabelMapping, serviceStatusLabelMapping, serviceTechnologyabelMapping, serviceTypeLabelMapping } from '../contentsMap'

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<Service>['columns'] = [
    {
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
      title: $t({ defaultMessage: 'Service Type' }),
      dataIndex: 'type',
      sorter: true,
      render: function (data) {
        return $t(serviceTypeLabelMapping[data as ServiceType])
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: true,
      render: function (data) {
        return $t(serviceStatusLabelMapping[data as ServiceStatus])
      }
    },
    {
      title: $t({ defaultMessage: 'Admin State' }),
      dataIndex: 'adminState',
      sorter: true,
      render: function (data) {
        return $t(serviceAdminStateLabelMapping[data as ServiceAdminState])
      }
    },
    {
      title: $t({ defaultMessage: 'Technology' }),
      dataIndex: 'technology',
      sorter: true,
      render: function (data) {
        return $t(serviceTechnologyabelMapping[data as ServiceTechnology])
      }
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      dataIndex: 'scope',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      dataIndex: 'health',
      sorter: true
    },
    {
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

    const actions: TableProps<Service>['actions'] = [{
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
          actions={actions}
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
          <TenantLink to='/services/dhcp/create/wifi' key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add DHCP Service' })}</Button>
          </TenantLink>
        ]}
      />
      <ServicesTable />
    </>
  )
}
