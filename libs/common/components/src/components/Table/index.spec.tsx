import '@testing-library/jest-dom'
import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import { render, fireEvent, screen, within, mockDOMSize, findTBody, waitFor } from '@acx-ui/test-utils'

import { columns as filteredColumns, data as filteredData } from './stories/FilteredTable'

import { Table, TableProps } from '.'

jest.mock('react-resizable', () => ({
  Resizable: jest.fn().mockImplementation((props) => (
    // eslint-disable-next-line testing-library/no-node-access
    require('react').cloneElement(props.children, {
      'data-testid': 'react-resizable',
      'onMouseDown': () => {
        props.onResizeStart()
        props.onResize(null, { size: { width: 99 } })
      }
    })
  ))
}))

type TestRow = {
  key: string,
  name: string,
  age: number,
  address: string,
  isFirstLevel?: boolean
}

describe('Table component', () => {
  const testColumns: TableProps<TestRow>['columns'] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age', tooltip: 'tooltip' },
    { title: 'Address', dataIndex: 'address', key: 'address' }
  ]
  const testData = [
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
      columns={testColumns}
      dataSource={testData}
    />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should only render pagination when total items exceeds default page size', async () => {
    const props: TableProps<TestRow> = {
      columns: testColumns,
      dataSource: testData,
      pagination: { total: 11 }
    }
    const { rerender } = render(<Table {...props} />)
    const pagination = await screen.findByRole('listitem', { name: /1/i })
    expect(pagination).toBeVisible()

    rerender(<Table {...props} pagination={{ total: 9 }} />)
    expect(screen.queryByRole('listitem', { name: /1/i })).toBeNull()
  })

  it('should only render pagination when dataSource length exceeds default page size', async () => {
    const props: TableProps<TestRow> = {
      columns: testColumns,
      dataSource: testData,
      pagination: { defaultPageSize: 2 }
    }
    const { rerender } = render(<Table {...props} />)
    const pagination = await screen.findByRole('listitem', { name: /1/i })
    expect(pagination).toBeVisible()

    rerender(<Table {...props} pagination={{ defaultPageSize: 10 }} />)
    expect(screen.queryByRole('listitem', { name: /1/i })).toBeNull()
  })

  it('should not render pagination when dataSource is undefined', async () => {
    const props: TableProps<TestRow> = { columns: testColumns }
    render(<Table {...props} />)
    expect(screen.queryByRole('listitem', { name: /1/i })).toBeNull()
  })

  it('renders compact table', () => {
    const { asFragment } = render(<Table
      type='compact'
      columns={testColumns}
      dataSource={testData}
    />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders form table', () => {
    const { asFragment } = render(<Table
      type='form'
      columns={testColumns}
      dataSource={testData}
    />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders no selected bar table', async () => {
    const props: TableProps<TestRow> = {
      columns: testColumns,
      dataSource: testData,
      rowSelection: {
        type: 'radio',
        defaultSelectedRowKeys: ['1']
      }
    }
    const { rerender } = render(<Table {...props} />)
    const alert = await screen.findByRole('alert')

    expect(alert).toBeVisible()
    rerender(<Table {...props} tableAlertRender={false} />)
    expect(alert).not.toBeVisible()
  })

  it('renders table with ellipsis column', async () => {
    const columns = testColumns.map((column, i) => {
      column = { ...column }
      if (i === 0) {
        column.ellipsis = true
      } else if (i === 1) {
        column.width = 100
      }
      return column
    })
    render(<Table
      columns={columns}
      dataSource={testData}
    />)
    const table = screen.getByRole('table')
    expect(table).toHaveStyle('width: 100%')
    expect(table).toHaveStyle('table-layout: fixed')
  })

  it('should render multi select table and render action buttons correctly', async () => {
    const [onEdit, onDelete] = [jest.fn(), jest.fn()]
    const rowActions = [
      { label: 'Edit', onClick: onEdit },
      { label: 'Delete', onClick: onDelete }
    ]

    const { asFragment } = render(<Table
      columns={testColumns}
      dataSource={testData}
      rowActions={rowActions}
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
    expect(onEdit).toBeCalledWith(testData.slice(0, 2), expect.anything())

    fireEvent.click(deleteButton)
    expect(onDelete).toBeCalledWith(testData.slice(0, 2), expect.anything())

    fireEvent.click(closeButton)
    expect(closeButton).not.toBeVisible()
    expect(editButton).not.toBeVisible()
    expect(deleteButton).not.toBeVisible()

    expect(asFragment()).toMatchSnapshot()
  })

  it('allow action to clear selection', async () => {
    const rowActions: TableProps<TestRow>['rowActions'] = [
      { label: 'Delete', onClick: (_selected, clear) => clear() }
    ]

    render(<Table
      columns={testColumns}
      dataSource={testData}
      rowActions={rowActions}
      rowSelection={{ defaultSelectedRowKeys: ['1', '2'] }}
    />)

    const tbody = await findTBody()

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

    const rowActions: TableProps<{ key: string, name: string }>['rowActions'] = [
      { label: 'Delete', onClick: (_selected, clear) => clear() }
    ]

    const { rerender } = render(<Table
      columns={columns}
      dataSource={data}
      rowActions={rowActions}
      rowSelection={{ selectedRowKeys: ['1', '2'] }}
    />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    const before = (await body.findAllByRole('checkbox')) as HTMLInputElement[]
    expect(before.filter(el => el.checked)).toHaveLength(2)
    expect(before.filter(el => !el.checked)).toHaveLength(1)

    rerender(<Table
      columns={columns}
      dataSource={data}
      rowActions={rowActions}
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
    const onChange = jest.fn()
    render(<Table
      columns={testColumns}
      dataSource={testData}
      rowSelection={{ type: 'radio', onChange }}
    />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText(testData[1].name))
    // to ensure it doesn't get unselected
    fireEvent.click(await body.findByText(testData[1].name))
    const selectedRow = (await body.findAllByRole('radio')) as HTMLInputElement[]
    expect(selectedRow.filter(el => el.checked)).toHaveLength(1)
    expect(onChange).toBeCalledTimes(1)
  })

  it('single select disabled row click', async () => {
    render(<Table
      columns={testColumns}
      dataSource={testData}
      rowSelection={{
        type: 'radio',
        getCheckboxProps: () => ({
          disabled: true
        })
      }}
    />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('Jane Doe'))
    // to ensure it doesn't get unselected
    fireEvent.click(await body.findByText('Jane Doe'))
    const selectedRow = (await body.findAllByRole('radio')) as HTMLInputElement[]
    expect(selectedRow.filter(el => el.checked)).toHaveLength(0)
  })

  it('multiple select row click', async () => {
    const onChange = jest.fn()
    render(<Table
      columns={testColumns}
      dataSource={testData}
      rowSelection={{ defaultSelectedRowKeys: ['1', '3'], onChange }}
    />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText('Jane Doe'))
    const selectedRows = (await body.findAllByRole('checkbox')) as HTMLInputElement[]
    expect(selectedRows.filter(el => el.checked)).toHaveLength(3)
    fireEvent.click(await body.findByText('Will Smith'))
    expect(selectedRows.filter(el => el.checked)).toHaveLength(2)
    expect(onChange).toBeCalledTimes(2)
  })

  it('Repeated key data: rowKey funciton single select row click', async () => {
    const treeData = [
      { key: '1',
        name: 'John Doe',
        age: 32,
        address: 'sample address',
        isFirstLevel: true,
        children: [
          {
            key: '1',
            name: 'Will Smith',
            age: 32,
            address: 'sample address',
            isFirstLevel: false
          }
        ]
      },
      { key: '2',
        name: 'Jane Doe',
        age: 32,
        address: 'sample address',
        isFirstLevel: true
      }
    ]
    const onChange = jest.fn()
    render(<Table
      columns={testColumns}
      dataSource={treeData}
      rowKey={(record)=> record.key + (!record.isFirstLevel ? 'child' : '')}
      rowSelection={{ type: 'radio', onChange }}
    />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const body = within(tbody)
    fireEvent.click(await body.findByText(testData[1].name))
    // to ensure it doesn't get unselected
    fireEvent.click(await body.findByText(testData[1].name))
    const selectedRow = (await body.findAllByRole('radio')) as HTMLInputElement[]
    expect(selectedRow.filter(el => el.checked)).toHaveLength(1)
    expect(onChange).toBeCalledTimes(1)
  })

  it('calls onResetState', async () => {
    const reset = jest.fn()
    render(<Table
      columns={testColumns}
      dataSource={testData}
      extraSettings={[<div>setting element</div>]}
      onResetState={reset}
    />)
    fireEvent.click(await screen.findByTestId('SettingsOutlined'))
    await screen.findByText('setting element')
    fireEvent.click(await screen.findByText('Reset to default'))
    expect(reset).toHaveBeenCalled()
  })

  it('should allow column resizing', async () => {
    mockDOMSize(99, 800)
    const { asFragment } = render(<Table
      columns={testColumns}
      dataSource={testData}
    />)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('col')?.style.width).toBe('')
    await userEvent.click((await screen.findAllByTestId('react-resizable'))[0])
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('col')?.style.width).toBe('99px')
  })

  it('renders action items', async () => {
    const actions = [
      { label: 'Action 1', onClick: jest.fn() },
      { label: 'Action 2', onClick: jest.fn() }
    ]

    render(<Table
      actions={actions}
      columns={testColumns}
      dataSource={testData}
    />)

    const action1 = await screen.findByRole('button', { name: actions[0].label })
    expect(action1).toBeVisible()
    expect(actions[0].onClick).not.toBeCalled()
    fireEvent.click(action1)
    expect(actions[0].onClick).toBeCalled()
  })

  it('renders action dropdown', async () => {
    const actions = [
      { label: 'Action 1', onClick: jest.fn() },
      { label: 'Action 2', onClick: jest.fn() },
      {
        label: 'Action 3',
        onClick: jest.fn(),
        dropdownMenu: {
          onClick: jest.fn(),
          items: [{ key: 'item1', label: 'Item 1', onClick: jest.fn() }]
        }
      }
    ]

    render(<Table
      actions={actions}
      columns={testColumns}
      dataSource={testData}
    />)

    const dropdown = await screen.findByRole('button', { name: actions[2].label })
    expect(dropdown).toBeVisible()
    expect(actions[2].onClick).not.toBeCalled()
    fireEvent.click(dropdown)
    expect(actions[2].onClick).not.toBeCalled()

    const dropdownItem = await screen.findByText('Item 1')
    expect(actions[2].dropdownMenu?.onClick).not.toBeCalled()
    expect(actions[2].dropdownMenu?.items[0].onClick).not.toBeCalled()
    fireEvent.click(dropdownItem)
    expect(actions[2].dropdownMenu?.onClick).toBeCalled()
    expect(actions[2].dropdownMenu?.items[0].onClick).toBeCalled()
  })

  it('renders disabled action items', async () => {
    const actions = [
      { label: 'Action 1', disabled: true, onClick: jest.fn() },
      { label: 'Action 2', disabled: true, tooltip: 'can not action', onClick: jest.fn() }
    ]

    render(<Table
      actions={actions}
      columns={testColumns}
      dataSource={testData}
    />)

    const action1 = await screen.findByRole('button', { name: actions[0].label })
    expect(action1).toBeVisible()
    expect(actions[0].onClick).not.toBeCalled()
    const action2 = await screen.findByRole('button', { name: actions[1].label })
    fireEvent.mouseOver(action2)
    await waitFor(() => {
      expect(screen.getByRole('tooltip').textContent).toBe('can not action')
    })
  })

  it('hides rowAction when visible == false', async () => {
    const [onEdit, onDelete] = [jest.fn(), jest.fn()]
    const Component = () => {
      const [visible, setVisible] = useState(true)
      const rowActions = [
        { label: 'Edit', onClick: onEdit, visible },
        { label: 'Delete', onClick: onDelete }
      ]

      return <>
        <button onClick={() => setVisible(false)}>show</button>
        <Table
          columns={testColumns}
          dataSource={testData}
          rowActions={rowActions}
          rowSelection={{ defaultSelectedRowKeys: ['1'] }}
        />
      </>
    }

    render(<Component />)


    const editButton = screen.getByRole('button', { name: /edit/i })
    expect(editButton).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'show' }))
    expect(editButton).not.toBeVisible()
  })

  it('hides rowAction when visible(items) == false', async () => {
    const [onEdit, onDelete] = [jest.fn(), jest.fn()]
    const rowActions: TableProps<TestRow>['rowActions'] = [
      { label: 'Edit', onClick: onEdit, visible: (items) => items.length === 1 },
      { label: 'Delete', onClick: onDelete }
    ]

    render(<Table
      columns={testColumns}
      dataSource={testData}
      rowActions={rowActions}
      rowSelection={{ }}
    />)

    const row1 = await screen.findByRole('row', { name: /john/i })
    fireEvent.click(within(row1).getByRole('checkbox'))
    const editButton = screen.getByRole('button', { name: /edit/i })
    expect(editButton).toBeVisible()
    const row2 = await screen.findByRole('row', { name: /jane/i })
    fireEvent.click(within(row2).getByRole('checkbox'))
    expect(editButton).not.toBeVisible()
  })

  it('disabled row action button and add tooltip', async () => {
    const [onEdit, onDelete, onBackup] = [jest.fn(), jest.fn(), jest.fn()]
    const rowActions: TableProps<TestRow>['rowActions'] = [
      { label: 'Edit', onClick: onEdit },
      { label: 'Delete', onClick: onDelete, disabled: true, tooltip: 'can not delete' },
      { label: 'Backup', onClick: onBackup,
        disabled: (rows) => rows.length !== 1, tooltip: 'can not backup' }
    ]

    render(<Table
      columns={testColumns}
      dataSource={testData}
      rowActions={rowActions}
      rowSelection={{ }}
    />)

    const row1 = await screen.findByRole('row', { name: /john/i })
    fireEvent.click(within(row1).getByRole('checkbox'))
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    expect(deleteButton).toBeDisabled()
    const backupButton = screen.getByRole('button', { name: /backup/i })
    expect(backupButton).not.toBeDisabled()
    const row2 = await screen.findByRole('row', { name: /jane/i })
    fireEvent.click(within(row2).getByRole('checkbox'))
    expect(backupButton).toBeDisabled()
  })

  it('add row action button tooltip', async () => {
    const [onEdit, onDelete] = [jest.fn(), jest.fn()]
    const rowActions: TableProps<TestRow>['rowActions'] = [
      { label: 'Edit', onClick: onEdit },
      { label: 'Delete', onClick: onDelete, tooltip: 'test delete' }
    ]

    render(<Table
      columns={testColumns}
      dataSource={testData}
      rowActions={rowActions}
      rowSelection={{ }}
    />)

    const row1 = await screen.findByRole('row', { name: /john/i })
    fireEvent.click(within(row1).getByRole('checkbox'))
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    expect(deleteButton).toBeVisible()
    expect(rowActions[1].onClick).not.toBeCalled()
    fireEvent.click(deleteButton)
    expect(rowActions[1].onClick).toBeCalled()
  })

  describe('search & filter', () => {
    it('search input with terms', async () => {
      render(<Table
        columns={filteredColumns}
        dataSource={filteredData}
        rowSelection={{ selectedRowKeys: [] }}
      />)
      const validSearchTerm = 'John Doe'
      const input = await screen
        .findByPlaceholderText('Search Name, Given Name, Surname, Description, Address')
      fireEvent.change(input, { target: { value: validSearchTerm } })
      expect(await screen.findAllByText(validSearchTerm)).toHaveLength(1)

      fireEvent.change(input, { target: { value: 'edna' } })
      expect(await screen.findAllByText('Jane')).toHaveLength(1)
      expect(await screen.findAllByText('Jordan')).toHaveLength(1)

      const buttons = await screen.findAllByRole('button')
      expect(buttons).toHaveLength(4)
      fireEvent.click(buttons[2])
      fireEvent.click(buttons[3])
      expect(await screen.findAllByText('Edna')).toHaveLength(3)

      expect(await screen.findAllByRole('checkbox')).toHaveLength(5)
    })

    it('filtering inputs & searching', async () => {
      render(<Table
        columns={filteredColumns}
        dataSource={filteredData}
        rowSelection={{ selectedRowKeys: [] }}
      />)

      const tbody = await findTBody()

      expect(tbody).toBeVisible()
      const body = within(tbody)
      const before =
        (await body.findAllByRole('checkbox', { hidden: false })) as HTMLInputElement[]
      expect(before).toHaveLength(4)

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

    it('should highlight when search', async () => {
      const { asFragment } = render(<Table columns={filteredColumns} dataSource={filteredData} />)
      const input = await screen
        .findByPlaceholderText('Search Name, Given Name, Surname, Description, Address')
      fireEvent.change(input, { target: { value: 'John Doe' } })

      // eslint-disable-next-line testing-library/no-node-access
      expect(asFragment().querySelectorAll('mark')).toHaveLength(1)
    })

    it('should highlight with custom render', async () => {
      const renderFn = jest.fn()
      const columns = [ ...filteredColumns.slice(0,3), {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        searchable: true,
        render: renderFn
      }]
      render(<Table columns={columns} dataSource={filteredData} />)
      expect(renderFn).toBeCalled()
    })

    it('should highlight with custom highlighter', async () => {
      const customHighlighter = jest.fn(() => 'highlighted')
      const renderFn = jest.fn((_, row , __, highlightFn) =>
        highlightFn(row.address, customHighlighter)
      )
      const columns = [ ...filteredColumns.slice(0,3), {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        searchable: true,
        render: renderFn
      }]
      render(<Table columns={columns} dataSource={filteredData} />)
      const validSearchTerm = 'sample address'
      const input = await screen
        .findByPlaceholderText('Search Name, Given Name, Surname, Description, Address')
      fireEvent.change(input, { target: { value: validSearchTerm } })

      await screen.findByText('highlighted')
      expect(customHighlighter).toBeCalled()
    })

    it('should call debounced/onFilterChange when filter/search updated', async () => {
      const onFilterChange = jest.fn()
      render(<Table
        columns={filteredColumns}
        dataSource={filteredData}
        onFilterChange={onFilterChange}
      />)

      const input = await screen
        .findByPlaceholderText('Search Name, Given Name, Surname, Description, Address')
      fireEvent.change(input, { target: { value: 'J' } })
      await new Promise((r)=>{setTimeout(r, 1000)})
      expect(onFilterChange).not.toBeCalled()

      fireEvent.change(input, { target: { value: 'John Doe' } })
      await new Promise((r)=>{setTimeout(r, 1000)})
      expect(onFilterChange).toBeCalledTimes(1)

      fireEvent.change(input, { target: { value: '' } })
      const filters = await screen.findAllByRole('combobox', { hidden: true, queryFallbacks: true })
      const nameFilter = filters[0]
      fireEvent.keyDown(nameFilter, { key: 'John Doe', code: 'John Doe' })
      await new Promise((r)=>{setTimeout(r, 1000)})
      expect(onFilterChange).toBeCalledTimes(2)
    })

    it('should not do local filter/search when enableApiFilter', async () => {
      render(<Table
        columns={filteredColumns}
        dataSource={filteredData}
        enableApiFilter={true}
      />)
      const input = await screen
        .findByPlaceholderText('Search Name, Given Name, Surname, Description, Address')
      fireEvent.change(input, { target: { value: 'John Doe' } })
      expect(await screen.findAllByText('Jordan')).toHaveLength(1)
    })
  })

  describe('show/hide columnSort', () => {
    const basicColumns = [
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

    const columnState = {
      // eslint-disable-next-line no-console
      onChange: jest.fn(),
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
    }
    const props = {
      columns: basicColumns,
      dataSource: basicData,
      columnState: columnState
    }


    it('hide the columnSort', async () => {
      render(<Table {...props} columnState={{ ...columnState, hidden: true }} />)

      const listToolbar = await screen.findByRole('generic', {
        name: (name, element) => {
          return element.classList.contains('ant-pro-table-list-toolbar')
        }
      })

      const listToolBarItem = within(listToolbar).queryByRole('generic', {
        name: (name, element) => {
          return element.classList.contains('ant-pro-table-list-toolbar-setting-item')
        }
      })

      expect(listToolBarItem).toBeNull()
    })

    it('show the columnSort by default', async () => {
      render(<Table {...props} columnState={{ ...columnState }} />)

      const listToolbar = await screen.findByRole('generic', {
        name: (name, element) => {
          return element.classList.contains('ant-pro-table-list-toolbar')
        }
      })

      const listToolBarItem = await within(listToolbar).findByRole('generic', {
        name: (name, element) => {
          return element.classList.contains('ant-pro-table-list-toolbar-setting-item')
        }
      })

      expect(listToolBarItem).toBeTruthy()
    })
  })
})
