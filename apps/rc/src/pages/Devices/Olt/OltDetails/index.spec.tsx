import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltDetails } from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/olt/components', () => {
  const original = jest.requireActual('@acx-ui/olt/components')
  return {
    ...original,
    OltDetailPageHeader: () => <div data-testid='OltDetailPageHeader' />,
    OltInfoWidget: () => <div data-testid='OltInfoWidget' />,
    OltLineCardTab: () => <div data-testid='OltLineCardTab' />,
    OltNetworkCardTab: () => <div data-testid='OltNetworkCardTab' />,
    OltOverviewTab: () => <div data-testid='OltOverviewTab' />
  }
})

describe('OltDetails', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id', activeTab: 'overview' }
  it('should render correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByTestId('OltDetailPageHeader')).toBeInTheDocument()
    expect(screen.getByTestId('OltOverviewTab')).toBeInTheDocument()
    expect(screen.getByTestId('OltInfoWidget')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/Network Card/))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/optical/olt-id/details/network',
      search: '',
      hash: ''
    })
  })

  it('should navigate to default tab correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params: { ...params, activeTab: 'unexisting-tab' } }
    })

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
  })

})
