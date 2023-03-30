import { DownloadOutlined, MoreVertical } from '@acx-ui/icons'

import { Table, TableProps } from '..'

const basicColumns: TableProps<typeof basicData[0]>['columns'] = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age', width: 150, align: 'center' },
  { title: 'Address', dataIndex: 'address', key: 'address' }
]

const basicData = [
  { key: '1', name: 'John Doe', age: 32, address: 'sample address' },
  { key: '2', name: 'Jane Doe', age: 33, address: 'new address' }
]

export function TableWithIconButton () {
  return (<>
    Table With Icon Button
    <Table
      columns={basicColumns}
      dataSource={basicData}
      iconButton={{
        icon: <DownloadOutlined />,
        onClick: () => console.log('Icon Button Clicked!') // eslint-disable-line no-console
      }}
    />
    Table With Disabled Icon Button
    <Table
      columns={basicColumns}
      dataSource={basicData}
      iconButton={{
        icon: <DownloadOutlined />,
        disabled: true
      }}
    />
    Table With Icon Button with Menu
    <Table
      columns={basicColumns}
      dataSource={basicData}
      iconButton={{
        icon: <MoreVertical />,
        dropdownMenu: {
          items: [
            { key: 'item1', label: 'Item 1', onClick: () => console.log('Menu Item Clicked!') }, // eslint-disable-line no-console
            { key: 'item2', label: 'Item 2' },
            { key: 'item3', label: 'Item 3' }
          ]
        }
      }}
    />
  </>)
}
