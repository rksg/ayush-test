import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OntTabs } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('../OntClientTab', () => ({
  OntClientTab: () => <div data-testid='OntClientTab' />
}))
jest.mock('../OntOverviewTab', () => ({
  OntOverviewTab: () => <div data-testid='OntOverviewTab' />
}))
jest.mock('../OntPortTab', () => ({
  OntPortTab: () => <div data-testid='OntPortTab' />
}))

describe('OntTabs', () => {
  const params = {
    tenantId: 'tenant-id', oltId: 'olt-id', venueId: 'venue-id',
    cageId: 'cage-id', activeTab: 'panel'
  }
  it('should render correctly', async () => {
    render(<Provider>
      <OntTabs />
    </Provider>, { route: { params } })

    // eslint-disable-next-line max-len
    expect(screen.getByRole('tab', { name: 'Panel' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('OntOverviewTab')).toBeInTheDocument()
  })

  it('should handle tab changes correctly', async () => {
    render(<Provider>
      <OntTabs />
    </Provider>, {
      route: {
        path: '/:tenantId/t/devices/optical/:venueId/:oltId/cages/:cageId',
        params: { ...params, activeTab: undefined }
      }
    })

    // eslint-disable-next-line max-len
    expect(screen.getByRole('tab', { name: 'Panel' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('tab', { name: 'Ports' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/optical/venue-id/olt-id/cages/cage-id/ports',
      search: '',
      hash: ''
    })
  })

})
