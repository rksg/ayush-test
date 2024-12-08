import 'jest-styled-components'
import userEvent    from '@testing-library/user-event'
import EChartsReact from 'echarts-for-react'

import { GraphProps }     from '@acx-ui/components'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { mockIntentContext } from '../../__tests__/fixtures'
import { Statuses }          from '../../states'
import { mockedIntentCRRM }  from '../__tests__/fixtures'

import { mockCrrmData } from './__tests__/fixtures'

import { IntentAIRRMGraph } from '.'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Graph: ({
    data,
    chartRef,
    zoomScale,
    onEvents,
    backgroundColor,
    ...props
  }: GraphProps) => {
    // to get connectChart covered
    const getEchartsInstance = jest.fn(() => ({ group: '' }))
    chartRef({ getEchartsInstance } as unknown as EChartsReact)
    expect(getEchartsInstance).toHaveBeenCalledTimes(1)
    return <div {...props} data-testid='rrm-graph' />
  }
}))
jest.mock('../../IntentContext')
jest.mock('./Legend', () => ({
  Legend: () => <div data-testid='rrm-legend' />
}))
jest.mock('./DownloadRRMComparison', () => ({
  DownloadRRMComparison: () => <div data-testid='rrm-comparison-button' />
}))

describe('CloudRRM', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(+new Date('2023-07-15T14:15:00.000Z'))
    mockIntentContext({ intent: mockedIntentCRRM })
  })

  it('should render correctly for active states', async () => {
    render(<IntentAIRRMGraph
      crrmData={mockCrrmData}
      summaryUrlBefore='data:image/svg+xml;charset=UTF-8,img-before.png'
      summaryUrlAfter='data:image/svg+xml;charset=UTF-8,img-after.png'
    />, { wrapper: Provider })

    expect(await screen.findByText('View More')).toBeVisible()
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
    expect(screen.getByAltText('rrm-graph-before')).toBeVisible()
    expect(screen.getByAltText('rrm-graph-after')).toBeVisible()
  })

  it('should render correctly for non-active states', async () => {
    mockIntentContext({ intent: { ...mockedIntentCRRM, status: Statuses.na } })

    render(<IntentAIRRMGraph crrmData={mockCrrmData} />, { wrapper: Provider })
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Graph modeling will be generated once Intent is activated.')).toBeVisible()
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
  })

  it('should handle drawer', async () => {
    render(<IntentAIRRMGraph crrmData={mockCrrmData} />, { wrapper: Provider })
    await userEvent.click(await screen.findByText('View More'))
    expect(await screen.findByText('Key Performance Indications')).toBeVisible()
    expect(await screen.findAllByTestId('rrm-graph')).toHaveLength(2)
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
  })

  it('handle beyond data retention', async () => {
    jest.mocked(Date.now).mockRestore()
    mockIntentContext({ intent: mockedIntentCRRM })
    const { container } = render(<IntentAIRRMGraph crrmData={mockCrrmData} />, {
      wrapper: Provider
    })
    expect(container).toHaveTextContent('Beyond data retention period')
  })
})
