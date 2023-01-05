import { Button, Loader, Modal, Table, TableProps, Descriptions } from '@acx-ui/components'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { CodeMirrorWidget } from '@acx-ui/rc/components'
import { ConfigurationHistory, useTableQuery } from '@acx-ui/rc/utils'
import { useGetSwitchConfigHistoryQuery } from '@acx-ui/rc/services'
import * as UI from './styledComponents'

export function ErrorsTable (props: {errors: any[]}) {
  const { $t } = useIntl()
  const { errors } = props
  const [visible, setVisible] = useState(false)
  const [showError, setShowError] = useState(true)
  const [showClis, setShowClis] = useState(true)
  const [collapseActive, setCollapseActive] = useState(false)
  const [dispatchFailedReason, setDispatchFailedReason] = useState([])
  const [selectedRow, setSelectedRow] = useState(null as unknown as ConfigurationHistory)

  const tableData = errors ? errors.map((item, index) => {return {...item, index}}): []

  const columns: TableProps<any>['columns'] = [{
    key: 'lineNumber',
    title: $t({ defaultMessage: 'Line #' }),
    dataIndex: 'lineNumber',
  }, {
    key: 'message',
    title: $t({ defaultMessage: 'Error Description' }),
    dataIndex: 'message',
    sorter: true
  }
  ]

  return <>
      <Table
        rowKey='index'
        rowSelection={{ type: 'radio', defaultSelectedRowKeys: [0]}}
        columns={columns}
        dataSource={tableData}
      />
  </>
}