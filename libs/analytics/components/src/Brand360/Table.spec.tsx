import '@testing-library/jest-dom'


import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { BrandTable } from './Table'


describe('Brand 360 Table', () => {
  it('should render table correctly for proptery view', async () => {
    const data = [{
      property: 'p',
      lsp: 'l',
      p1Incidents: 10,
      guestExp: .1,
      ssidCompliance: .1,
      deviceCount: 2,
      avgConnSuccess: .1,
      avgTTC: .1,
      avgClientThroughput: .1
    }]
    render(<BrandTable sliceType='property' data={data}/>, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property')).toBeVisible()
    expect(screen.getByText('LSP')).toBeVisible()
  })
  it('should render table correctly for lsp view', async () => {
    const slaThreshold = {
      'sla-p1-incidents-count': '100',
      'sla-guest-experience': '40',
      'sla-brand-ssid-compliance': '40'
    }
    const data = [{
      property: 'p',
      lsp: 'l',
      p1Incidents: 10,
      guestExp: .5,
      ssidCompliance: .5,
      deviceCount: 2,
      avgConnSuccess: .5,
      avgTTC: .5,
      avgClientThroughput: .5
    }]
    render(<BrandTable sliceType='lsp' slaThreshold={slaThreshold} data={data} />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property Count')).toBeVisible()
    expect(screen.getByText('LSP')).toBeVisible()
  })
})
