import { Table, TableProps } from '..'
import { showToast }         from '../../Toast'

type RecordType = {
  key: string
  name: string
  age: number
  address: string
}

const columns: TableProps<RecordType>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    filterable: true,
    searchable: true
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    filterable: true
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  }
]

const data: TableProps<RecordType>['dataSource'] = [
  {
    key: '1',
    name: 'John Doe',
    age: 32,
    address: 'sample address'
  },
  {
    key: '2',
    name: 'Jane Doe',
    age: 33,
    address: 'new address'
  },
  {
    key: '3',
    name: 'Jordan Doe',
    age: 33,
    address: 'new address'
  }
]

const actions: TableProps<(typeof data)[0]>['actions'] = [
  {
    label: 'Edit',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Edit ${selectedRows.length} item(s)`
    })
  },
  {
    label: 'Delete',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Delete ${selectedRows.length} item(s)`
    })
  }
]

export function FilteredTable () {
  return <>
    with selection:
    <Table<RecordType>
      columns={columns}
      actions={actions}
      dataSource={data}
      rowSelection={{ defaultSelectedRowKeys: [] }}
    />
    without selection:
    <Table<RecordType>
      columns={columns}
      dataSource={data}
    />
  </>
}
