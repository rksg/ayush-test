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
    name: 'John Doe',
    age: 32,
    address: 'sample address'
  },
  {
    key: '3',
    name: 'John Doe',
    age: 32,
    address: 'sample address'
  }
]

export function CompactTable () {
  return (<>
    Compact
    <Table
      columns={basicColumns}
      dataSource={basicData}
      type={'compact'}
    />
  </>)
}
