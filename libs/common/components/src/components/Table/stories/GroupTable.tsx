import React from 'react'

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
    searchable: true
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
    render: (text, _, __, highlightFn) => <u>{highlightFn(text as string)}</u>,
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
    address: 'sample address'
  },
  {
    key: '2',
    name: 'Jane Doe',
    givenName: 'Jane',
    surname: 'Doe',
    age: 33,
    description: 'Jane Doe living at new address',
    address: 'new address'
  },
  {
    key: '3',
    name: 'Jordan Doe',
    givenName: 'Jordan',
    surname: 'Doe',
    age: 33,
    description: '',
    address: 'another address'
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

export function GroupTable () {
  return (
    <>
    with selection:
      <Table<RecordType>
        columns={columns}
        rowActions={rowActions}
        dataSource={data}
        rowSelection={{ defaultSelectedRowKeys: [] }}
      />
    </>
  )
}
