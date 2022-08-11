import { Table, TableProps } from '..'
import { showToast }         from '../../Toast'

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
    name: 'Jane Doe',
    age: 33,
    address: 'new address'
  },
  {
    key: '3',
    name: 'Will Smith',
    age: 45,
    address: 'address'
  }
]

const actions: TableProps<(typeof basicData)[0]>['actions'] = [
  {
    label: 'Edit',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Edit ${selectedRows[0].name}`
    })
  },
  {
    label: 'Delete',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Delete ${selectedRows[0].name}`
    })
  },
  {
    label: 'Mute',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Mute ${selectedRows[0].name}`
    })
  }
]

export function SingleSelectTable () {
  return (<>
    Single Select
    <Table
      columns={basicColumns}
      dataSource={basicData}
      actions={actions}
      rowSelection={{ type: 'radio' }}
    />
  </>)
}
