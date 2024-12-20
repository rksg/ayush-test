import 'jest-styled-components'
import React from 'react'

import userEvent    from '@testing-library/user-event'
import EChartsReact from 'echarts-for-react'

import { GraphProps }                       from '@acx-ui/components'
import { intentAIUrl, Provider }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockIntentContext }                  from '../../__tests__/fixtures'
import { Statuses }                           from '../../states'
import { mockedCRRMGraphs, mockedIntentCRRM } from '../__tests__/fixtures'

import { mockCrrmData } from './__tests__/fixtures'

import { DataGraph, detailsZoomScale, IntentAIRRMGraph } from '.'

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
    const mockInstance = {
      dispatchAction: jest.fn(),
      getDataURL: jest.fn(() => 'data:image/png;base64,...')
    }

    const mockChartInstance = { getEchartsInstance: () => mockInstance } as unknown as EChartsReact
    setTimeout(() => chartRef(mockChartInstance), 0)

    if (onEvents?.mouseover) {
      onEvents.mouseover({ seriesIndex: '0', name: 'AP X' })
    }
    if (onEvents?.mouseout) {
      onEvents.mouseout()
    }
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
  const params = {
    root: mockedIntentCRRM.root,
    sliceId: mockedIntentCRRM.sliceId,
    code: mockedIntentCRRM.code
  }
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(+new Date('2023-07-15T14:15:00.000Z'))
    mockIntentContext({ intent: mockedIntentCRRM })
    mockGraphqlQuery(intentAIUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
  })

  it('should render correctly for active states', async () => {
    render(<IntentAIRRMGraph />, { route: { params }, wrapper: Provider })

    expect(await screen.findByText('View More')).toBeVisible()
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
    expect(screen.getByTestId('hidden-graph')).toBeInTheDocument()
    expect(await screen.findByAltText('rrm-graph-before')).toBeVisible()
    expect(screen.getByAltText('rrm-graph-after')).toBeVisible()
  })

  it('should render correctly for non-active states', async () => {
    mockIntentContext({ intent: { ...mockedIntentCRRM, status: Statuses.na } })

    render(<IntentAIRRMGraph />, { route: { params }, wrapper: Provider })
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Graph modeling will be generated once Intent is activated.')).toBeVisible()
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
  })

  it('should handle drawer', async () => {
    render(<IntentAIRRMGraph />, { route: { params }, wrapper: Provider })
    await userEvent.click(await screen.findByText('View More'))
    expect(await screen.findByText('Key Performance Indications')).toBeVisible()
    expect(await screen.findAllByTestId('rrm-graph')).toHaveLength(4)
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
  })

  it('handle beyond data retention', async () => {
    jest.mocked(Date.now).mockRestore()
    mockIntentContext({ intent: mockedIntentCRRM })
    const { container } = render(<IntentAIRRMGraph />, {
      route: { params },
      wrapper: Provider
    })
    expect(container).toHaveTextContent('Beyond data retention period')
  })
})

describe('DataGraph', () => {
  it('dispatches showTip on mouseover and hideTip on mouseout', async () => {
    const mockDispatchAction = jest.fn()
    const graphGroupRef = { current: [{ dispatchAction: mockDispatchAction }] }

    jest.spyOn(React, 'useRef').mockReturnValue(graphGroupRef)

    render(
      <DataGraph
        graphs={[mockCrrmData[0]]}
        zoomScale={detailsZoomScale}
      />
    )

    const graphs = screen.getAllByTestId('rrm-graph')
    expect(graphs).toHaveLength(2)

    await userEvent.hover(graphs[0])

    expect(mockDispatchAction).toHaveBeenCalledTimes(4)
    expect(mockDispatchAction).toHaveBeenCalledWith({
      type: 'showTip',
      seriesIndex: '0',
      name: 'AP X'
    })

    await userEvent.unhover(graphs[0])

    expect(mockDispatchAction).toHaveBeenCalledTimes(4)
    expect(mockDispatchAction).toHaveBeenCalledWith({ type: 'hideTip' })
  })
})
