import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { NetworkIncidentsTab } from '.'

jest.mock('@acx-ui/analytics/components', () => ({
  IncidentTabContent: () => <div data-testid='incidents'>Incidents List</div>
}))

describe('Network Incidents Tab', () => {
  it('should render correctly', () => {
    render(<NetworkIncidentsTab />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(screen.getByText('Incidents List')).toBeInTheDocument()
  })
})
