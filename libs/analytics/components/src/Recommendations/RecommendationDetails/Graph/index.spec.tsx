import userEvent    from '@testing-library/user-event'
import EChartsReact from 'echarts-for-react'

import { GraphProps }                       from '@acx-ui/components'
import { Provider, recommendationUrl }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedRecommendationCRRM } from '../__tests__/fixtures'
import { EnhancedRecommendation }                     from '../services'

import { CloudRRMGraph } from '.'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Graph: ({ data, chartRef, ...props }: GraphProps) => {
    // to get connectChart covered
    const getEchartsInstance = jest.fn(() => ({ group: '' }))
    chartRef({ getEchartsInstance } as unknown as EChartsReact)
    expect(getEchartsInstance).toHaveBeenCalledTimes(1)
    return <div {...props} data-testid='rrm-graph' />
  }
}))
jest.mock('./Legend', () => ({
  Legend: () => <div data-testid='rrm-legend' />
}))
jest.mock('./DownloadRRMComparison', () => ({
  DownloadRRMComparison: () => <div data-testid='rrm-comparison-button' />
}))

describe('CloudRRM', () => {
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
  })

  it('should render correctly', async () => {
    const details = {
      ...mockedRecommendationCRRM,
      monitoring: null
    } as EnhancedRecommendation
    render(<CloudRRMGraph details={details}/>, { wrapper: Provider })
    expect(await screen.findByText('More details')).toBeVisible()
    expect(await screen.findAllByTestId('rrm-graph')).toHaveLength(2)
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
  })

  it('should handle drawer', async () => {
    const details = {
      ...mockedRecommendationCRRM,
      monitoring: null
    } as EnhancedRecommendation
    render(<CloudRRMGraph details={details}/>, { wrapper: Provider })
    await userEvent.click(await screen.findByText('More details'))
    expect(await screen.findByTestId('rrm-legend')).toBeVisible()
    expect(await screen.findAllByTestId('rrm-graph')).toHaveLength(4)
    expect(await screen.findByTestId('rrm-comparison-button')).toBeVisible()
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
  })
  it('should handle monitoring', async () => {
    const details = {
      ...mockedRecommendationCRRM,
      monitoring: { until: '2023-06-26T00:00:00Z' }
    } as EnhancedRecommendation
    render(<CloudRRMGraph details={details}/>, { wrapper: Provider })
    expect(await screen.findByText('Monitoring performance indicators')).toBeVisible()
    expect(await screen.findByText('until 06/26/2023 00:00')).toBeVisible()
    await userEvent.click(await screen.findByText('More details'))
    expect(await screen.findAllByText('Monitoring performance indicators')).toHaveLength(2)
    expect(await screen.findAllByText('until 06/26/2023 00:00')).toHaveLength(2)
  })
})
