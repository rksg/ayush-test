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
    align: 'center'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]
const basicData:{
  name: string,
  key: number,
  age: number,
  address: string
}[] = []

for (let i = 1; i <= 30; i++) {
  basicData.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`
  })
}

export function TwoTablesStickyPaging () {
  return (<>
    Two Tables with stickyPagination
    <Table
      columns={basicColumns}
      dataSource={basicData}
    />
    <Table
      columns={basicColumns}
      dataSource={basicData}
    />
  </>)
}
