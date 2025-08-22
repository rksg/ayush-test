import userEvent from '@testing-library/user-event'

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltTabs } from './'

const { mockOlt } = OltFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('OltTabs', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id', venueId: 'venue-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OltTabs oltDetails={mockOlt} />
    </Provider>, { route: { params } })

    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('should navigate to the correct tab', async () => {
    render(<Provider>
      <OltTabs oltDetails={mockOlt} />
    </Provider>, { route: { params: { ...params, activeTab: 'onts' } } })

    expect(screen.getByRole('tab', { name: /ONU\/Ts/ })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('tab', { name: /Configuration/ }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/optical/venue-id/olt-id/details/configuration',
      search: '',
      hash: ''
    })
  })

})
