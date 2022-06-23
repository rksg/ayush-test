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

const actions = [
  {
    key: 11,
    label: 'Edit',
    onClick: (selectedRows: object)=> { console.log('Edit', selectedRows) } // eslint-disable-line
  },
  {
    key: 12,
    label: 'Delete',
    onClick: (selectedRows: object)=> { console.log('Delete', selectedRows) } // eslint-disable-line
  },
  {
    key: 13,
    label: 'Mute',
    onClick: (selectedRows: object)=> { console.log('Mute', selectedRows) } // eslint-disable-line
  }
]

export function SingleSelectTable () {
  return (
    <Table
      columns={basicColumns}
      dataSource={basicData}
      alertOptions={actions}
      headerTitle='Single Select'
      type={'selectable'}
      rowSelection={{ defaultSelectedRowKeys: [], type: 'radio' }}
    />
  )
}