import { omit }                    from 'lodash'
import { BrowserRouter as Router } from 'react-router-dom'

import { DownloadOutlined } from '@acx-ui/icons'

import { Table, TableProps } from '..'
import { showToast }         from '../../Toast'

export type RecordType = {
  key: string
  name: string
  givenName: string
  surname: string
  age: number
  description: string
  address: string,
  status: string,
  children?: RecordType[]
  hiredate?: string
}

export const columns: TableProps<RecordType>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    filterable: true,
    searchable: true,
    children: [{
      title: 'Given Name',
      dataIndex: 'givenName',
      key: 'givenName',
      searchable: true
    },{
      title: 'Surname',
      dataIndex: 'surname',
      key: 'surname',
      searchable: true
    }]
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    align: 'center',
    filterable: true
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    render: (_, { description }, __, highlightFn) => <u>{highlightFn(description)}</u>,
    searchable: true
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  }
]

const columnsFilterOnly: TableProps<RecordType>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    filterable: true
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    align: 'center',
    filterable: true
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    render: (_, { description }) => <u>{description}</u>
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]

const columnsSearchOnly: TableProps<RecordType>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    searchable: true
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    align: 'center'
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    render: (_, { description }, __, highlightFn) => <u>{highlightFn(description)}</u>,
    searchable: true
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    searchable: true
  }
]

const columnsCheckboxOnly: TableProps<RecordType>['columns'] = [
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
    title: 'Description',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    filterComponent: { type: 'checkbox', label: 'Show online users' },
    filterKey: 'status',
    defaultFilteredValue: [false],
    filterable: true,
    render: function (_, row) {
      return row.status === 'true' ? 'Online' : 'Offline'
    }
  }
]

const columnsWithRangepickerOnly: TableProps<RecordType>['columns'] = [
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
    title: 'Description',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  },
  {
    title: 'Date of Employment',
    dataIndex: 'hiredate',
    key: 'hiredate',
    align: 'center',
    filterable: true,
    filterKey: 'hiredate',
    filterMultiple: false,
    filterComponent: { type: 'rangepicker' }
  }
]

export const data: TableProps<RecordType>['dataSource'] = [
  {
    key: '1',
    name: 'John Doe',
    givenName: 'John',
    surname: 'Doe',
    age: 32,
    description: 'John Doe living at sample address',
    address: 'sample address',
    status: 'false',
    children: [
      {
        key: '1.1',
        name: 'Fred Mayers',
        givenName: 'Fred',
        surname: 'Mayers',
        age: 27,
        description: 'Fred Mayers is a good guy',
        address: 'Fred lives alone',
        status: 'true'
      }
    ]
  },
  {
    key: '2',
    name: 'Jane Doe',
    givenName: 'Jane',
    surname: 'Doe',
    age: 33,
    description: 'Jane Doe living at new address',
    address: 'new address',
    status: 'false',
    children: [
      {
        key: '2.1',
        name: 'Edna Tan',
        givenName: 'Edna',
        surname: 'Tan',
        description: 'just started work',
        age: 17,
        address: 'living in canada',
        status: 'false'
      },
      {
        key: '2.2',
        name: 'Will Smith',
        givenName: 'Will',
        surname: 'Smith',
        description: 'accomplished actor',
        age: 17,
        address: 'born and raised in us',
        status: 'true'
      }
    ]
  },
  {
    key: '3',
    name: 'Jordan Doe',
    givenName: 'Jordan',
    surname: 'Doe',
    age: 33,
    description: '',
    address: 'another address',
    status: 'true',
    children: [
      {
        key: '3.1',
        name: 'Dawn Soh',
        givenName: 'Dawn',
        surname: 'Soh',
        age: 22,
        description: 'Dawn just graduated college',
        address: 'none, had moved out of the dorm',
        status: 'false'
      },
      {
        key: '3.2',
        name: 'Edna Wee',
        givenName: 'Edna',
        surname: 'Wee',
        age: 22,
        description: 'Edna loves to run',
        address: 'living abroad in America',
        status: 'true'
      }
    ]
  },
  {
    key: '4',
    name: 'Sam Smith',
    givenName: 'Sam',
    surname: 'Smiths',
    age: 43,
    description: 'a great singer',
    address: 'mountain style',
    status: 'false'
  }
]


export const dataWithStatus: TableProps<RecordType>['dataSource'] = [
  {
    key: '1',
    name: 'John Doe',
    givenName: 'John',
    surname: 'Doe',
    age: 32,
    hiredate: '2023-09-25T03:40:15.052Z',
    description: 'John Doe living at sample address',
    address: 'sample address',
    status: 'false'
  },
  {
    key: '2',
    name: 'Jane Doe',
    givenName: 'Jane',
    surname: 'Doe',
    age: 33,
    hiredate: '2023-08-05T03:40:15.052Z',
    description: 'Jane Doe living at new address',
    address: 'new address',
    status: 'false'
  },
  {
    key: '3',
    name: 'Jordan Doe',
    givenName: 'Jordan',
    surname: 'Doe',
    age: 33,
    hiredate: '2023-09-03T03:40:15.052Z',
    description: '',
    address: 'another address',
    status: 'true'
  },
  {
    key: '4',
    name: 'Sam Smith',
    givenName: 'Sam',
    surname: 'Smiths',
    age: 43,
    hiredate: '2023-08-15T03:40:15.052Z',
    description: 'a great singer',
    address: 'mountain style',
    status: 'false'
  }
]

const rowActions: TableProps<(typeof data)[0]>['rowActions'] = [
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

export function FilteredTable () {
  return <>
    with selection:
    <Table<RecordType>
      columns={columns}
      rowActions={rowActions}
      dataSource={data}
      rowSelection={{ defaultSelectedRowKeys: [] }}
      iconButton={{
        icon: <DownloadOutlined />,
        onClick: () => console.log('Icon Button Clicked!') // eslint-disable-line no-console
      }}
    />
    without selection:
    <Table<RecordType>
      columns={columns}
      dataSource={data}
    />
    without children:
    <Table<RecordType>
      columns={columns}
      rowActions={rowActions}
      dataSource={data!.map(row => omit(row, 'children'))}
      rowSelection={{ defaultSelectedRowKeys: [] }}
    />
    with filter only:
    <Table<RecordType>
      columns={columnsFilterOnly}
      dataSource={data}
    />
    with search only:
    <Table<RecordType>
      columns={columnsSearchOnly}
      dataSource={data}
    />
    with highlight only (no search):
    <Table<RecordType>
      columns={columnsSearchOnly}
      dataSource={data}
      highLightValue='John Doe'
    />
    with Checkbox only:
    <Table<RecordType>
      columns={columnsCheckboxOnly}
      dataSource={dataWithStatus}
    />
    with Range Picker only:
    <Router>
      <Table<RecordType>
        columns={columnsWithRangepickerOnly}
        dataSource={dataWithStatus}
      />
    </Router>
    with persistent filter only:
    <Router>
      <Table<RecordType>
        settingsId={'storybook-demo'}
        columns={columnsFilterOnly}
        dataSource={dataWithStatus}
        filterPersistence={true}
      />
    </Router>
  </>
}
