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
  },
  {
    title: 'Children',
    key: 'children',
    children: [
      { title: 'Child 1', key: 'child1', dataIndex: 'child1', width: 100 },
      { title: 'Child 2', key: 'child2', dataIndex: 'child2', width: 100 }
    ]
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
    child1: 'Sample one',
    child2: 'Sample two',
    events: CustomColumn('var(--acx-semantics-red-50)', 1)
  },
  {
    key: '2',
    name: 'Jane Doe',
    age: 33,
    address: 'new address',
    child1: 'Sample three',
    child2: 'Sample four',
    events: CustomColumn('var(--acx-semantics-green-50)', 'new')
  }
]

export function CustomTable () {
  return (<>
    Customizations
    <Table
      columns={customColumns}
      dataSource={customData}
    />
  </>)
}
