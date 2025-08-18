import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltOverviewTab } from './'

jest.mock('./OltPanelTab', () => ({
  OltPanelTab: () => <div data-testid='OltPanelTab' />
}))
jest.mock('./OltLineCardTab', () => ({
  OltLineCardTab: () => <div data-testid='OltLineCardTab' />
}))
jest.mock('./OltNetworkCardTab', () => ({
  OltNetworkCardTab: () => <div data-testid='OltNetworkCardTab' />
}))
jest.mock('../OltInfoWidget', () => ({
  OltInfoWidget: () => <div data-testid='OltInfoWidget' />
}))

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('OltOverviewTab', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id', venueId: 'venue-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <OltOverviewTab />
    </Provider>, { route: { params } })

    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByText('Panel')).toBeInTheDocument()
    expect(screen.getByTestId('OltInfoWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OltPanelTab')).toBeInTheDocument()
  })

  it('should navigate to the correct tab', async () => {
    render(<Provider>
      <OltOverviewTab />
    </Provider>, { route: { params: { ...params, activeSubTab: 'line' } } })

    expect(screen.getByRole('tab', { name: /Line/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('OltLineCardTab')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: /Network/ }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/optical/venue-id/olt-id/details/overview/network',
      search: '',
      hash: ''
    })
  })

})
