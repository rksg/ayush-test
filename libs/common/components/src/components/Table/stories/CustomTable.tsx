import { Badge } from 'antd'

import { Table } from '..'

function CustomColumn (color: string, text: string | number) {
  return <Badge color={color} text={text} />
}

const customColumns = [
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
  },
  {
    title: 'Events',
    dataIndex: 'events',
    key: 'events'
  }
]

const customData = [
  {
    key: '1',
    name: 'John Doe',
    age: 32,
    address: 'sample address',
    events: CustomColumn('var(--acx-semantics-red-50)', 1)
  },
  {
    key: '2',
    name: 'Jane Doe',
    age: 33,
    address: 'new address',
    events: CustomColumn('var(--acx-semantics-green-50)', 'new')
  }
]

export function CustomTable () {
  return (
    <Table
      columns={customColumns}
      dataSource={customData}
      title={() => 'With Custom Cell'}
      options={false}
      search={false}
    />
  )
}
