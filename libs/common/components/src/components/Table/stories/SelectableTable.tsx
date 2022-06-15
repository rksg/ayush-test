import { Space } from 'antd';
import { Table } from '..'

const basicColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]

const basicData = [
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
    name: 'Will Smith',
    age: 45,
    address: 'address'
  }
]

export function SelectableTable () {
  return (
    <Table
      columns={basicColumns}
      dataSource={basicData}
      rowSelection={{
        defaultSelectedRowKeys: [],
      }}
      tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
        <Space>
          <span>
            {selectedRowKeys.length} selected
            <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
              x
            </a>
          </span>
        </Space>
      )}
      tableAlertOptionRender={() => (
          <Space size={8}>
            <a>Edit</a>
            <a>|</a>
            <a>Delete</a>
          </Space>
        )
      }
      options={false}
      search={false}
      headerTitle='Selectable'
      type={'selectable'}
    />
  )
}