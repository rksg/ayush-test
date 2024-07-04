import userEvent    from '@testing-library/user-event'
import EChartsReact from 'echarts-for-react'

import { GraphProps }                       from '@acx-ui/components'
import { Provider, recommendationUrl }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedRecommendationCRRM } from '../__tests__/fixtures'
import { EnhancedRecommendation }                     from '../services'

import { IntentAIRRMGraph } from '.'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Graph: ({ data, chartRef, zoomScale, ...props }: GraphProps) => {
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
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
  })

  it('should render correctly', async () => {
    const details = mockedRecommendationCRRM as EnhancedRecommendation
    render(<IntentAIRRMGraph details={details}/>, { wrapper: Provider })
    expect(await screen.findByText('View More')).toBeVisible()
    expect(await screen.findAllByTestId('rrm-graph')).toHaveLength(2)
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
  })

  it('should handle drawer', async () => {
    const details = mockedRecommendationCRRM as EnhancedRecommendation
    render(<IntentAIRRMGraph details={details}/>, { wrapper: Provider })
    await userEvent.click(await screen.findByText('View More'))
    expect(await screen.findByText('Key Performance Indications')).toBeVisible()
    expect(await screen.findAllByTestId('rrm-graph')).toHaveLength(4)
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
  })
})
