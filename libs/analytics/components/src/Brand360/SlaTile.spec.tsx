import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import '@testing-library/jest-dom'
import {
  fetchBrandProperties,
  mockBrandTimeseries,
  prevTimeseries,
  currTimeseries
}         from './__tests__/fixtures'
import { SlaTile }                      from './SlaTile'
import type { FranchisorTimeseries, Response } from './services'

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

  const baseProps = {
    tableData: fetchBrandProperties() as unknown as Response[],
    chartData: franchisorTimeseries as unknown as FranchisorTimeseries,
    prevData: prevTimeseries as unknown as FranchisorTimeseries,
    currData: currTimeseries as unknown as FranchisorTimeseries
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
    expect(await screen.findByText('Distressed LSPs')).toBeVisible()
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
    expect(await screen.findByText('Distressed Properties')).toBeVisible()
    expect(await screen.findByText('Guest Experience')).toBeVisible()
    expect(await screen.findByText('Brand SSID Compliance')).toBeVisible()
    const graphs = await screen.findAllByTestId('slaChart')
    expect(graphs).toHaveLength(3)
  })

  it('should render empty data by lsp', async () => {
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
    expect(await screen.findByText('Distressed LSPs')).toBeVisible()
    expect(await screen.findByText('Guest Experience')).toBeVisible()
    expect(await screen.findByText('Brand SSID Compliance')).toBeVisible()
    const graphs = await screen.findAllByTestId('slaChart')
    expect(graphs).toHaveLength(3)
    const zeroes = await screen.findAllByText('0')
    expect(zeroes).toHaveLength(1)
  })

  it('should render empty data by property', async () => {
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
    expect(await screen.findByText('Distressed Properties')).toBeVisible()
    expect(await screen.findByText('Guest Experience')).toBeVisible()
    expect(await screen.findByText('Brand SSID Compliance')).toBeVisible()
    const graphs = await screen.findAllByTestId('slaChart')
    expect(graphs).toHaveLength(3)
    const zeroes = await screen.findAllByText('0')
    expect(zeroes).toHaveLength(1)
  })

  it('should handle top sorting', async () => {
    const props = {
      chartKey: 'incident' as const,
      ...baseProps,
      sliceType: 'property' as const
    }
    render(<SlaTile {...props}/>, { wrapper: Provider })
    expect(await screen.findByText('# of Properties with P1 Incident'))
      .toBeVisible()
    const switchIcon = await screen.findByTestId('DownArrow')
    fireEvent.click(switchIcon)
    expect(switchIcon).toBeVisible()
  })
})
