import { Provider }        from '@acx-ui/store'
import { render, screen  } from '@acx-ui/test-utils'

import SwitchDetails from '.'

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report'>Report Content</div>
}))

describe('Switch Details', () => {
  it('should render correctly', () => {
    render(<SwitchDetails />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(screen.getByText('Wired')).toBeVisible()
    expect(screen.getByText('Switches')).toBeVisible()
    expect(screen.getByText('Report Content')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Switch List' }))
      .toHaveAttribute('href', '/ai/switch')
  })
})
