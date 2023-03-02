import { Badge } from 'antd'

import { Table, TableProps } from '..'
import { showToast }         from '../../Toast'

function CustomColumn (color: string, text: string | number) {
  return <Badge color={color} text={text} />
}

const customColumns: TableProps<typeof customData[0]>['columns'] = [
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
    width: 150,
    align: 'center'
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
    dataIndex: 'children',
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

const rowActions: TableProps<(typeof customData)[0]>['rowActions'] = [{
  label: 'Delete',
  disabled: (rows) => rows.length > 1,
  tooltip: (rows) => rows.length > 1 ? 'Cannot delete' : undefined,
  onClick: () => {}
}]

export function CustomTable () {
  return (<>
    Customizations
    <Table
      columns={customColumns}
      dataSource={customData}
      rowActions={rowActions}
      rowSelection={{
        type: 'checkbox'
      }}
      actions={[{
        label: 'Add Item',
        onClick: () => showToast({ type: 'info', content: 'Add Item Clicked' })
      }, {
        label: 'Add Other Item',
        disabled: true,
        tooltip: 'test tooltip',
        onClick: () => showToast({ type: 'info', content: 'Add Other Item Clicked' })
      }, {
        label: 'Open Dropdown',
        onClick: () => showToast({ type: 'info', content: 'This Toast Should Not Show Up' }),
        dropdownMenu: {
          onClick: () => showToast({ type: 'info', content: 'Dropdown Item Clicked' }),
          items: [
            { key: 'item1', label: 'Item 1' },
            { key: 'item2', label: 'Item 2', disabled: true },
            { type: 'divider' },
            { key: 'item3', label: 'Item 3' }
          ]
        }
      },
      {
        label: 'Open other Dropdown',
        disabled: true,
        dropdownMenu: {
          items: [
            { key: 'item1', label: 'Item 1' },
            { key: 'item2', label: 'Item 2' },
            { key: 'item3 ', label: 'Item 3' }
          ]
        }
      }]}
    />
  </>)
}
