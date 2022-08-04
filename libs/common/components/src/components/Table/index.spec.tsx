import '@testing-library/jest-dom'
import { render, fireEvent, screen, within } from '@acx-ui/test-utils'

import { Table, TableProps } from '.'

jest.mock('@acx-ui/icons', ()=> ({
  CancelCircle: () => <div data-testid='cancel-circle'/>
}), { virtual: true })


describe('Table component', () => {
  it('should render correctly', () => {
    const basicColumns = [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Age', dataIndex: 'age', key: 'age' },
      { title: 'Address', dataIndex: 'address', key: 'address' }
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
    const { asFragment } = render(<Table
      columns={basicColumns}
      dataSource={basicData}
      title={() => 'Basic'}
    />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render multi select table and render action buttons correctly', async () => {
    const columns = [
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
    const data = [
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

    const [onEdit, onDelete] = [jest.fn(), jest.fn()]
    const actions = [
      { label: 'Edit', onClick: onEdit },
      { label: 'Delete', onClick: onDelete }
    ]

    const { asFragment } = render(<Table
      columns={columns}
      dataSource={data}
      actions={actions}
      title={() => 'Selectable'}
      rowSelection={{ defaultSelectedRowKeys: [] }}
    />)
    expect(asFragment()).toMatchSnapshot()

    const row1 = await screen.findByRole('row', { name: /john/i })
    const row2 = await screen.findByRole('row', { name: /jane/i })
    fireEvent.click(within(row1).getByRole('checkbox'))
    fireEvent.click(within(row2).getByRole('checkbox'))

    expect(asFragment()).toMatchSnapshot()

    const closeButton = screen.getByRole('button', { name: 'Clear selection' })
    const editButton = screen.getByRole('button', { name: /edit/i })
    const deleteButton = screen.getByRole('button', { name: /delete/i })

    expect(closeButton).toBeVisible()
    expect(editButton).toBeVisible()
    expect(deleteButton).toBeVisible()

    expect(onEdit).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()

    fireEvent.click(editButton)
    expect(onEdit).toBeCalledWith(data.slice(0, 2), expect.anything())

    fireEvent.click(deleteButton)
    expect(onDelete).toBeCalledWith(data.slice(0, 2), expect.anything())

    fireEvent.click(closeButton)
    expect(closeButton).not.toBeVisible()
    expect(editButton).not.toBeVisible()
    expect(deleteButton).not.toBeVisible()

    expect(asFragment()).toMatchSnapshot()
  })

  it('allow action to clear selection', async () => {
    const columns = [{ title: 'Name', dataIndex: 'name', key: 'name' }]
    const data = [
      { key: '1', name: 'John Doe' },
      { key: '2', name: 'Jane Doe' },
      { key: '3', name: 'Will Smith' }
    ]

    const actions: TableProps<{ key: string, name: string }>['actions'] = [
      { label: 'Delete', onClick: (selected, clear) => clear() }
    ]

    render(<Table
      columns={columns}
      dataSource={data}
      actions={actions}
      rowSelection={{ defaultSelectedRowKeys: ['1', '2'] }}
    />)

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    const before = (await body.findAllByRole('checkbox')) as HTMLInputElement[]
    expect(before.filter(el => el.checked)).toHaveLength(2)
    expect(before.filter(el => !el.checked)).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    const after = (await body.findAllByRole('checkbox')) as HTMLInputElement[]
    expect(after.filter(el => el.checked)).toHaveLength(0)
    expect(after.filter(el => !el.checked)).toHaveLength(3)
  })

  it('single select row click', async () => {
    const columns = [{ title: 'Name', dataIndex: 'name', key: 'name' }]
    const data = [
      { key: '1', name: 'John Doe' },
      { key: '2', name: 'Jane Doe' },
      { key: '3', name: 'Will Smith' }
    ]

    render(<Table
      columns={columns}
      dataSource={data}
      rowSelection={{ type: 'radio' }}
    />)

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('Jane Doe'))
    const selectedRow = (await body.findAllByRole('radio')) as HTMLInputElement[]
    expect(selectedRow.filter(el => el.checked)).toHaveLength(1)
  })

  it('multible select row click', async () => {
    const columns = [{ title: 'Name', dataIndex: 'name', key: 'name' }]
    const data = [
      { key: '1', name: 'John Doe' },
      { key: '2', name: 'Jane Doe' },
      { key: '3', name: 'Will Smith' }
    ]

    render(<Table
      columns={columns}
      dataSource={data}
      rowSelection={{ defaultSelectedRowKeys: ['1', '3'] }}
    />)

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('Jane Doe'))
    const selectedRows = (await body.findAllByRole('checkbox')) as HTMLInputElement[]
    expect(selectedRows.filter(el => el.checked)).toHaveLength(3)
    fireEvent.click(await body.findByText('Will Smith'))
    expect(selectedRows.filter(el => el.checked)).toHaveLength(2)
  })
})
