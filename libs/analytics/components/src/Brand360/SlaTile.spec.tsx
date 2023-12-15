import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import '@testing-library/jest-dom'
import { fetchBrandProperties }         from './__tests__/fixtures'
import { useFetchBrandPropertiesQuery } from './services'
import { SlaTile }                      from './SlaTile'

jest.mock('./Chart', () => ({
  SlaChart: () => <div data-testid='slaChart'>SlaChart</div>
}))

const mockBrandProperties = fetchBrandProperties()
jest.mock('./services', () => ({
  ...jest.requireActual('./services'),
  useFetchBrandPropertiesQuery: () => ({
    data: mockBrandProperties,
    isLoading: false,
    isFetching: false
  })
}))

const mockProperties = useFetchBrandPropertiesQuery as jest.Mock

describe('SlaTile', () => {
  const chartKeys = [
    'incident' as const,
    'compliance' as const,
    'experience' as const
  ]

  const baseProps = {
    ssidRegex: 'DENSITY',
    start: '2023-12-11T00:00:00+00:00',
    end: '2023-12-12T00:00:00+00:00'
  }

  it('should render correctly by lsp', async () => {
    const tiles = chartKeys.map(chartKey => {
      const tableQuery = mockProperties()
      const props = {
        chartKey,
        ...baseProps,
        tableQuery,
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
      const tableQuery = mockProperties()
      const props = {
        chartKey,
        ...baseProps,
        tableQuery,
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
      const tableQuery = mockProperties()
      const props = {
        chartKey,
        ...baseProps,
        tableQuery: { ...tableQuery, data: [] },
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
      const tableQuery = mockProperties()
      const props = {
        chartKey,
        ...baseProps,
        tableQuery: { ...tableQuery, data: [] },
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
    const tableQuery = mockProperties()
    const props = {
      chartKey: 'incident' as const,
      ...baseProps,
      tableQuery,
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
