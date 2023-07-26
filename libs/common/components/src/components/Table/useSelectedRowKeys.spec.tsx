import { render, within, findTBody } from '@acx-ui/test-utils'

import { Table, TableProps } from '.'

jest.mock('./useSelectedRowKeys', () => {
  return {
    useSelectedRowKeys: jest.fn(() => {
      const selectedRowKeys: unknown[] = []
      const setSelectedRowKeys = jest.fn()
      const selectedRows = [
        { key: '1', name: 'John Doe' },
        { key: '4', name: 'Jane Doe' }
      ]
      const setSelectedRows = jest.fn()
      const allRows: unknown[] = []
      const setAllRows = jest.fn()

      return [
        selectedRowKeys,
        setSelectedRowKeys,
        selectedRows,
        setSelectedRows,
        allRows,
        setAllRows
      ]
    })
  }
})

describe('Table component: mock useSelectedRowKeys', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('updates selected rows after the table data source changes', async () => {
    const columns = [{ title: 'Name', dataIndex: 'name', key: 'name' }]
    const data = [
      { key: '1', name: 'John Doe' },
      { key: '2', name: 'Jane Doe' },
      { key: '3', name: 'Will Smith' }
    ]

    const rowActions: TableProps<{ key: string, name: string }>['rowActions'] = [
      { label: 'Delete', onClick: (_selected, clear) => clear() }
    ]

    render(<Table
      columns={columns}
      dataSource={data}
      rowActions={rowActions}
      rowSelection={{ type: 'checkbox' }}
    />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    expect(await body.findByText(/john/i)).toBeVisible()
  })
})
