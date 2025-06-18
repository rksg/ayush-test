import { useState } from 'react'

import { now }     from 'lodash'
import { useIntl } from 'react-intl'

import { Button, cssStr, Loader, Table, TableProps } from '@acx-ui/components'
import { DateFormatEnum, formatter }                 from '@acx-ui/formatter'
import { Sync }                                      from '@acx-ui/icons'
import { PendingAsset }                              from '@acx-ui/rc/utils'
import { TimeStamp }                                 from '@acx-ui/types'

import { MessageMapping } from '../messageMapping'

export const PendingSwitch = () => {
  const [ refreshAt, setRefreshAt ] = useState<TimeStamp>(now() - 1000 * 60 * 5)
  const [ tableData ] = useState([{
    serial: '309862154862',
    model: 'ICX7550-48',
    shipDate: '2025-05-21',
    createdDate: '2025-05-20',
    status: 'Ready'
  }, {
    serial: '309862154841',
    model: 'ICX7150-C12P',
    shipDate: '2024-05-01',
    createdDate: '2024-05-05',
    status: 'Ready'
  },{
    serial: '309862154842',
    model: 'ICX7150-C12P',
    shipDate: '2025-05-21',
    createdDate: '2025-05-20',
    status: 'Ready'
  }, {
    serial: '309862154843',
    model: 'ICX7150-C12P',
    shipDate: '2024-05-01',
    createdDate: '2024-05-05',
    status: 'Ready'
  },{
    serial: '309862154844',
    model: 'ICX7150-C12P',
    shipDate: '2025-05-21',
    createdDate: '2025-05-20',
    status: 'Ready'
  }, {
    serial: '309862154863',
    model: 'ICX7550-48',
    shipDate: '2024-05-01',
    createdDate: '2024-05-05',
    status: 'Ready'
  },{
    serial: '309862154864',
    model: 'ICX7550-48',
    shipDate: '2025-05-21',
    createdDate: '2025-05-20',
    status: 'Ready'
  }, {
    serial: '309862154865',
    model: 'ICX7550-48',
    shipDate: '2024-05-01',
    createdDate: '2024-05-05',
    status: 'Ready'
  }] as (PendingAsset)[])

  const tableQuery = {
    data: tableData,
    pagination: {
      page: 1,
      pageSize: 5,
      defaultPageSize: 5,
      total: 8
    },
    handleTableChange: () => {}
  }

  const { $t } = useIntl()

  const columns: TableProps<PendingAsset>['columns'] = [
    {
      key: 'serial',
      title: 'Serial',
      dataIndex: 'serial',
      sorter: true,
      searchable: true
    },
    {
      key: 'model',
      title: 'Model',
      dataIndex: 'model',
      sorter: true,
      searchable: true,
      filterable: [{ key: 'ICX7550-48', label: 'ICX7550-48' },
        { key: 'ICX7150-C12P', label: 'ICX7150-C12P' }]
    },
    {
      key: 'shipDate',
      title: 'Ship Date',
      dataIndex: 'shipDate',
      sorter: true,
      searchable: true,
      render: (value) => formatter(DateFormatEnum.DateFormat)(value)
    },
    {
      key: 'createdDate',
      title: 'Created Date',
      dataIndex: 'createdDate',
      sorter: true,
      searchable: true,
      render: (value) => formatter(DateFormatEnum.DateFormat)(value)
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sorter: true,
      searchable: true,
      filterComponent: { type: 'checkbox', label: 'Show ignored devices' },
      filterable: true,
      filterKey: 'status',
      filterValueArray: true,
      fitlerCustomOptions: [{ key: 'Ready', label: 'Ready' }, { key: 'Ignored', label: 'Ignored' }]
    }
  ]

  const rowActions: TableProps<PendingAsset>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Claim Device' }),
      onClick: () => {
      }
    },
    {
      label: $t({ defaultMessage: 'Ignore Device' }),
      tooltip: $t(MessageMapping.ignore_devive_tooltip),
      onClick: () => {
      }
    }
  ]

  const handleRefresh = () => {
    setRefreshAt(now())
  }

  return (
    <Loader>
      <div
        className={'ant-space-align-center'}
        style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '12px', marginRight: '6px', color: cssStr('--acx-neutrals-60') }}>
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
      <Table<PendingAsset>
        settingsId={'pending-aps-table'}
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowActions={rowActions}
        rowSelection={
          rowActions.length > 0 && { type: 'checkbox' }
        }
        rowKey='serial'
      />
    </Loader>
  )
}
