import '@testing-library/jest-dom'
import { render, fireEvent, screen, within } from '@acx-ui/test-utils'

import { Table, TableProps } from '.'

jest.mock('@acx-ui/icons', ()=> ({
  CancelCircle: () => <div data-testid='cancel-circle'/>,
  InformationOutlined: () => <div data-testid='information-outlined'/>,
  SettingsOutlined: () => <div data-testid='settings-outlined'/>
}), { virtual: true })

jest.mock('react-resizable', () => ({
  Resizable: jest.fn().mockImplementation((props) => {
    return <td><div
      data-testid='react-resizable'
      onMouseDown={()=>{
        props.onResize(null, { size: { width: 99 } })
      // eslint-disable-next-line testing-library/no-node-access
      }}/>{props.children}</td>
  })
}))

describe('Table component', () => {
  const basicColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age', tooltip: 'tooltip' },
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
  it('should render correctly', () => {
    const { asFragment } = render(<Table
      columns={basicColumns}
      dataSource={basicData}
    />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders compact table', () => {
    const { asFragment } = render(<Table
      type='compact'
      columns={basicColumns}
      dataSource={basicData}
    />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render multi select table and render action buttons correctly', async () => {
    const [onEdit, onDelete] = [jest.fn(), jest.fn()]
    const actions = [
      { label: 'Edit', onClick: onEdit },
      { label: 'Delete', onClick: onDelete }
    ]

    const { asFragment } = render(<Table
      columns={basicColumns}
      dataSource={basicData}
      actions={actions}
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
    expect(onEdit).toBeCalledWith(basicData.slice(0, 2), expect.anything())

    fireEvent.click(deleteButton)
    expect(onDelete).toBeCalledWith(basicData.slice(0, 2), expect.anything())

    fireEvent.click(closeButton)
    expect(closeButton).not.toBeVisible()
    expect(editButton).not.toBeVisible()
    expect(deleteButton).not.toBeVisible()

    expect(asFragment()).toMatchSnapshot()
  })

  it('allow action to clear selection', async () => {
    const actions: TableProps<{ key: string, name: string }>['actions'] = [
      { label: 'Delete', onClick: (selected, clear) => clear() }
    ]

    render(<Table
      columns={basicColumns}
      dataSource={basicData}
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

  it('updates selected rows when selectedRowKeys changed', async () => {
    const columns = [{ title: 'Name', dataIndex: 'name', key: 'name' }]
    const data = [
      { key: '1', name: 'John Doe' },
      { key: '2', name: 'Jane Doe' },
      { key: '3', name: 'Will Smith' }
    ]

    const actions: TableProps<{ key: string, name: string }>['actions'] = [
      { label: 'Delete', onClick: (selected, clear) => clear() }
    ]

    const { rerender } = render(<Table
      columns={columns}
      dataSource={data}
      actions={actions}
      rowSelection={{ selectedRowKeys: ['1', '2'] }}
    />)

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    const before = (await body.findAllByRole('checkbox')) as HTMLInputElement[]
    expect(before.filter(el => el.checked)).toHaveLength(2)
    expect(before.filter(el => !el.checked)).toHaveLength(1)

    rerender(<Table
      columns={columns}
      dataSource={data}
      actions={actions}
      rowSelection={{ selectedRowKeys: ['1'] }}
    />)

    const after = (await body.findAllByRole('checkbox')) as HTMLInputElement[]
    expect(after.filter(el => el.checked)).toHaveLength(1)
    expect(after.filter(el => !el.checked)).toHaveLength(2)
  })

  it('row click for table without rowSelection does nothing', async () => {
    const columns = [{ title: 'Name', dataIndex: 'name', key: 'name' }]
    const data = [
      { key: '1', name: 'John Doe' },
      { key: '2', name: 'Jane Doe' },
      { key: '3', name: 'Will Smith' }
    ]

    render(<Table
      columns={columns}
      dataSource={data}
    />)

    fireEvent.click(await screen.findByText('Jane Doe'))
  })

  it('single select row click', async () => {
    render(<Table
      columns={basicColumns}
      dataSource={basicData}
      rowSelection={{ type: 'radio' }}
    />)

    const tbody = (await screen.findAllByRole('rowgroup'))
      .find(element => element.classList.contains('ant-table-tbody'))!

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('Jane Doe'))
    // to ensure it doesn't get unselected
    fireEvent.click(await body.findByText('Jane Doe'))
    const selectedRow = (await body.findAllByRole('radio')) as HTMLInputElement[]
    expect(selectedRow.filter(el => el.checked)).toHaveLength(1)
  })

  it('multible select row click', async () => {
    render(<Table
      columns={basicColumns}
      dataSource={basicData}
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

  it('dynamically scales based on scroll prop', () => {
    const basicColumns = [
      { title: 'Name', key: 'name' },
      { title: 'Age', key: 'age' },
      { title: 'Address', key: 'address' }
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
    const scroll = { y: 'max-content' }
    const { asFragment } = render(<Table
      columns={basicColumns}
      dataSource={basicData}
      scroll={scroll}
    />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should allow column resizing', async () => {
    const { asFragment } = render(<Table
      columns={basicColumns}
      dataSource={basicData}
    />)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('col')?.style.width).toBe('')
    fireEvent.mouseDown((await screen.findAllByTestId('react-resizable'))[0])
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('col')?.style.width).toBe('99px')
  })

  describe('search & filter', () => {
    const filteredColumns = [
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
        filterable: true
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        searchable: true
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        searchable: true
      }
    ]
  
    const filteredData = [
      {
        key: '1',
        name: 'John Doe',
        age: 32,
        description: 'John Doe living at sample address',
        address: 'sample address',
        children: [
          {
            key: '1.1',
            name: 'Fred Mayers',
            age: 27,
            description: 'Fred Mayers is a good guy',
            address: 'Fred lives alone'
          }
        ]
      },
      {
        key: '2',
        name: 'Jane Doe',
        age: 33,
        description: 'Jane Doe living at new address',
        address: 'new address'
      },
      {
        key: '3',
        name: 'Jordan Doe',
        age: 33,
        description: '',
        address: 'another address',
        children: [
          {
            key: '3.1',
            name: 'Dawn Soh',
            age: 22,
            description: 'Dawn just graduated college',
            address: 'none, had moved out of the dorm'
          },
          {
            key: '3.2',
            name: 'Edna Wee',
            age: 22,
            description: 'Edna loves to run',
            address: 'living abroad in America'
          }
        ]
      }
    ]
  
    it('search input with terms', async () => {
      render(<Table 
        columns={filteredColumns}
        dataSource={filteredData}
        rowSelection={{ selectedRowKeys: [] }}
      />)
      const validSearchTerm = 'John Doe'
      const input = await screen.findByPlaceholderText('Search Name, Description, Address')
      fireEvent.change(input, { target: { value: validSearchTerm } })
      
      expect(await screen.findAllByText(validSearchTerm)).toHaveLength(2)
  
      const childSearchTerm = 'edna'
      fireEvent.change(input, { target: { value: childSearchTerm } })
      expect(await screen.findAllByText('Jordan Doe')).toHaveLength(1)

      const buttons = await screen.findAllByRole('button')
      expect(buttons).toHaveLength(4)
      fireEvent.click(buttons[0])

      expect(await screen.findAllByRole('checkbox')).toHaveLength(4)
    })
  
    it('filtering inputs & searching', async () => {
      render(<Table 
        columns={filteredColumns}
        dataSource={filteredData}
        rowSelection={{ selectedRowKeys: [] }}
      />)

      const tbody = (await screen.findAllByRole('rowgroup'))
        .find(element => element.classList.contains('ant-table-tbody'))!

      expect(tbody).toBeVisible()
      const body = within(tbody)
      const before = 
        (await body.findAllByRole('checkbox', { hidden: false })) as HTMLInputElement[]
      expect(before).toHaveLength(3)

      const filters = await screen.findAllByRole('combobox', { hidden: true, queryFallbacks: true })
      expect(filters).toHaveLength(2)

      const nameFilter = filters[0]
      fireEvent.keyDown(nameFilter, { key: 'John Doe', code: 'John Doe' })

      const testId = 'option-John Doe'
      const johnDoeOptions = await screen.findAllByTestId(testId)

      expect(johnDoeOptions).toHaveLength(1)
      fireEvent.click(johnDoeOptions[0])
      
      const after = 
        (await body.findAllByRole('checkbox', { hidden: false })) as HTMLInputElement[]
      expect(after).toHaveLength(1)
      expect(await screen.findByRole('img', { name: 'check', hidden: true }))
        .toBeInTheDocument()
    })
  })
})
