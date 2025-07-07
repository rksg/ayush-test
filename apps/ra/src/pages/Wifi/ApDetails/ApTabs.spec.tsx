import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import ApTabs from './ApTabs'

const params= { apId: 'ap-id' }
const mockedUsedNavigate = jest.fn()

const mockedTenantLink = {
  hash: '',
  pathname: '/ai/devices/wifi/ap-id/details',
  search: ''
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: () => mockedTenantLink
}))

describe('ApTabs', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <ApTabs/>
    </Provider>, { route: { params } })
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <ApTabs/>
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Reports'))
    fireEvent.click(await screen.findByText('Reports'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/ai/devices/wifi/${params.apId}/details/reports`,
      hash: '',
      search: ''
    })
  })
})
