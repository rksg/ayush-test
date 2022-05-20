import { Table, TableProps } from '..'

const basicColumns: TableProps<typeof basicData[0]>['columns'] = [
  {
    title: '',
    dataIndex: 'venue',
    key: 'venue'
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    sorter: (a: any, b: any) => a.age - b.age,
    showSorterTooltip: false
  },
  {
    title: 'Favorite Number',
    dataIndex: 'favoriteNumber',
    key: 'favoriteNumber',
    sorter: (a: any, b: any) => a.favoriteNumber - b.favoriteNumber
  }
]

const basicData = [
  {
    venue: 'venue 1',
    key: '1',
    name: 'John',
    age: 40,
    favoriteNumber: 1
  },
  {
    venue: 'venue 2',
    key: '2',
    name: 'Anne',
    age: 33,
    favoriteNumber: 10
  },
  {
    venue: 'venue 3',
    key: '3',
    name: 'Will',
    age: 55,
    favoriteNumber: 5
  }
]


export function RotatedTable () {
  return (
    <Table
      columns={basicColumns}
      dataSource={basicData}
      title={() => 'Rotated'}
      type={'rotated'}
    />
  )
}
