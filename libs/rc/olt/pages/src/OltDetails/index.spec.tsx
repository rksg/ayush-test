import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltDetails } from './index'

jest.mock('@acx-ui/olt/components', () => ({
  OltConfigurationTab: () => <div data-testid='OltConfigurationTab' />,
  OltDetailPageHeader: () => <div data-testid='OltDetailPageHeader' />,
  OltInfoWidget: () => <div data-testid='OltInfoWidget' />,
  OltOverviewTab: () => <div data-testid='OltOverviewTab' />,
  OltOntTab: () => <div data-testid='OltOntTab' />,
  OltDetailsContext: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='OltDetailsContext'>{children}</div>
    )
  }
}))
jest.mock('@acx-ui/user', () => ({
  setUserProfile: jest.fn(),
  goToNotFound: () => <div data-testid='goToNotFound' />
}))

describe('OltDetails', () => {
  const params = {
    tenantId: 'tenant-id', venueId: 'venue-id', oltId: 'olt-id', activeTab: 'overview'
  }
  it('should render correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByTestId('OltDetailPageHeader')).toBeInTheDocument()
    expect(screen.getByTestId('OltOverviewTab')).toBeInTheDocument()
  })

  it('should handle non-existent tab correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params: { ...params, activeTab: 'unexisted' } }
    })
    expect(screen.getByTestId('goToNotFound')).toBeInTheDocument()
  })

})
