import { Table, TableProps } from '..'

const basicColumns: TableProps<typeof basicData[0]>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Math Score',
    dataIndex: 'math',
    sorter: {
      compare: (a, b) => a.math - b.math,
      multiple: 3
    }
  },
  {
    title: 'English Score',
    dataIndex: 'english',
    sorter: {
      compare: (a, b) => a.english - b.english,
      multiple: 2
    }
  },
  {
    title: 'Chinese Score',
    dataIndex: 'chinese',
    sorter: {
      compare: (a, b) => a.chinese - b.chinese,
      multiple: 1
    }
  }
]

const basicData = [
  {
    key: '1',
    name: 'John',
    math: 77,
    english: 88,
    chinese: 99
  },
  {
    key: '2',
    name: 'Anne',
    math: 99,
    english: 77,
    chinese: 88
  },
  {
    key: '3',
    name: 'Will',
    math: 88,
    english: 99,
    chinese: 77
  }
]


export function MultipleSorterTable () {
  return (
    <Table
      columns={basicColumns}
      dataSource={basicData}
      title={() => 'Multiple Sorter'}
      options={false}
      search={false}
    />
  )
}
