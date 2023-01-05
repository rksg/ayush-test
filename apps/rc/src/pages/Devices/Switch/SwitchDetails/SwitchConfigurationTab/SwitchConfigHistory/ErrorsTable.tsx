import { Table, TableProps } from '@acx-ui/components'
import { useIntl } from 'react-intl'

export function ErrorsTable (props: {errors: any[], selectionChanged: Function}) {
  const { $t } = useIntl()
  const { errors, selectionChanged } = props
  const tableData = errors ? errors.map((item, index) => {return {...item, id:index}}): []

  const columns: TableProps<any>['columns'] = [{
    key: 'lineNumber',
    title: $t({ defaultMessage: 'Line #' }),
    dataIndex: 'lineNumber',
  }, {
    key: 'message',
    title: $t({ defaultMessage: 'Error Description' }),
    dataIndex: 'message'
  }
  ]

  return <>
      <Table
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
  </>
}