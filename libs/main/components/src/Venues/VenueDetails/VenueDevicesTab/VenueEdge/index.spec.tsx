import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { VenueEdge } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgesTable: () => <div data-testid={'EdgesTable'} />
}))

describe('VenueEdge', () => {
  const params = {
    tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
    venueId: '8caa8f5e01494b5499fa156a6c565138',
    activeTab: 'devices',
    activeSubTab: 'edge'
  }

  it('should render correctly', async () => {
    render(<Provider><VenueEdge /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/:activeTab/:activeSubTab' }
    })

    expect(await screen.findByTestId('EdgesTable')).toBeVisible()

    const target = await screen.findByRole('link', { name: 'Add SmartEdge' })
    expect(target.getAttribute('href')).toBe(`/${params.tenantId}/t/devices/edge/add`)
  })
})
