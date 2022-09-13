import { Table }     from '..'
import { showToast } from '../../Toast'

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
      actions={[{
        label: 'Add Item',
        onClick: () => showToast({ type: 'info', content: 'Add Item Clicked' })
      }, {
        label: 'Add Other Item',
        onClick: () => showToast({ type: 'info', content: 'Add Other Item Clicked' })
      }]}
    />
  </>)
}
