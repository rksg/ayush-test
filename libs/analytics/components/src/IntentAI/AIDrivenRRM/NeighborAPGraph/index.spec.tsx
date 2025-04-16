import 'jest-styled-components'
import React from 'react'

import userEvent from '@testing-library/user-event'

import { intentAIUrl, Provider }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockIntentContext }                  from '../../__tests__/fixtures'
import { Statuses, DisplayStates }            from '../../states'
import { mockedCRRMGraphs, mockedIntentCRRM } from '../__tests__/fixtures'
import { mockCrrmData }                       from '../RRMGraph/__tests__/fixtures'

import { DataGraph, NeighborAPGraph } from '.'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  NeighborAPGraphComponent: (props: Record<string, unknown>) =>
    <div data-testid='neighbor-ap-graph' {...props} />,
  Card: ({ children }: { children: React.ReactNode }) =>
    <div data-testid='card'>{children}</div>,
  Drawer: ({
    children,
    visible,
    onClose
  }: {
    children: React.ReactNode,
    visible: boolean,
    onClose: () => void
  }) =>
    visible ? (
      <div data-testid='drawer'>
        <button data-testid='CloseSymbol' onClick={onClose}>Close</button>
        {children}
      </div>
    ) : null,
  DrawerTypes: {
    FullHeight: 'FullHeight'
  },
  Loader: ({ children }: { children: React.ReactNode }) =>
    <div data-testid='loader'>{children}</div>,
  nodeTypes: {
    nonInterfering: { color: '#00FF00' },
    interfering: { color: '#FF0000' },
    rogue: { color: '#0000FF' }
  }
}))

jest.mock('../../IntentContext')

jest.mock('../RRMGraph/Legend', () => ({
  Legend: () => <div data-testid='legend' />
}))

jest.mock('../RRMGraph', () => ({
  GraphTitle: () => <div data-testid='graph-title'>Neighbor AP Graph</div>
}))

jest.mock('../RRMGraph/services', () => ({
  useIntentAICRRMQuery: () => ({
    data: mockedCRRMGraphs,
    loading: false,
    error: null
  })
}))

jest.mock('react-virtualized-auto-sizer', () => ({
  __esModule: true,
  default: ({
    children
  }: {
    children: (props: { width: number, height: number }) => React.ReactNode
  }) =>
    <div data-testid='auto-sizer'>
      {children({ width: 500, height: 300 })}
    </div>
}))

describe('NeighborAPGraph', () => {
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
    mockIntentContext({
      intent: {
        ...mockedIntentCRRM,
        status: Statuses.active,
        displayStatus: DisplayStates.active
      }
    })

    render(
      <NeighborAPGraph />,
      { route: { params }, wrapper: Provider }
    )

    expect(await screen.findByText('View More')).toBeVisible()
    expect(screen.getByTestId('graph-wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('graph-title')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('should render correctly when no data', async () => {
    mockIntentContext({
      intent: {
        ...mockedIntentCRRM,
        status: Statuses.na,
        displayStatus: DisplayStates.naNoAps
      }
    })

    render(<NeighborAPGraph />, { route: { params }, wrapper: Provider })

    expect(await screen.findByText('Graph modeling will be generated once Intent is activated.'))
      .toBeVisible()
    expect(screen.queryByText(/The graph and channel plan are generated/)).not.toBeInTheDocument()
    expect(screen.queryByText('View More')).not.toBeInTheDocument()
    expect(screen.queryByTestId('rrm-comparison-button')).toBeNull()
  })

  it('should handle cold tier data', async () => {
    const coldTierDataMock = {
      ...mockedIntentCRRM,
      dataCheck: {
        isHotTierData: false,
        isDataRetained: true
      }
    }
    mockIntentContext({ intent: coldTierDataMock })

    const { container } = render(<NeighborAPGraph />, { route: { params }, wrapper: Provider })
    expect(container).toHaveTextContent('Metrics / Charts unavailable for data beyond 30 days')
    expect(container).not.toHaveTextContent(/The graph and channel plan are generated/)
  })

  it('should render correctly when data is not retained', async () => {
    const beyondDataRetentionMock = {
      ...mockedIntentCRRM,
      dataCheck: {
        isHotTierData: true,
        isDataRetained: false
      }
    }
    mockIntentContext({ intent: beyondDataRetentionMock })

    const { container } = render(<NeighborAPGraph />, { route: { params }, wrapper: Provider })
    expect(container).toHaveTextContent('Beyond data retention period')
    expect(container).not.toHaveTextContent(/The graph and channel plan are generated/)
  })

  it('should handle drawer', async () => {
    render(<NeighborAPGraph />, { route: { params }, wrapper: Provider })
    await userEvent.click(await screen.findByText('View More'))
    expect(await screen.findAllByTestId('graph-wrapper')).toHaveLength(1)
    expect(await screen.findAllByTestId('graph-title')).toHaveLength(2)
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
  })
})

describe('DataGraph', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<DataGraph data={mockCrrmData} isDrawer={false} />)

    // eslint-disable-next-line testing-library/no-node-access
    const graphs = asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]')
    expect(graphs).toHaveLength(2)
    const arrow = screen.queryByTestId('ArrowChevronRight')
    expect(arrow).toBeVisible()
  })

  it('should render correctly when drawer is open', async () => {
    const { asFragment } = render(<DataGraph data={mockCrrmData} isDrawer={true} />)

    // eslint-disable-next-line testing-library/no-node-access
    const graphs = asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]')
    expect(graphs).toHaveLength(2)
    const arrow = screen.queryByTestId('ArrowChevronRight')
    expect(arrow).toBeVisible()
  })

  it('should not render when data is empty', () => {
    const { asFragment } = render(<DataGraph data={[]} isDrawer={false} />)

    // eslint-disable-next-line testing-library/no-node-access
    const graphs = asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]')
    expect(graphs).toHaveLength(0)
    const arrow = screen.queryByTestId('ArrowChevronRight')
    expect(arrow).not.toBeInTheDocument()
  })
})
