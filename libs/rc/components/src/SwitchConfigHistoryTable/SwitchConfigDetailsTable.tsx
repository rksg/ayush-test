/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Radio }   from 'antd'
import { useIntl } from 'react-intl'

import { Table, TableProps }                                                from '@acx-ui/components'
import { ConfigurationHistory, transformConfigType, transformConfigStatus } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import type { RadioChangeEvent } from 'antd'

export function SwitchConfigDetailsTable (props: {
  configDetails?: ConfigurationHistory[]
  onSelectConfingChange: (data: ConfigurationHistory) => void,
  onFilterConfigDetails: (e: RadioChangeEvent) => void
}) {
  const { $t } = useIntl()
  const { configDetails, onSelectConfingChange, onFilterConfigDetails } = props

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
      <Radio.Group onChange={onFilterConfigDetails} defaultValue='All'>
        <Radio.Button value='ALL'>{ $t({ defaultMessage: 'All' }) }</Radio.Button>
        <Radio.Button value='FAILED'>{ $t({ defaultMessage: 'Failed' }) }</Radio.Button>
        <Radio.Button value='SUCCESS'>{ $t({ defaultMessage: 'Success' }) }</Radio.Button>
        <Radio.Button value='NOTIFY_SUCCESS'>{ $t({ defaultMessage: 'Notify Success' }) }</Radio.Button>
      </Radio.Group>
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