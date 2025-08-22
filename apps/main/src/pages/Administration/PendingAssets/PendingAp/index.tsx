import { useEffect, useState, useRef } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, cssStr, Loader, Table, TableProps }                                                                                  from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                                                  from '@acx-ui/formatter'
import { Sync }                                                                                                                       from '@acx-ui/icons'
import { useGetApModelsQuery, useGetApProvisionsQuery, useGetApStatusQuery, useHideApProvisionsMutation, useRefreshApStatusMutation } from '@acx-ui/rc/services'
import { DeviceProvision, HideProvisionsPayload }                                                                                     from '@acx-ui/rc/utils'
import { TimeStamp }                                                                                                                  from '@acx-ui/types'
import { useTableQuery }                                                                                                              from '@acx-ui/utils'

import { ApGroupDrawer }     from '../ApGroupDrawer'
import { ClaimDeviceDrawer } from '../ClaimDeviceDrawer'
import { MessageMapping }    from '../messageMapping'
import { VenueDrawer }       from '../VenueDrawer'


export const PendingAp = () => {
  const { $t } = useIntl()
  const params = useParams()

  const tenantId = params.tenantId

  const [ refreshAt, setRefreshAt ] = useState<TimeStamp | null>(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ hasAutoRefreshed, setHasAutoRefreshed ] = useState(false)
  const [ claimDrawerVisible, setClaimDrawerVisible ] = useState(false)
  const [ selectedDevices, setSelectedDevices ] = useState<{ serial: string; model: string }[]>([])
  const [ venueDrawerVisible, setVenueDrawerVisible ] = useState(false)
  const [ apGroupDrawerVisible, setApGroupDrawerVisible ] = useState(false)

  const clearSelectionRef = useRef<(() => void) | null>(null)

  const { data: apStatus, refetch: refetchApStatus } = useGetApStatusQuery(
    { params },
    { refetchOnMountOrArgChange: true })

  const [ refreshApStatus ] = useRefreshApStatusMutation()

  const [ hideApProvisions ] = useHideApProvisionsMutation()

  const tableQuery = useTableQuery<DeviceProvision>({
    useQuery: useGetApProvisionsQuery,
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
  const { modelFilterMap } = useGetApModelsQuery({
    params: { tenantId },
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
    setRefreshAt(formatter(DateFormatEnum.DateTimeFormatWithSeconds)(apStatus?.refreshedAt) ?? null)

    const autoRefresh = async () => {
      if (apStatus && apStatus.refreshedAt === null && !hasAutoRefreshed) {
        setHasAutoRefreshed(true)
        await handleRefresh()
      }
    }

    autoRefresh()
  }, [apStatus, hasAutoRefreshed])

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

  // Handle add AP group button click
  const handleAddApGroup = () => {
    setApGroupDrawerVisible(true)
  }

  // Handle AP group drawer close
  const handleApGroupDrawerClose = () => {
    setApGroupDrawerVisible(false)
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
      defaultFilteredValue: [false],
      filterComponent: { type: 'checkbox', label: $t({ defaultMessage: 'Show hidden devices' }) }
    }
  ]

  const rowActions: TableProps<DeviceProvision>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Claim Device' }),
      onClick: (selectedRows, clearSelection) => {
        const devices = selectedRows.map(row => ({
          serial: row.serialNumber,
          model: row.model
        }))
        setSelectedDevices(devices)
        clearSelectionRef.current = clearSelection
        setClaimDrawerVisible(true)
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
        hideApProvisions({
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
    await refreshApStatus({})
    const { data: latestApStatus } = await refetchApStatus()
    setRefreshAt(
      formatter(DateFormatEnum.DateTimeFormatWithSeconds)(latestApStatus?.refreshedAt) ?? null)
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
        settingsId={'pending-aps-tab'}
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
        visible={claimDrawerVisible}
        devices={selectedDevices}
        onClose={() => {
          setClaimDrawerVisible(false)
          // Clear selection when drawer closes
          if (clearSelectionRef.current) {
            clearSelectionRef.current()
            clearSelectionRef.current = null
          }
          setSelectedDevices([])
        }}
        onAddVenue={handleAddVenue}
        onAddApGroup={handleAddApGroup}
      />

      {/* Venue Drawer */}
      <VenueDrawer
        open={venueDrawerVisible}
        onClose={handleVenueDrawerClose}
        onSuccess={handleVenueCreated}
      />

      {/* Ap Group Drawer */}
      <ApGroupDrawer
        open={apGroupDrawerVisible}
        onClose={handleApGroupDrawerClose}
      />
    </Loader>
  )
}
