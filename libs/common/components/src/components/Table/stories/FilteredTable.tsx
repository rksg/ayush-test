import { omit } from 'lodash'

import { DownloadOutlined } from '@acx-ui/icons'

import { Table, TableProps } from '..'
import { showToast }         from '../../Toast'

type RecordType = {
  key: string
  name: string
  givenName: string
  surname: string
  age: number
  description: string
  address: string,
  children?: RecordType[]
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

export const data: TableProps<RecordType>['dataSource'] = [
  {
    key: '1',
    name: 'John Doe',
    givenName: 'John',
    surname: 'Doe',
    age: 32,
    description: 'John Doe living at sample address',
    address: 'sample address',
    children: [
      {
        key: '1.1',
        name: 'Fred Mayers',
        givenName: 'Fred',
        surname: 'Mayers',
        age: 27,
        description: 'Fred Mayers is a good guy',
        address: 'Fred lives alone'
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
    children: [
      {
        key: '2.1',
        name: 'Edna Tan',
        givenName: 'Edna',
        surname: 'Tan',
        description: 'just started work',
        age: 17,
        address: 'living in canada'
      },
      {
        key: '2.2',
        name: 'Will Smith',
        givenName: 'Will',
        surname: 'Smith',
        description: 'accomplished actor',
        age: 17,
        address: 'born and raised in us'
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
    children: [
      {
        key: '3.1',
        name: 'Dawn Soh',
        givenName: 'Dawn',
        surname: 'Soh',
        age: 22,
        description: 'Dawn just graduated college',
        address: 'none, had moved out of the dorm'
      },
      {
        key: '3.2',
        name: 'Edna Wee',
        givenName: 'Edna',
        surname: 'Wee',
        age: 22,
        description: 'Edna loves to run',
        address: 'living abroad in America'
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
    address: 'mountain style'
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
  </>
}
