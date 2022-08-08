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
    dataIndex: 'address1',
    key: 'address1',
    disable: true
  },
  {
    title: 'Address 2',
    dataIndex: 'address2',
    key: 'address2',
    show: false
  },
  {
    title: 'Address 3',
    dataIndex: 'address3',
    key: 'address3'
  },
  {
    title: 'Address 4',
    dataIndex: 'address4',
    key: 'address4'
  },
  {
    title: 'Address 5',
    dataIndex: 'address5',
    key: 'address5'
  },
  {
    title: 'Address 6',
    dataIndex: 'address6',
    key: 'address6'
  }
]

const basicData = [
  {
    key: '1',
    name: 'John Doe',
    age: 32,
    distance: 32,
    address1: 'sample address',
    address2: 'sample address',
    address3: 'sample address',
    address4: 'sample address',
    address5: 'sample address',
    address6: 'sample address'
  },
  {
    key: '2',
    name: 'Jane Doe',
    age: 33,
    distance: 33,
    address1: 'new address',
    address2: 'sample address',
    address3: 'sample address',
    address4: 'sample address',
    address5: 'sample address',
    address6: 'sample address'
  },
  {
    key: '3',
    name: 'Will Smith',
    age: 45,
    distance: 45,
    address1: 'address',
    address2: 'sample address',
    address3: 'sample address',
    address4: 'sample address',
    address5: 'sample address',
    address6: 'sample address'
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
          address1: true,
          address2: true,
          address3: true,
          address4: true,
          distance: true,
          address5: false,
          address6: true
        }
      }}
    />
  </>)
}
