import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Loader, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { DownloadOutlined }                  from '@acx-ui/icons'
import { useEdgeExportCsv }                  from '@acx-ui/rc/components'
import { useGetEdgeServiceListQuery }        from '@acx-ui/rc/services'
import {
  EdgeService,
  RequestPayload,
  TableQuery,
  useTableQuery
} from '@acx-ui/rc/utils'

import { ServiceDetailDrawer } from './ServiceDetailDrawer'

export const EdgeServices = () => {

  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)
  const [currentData, setCurrentData] = useState({} as EdgeService)
  const [drawerVisible, setDrawerVisible] = useState(false)
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

  const showServiceDetailsDrawer = (data: EdgeService) => {
    setCurrentData(data)
    setDrawerVisible(true)
  }

  const columns: TableProps<EdgeService>['columns'] = [
    {
      title: $t({ defaultMessage: 'Service Name' }),
      key: 'serviceName',
      dataIndex: 'serviceName',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (data, row) => {
        return (
          <Button
            type='link'
            onClick={() => showServiceDetailsDrawer(row)}
          >
            {data}
          </Button>
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
      <ServiceDetailDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        serviceData={currentData}
      />
    </Loader>
  )
}
