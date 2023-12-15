import { dataApiURL, Provider } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import '@testing-library/jest-dom'
import { mockBrandTimeseries } from './__tests__/fixtures'
import { SlaChart }            from './Chart'

describe('chart', () => {
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

  it('should render charts correctly without randomizer', async () => {
    const charts = chartKeys.map(chartKey => {
      mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
      const props = { chartKey, ...baseProps }
      return () => <SlaChart {...props} mock={false} />
    })
    const Test = () => {
      return <div>
        {charts.map((Chart, i) => <Chart key={i} />)}
      </div>
    }
    const { asFragment } = render(<Test />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    // eslint-disable-next-line testing-library/no-node-access
    const graphs = fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
    // eslint-disable-next-line testing-library/no-node-access
    graphs.forEach(graph => graph.setAttribute('_echarts_instance_', 'echartsMock'))
    expect(fragment).toMatchSnapshot()
  })

  it('should render charts correctly with randomizer', async () => {
    const charts = chartKeys.map(chartKey => {
      mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
      const props = { chartKey, ...baseProps }
      return () => <SlaChart {...props} mock />
    })
    const Test = () => {
      return <div>
        {charts.map((Chart, i) => <Chart key={i} />)}
      </div>
    }
    const { asFragment } = render(<Test />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    // eslint-disable-next-line testing-library/no-node-access
    const graphs = asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]')
    expect(graphs).toHaveLength(3)
  })

  it('should render charts correctly with errors', async () => {
    mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', {
      data: {
        franchisorTimeseries: {
          ...mockBrandTimeseries.data.franchisorTimeseries,
          errors: [{ sla: 'p1Incident', error: 'something went wrong' }]
        }
      }
    })
    render(<SlaChart chartKey='incident' {...baseProps} />, { wrapper: Provider })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
