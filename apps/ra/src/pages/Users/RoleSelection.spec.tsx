import userEvent from '@testing-library/user-event'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'


import { RoleSelection } from './RoleSelection'

const mockedOnchange = jest.fn()

describe('Role Selection', () => {
  afterEach(() => {
    mockedOnchange.mockClear()
  })
  it('should work correctly', async () => {
    render(
      <Provider><RoleSelection onChange={mockedOnchange} selectedValue='admin' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Prime Administrator')).toBeVisible()
    const ddWithSearch = screen.getByRole('combobox')
    await userEvent.click(ddWithSearch)
    expect(screen.getByTitle('Administrator')).toBeInTheDocument()
    fireEvent.change(ddWithSearch, { target: { value: 'Toy' } })
    expect(screen.queryByTitle('Administrator')).not.toBeInTheDocument()
    await userEvent.type(ddWithSearch, 'Administrator')
    await userEvent.click(await screen.findByTitle('Administrator'))
    expect(mockedOnchange).toBeCalledWith(
      'network-admin',
      { value: 'network-admin', label: 'Administrator', key: 1 }
    )
  })
})
