/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { SelectionControl, Table, TableProps }                              from '@acx-ui/components'
import { ConfigurationHistory, transformConfigType, transformConfigStatus } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import type { RadioChangeEvent } from 'antd'

export function SwitchConfigDetailsTable (props: {
  configDetails?: ConfigurationHistory[],
  filterType: string,
  onSelectConfingChange: (data: ConfigurationHistory) => void,
  onFilterConfigDetails: (e: RadioChangeEvent) => void
}) {
  const { $t } = useIntl()
  const { configDetails, onSelectConfingChange, filterType, onFilterConfigDetails } = props

  const [selectedRowKeys, setSelectedRowKeys] = useState([''] as string[])

  const columns: TableProps<ConfigurationHistory>['columns'] = [{
    key: 'switchName',
    title: $t({ defaultMessage: 'Switch Name' }),
    dataIndex: 'switchName',
    sorter: true
  }, {
    key: 'serialNumber',
    title: $t({ defaultMessage: 'Serial Number' }),
    dataIndex: 'serialNumber',
    sorter: true
  }, {
    key: 'configType',
    title: $t({ defaultMessage: 'Type' }),
    dataIndex: 'configType',
    sorter: true,
    render: (data) => transformConfigType(data as string)
  },{
    key: 'dispatchStatus',
    title: $t({ defaultMessage: 'Status' }),
    dataIndex: 'dispatchStatus',
    sorter: true,
    render: (data) => transformConfigStatus(data as string)
  }, {
    key: 'numberOfErrors',
    title: $t({ defaultMessage: 'Errors' }),
    dataIndex: 'numberOfErrors',
    sorter: true
  }]

  useEffect(() => {
    setSelectedRowKeys(['0'])
  }, [configDetails])

  return <>
    <UI.SwitchConfigHeader>
      {$t({ defaultMessage: 'Switches ({count})' }, { count: configDetails?.length })}
      <SelectionControl
        size='small'
        defaultValue='ALL'
        onChange={onFilterConfigDetails}
        value={filterType}
        options={[
          { value: 'ALL', label: 'All' },
          { value: 'FAILED', label: 'Failed' },
          { value: 'SUCCESS', label: 'Success' },
          { value: 'NOTIFY_SUCCESS', label: 'Notify Success' }
        ]}
      />
    </UI.SwitchConfigHeader>
    <Table
      type='form'
      rowKey='id'
      columns={columns}
      dataSource={configDetails}
      tableAlertRender={false}
      rowSelection={{
        type: 'radio',
        defaultSelectedRowKeys: selectedRowKeys,
        selectedRowKeys: selectedRowKeys,
        onChange: (keys, rows) => {
          onSelectConfingChange(rows[0])
        }
      }}
    />
  </>
}