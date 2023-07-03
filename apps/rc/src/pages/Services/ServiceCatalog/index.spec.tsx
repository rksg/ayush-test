import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import ServiceCatalog from '.'

describe('ServiceCatalog', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/t/:tenantId'

  it('should render service catalog', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(
      <ServiceCatalog />, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('mDNS Proxy')).toBeVisible()

    expect(screen.queryByText('Network Segmentation')).toBeNull()
    expect(screen.queryByText('Firewall')).toBeNull()
  })

  it('should render service catalog with feature flag ON', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <ServiceCatalog />, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('Network Segmentation')).toBeVisible()
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(await screen.findByText('Firewall')).toBeVisible()
  })
})
