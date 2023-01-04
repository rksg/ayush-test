import { Button, Loader, Modal, Table, TableProps, Descriptions } from '@acx-ui/components'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import 'codemirror/addon/merge/merge.css'
import 'codemirror/addon/merge/merge.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/mode/overlay'
import { CodeMirrorWidget } from '@acx-ui/rc/components'
import { ConfigurationHistory, useTableQuery } from '@acx-ui/rc/utils'
import { useGetSwitchConfigHistoryQuery } from '@acx-ui/rc/services'

export function SwitchConfigHistory () {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null as unknown as ConfigurationHistory)

  const showModal = (row: ConfigurationHistory) => {
    setSelectedRow(row)
    setVisible(true)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const tableQuery = useTableQuery({
    useQuery: useGetSwitchConfigHistoryQuery,
    defaultPayload: {
      filterByConfigType: '',
      sortInfo: {sortColumn: "startTime", dir: "DESC"},
      limit: 10
    }
  })

  const tableData = tableQuery.data?.data ?? []

  const columns: TableProps<any>['columns'] = [{
    key: 'startTime',
    title: $t({ defaultMessage: 'Time' }),
    dataIndex: 'startTime',
    sorter: true,
    defaultSortOrder: 'ascend',
    disable: true,
    render: function (data, row) { 
      return <Button type='link' size='small' onClick={() => {showModal(row)}}>
        {data}
      </Button>
    }
  }, {
    key: 'configType',
    title: $t({ defaultMessage: 'Type' }),
    dataIndex: 'configType',
    sorter: true
  }, {
    key: 'dispatchStatus',
    title: $t({ defaultMessage: 'Status' }),
    dataIndex: 'dispatchStatus',
    sorter: true
  }
  ]

  
  // TODO: add search string and filter to retrieve data
  // const retrieveData () => {}

  return <>
    <Loader states={[tableQuery]}>
      <Table
        rowKey='startTime'
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
    <Modal
      title={$t({ defaultMessage: 'Configuration Details' })}
      visible={visible}
      onCancel={handleCancel}
      width={1000}
      footer={<Button key='back' type='secondary' onClick={handleCancel}>
        {$t({ defaultMessage: 'Close' })}
      </Button>
      }
    >
      {
        selectedRow && 
        <>
          <Descriptions labelWidthPercent={15}>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Time' })}
              children={selectedRow.startTime} />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Type' })}
              children={selectedRow.configType} />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Status' })}
              children={selectedRow.dispatchStatus} />
          </Descriptions>
          <CodeMirrorWidget data={selectedRow}/>
        </>
      }
    </Modal>
  </>
}