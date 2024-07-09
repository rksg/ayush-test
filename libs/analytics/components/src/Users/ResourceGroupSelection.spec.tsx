import userEvent from '@testing-library/user-event'

import { useGetResourceGroupsQuery } from '@acx-ui/analytics/services'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'


import { ResourceGroupSelection } from './ResourceGroupSelection'

const mockedQuery = useGetResourceGroupsQuery as jest.Mock
const mockedOnchange = jest.fn()
jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useGetResourceGroupsQuery: jest.fn()
}))


describe('Available Users Selection', () => {
  beforeEach(() => {
    mockedQuery.mockImplementation(() => ({
      isLoading: false,
      data: [{
        id: '1',
        name: 'abc'
      }, {
        id: '2',
        name: 'xyz'
      }]
    }))
  })
  afterEach(() => {
    mockedQuery.mockClear()
    mockedOnchange.mockClear()
  })
  it('should work correctly', async () => {
    render(
      <Provider>
        <ResourceGroupSelection onChange={mockedOnchange} selectedValue='abc' />
      </Provider>,
      { route: {} }
    )
    expect(await screen.findByText('abc')).toBeVisible()
    const ddWithSearch = await screen.findByRole('combobox')
    await userEvent.click(ddWithSearch)
    fireEvent.change(ddWithSearch, { target: { value: 'xyz' } })
    expect(screen.queryByTitle('abc')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTitle('xyz'))
    expect(mockedOnchange).toBeCalledWith('2', { key: '2', label: 'xyz', value: '2' })
  })
})