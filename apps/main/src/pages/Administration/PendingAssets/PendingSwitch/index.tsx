import { useEffect, useState, useRef } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, cssStr, Loader, Table, TableProps }                                                                                                      from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                                                                      from '@acx-ui/formatter'
import { Sync }                                                                                                                                           from '@acx-ui/icons'
import { useGetSwitchModelsQuery, useGetSwitchProvisionsQuery, useGetSwitchStatusQuery, useHideSwitchProvisionsMutation, useRefreshSwitchStatusMutation } from '@acx-ui/rc/services'
import {  DeviceProvision,  HideProvisionsPayload }                                                                                                       from '@acx-ui/rc/utils'
import { TimeStamp }                                                                                                                                      from '@acx-ui/types'
import { useTableQuery }                                                                                                                                  from '@acx-ui/utils'

import { ClaimDeviceDrawer } from '../ClaimDeviceDrawer'
import { MessageMapping }    from '../messageMapping'
import { VenueDrawer }       from '../VenueDrawer'


export const PendingSwitch = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [ refreshAt, setRefreshAt ] = useState<TimeStamp | null>(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ hasAutoRefreshed, setHasAutoRefreshed ] = useState(false)
  const [ claimDrawerVisible, setClaimDrawerVisible ] = useState(false)
  const [ selectedDevices, setSelectedDevices ] = useState<DeviceProvision[]>([])
  const [ venueDrawerVisible, setVenueDrawerVisible ] = useState(false)
  const clearSelectionRef = useRef<(() => void) | null>(null)

  const { data: switchStatus, refetch: refetchSwitchStatus } = useGetSwitchStatusQuery(
    { params },
    { refetchOnMountOrArgChange: true })

  const [ refreshSwitchStatus ] = useRefreshSwitchStatusMutation()

  const [ hideSwitchProvisions ] = useHideSwitchProvisionsMutation()

  const tableQuery = useTableQuery<DeviceProvision>({
    useQuery: useGetSwitchProvisionsQuery,
    defaultPayload: {
      page: 0,
      pageSize: 10,
      filters: {}
    },
    search: {
      searchString: '',
      searchTargetFields: ['serialNumber', 'model']
    },
    sorter: {
      sortField: 'serialNumber',
      sortOrder: 'asc'
    }
  })

  const emptyModelFilterMap: { key: string, value: string }[] = []
  const tableFilters = tableQuery.payload.filters as { includeHidden?: boolean[] }
  const { modelFilterMap } = useGetSwitchModelsQuery({
    params: { tenantId: params.tenantId },
    payload: {
      filters: {
        includeHidden: tableFilters?.includeHidden || [false]
      }
    }
  }, {
    selectFromResult: ({ data }) => {
      return {
        modelFilterMap: data?.map((model: string) =>
          ({ key: model, value: model })) ?? emptyModelFilterMap
      }
    }
  })

  useEffect(() => {
    // Set refreshAt from switchStatus
    setRefreshAt(
      formatter(DateFormatEnum.DateTimeFormatWithSeconds)(switchStatus?.refreshedAt) ?? null
    )

    // Auto refresh when switchStatus?.refreshedAt is null
    const autoRefresh = async () => {
      if (switchStatus && switchStatus.refreshedAt === null && !hasAutoRefreshed) {
        setHasAutoRefreshed(true)
        await handleRefresh()
      }
    }

    autoRefresh()
  }, [switchStatus, hasAutoRefreshed])

  // Handle add venue button click
  const handleAddVenue = () => {
    setVenueDrawerVisible(true)
  }

  // Handle venue drawer close
  const handleVenueDrawerClose = () => {
    setVenueDrawerVisible(false)
  }

  // Handle venue creation success
  const handleVenueCreated = async () => {
    setVenueDrawerVisible(false)
  }

  const columns: TableProps<DeviceProvision>['columns'] = [
    {
      key: 'serialNumber',
      title: $t({ defaultMessage: 'Serial #' }),
      dataIndex: 'serialNumber',
      sorter: true,
      searchable: true,
      fixed: 'left'
    },
    {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true,
      searchable: true,
      filterable: modelFilterMap
    },
    {
      key: 'shipDate',
      title: $t({ defaultMessage: 'Ship Date' }),
      dataIndex: 'shipDate',
      sorter: true,
      render: (_, row) => {
        return formatter(DateFormatEnum.DateFormat)(row.shipDate)
      }
    },
    {
      key: 'createdDate',
      title: $t({ defaultMessage: 'Created Date' }),
      dataIndex: 'createdDate',
      sorter: true,
      filterable: true,
      filterKey: 'fromDate',
      filterComponent: { type: 'rangepicker', unlimitedRange: true },
      render: (_, row) => {
        return formatter(DateFormatEnum.DateFormat)(row.createdDate)
      }
    },
    {
      key: 'visibleStatus',
      title: $t({ defaultMessage: 'Visibility' }),
      dataIndex: 'visibleStatus',
      sorter: true,
      filterKey: 'includeHidden',
      filterable: true,
      filterComponent: { type: 'checkbox', label: $t({ defaultMessage: 'Show hidden devices' }) }
    }
  ]

  const rowActions: TableProps<DeviceProvision>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Claim Device' }),
      onClick: (selectedRows, clearSelection) => {
        setSelectedDevices(selectedRows)
        setClaimDrawerVisible(true)
        clearSelectionRef.current = clearSelection
      },
      disabled: (selectedRows: DeviceProvision[]) => selectedRows.length > 256,
      tooltip: (selectedRows: DeviceProvision[]) =>
        selectedRows.length > 256
          ? $t(MessageMapping.claim_devive_limitation_tooltip, { deviceCount: 256 })
          : undefined
    },
    {
      label: $t({ defaultMessage: 'Hide Device' }),
      tooltip: $t(MessageMapping.hide_devive_tooltip),
      onClick: (selectedRows, clearSelection) => {
        hideSwitchProvisions({
          payload: {
            serials: selectedRows.map((row) => row.serialNumber)
          } as HideProvisionsPayload
        }).then(() => {
          clearSelection()
        })
      },
      visible: (selectedRows: DeviceProvision[]) => {
        return !selectedRows.some((row: DeviceProvision) => row.visibleStatus === 'Hidden')
      }
    }
  ]

  const handleRefresh = async () => {
    setIsLoading(true)
    await refreshSwitchStatus({})
    const { data: latestSwitchStatus } = await refetchSwitchStatus()
    setRefreshAt(
      formatter(DateFormatEnum.DateTimeFormatWithSeconds)(latestSwitchStatus?.refreshedAt) ?? null)
    setIsLoading(false)
  }

  return (
    <Loader states={[{ isLoading }]}>
      <div
        className={'ant-space-align-center'}
        style={{ textAlign: 'right', paddingBottom: '20px' }}>
        <span style={{ fontSize: '12px', marginRight: '6px',
          color: cssStr('--acx-neutrals-60') }}>
          {$t({ defaultMessage: 'Updated at' })}
        </span>
        <span data-testid='test-refresh-time' style={{ fontSize: '12px', marginRight: '6px' }}>
          {formatter(DateFormatEnum.DateTimeFormatWith12HourSystem)(refreshAt)}
        </span>
        <Button
          icon={<Sync />}
          type='link'
          size='small'
          onClick={handleRefresh}>{$t({ defaultMessage: 'Refresh' })}</Button>
      </div>

      <Table<DeviceProvision>
        key={refreshAt}
        settingsId={'pending-switches-tab'}
        loading={tableQuery.isLoading || tableQuery.isFetching}
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        rowActions={rowActions}
        enableApiFilter={true}
        rowSelection={
          rowActions?.length > 0 && { type: 'checkbox' }
        }
        rowKey='serialNumber'
      />

      <ClaimDeviceDrawer
        deviceType='switch'
        devices={selectedDevices.map(device => ({
          serial: device.serialNumber,
          model: device.model
        }))}
        visible={claimDrawerVisible}
        onClose={() => {
          setClaimDrawerVisible(false)
          setSelectedDevices([])
          // Clear selection when drawer closes
          if (clearSelectionRef.current) {
            clearSelectionRef.current()
            clearSelectionRef.current = null
          }
        }}
        onAddVenue={handleAddVenue}
      />

      {/* Venue Drawer */}
      <VenueDrawer
        open={venueDrawerVisible}
        onClose={handleVenueDrawerClose}
        onSuccess={handleVenueCreated}
      />
    </Loader>
  )
}
