import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps }  from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { DownloadOutlined }           from '@acx-ui/icons'
import { useEdgeExportCsv }           from '@acx-ui/rc/components'
import { useGetEdgeServiceListQuery } from '@acx-ui/rc/services'
import {
  EdgeService,
  EdgeServiceTypeEnum,
  RequestPayload,
  ServiceOperation,
  ServiceType,
  TableQuery,
  getServiceDetailsLink,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

export const EdgeServices = () => {

  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeServiceListQuery,
    defaultPayload: {
      filters: { edgeId: [serialNumber] }
    },
    sorter: {
      sortField: 'serviceName',
      sortOrder: 'ASC'
    }
  })
  const { exportCsv, disabled } = useEdgeExportCsv<EdgeService>(
    tableQuery as unknown as TableQuery<EdgeService, RequestPayload<unknown>, unknown>
  )

  const columns: TableProps<EdgeService>['columns'] = [
    {
      title: $t({ defaultMessage: 'Service Name' }),
      key: 'serviceName',
      dataIndex: 'serviceName',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (data, row) => {
        return (
          <TenantLink to={getServiceDetailUrl(row.serviceType, row.serviceId)}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Service Type' }),
      key: 'serviceType',
      dataIndex: 'serviceType',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'health',
      dataIndex: 'health',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Update Available' }),
      key: 'targetVersion',
      dataIndex: 'targetVersion',
      sorter: true,
      render: (data, row) => {
        if(row.targetVersion && row.currentVersion !== row.targetVersion) {
          return $t({ defaultMessage: 'Yes' })
        }
        return $t({ defaultMessage: 'No' })
      }
    },
    {
      title: $t({ defaultMessage: 'Service Version' }),
      key: 'currentVersion',
      dataIndex: 'currentVersion',
      sorter: true
    }
  ]

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Table
        settingsId='edge-services-table'
        rowKey='edgeId'
        // rowActions={filterByAccess(rowActions)}
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter
        iconButton={
          (exportDevice && false) ?
            { icon: <DownloadOutlined />, disabled, onClick: exportCsv } :
            undefined
        }
      />
    </Loader>
  )
}

const getServiceDetailUrl = (serviceType: EdgeServiceTypeEnum, servieId: string) => {
  switch(serviceType) {
    case EdgeServiceTypeEnum.DHCP:
      return getServiceDetailsLink({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.DETAIL,
        serviceId: servieId
      })
    case EdgeServiceTypeEnum.FIREWALL:
      return getServiceDetailsLink({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.DETAIL,
        serviceId: servieId
      })
    case EdgeServiceTypeEnum.NETWORK_SEGMENTATION:
      return getServiceDetailsLink({
        type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.DETAIL,
        serviceId: servieId
      })
    default:
      return ''
  }
}