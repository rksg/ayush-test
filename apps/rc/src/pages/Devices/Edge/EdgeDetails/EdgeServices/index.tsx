import { useContext, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Loader, Table, TableProps, showActionModal }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                                                              from '@acx-ui/feature-toggle'
import { DownloadOutlined }                                                                    from '@acx-ui/icons'
import { EdgeServiceStatusLight, useEdgeDhcpActions, useEdgeExportCsv, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { useDeleteEdgeServicesMutation, useGetEdgeServiceListQuery }                           from '@acx-ui/rc/services'
import {
  EdgeDhcpUrls,
  EdgeService,
  EdgeServiceTypeEnum,
  EdgeUrlsInfo,
  TableQuery,
  useTableQuery
} from '@acx-ui/rc/utils'
import { EdgeScopes, RequestPayload }      from '@acx-ui/types'
import { filterByAccess, hasPermission }   from '@acx-ui/user'
import { exportMessageMapping, getOpsApi } from '@acx-ui/utils'

import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

import { ServiceDetailDrawer }      from './ServiceDetailDrawer'
import { getEdgeServiceTypeString } from './utils'

export const EdgeServices = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { serialNumber } = params

  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)

  const [currentData, setCurrentData] = useState({} as EdgeService)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const { currentEdgeStatus, isEdgeStatusLoading } = useContext(EdgeDetailsDataContext)

  const settingsId = 'edge-services-table'
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeServiceListQuery,
    defaultPayload: {
      filters: { edgeId: [serialNumber] }
    },
    sorter: {
      sortField: 'serviceName',
      sortOrder: 'ASC'
    },
    pagination: { settingsId }
  })

  const { exportCsv, disabled } = useEdgeExportCsv<EdgeService>(
    tableQuery as unknown as TableQuery<EdgeService, RequestPayload<unknown>, unknown>
  )
  const [removeServices] = useDeleteEdgeServicesMutation()
  const { restartEdgeDhcp } = useEdgeDhcpActions()

  const showServiceDetailsDrawer = (data: EdgeService) => {
    switch (data.serviceType) {
      case EdgeServiceTypeEnum.DHCP:
        if (!isEdgeHaReady || !isEdgeDhcpHaReady) return
        break
      case EdgeServiceTypeEnum.FIREWALL:
        if (!isEdgeHaReady || !isEdgeFirewallHaReady) return
        break
      case EdgeServiceTypeEnum.PIN:
        if (!isEdgePinReady) return
        break
      case EdgeServiceTypeEnum.MDNS_PROXY:
        if (!isEdgeMdnsReady) return
        break
      default:
    }

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
      key: 'edgeAlarmSummary',
      dataIndex: 'edgeAlarmSummary',
      render: (_, row) =>
        <EdgeServiceStatusLight data={row.edgeAlarmSummary} />
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

    let isPinSelected = selectedRows
      .filter(EdgeService => EdgeService.serviceType === EdgeServiceTypeEnum.PIN)
      .length > 0

    let isPinExist = tableQuery?.data?.data ? tableQuery?.data?.data?.filter(EdgeService =>
      EdgeService.serviceType === EdgeServiceTypeEnum.PIN)
      .length > 0 : false

    return isDhcpSelected ? isPinSelected ? false : isPinExist : false
  }

  const isRestartBtnDisable = (selectedRows: EdgeService[]) => {
    let isDhcpSelected = selectedRows
      .filter(EdgeService => EdgeService.serviceType === EdgeServiceTypeEnum.DHCP)
      .length > 0

    return !(isDhcpSelected && selectedRows.length === 1)
  }

  const rowActions: TableProps<EdgeService>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Remove' }),
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.deleteService)],
      scopeKey: [EdgeScopes.DELETE],
      disabled: isRemoveBtnDisable,
      tooltip: (selectedRows) => isRemoveBtnDisable(selectedRows)
        // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'DHCP cannot be removed when the Personal Identity Network is applied on the Edge' }
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
                    params: {
                      venueId: currentEdgeStatus?.venueId,
                      edgeClusterId: currentEdgeStatus?.clusterId
                    },
                    payload: {
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
    },
    {
      label: $t({ defaultMessage: 'Restart' }),
      scopeKey: [EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeDhcpUrls.restartDhcpService)],
      disabled: (isEdgeHaReady && isEdgeDhcpHaReady) ? isRestartBtnDisable : true,
      tooltip: (selectedRows) => isRestartBtnDisable(selectedRows)
        ? $t({ defaultMessage: 'Only DHCP can be restarted' }
        ) : undefined,
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: $t({
            defaultMessage: `Restart "{count, plural,
              one {{entityValue}}
              other {{count} Services}
            }"?`
          }, { count: selectedRows.length, entityValue: selectedRows[0].serviceName }),
          content: $t({
            defaultMessage: `Are you sure you want to restart {count, plural,
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
                text: $t({ defaultMessage: 'Restart' }),
                type: 'primary',
                key: 'ok',
                closeAfterAction: true,
                handler: async () => {
                  await restartEdgeDhcp(
                    selectedRows[0].serviceId,
                    currentEdgeStatus?.venueId ?? '',
                    currentEdgeStatus?.clusterId ?? ''
                  )
                  clearSelection()
                }
              }
            ]
          }
        })
      }
    }
  ]

  const isSelectionVisible = hasPermission({ scopes: [EdgeScopes.UPDATE, EdgeScopes.DELETE] })

  return (
    <Loader states={[
      tableQuery,
      { isLoading: isEdgeStatusLoading }
    ]}>
      <Table
        settingsId={settingsId}
        rowKey='serviceId'
        rowSelection={isSelectionVisible && { type: 'checkbox' }}
        rowActions={filterByAccess(rowActions)}
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter
        iconButton={
          (exportDevice && false) ? {
            icon: <DownloadOutlined />,
            disabled,
            onClick: exportCsv,
            tooltip: $t(exportMessageMapping.EXPORT_TO_CSV)
          } : undefined
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

