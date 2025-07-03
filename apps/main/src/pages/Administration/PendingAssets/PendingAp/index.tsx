import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, cssStr, Loader, Table, TableProps }                                                             from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                             from '@acx-ui/formatter'
import { Sync }                                                                                                  from '@acx-ui/icons'
import { useGetApProvisionsQuery, useGetApStatusQuery, useHideApProvisionsMutation, useRefreshApStatusMutation } from '@acx-ui/rc/services'
import { DeviceProvision, useTableQuery, HideProvisionsPayload }                                                 from '@acx-ui/rc/utils'
import { TimeStamp }                                                                                             from '@acx-ui/types'

import { MessageMapping } from '../messageMapping'

export const PendingAp = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [ refreshAt, setRefreshAt ] = useState<TimeStamp | null>(null)
  const [ isLoading, setIsLoading ] = useState(false)

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

  useEffect(() => {
    setRefreshAt(formatter(DateFormatEnum.DateTimeFormatWithSeconds)(apStatus?.refreshedAt) ?? null)
  }, [apStatus])

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
      filterable: true
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
      onClick: () => {
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
    </Loader>
  )
}
