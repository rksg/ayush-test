import '@testing-library/jest-dom'
import { render, fireEvent, screen, within } from '@acx-ui/test-utils'

import { Table } from '.'

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

  it('should call sorter function when sorter title is clicked', async () => {
    const rotatedColumns = [
      {
        title: '',
        dataIndex: 'venue',
        key: 'venue'
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        sorter: jest.fn(),
        showSorterTooltip: false
      },
      {
        title: 'Favorite Number',
        dataIndex: 'favoriteNumber',
        key: 'favoriteNumber',
        sorter: jest.fn()
      }
    ]
    const rotatedData = [
      {
        venue: 'venue 1',
        key: '1',
        name: 'John',
        age: 40,
        favoriteNumber: 1
      },
      {
        venue: 'venue 2',
        key: '2',
        name: 'Anne',
        age: 33,
        favoriteNumber: 10
      },
      {
        venue: 'venue 3',
        key: '3',
        name: 'Will',
        age: 55,
        favoriteNumber: 5
      }
    ]

    const { asFragment } = render(<Table
      columns={rotatedColumns}
      dataSource={rotatedData}
      title={() => 'Rotated'}
      type={'rotated'}
    />)
    expect(asFragment()).toMatchSnapshot()

    const sorterAgeTitle = await screen.findByText('Age')
    fireEvent.click(sorterAgeTitle)
    expect(rotatedColumns[2].sorter).toBeCalled()

    const sorterNumberTitle = await screen.findByText('Favorite Number')
    fireEvent.click(sorterNumberTitle)
    expect(rotatedColumns[3].sorter).toBeCalled()
  })

  it('should render selectable table and render action buttons correctly', async () => {
    const selectableColumns = [
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
    const selectableData = [
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
    const actions = [
      {
        label: 'Edit',
        onClick: jest.fn()
      },
      {
        label: 'Delete',
        onClick: jest.fn()
      }
    ]

    const { asFragment } = render(<Table
      columns={selectableColumns}
      dataSource={selectableData}
      actions={actions}
      headerTitle='Selectable'
      rowSelection={{ defaultSelectedRowKeys: [] }}
    />)
    expect(asFragment()).toMatchSnapshot()

    const row = await screen.findByRole('row', {
      name: /john doe 32 sample address/i
    })
    const checkbox = await within(row).findByRole('checkbox')
    fireEvent.click(checkbox)

    const closeButton = screen.getByRole('button', { name: 'clear selection' })
    const editButton = screen.getByRole('button', { name: /edit/i })
    const deleteButton = screen.getByRole('button', { name: /delete/i })

    expect(closeButton).toBeDefined()
    expect(editButton).toBeDefined()
    expect(deleteButton).toBeDefined()

    expect(actions[0].onClick).toHaveBeenCalledTimes(0)
    expect(actions[1].onClick).toHaveBeenCalledTimes(0)

    fireEvent.click(editButton)
    expect(actions[0].onClick).toBeCalled()
    expect(actions[0].onClick).toHaveBeenCalledTimes(1)

    fireEvent.click(deleteButton)
    expect(actions[1].onClick).toBeCalled()
    expect(actions[1].onClick).toHaveBeenCalledTimes(1)
  })
})
