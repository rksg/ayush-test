import '@testing-library/jest-dom'


import { Provider }                                  from '@acx-ui/store'
import { render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { BrandTable } from './Table'


describe('Brand 360 Table', () => {
  it('should render table correctly for proptery view', async () => {
    render(<BrandTable sliceType='property' />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('Property')).toBeVisible()
    expect(screen.getByText('LSP')).toBeVisible()
  })
  it('should render table correctly for lsp view', async () => {
    const slaThreshold = {
      'sla-p1-incidents-count': '100',
      'sla-guest-experience': '40',
      'sla-brand-ssid-compliance': '40'
    }

    render(<BrandTable sliceType='lsp' slaThreshold={slaThreshold}/>, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getByText('Property Count')).toBeVisible()
    expect(screen.getByText('LSP')).toBeVisible()
  })
})
