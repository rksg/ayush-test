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

export function FormTable () {
  return (<>
    Form Table
    <Table
      columns={basicColumns}
      dataSource={basicData}
      type={'form'}
    />
    <p />
    Form Table without header
    <Table
      columns={basicColumns}
      dataSource={basicData}
      showHeader={false}
      type={'form'}
    />
  </>)
}
