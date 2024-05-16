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
    expect(await screen.findByText('Admin')).toBeVisible()
    const ddWithSearch = screen.getByRole('combobox')
    await userEvent.click(ddWithSearch)
    expect(screen.getByTitle('Network Admin')).toBeInTheDocument()
    fireEvent.change(ddWithSearch, { target: { value: 'Netwo' } })
    expect(screen.queryByTitle('Admin')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTitle('Network Admin'))
    expect(mockedOnchange).toBeCalledWith(
      'network-admin',
      { value: 'network-admin', label: 'Network Admin', key: 'network-admin' }
    )
  })
})
