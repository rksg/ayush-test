import userEvent from '@testing-library/user-event'

import { useGetAvailableUsersQuery } from '@acx-ui/analytics/services'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'


import { AvailableUsersSelection } from './AvailableUsersSelection'

const mockedQuery = useGetAvailableUsersQuery as jest.Mock
const mockedOnchange = jest.fn()
jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useGetAvailableUsersQuery: jest.fn()
}))


describe('Available Users Selection', () => {
  beforeEach(() => {
    mockedQuery.mockImplementation(() => ({
      isLoading: false,
      data: [{
        swuId: '1',
        userName: 'abc'
      }, {
        swuId: '2',
        userName: 'xyz'
      }]
    }))
  })
  afterEach(() => {
    mockedQuery.mockClear()
    mockedOnchange.mockClear()
  })
  it('should work correctly', async () => {
    render(
      <Provider><AvailableUsersSelection onChange={mockedOnchange} /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Search to select')).toBeVisible()
    const ddWithSearch = screen.getByRole('combobox')
    await userEvent.click(ddWithSearch)
    expect(screen.getByTitle('abc')).toBeInTheDocument()
    fireEvent.change(ddWithSearch, { target: { value: 'xyz' } })
    expect(screen.queryByTitle('abc')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTitle('xyz'))
    expect(mockedOnchange).toBeCalledWith({ email: 'xyz', id: '2' })
  })
})