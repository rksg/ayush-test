import '@testing-library/jest-dom'
import { render, fireEvent, screen, within } from '@acx-ui/test-utils'

import { Table } from '.'
// import * as UI from './styledComponents'

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
      options={false}
      search={false}
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
      options={false}
      search={false}
    />)
    expect(asFragment()).toMatchSnapshot()

    const sorterAgeTitle = await screen.findByText('Age')
    fireEvent.click(sorterAgeTitle)
    expect(rotatedColumns[2].sorter).toBeCalled()
    const sorterNumberTitle = await screen.findByText('Favorite Number')
    fireEvent.click(sorterNumberTitle)
    expect(rotatedColumns[3].sorter).toBeCalled()
  })

  it('should show table action when selectable table checkbox is clicked', async () => {
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
        key: 11,
        label: 'Edit',
        onClick: jest.fn()
      },
      {
        key: 12,
        label: 'Delete',
        onClick: jest.fn()
      }
    ]

    const { asFragment } = render(<Table
      columns={selectableColumns}
      dataSource={selectableData}
      alertOptions={actions}
      headerTitle='Selectable'
      type={'selectable'}
      rowSelection={{ defaultSelectedRowKeys: [] }}
      options={false}
      search={false}
    />)
    expect(asFragment()).toMatchSnapshot()

    const row = await screen.findByRole('row', {
      name: /john doe 32 sample address/i
    })
    const checkbox = await within(row).findByRole('checkbox')
    fireEvent.click(checkbox)
    screen.logTestingPlaygroundURL()

    const view = screen.getByText(/1 selected/i)
    const closeButton = within(view).getByRole('button')
    const editButton = screen.getByRole('button', { name: /edit/i })
    const deleteButton = screen.getByRole('button', { name: /delete/i })

    fireEvent.click(editButton)
    expect(actions[0].onClick).toBeCalled()
    expect(actions[0].onClick).toHaveBeenCalledTimes(1)

    fireEvent.click(deleteButton)
    expect(actions[1].onClick).toBeCalled()
    expect(actions[1].onClick).toHaveBeenCalledTimes(1)

    fireEvent.click(closeButton)
    expect(actions[0].onClick).toHaveBeenCalledTimes(1)


  })

  it('it should', () => {

  })
})