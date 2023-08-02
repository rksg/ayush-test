import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Loader, Table, TableProps, showActionModal }        from '@acx-ui/components'
import { Features, useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import { DownloadOutlined }                                          from '@acx-ui/icons'
import { useEdgeExportCsv }                                          from '@acx-ui/rc/components'
import { useDeleteEdgeServicesMutation, useGetEdgeServiceListQuery } from '@acx-ui/rc/services'
import {
  EdgeService,
  EdgeServiceTypeEnum,
  TableQuery,
  useTableQuery
} from '@acx-ui/rc/utils'
import { RequestPayload }            from '@acx-ui/types'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { ServiceDetailDrawer }      from './ServiceDetailDrawer'
import { getEdgeServiceTypeString } from './utils'

export const EdgeServices = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { serialNumber } = params
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
  const [removeServices] = useDeleteEdgeServicesMutation()

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
      render: (_, row) => {
        return (
          <Button
            type='link'
            onClick={() => showServiceDetailsDrawer(row)}
          >
            {row.serviceName}
          </Button>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Service Type' }),
      key: 'serviceType',
      dataIndex: 'serviceType',
      sorter: true,
      render: (_, row) => getEdgeServiceTypeString($t, row.serviceType)
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
      render: (_, row) => {
        if (row.targetVersion && row.currentVersion !== row.targetVersion) {
          return $t({ defaultMessage: 'Yes' })
        }
        return $t({ defaultMessage: 'No' })
      }
    },
    {
      title: $t({ defaultMessage: 'Service Version' }),
      key: 'currentVersion',
      dataIndex: 'currentVersion',
      sorter: true,
      render: (_, row) => (row.currentVersion || $t({ defaultMessage: 'NA' }))
    }
  ]

  const isRemoveBtnDisable = (selectedRows: EdgeService[]) => {
    let isDhcpSelected = selectedRows
      .filter(EdgeService => EdgeService.serviceType === EdgeServiceTypeEnum.DHCP)
      .length > 0

    let isNsgSelected = selectedRows
      .filter(EdgeService => EdgeService.serviceType === EdgeServiceTypeEnum.NETWORK_SEGMENTATION)
      .length > 0

    let isNsgExist = tableQuery?.data?.data ? tableQuery?.data?.data?.filter(EdgeService =>
      EdgeService.serviceType === EdgeServiceTypeEnum.NETWORK_SEGMENTATION)
      .length > 0 : false

    return isDhcpSelected ? isNsgSelected ? false : isNsgExist : false
  }

  const rowActions: TableProps<EdgeService>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Remove' }),
      disabled: isRemoveBtnDisable,
      tooltip: (selectedRows) => isRemoveBtnDisable(selectedRows)
        // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'DHCP cannot be removed when the Network Segmentation is applied on the Edge' }
        ) : undefined,
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: $t({
            defaultMessage: `Remove "{count, plural,
              one {{entityValue}}
              other {{count} Services}
            }"?`
          }, { count: selectedRows.length, entityValue: selectedRows[0].serviceName }),
          content: $t({
            defaultMessage: `Are you sure you want to remove {count, plural,
              one {this service}
              other {these services}
            }?`
          }, { count: selectedRows.length }),
          customContent: {
            action: 'CUSTOM_BUTTONS',
            buttons: [
              {
                text: $t({ defaultMessage: 'Cancel' }),
                type: 'default',
                key: 'cancel'
              }, {
                text: $t({ defaultMessage: 'Remove' }),
                type: 'primary',
                key: 'ok',
                closeAfterAction: true,
                handler: () => {
                  removeServices({
                    params, payload: {
                      serviceList: selectedRows.map(item => ({
                        serviceId: item.serviceId,
                        serviceType: item.serviceType
                      }))
                    }
                  }).then(clearSelection)
                }
              }
            ]
          }
        })
      }
    }
  ]

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Table
        settingsId='edge-services-table'
        rowKey='serviceId'
        rowSelection={hasAccess() && { type: 'checkbox' }}
        rowActions={filterByAccess(rowActions)}
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
