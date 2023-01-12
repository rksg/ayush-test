import { Table, TableProps } from '..'

const basicColumns: TableProps<typeof basicData[0]>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 150,
    align: 'center'
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
  }
]

export function BasicTable () {
  return (<>
    Basic
    <Table
      columns={basicColumns}
      dataSource={basicData}
    />
  </>)
}
