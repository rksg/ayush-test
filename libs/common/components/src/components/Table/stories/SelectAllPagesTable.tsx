import { Table, TableProps } from '..'
import { showToast }         from '../../Toast'

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

const actions: TableProps<(typeof basicData)[0]>['rowActions'] = [
  {
    label: 'Edit',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Edit ${selectedRows.length} item(s)`
    })
  },
  {
    label: 'Delete',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Delete ${selectedRows.length} item(s)`
    })
  }
]

const getAllPagesData = () => {
  return basicData
}

export function SelectAllPagesTable () {
  return (<>
    Multi Select - Select data from all pages
    <Table
      columns={basicColumns}
      dataSource={basicData}
      rowActions={actions}
      rowSelection={{ defaultSelectedRowKeys: [] }}
      getAllPagesData={getAllPagesData}
    />
  </>)
}
