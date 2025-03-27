import 'jest-styled-components'
import React from 'react'

import userEvent    from '@testing-library/user-event'
import EChartsReact from 'echarts-for-react'

import { GraphProps }                      from '@acx-ui/components'
import { useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { intentAIUrl, Provider }           from '@acx-ui/store'
import { mockGraphqlQuery,render, screen } from '@acx-ui/test-utils'

import { mockIntentContext }                  from '../../__tests__/fixtures'
import { Statuses, DisplayStates }            from '../../states'
import { mockedCRRMGraphs, mockedIntentCRRM } from '../__tests__/fixtures'

import { mockCrrmData }                                  from './__tests__/fixtures'
import { DataGraph, detailsZoomScale, IntentAIRRMGraph } from './indexLegacy'

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

  it('should render correctly when active', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockIntentContext({ intent: {
      ...mockedIntentCRRM,
      status: Statuses.active,
      displayStatus: DisplayStates.active
    } })
    render(
      <IntentAIRRMGraph isFullOptimization={false} />,
      { route: { params }, wrapper: Provider }
    )
    expect(screen.queryByText(/The graph and channel plan are generated/)).not.toBeInTheDocument()
    expect(await screen.findByText('View More')).toBeVisible()
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
    expect(screen.getByTestId('hidden-graph')).toBeInTheDocument()
    expect(await screen.findByAltText('rrm-graph-before')).toBeVisible()
    expect(screen.getByAltText('rrm-graph-after')).toBeVisible()
  })

  it('should render correctly for changed preference when active', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockIntentContext({ intent: {
      ...mockedIntentCRRM,
      status: Statuses.active,
      displayStatus: DisplayStates.active
    } })
    render(<IntentAIRRMGraph isFullOptimization={true} />, { route: { params }, wrapper: Provider })
    expect(screen.getByText(/The graph and channel plan are generated/)).toBeInTheDocument()
    expect(screen.getByText(/previously saved/)).toBeInTheDocument()
    expect(await screen.findByText('View More')).toBeVisible()
  })

  it('should render correctly when cannot optimize', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockIntentContext({ intent: {
      ...mockedIntentCRRM,
      status: Statuses.applyScheduleInProgress,
      displayStatus: DisplayStates.applyScheduleInProgress
    } })
    render(
      <IntentAIRRMGraph isFullOptimization={false} />,
      { route: { params }, wrapper: Provider }
    )
    expect(screen.queryByText(/The graph and channel plan are generated/)).not.toBeInTheDocument()
    expect(await screen.findByText('View More')).toBeVisible()
  })

  it('should render correctly when non-active', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockIntentContext({ intent: {
      ...mockedIntentCRRM,
      status: Statuses.new,
      displayStatus: DisplayStates.new
    } })
    render(
      <IntentAIRRMGraph isFullOptimization={false} />,
      { route: { params }, wrapper: Provider }
    )
    expect(screen.queryByText(/The graph and channel plan are generated/)).not.toBeInTheDocument()
    expect(await screen.findByText('View More')).toBeVisible()
  })

  it('should render correctly for changed preference when non-active', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockIntentContext({ intent: {
      ...mockedIntentCRRM,
      status: Statuses.new,
      displayStatus: DisplayStates.new
    } })
    render(<IntentAIRRMGraph isFullOptimization={true} />, { route: { params }, wrapper: Provider })
    expect(screen.getByText(/The graph and channel plan are generated/)).toBeInTheDocument()
    expect(screen.getByText(/default/)).toBeInTheDocument()
    expect(await screen.findByText('View More')).toBeVisible()
  })

  it('should render correctly when no data', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockIntentContext({ intent: {
      ...mockedIntentCRRM,
      status: Statuses.na,
      displayStatus: DisplayStates.naNoAps
    } })
    render(<IntentAIRRMGraph isFullOptimization={true} />, { route: { params }, wrapper: Provider })
    expect(await screen.findByText('Graph modeling will be generated once Intent is activated.'))
      .toBeVisible()
    expect(screen.queryByText(/The graph and channel plan are generated/)).not.toBeInTheDocument()
    expect(screen.queryByText('View More')).not.toBeInTheDocument()
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
  })

  it('should handle drawer', async () => {
    render(<IntentAIRRMGraph />, { route: { params }, wrapper: Provider })
    await userEvent.click(await screen.findByText('View More'))
    expect(await screen.findByText('Key Performance Indications')).toBeVisible()
    expect(await screen.findAllByTestId('rrm-graph')).toHaveLength(4)
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
  })

  it('handle cold tier data', async () => {
    const coldTierDataMock = {
      ...mockedIntentCRRM,
      dataCheck: {
        isHotTierData: false,
        isDataRetained: true
      }
    }
    mockIntentContext({ intent: coldTierDataMock })
    const { container } = render(<IntentAIRRMGraph isFullOptimization={true} />, {
      wrapper: Provider
    })
    expect(container).toHaveTextContent('Metrics / Charts unavailable for data beyond 30 days')
    expect(container).not.toHaveTextContent(/The graph and channel plan are generated/)
  })

  it('handle beyond data retention', async () => {
    const beyondDataRetentionMock = {
      ...mockedIntentCRRM,
      dataCheck: {
        isHotTierData: true,
        isDataRetained: false
      }
    }
    mockIntentContext({ intent: beyondDataRetentionMock })
    const { container } = render(<IntentAIRRMGraph isFullOptimization={true} />, {
      route: { params },
      wrapper: Provider
    })
    expect(container).toHaveTextContent('Beyond data retention period')
    expect(container).not.toHaveTextContent(/The graph and channel plan are generated/)
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
