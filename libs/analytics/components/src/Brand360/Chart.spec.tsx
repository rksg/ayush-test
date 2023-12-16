import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import '@testing-library/jest-dom'
import { mockBrandTimeseries }  from './__tests__/fixtures'
import { SlaChart }             from './Chart'
import { FranchisorTimeseries } from './services'

describe('chart', () => {
  const chartKeys = [
    'incident' as const,
    'compliance' as const,
    'experience' as const
  ]

  const baseProps = {
    chartData: mockBrandTimeseries
      .data
      .franchisorTimeseries as unknown as FranchisorTimeseries
  }

  it('should render charts correctly', async () => {
    const charts = chartKeys.map(chartKey => {
      const props = { chartKey, ...baseProps }
      return () => <SlaChart {...props} />
    })
    const Test = () => {
      return <div>
        {charts.map((Chart, i) => <Chart key={i} />)}
      </div>
    }
    const { asFragment } = render(<Test />, { wrapper: Provider })
    const fragment = asFragment()
    // eslint-disable-next-line testing-library/no-node-access
    const graphs = fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
    expect(graphs).toHaveLength(3)
  })

  it('should render no data with undefined', async () => {
    const props = {
      chartKeys: 'incident',
      chartData: undefined
    }
    render(<SlaChart chartKey='incident' {...props} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should render no data with errors', async () => {
    const props = {
      chartData: {
        ...mockBrandTimeseries.data.franchisorTimeseries as unknown as FranchisorTimeseries,
        errors: [{ sla: 'test', error: 'something went wrong' }]
      }
    }
    render(<SlaChart chartKey='incident' {...props} />, { wrapper: Provider })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
