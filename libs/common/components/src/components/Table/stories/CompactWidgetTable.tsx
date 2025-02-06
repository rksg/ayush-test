import { Table } from '..'

const basicColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    searchable: true
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    searchable: true
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  }
]

const basicData = [
  {
    key: '1',
    name: 'John Doe',
    age: '32',
    address: 'sample address'
  },
  {
    key: '2',
    name: 'Jane Doe',
    age: '33',
    address: 'new address'
  },
  {
    key: '3',
    name: 'Will Smith',
    age: '45',
    address: 'address'
  }
]

export function CompactWidgetTable () {
  return (<>
    <h2>Compact Widget Table</h2>
    <Table
      columns={basicColumns}
      dataSource={basicData}
      type={'compactWidget'}
    />
  </>)
}
