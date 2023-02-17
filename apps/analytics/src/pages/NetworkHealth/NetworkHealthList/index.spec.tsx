import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import NetworkHealthList from '.'

const params = { tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Network Health', () => {
  it('should render page correctly', async () => {
    render(
      <Provider>
        <NetworkHealthList />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Network Health')).toBeVisible()
  })
})
