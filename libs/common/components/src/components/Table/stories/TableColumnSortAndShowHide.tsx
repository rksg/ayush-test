import { Table, TableProps } from '..'

const basicColumns: TableProps<(typeof basicData)[0]>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    fixed: 'left'
  },
  {
    title: 'Distance',
    dataIndex: 'distance',
    key: 'distance',
    show: false
  },
  {
    title: 'Address 1',
    dataIndex: 'address',
    key: 'address',
    disable: true
  },
  {
    title: 'Address 2',
    dataIndex: 'address1',
    key: 'address1',
    show: false
  },
  {
    title: 'Address 3',
    dataIndex: 'address2',
    key: 'address2'
  },
  {
    title: 'Address 4',
    dataIndex: 'address3',
    key: 'address3'
  },
  {
    title: 'Address 5',
    dataIndex: 'address4',
    key: 'address4'
  },
  {
    title: 'Address 6',
    dataIndex: 'address5',
    key: 'address5'
  }
]

const basicData = [
  {
    key: '1',
    name: 'John Doe',
    age: 32,
    distance: 32,
    address: 'sample address',
    address1: 'sample address',
    address2: 'sample address',
    address3: 'sample address',
    address4: 'sample address',
    address5: 'sample address'
  },
  {
    key: '2',
    name: 'Jane Doe',
    age: 33,
    distance: 33,
    address: 'new address',
    address1: 'sample address',
    address2: 'sample address',
    address3: 'sample address',
    address4: 'sample address',
    address5: 'sample address'
  },
  {
    key: '3',
    name: 'Will Smith',
    age: 45,
    distance: 45,
    address: 'address',
    address1: 'sample address',
    address2: 'sample address',
    address3: 'sample address',
    address4: 'sample address',
    address5: 'sample address'
  }
]

export function TableColumnSortAndShowHide () {
  return (<>
    <p>Open Browser Debug Console to see updated state</p>
    <Table
      columns={basicColumns}
      dataSource={basicData}
      columnState={{
        // eslint-disable-next-line no-console
        onChange: (state) => console.log(JSON.stringify(state, null, 2)),
        defaultValue: {
          name: true,
          age: true,
          address: true,
          gg: true,
          address1: true,
          address2: true,
          address3: true,
          distance: true,
          address4: false,
          address5: true
        }
      }}
    />
  </>)
}
