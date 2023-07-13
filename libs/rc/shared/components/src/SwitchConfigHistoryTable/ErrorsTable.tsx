import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'

interface ConfigurationErrors {
  lineNumber: string,
  message: string
}

export function ErrorsTable (props: { errors: ConfigurationErrors[], selectionChanged: Function }) {
  const { $t } = useIntl()
  const { errors, selectionChanged } = props
  const tableData = errors.map((item, index) => {return { ...item, id: index }})

  const columns: TableProps<ConfigurationErrors>['columns'] = [{
    key: 'lineNumber',
    title: $t({ defaultMessage: 'Line #' }),
    dataIndex: 'lineNumber'
  }, {
    key: 'message',
    title: $t({ defaultMessage: 'Error Description' }),
    dataIndex: 'message'
  }
  ]

  return <Table
    type='form'
    rowKey='id'
    rowSelection={{
      type: 'radio',
      defaultSelectedRowKeys: [0],
      onChange: (keys, rows) => {
        selectionChanged(rows[0].lineNumber)
      }
    }}
    columns={columns}
    dataSource={tableData}
    tableAlertRender={false}
  />
}