import '@testing-library/jest-dom'


import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import { Provider }                       from '@acx-ui/store'
import { render, screen }                 from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile } from '@acx-ui/user'
import { AccountTier }                    from '@acx-ui/utils'

import { BrandTable } from './Table'

const nameProps = {
  lspLabel: 'LSP',
  propertyLabel: 'Property'
}

describe('Brand 360 Table', () => {
  it('should render table correctly for proptery view', async () => {
    const data = [{
      id: '1',
      property: 'p',
      lsps: ['l'],
      p1Incidents: 10,
      ssidCompliance: [10,100] as [number, number],
      deviceCount: 2,
      avgConnSuccess: [10,100] as [number, number],
      avgTTC: [1,10] as [number, number],
      avgClientThroughput: [1,10] as [number, number]
    }]
    render(<BrandTable sliceType='property' data={data} {...nameProps}/>, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property')).toBeVisible()
    expect(screen.getByText('LSP')).toBeVisible()
  })
  it('should render table correctly for proptery view for nodata', async () => {
    const data = [{
      id: '1',
      property: 'p',
      lsps: ['l'],
      p1Incidents: NaN,
      ssidCompliance: '--' as unknown as [number, number],
      deviceCount: NaN,
      avgConnSuccess: '--' as unknown as [number, number],
      avgTTC: '--' as unknown as [number, number],
      avgClientThroughput: '--' as unknown as [number, number]
    }]
    render(<BrandTable sliceType='property' data={data} {...nameProps}/>, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property')).toBeVisible()
    expect(screen.getByText('LSP')).toBeVisible()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
  it('should render table correctly for lsp view', async () => {
    const slaThreshold = {
      'sla-p1-incidents-count': '100',
      'sla-guest-experience': '40',
      'sla-brand-ssid-compliance': '40'
    }
    const data = [{
      id: '1',
      property: 'p',
      lsps: ['l'],
      p1Incidents: 10,
      ssidCompliance: [50,100] as [number, number],
      deviceCount: 2,
      avgConnSuccess: [50,100] as [number, number],
      avgTTC: [5,10] as [number, number],
      avgClientThroughput: [5,10] as [number, number]
    }]
    render(<BrandTable
      sliceType='lsp'
      slaThreshold={slaThreshold}
      data={data}
      {...nameProps}/>, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property Count')).toBeVisible()
    expect(screen.getByText('LSP')).toBeVisible()
  })
  it('should render table correctly for property view', async () => {
    const slaThreshold = {
      'sla-p1-incidents-count': '100',
      'sla-guest-experience': '40',
      'sla-brand-ssid-compliance': '40'
    }
    const data = [{
      id: '1',
      property: 'p',
      lsps: ['l'],
      p1Incidents: 23,
      ssidCompliance: [50,100] as [number, number],
      deviceCount: 2,
      avgConnSuccess: [50,100] as [number, number],
      avgTTC: [5,10] as [number, number],
      avgClientThroughput: [5,10] as [number, number]
    }]
    render(<BrandTable
      sliceType='property'
      slaThreshold={slaThreshold}
      data={data}
      {...nameProps}/>, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property')).toBeVisible()
    expect(screen.getByText('LSP')).toBeVisible()
    const p1IncidentCell = screen.getByText('23')
    expect(p1IncidentCell).toBeInTheDocument()
    expect(p1IncidentCell).toHaveStyle({ color: 'var(--acx-primary-black)' })
  })
  it('should render table correctly for lsp view for noData', async () => {
    const slaThreshold = {
      'sla-p1-incidents-count': '100',
      'sla-guest-experience': '40',
      'sla-brand-ssid-compliance': '40'
    }
    const data = [{
      id: '1',
      property: 'p',
      lsps: ['l'],
      p1Incidents: 0,
      ssidCompliance: '--' as unknown as [number, number],
      deviceCount: 0,
      avgConnSuccess: '--' as unknown as [number, number],
      avgTTC: '--' as unknown as [number, number],
      avgClientThroughput: '--' as unknown as [number, number]
    }]
    render(<BrandTable
      sliceType='lsp'
      slaThreshold={slaThreshold}
      data={data}
      {...nameProps}
    />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property Count')).toBeVisible()
    expect(screen.getByText('LSP')).toBeVisible()
  })
  it('should render table correctly for LSP account', async () => {
    const data = [{
      id: '1',
      property: 'p',
      lsps: ['l'],
      p1Incidents: 10,
      ssidCompliance: [10,100] as [number, number],
      deviceCount: 2,
      avgConnSuccess: [10,100] as [number, number],
      avgTTC: [1,10] as [number, number],
      avgClientThroughput: [1,10] as [number, number]
    }]
    render(<BrandTable
      sliceType='property'
      data={data}
      isLSP={true}
      {...nameProps}
    />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property')).toBeVisible()
    expect(screen.queryByText('LSP')).toBeNull()
  })

  it('should render table correctly for Property ID account', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((feature) => {
      if (feature === Features.MSP_HSP_DISPLAY_UID_TOGGLE) return true
      return true
    })
    const data = [{
      id: '1',
      property: 'p',
      propertyCode: 'p-id',
      lsps: ['l'],
      p1Incidents: 10,
      ssidCompliance: [10,100] as [number, number],
      deviceCount: 2,
      avgConnSuccess: [10,100] as [number, number],
      avgTTC: [1,10] as [number, number],
      avgClientThroughput: [1,10] as [number, number]
    }]
    await render(<BrandTable
      sliceType='property'
      data={data}
      isLSP={true}
      {...nameProps}
    />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property')).toBeVisible()
    expect(await screen.findByText('Property ID')).toBeVisible()
    expect(screen.queryByText('LSP')).toBeNull()
  })

  it('should render table correctly for Core tier', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      accountTier: AccountTier.CORE
    })
    const data = [{
      id: '1',
      property: 'p',
      lsps: ['l'],
      p1Incidents: 10,
      ssidCompliance: [10,100] as [number, number],
      deviceCount: 2,
      avgConnSuccess: [10,100] as [number, number],
      avgTTC: [1,10] as [number, number],
      avgClientThroughput: [1,10] as [number, number]
    }]
    render(<BrandTable
      sliceType='property'
      data={data}
      isLSP={true}
      {...nameProps}
    />, {
      wrapper: Provider,
      route: {
        params: { tenantId: 't-id' }
      }
    })
    expect(await screen.findByText('Property')).toBeVisible()
    expect(screen.queryByText('LSP')).toBeNull()
    const tooltipIcon = await screen.findByTestId('InformationOutlined')
    expect(tooltipIcon).toBeInTheDocument()
  })
})
