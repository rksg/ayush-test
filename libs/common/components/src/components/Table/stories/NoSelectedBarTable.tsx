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

export function NoSelectedBarTable () {
  return (<>
    <p>No Selected Bar Table</p>
    <Table
      columns={basicColumns}
      dataSource={basicData}
      rowSelection={{ type: 'radio' }}
      tableAlertRender={false}
    />
    <br />
    <p>No Selected Bar Table with filters</p>
    <Table
      columns={[
        { ...basicColumns[0], searchable: true },
        ...basicColumns.slice(1, 3)
      ]}
      dataSource={basicData}
      rowSelection={{ type: 'radio' }}
      tableAlertRender={false}
    />
  </>)
}
