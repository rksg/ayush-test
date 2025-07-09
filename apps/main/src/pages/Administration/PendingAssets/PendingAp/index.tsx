import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, cssStr, Loader, Table, TableProps }                                                                                  from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                                                  from '@acx-ui/formatter'
import { Sync }                                                                                                                       from '@acx-ui/icons'
import { useGetApModelsQuery, useGetApProvisionsQuery, useGetApStatusQuery, useHideApProvisionsMutation, useRefreshApStatusMutation } from '@acx-ui/rc/services'
import { DeviceProvision, HideProvisionsPayload, VenueExtended, AddApGroup }                                                          from '@acx-ui/rc/utils'
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
  const [ selectedVenueId ] = useState<string | undefined>(undefined)

  const { data: apStatus, refetch: refetchApStatus } = useGetApStatusQuery(
    { params },
    { refetchOnMountOrArgChange: true })

  const [ refreshApStatus ] = useRefreshApStatusMutation()

  const [ hideApProvisions ] = useHideApProvisionsMutation()

  const emptyModelFilterMap: { key: string, value: string }[] = []
  const { modelFilterMap } = useGetApModelsQuery({
    params: { tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10_000
    }
  }, {
    selectFromResult: ({ data }) => {
      return {
        modelFilterMap: data?.map(model =>
          ({ key: model, value: model })) ?? emptyModelFilterMap
      }
    }
  })

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
  const handleVenueCreated = async (venue?: VenueExtended) => {
    if (venue) {
      // Optionally select the newly created venue in ClaimDeviceDrawer
      // This will be handled by the ClaimDeviceDrawer's refetch mechanism
    }
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

  // Handle AP group creation success
  const handleApGroupCreated = async (apGroup?: AddApGroup) => {
    if (apGroup) {
      // Optionally select the newly created AP group in ClaimDeviceDrawer
      // This will be handled by the ClaimDeviceDrawer's refetch mechanism
    }
    setApGroupDrawerVisible(false)
  }

  const columns: TableProps<DeviceProvision>['columns'] = [
    {
      key: 'serialNumber',
      title: 'Serial #',
      dataIndex: 'serialNumber',
      sorter: true,
      searchable: true
    },
    {
      key: 'model',
      title: 'Model',
      dataIndex: 'model',
      sorter: true,
      searchable: true,
      filterable: modelFilterMap
    },
    {
      key: 'shipDate',
      title: 'Ship Date',
      dataIndex: 'shipDate',
      sorter: true,
      render: (_, row) => {
        return formatter(DateFormatEnum.DateFormat)(row.shipDate)
      }
    },
    {
      key: 'createdDate',
      title: 'Created Date',
      dataIndex: 'createdDate',
      sorter: true,
      filterable: true,
      filterKey: 'fromDate',
      filterComponent: { type: 'rangepicker' },
      render: (_, row) => {
        return formatter(DateFormatEnum.DateFormat)(row.createdDate)
      }
    },
    {
      key: 'visibleStatus',
      title: 'Visibility',
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
      onClick: (selectedRows) => {
        const devices = selectedRows.map(row => ({
          serial: row.serialNumber,
          model: row.model
        }))
        setSelectedDevices(devices)
        setClaimDrawerVisible(true)
      }
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
        onClose={() => setClaimDrawerVisible(false)}
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
        onSuccess={handleApGroupCreated}
        venueId={selectedVenueId}
        tenantId={tenantId}
      />
    </Loader>
  )
}
