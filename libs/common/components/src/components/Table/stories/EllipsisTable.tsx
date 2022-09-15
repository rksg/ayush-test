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
    key: 'distance'
  },
  {
    title: 'Address 1',
    dataIndex: 'address1',
    key: 'address1'
  },
  {
    title: 'Address 2',
    dataIndex: 'address2',
    key: 'address2'
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

export function EllipsisTable () {
  return (<>
    <p>
      With ellipsis set to true,
      &hellip; will appear when content is too long (affects all columns).
      Resize columns to see this effect.
    </p>
    <Table
      ellipsis
      columns={basicColumns}
      dataSource={basicData}
    />
  </>)
}
