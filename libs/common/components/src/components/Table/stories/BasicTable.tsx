import { Table } from '..'

const basicColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    tooltip: 'This is a tooltip',
    dataIndex: 'age',
    key: 'age',
    width: 150
  },
  {
    title: <>
      Address
      <Table.SubTitle>Sub Title</Table.SubTitle>
    </>,
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
