import { Settings }                  from '@acx-ui/analytics/utils'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'
import '@testing-library/jest-dom'
import {
  getUserProfile,
  setUserProfile
} from '@acx-ui/user'
import { AccountTier } from '@acx-ui/utils'

import {
  fetchBrandProperties,
  mockBrandTimeseries,
  prevTimeseries,
  currTimeseries,
  zeroPrevTimeseries,
  zeroCurrTimeseries
} from './__tests__/fixtures'
import { SlaTile } from './SlaTile'

import type { FranchisorTimeseries, Response } from './services'

const tableNoData = [{
  property: 'p',
  lsps: ['l'],
  p1Incidents: 0,
  ssidCompliance: '--' as unknown as [number, number],
  deviceCount: 0,
  avgConnSuccess: '--' as unknown as [number, number],
  avgTTC: '--' as unknown as [number, number],
  avgClientThroughput: '--' as unknown as [number, number]
}]

jest.mock('./Chart', () => ({
  SlaChart: () => <div data-testid='slaChart'>SlaChart</div>
}))

describe('SlaTile', () => {
  const chartKeys = [
    'incident' as const,
    'compliance' as const,
    'experience' as const
  ]

  const { data: { franchisorTimeseries } } = mockBrandTimeseries

  const zeroFranchisorTimeseries = {
    ...franchisorTimeseries,
    timeToConnectSLA: franchisorTimeseries.time.map(() => null),
    connectionSuccessSLA: franchisorTimeseries.time.map(() => null),
    clientThroughputSLA: franchisorTimeseries.time.map(() => null)
  } as unknown as FranchisorTimeseries

  const baseProps = {
    tableData: fetchBrandProperties() as unknown as Response[],
    chartData: franchisorTimeseries as unknown as FranchisorTimeseries,
    prevData: prevTimeseries as unknown as FranchisorTimeseries,
    currData: currTimeseries as unknown as FranchisorTimeseries,
    settings: {
      'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
      'sla-p1-incidents-count': '0',
      'sla-guest-experience': '100',
      'sla-brand-ssid-compliance': '100'
    } as Settings,
    lsp: 'LSP',
    property: 'Property'
  }

  it('should render correctly by lsp', async () => {
    const tiles = chartKeys.map(chartKey => {
      const props = {
        chartKey,
        ...baseProps,
        sliceType: 'lsp' as const
      }
      return () => <SlaTile {...props} />
    })
    const Test = () => {
      return <div>
        {tiles.map((Tile, i) => <Tile key={i} />)}
      </div>
    }
    render(<Test />, { wrapper: Provider })
    expect(await screen.findByText('LSP Health')).toBeVisible()
    expect(await screen.findByText('Guest Experience')).toBeVisible()
    expect(await screen.findByText('Brand SSID Compliance')).toBeVisible()
    const graphs = await screen.findAllByTestId('slaChart')
    expect(graphs).toHaveLength(3)
    expect(await screen.findByText('20')).toBeVisible()
  })

  it('should render null changes correctly', async () => {
    const tiles = chartKeys.map(chartKey => {
      const props = {
        ...baseProps,
        chartData: zeroFranchisorTimeseries,
        chartKey,
        prevData: zeroPrevTimeseries,
        currData: zeroCurrTimeseries,
        sliceType: 'property' as const
      }
      return () => <SlaTile {...props} />
    })
    const Test = () => {
      return <div>
        {tiles.map((Tile, i) => <Tile key={i} />)}
      </div>
    }
    render(<Test />, { wrapper: Provider })
    expect(await screen.findByText('Property Health')).toBeVisible()
    expect(await screen.findByText('Guest Experience')).toBeVisible()
    expect(await screen.findByText('Brand SSID Compliance')).toBeVisible()
    const graphs = await screen.findAllByTestId('slaChart')
    expect(graphs).toHaveLength(3)
  })
  it('should render correctly by property', async () => {
    const tiles = chartKeys.map(chartKey => {
      const props = {
        chartKey,
        ...baseProps,
        sliceType: 'property' as const
      }
      return () => <SlaTile {...props} />
    })
    const Test = () => {
      return <div>
        {tiles.map((Tile, i) => <Tile key={i} />)}
      </div>
    }
    render(<Test />, { wrapper: Provider })
    expect(await screen.findByText('Property Health')).toBeVisible()
    expect(await screen.findByText('Guest Experience')).toBeVisible()
    expect(await screen.findByText('Brand SSID Compliance')).toBeVisible()
    const graphs = await screen.findAllByTestId('slaChart')
    expect(graphs).toHaveLength(3)
  })
  it('should render empty data by lsp', async () => {
    const tiles = chartKeys.map(chartKey => {
      const props = {
        chartKey,
        tableData: undefined as unknown as Response[],
        chartData: undefined,
        currData: undefined,
        prevData: undefined,
        sliceType: 'lsp' as const,
        settings: {
          'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
          'sla-p1-incidents-count': '0',
          'sla-guest-experience': '100',
          'sla-brand-ssid-compliance': '100'
        } as Settings,
        lsp: 'LSP',
        property: 'Property'
      }
      return () => <SlaTile {...props} />
    })
    const Test = () => {
      return <div>
        {tiles.map((Tile, i) => <Tile key={i} />)}
      </div>
    }
    render(<Test />, { wrapper: Provider })
    expect(await screen.findByText('LSP Health')).toBeVisible()
    expect(await screen.findByText('Guest Experience')).toBeVisible()
    expect(await screen.findByText('Brand SSID Compliance')).toBeVisible()
    const graphs = await screen.findAllByTestId('slaChart')
    expect(graphs).toHaveLength(3)
    const zeroes = await screen.findAllByText('--')
    expect(zeroes).toHaveLength(3)
  })
  it('should render nodata by lsp', async () => {
    const tiles = chartKeys.map(chartKey => {
      const props = {
        chartKey,
        tableData: tableNoData as Response[],
        chartData: undefined,
        currData: undefined,
        prevData: undefined,
        sliceType: 'lsp' as const,
        settings: {
          'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
          'sla-p1-incidents-count': '0',
          'sla-guest-experience': '100',
          'sla-brand-ssid-compliance': '100'
        } as Settings,
        lsp: 'LSP',
        property: 'Property'
      }
      return () => <SlaTile {...props} />
    })
    const Test = () => {
      return <div>
        {tiles.map((Tile, i) => <Tile key={i} />)}
      </div>
    }
    render(<Test />, { wrapper: Provider })
    expect(await screen.findByText('LSP Health')).toBeVisible()
    expect(await screen.findByText('Guest Experience')).toBeVisible()
    expect(await screen.findByText('Brand SSID Compliance')).toBeVisible()
    const graphs = await screen.findAllByTestId('slaChart')
    expect(graphs).toHaveLength(3)
    const zeroes = await screen.findAllByText('--')
    expect(zeroes).toHaveLength(3)
  })

  it('should render empty data by property', async () => {
    const tiles = chartKeys.map(chartKey => {
      const props = {
        chartKey,
        tableData: undefined as unknown as Response[],
        chartData: undefined,
        currData: undefined,
        prevData: undefined,
        sliceType: 'property' as const,
        settings: {
          'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
          'sla-p1-incidents-count': '0',
          'sla-guest-experience': '100',
          'sla-brand-ssid-compliance': '100'
        } as Settings,
        lsp: 'LSP',
        property: 'Property'
      }
      return () => <SlaTile {...props} />
    })
    const Test = () => {
      return <div>
        {tiles.map((Tile, i) => <Tile key={i} />)}
      </div>
    }
    render(<Test />, { wrapper: Provider })
    expect(await screen.findByText('Property Health')).toBeVisible()
    expect(await screen.findByText('Guest Experience')).toBeVisible()
    expect(await screen.findByText('Brand SSID Compliance')).toBeVisible()
    const graphs = await screen.findAllByTestId('slaChart')
    expect(graphs).toHaveLength(3)
    const zeroes = await screen.findAllByText('--')
    expect(zeroes).toHaveLength(3)
  })

  it('should handle list sorting', async () => {
    const props = {
      chartKey: 'incident' as const,
      ...baseProps,
      sliceType: 'property' as const
    }
    render(<SlaTile {...props}/>, { wrapper: Provider })
    expect(await screen.findByText('# of P1 Incidents'))
      .toBeVisible()
    const downIcon = await screen.findByTestId('DownArrow')
    const prevItems = await screen.findAllByRole('listitem')
    expect(prevItems).toHaveLength(3)
    fireEvent.click(downIcon)
    const currItems = await screen.findAllByRole('listitem')
    expect(currItems).toHaveLength(3)
    expect(prevItems[0].isEqualNode(currItems[0])).toBeFalsy()
    fireEvent.click(downIcon)
    const recentItems = await screen.findAllByRole('listitem')
    expect(recentItems[0].isEqualNode(prevItems[0])).toBeTruthy()
  })
  it('should handle empty tableData', async () => {
    const props = {
      chartKey: 'incident' as const,
      ...baseProps,
      tableData: [],
      sliceType: 'property' as const
    }
    render(<SlaTile {...props}/>, { wrapper: Provider })
    expect(await screen.findByText('# of P1 Incidents'))
      .toBeVisible()
    const downIcon = screen.queryByTestId('DownArrow')
    expect(downIcon).toBeNull()
  })

  it('should render tooltip for Core tier', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      accountTier: AccountTier.CORE
    })
    const props = {
      chartKey: 'experience' as const,
      ...baseProps,
      tableData: [],
      sliceType: 'property' as const
    }
    render(<SlaTile {...props}/>, { wrapper: Provider })
    expect(await screen.findByText('Guest Experience')).toBeInTheDocument()
    const tooltipIcon = await screen.findByTestId('InformationOutlined')
    expect(tooltipIcon).toBeInTheDocument()
  })

})
