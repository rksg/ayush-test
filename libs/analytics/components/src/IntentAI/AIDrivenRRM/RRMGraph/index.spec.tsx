import userEvent    from '@testing-library/user-event'
import EChartsReact from 'echarts-for-react'

import { GraphProps }                       from '@acx-ui/components'
import { Provider, recommendationUrl }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { transformDetailsResponse }           from '../../useIntentDetailsQuery'
import { mockedCRRMGraphs, mockedIntentCRRM } from '../__tests__/fixtures'

import { mockCrrmData } from './__tests__/fixtures'

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
      data: { intent: mockedCRRMGraphs }
    })
  })

  it('should render correctly', async () => {
    const details = transformDetailsResponse(mockedIntentCRRM)
    render(<IntentAIRRMGraph details={details} crrmData={mockCrrmData}/>, { wrapper: Provider })
    expect(await screen.findByText('View More')).toBeVisible()
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
    expect(screen.getByRole('img', { name: 'summary-before' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'summary-after' })).toBeVisible()
  })

  it('should handle drawer', async () => {
    const details = transformDetailsResponse(mockedIntentCRRM)
    render(<IntentAIRRMGraph details={details} crrmData={mockCrrmData}/>, { wrapper: Provider })
    await userEvent.click(await screen.findByText('View More'))
    expect(await screen.findByText('Key Performance Indications')).toBeVisible()
    expect(await screen.findAllByTestId('rrm-graph')).toHaveLength(2)
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
  })
})
