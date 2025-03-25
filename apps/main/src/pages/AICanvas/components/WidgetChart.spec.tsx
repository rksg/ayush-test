import '@testing-library/jest-dom'
import { DndProvider } from 'react-dnd'
import { TestBackend } from 'react-dnd-test-backend'

import { WidgetListData } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { DraggableChart } from './WidgetChart'

jest.mock('@acx-ui/components', () => {
  const cssNumber = jest.requireActual('@acx-ui/components').cssNumber
  const cssStr = jest.requireActual('@acx-ui/components').cssStr
  const Loader = jest.requireActual('@acx-ui/components').Loader
  const TooltipWrapper = jest.requireActual('@acx-ui/components').TooltipWrapper
  const Card = jest.requireActual('@acx-ui/components').Card
  return {
    cssNumber,
    cssStr,
    Loader,
    TooltipWrapper,
    Card,
    BarChart: () => <div data-testid='BarChart' />,
    DonutChart: () => <div data-testid='DonutChart' />,
    StackedAreaChart: () => <div data-testid='StackedAreaChart' />,
    Table: () => <div data-testid='Table' />
  }
})

describe('WidgetChart', () => {
  const renderWithDndProvider = (component: JSX.Element) => {
    return render(
      <DndProvider backend={TestBackend}>
        {component}
      </DndProvider>
    )
  }
  afterEach(() => {
    jest.clearAllMocks()
  })

  const barChartData = {
    axisType: 'category',
    multiSeries: false,
    chartType: 'bar',
    chartOption: {
      dimensions: [
        'reasonCode',
        'Count of Client Connection Events'
      ],
      source: [
        [
          'EVENT_CLIENT_JOIN',
          37
        ],
        [
          'EVENT_CLIENT_DISCONNECT',
          33
        ],
        [
          'EVENT_CLIENT_INACTIVITY_TIMEOUT',
          4
        ]
      ],
      seriesEncode: [
        {
          x: 'Count of Client Connection Events',
          y: 'reasonCode',
          seriesName: null
        }
      ],
      multiSeries: false
    },
    sessionId: '053fd23c-c362-4306-af03-73a26013c61a',
    id: 'e3ec9fdedc1e47c6b69415265798b457',
    chatId: 'e3ec9fdedc1e47c6b69415265798b457'
  }

  const multipleBarChartData = {
    unit: {
      'Traffic (Total)': 'BYTES'
    },
    axisType: 'category',
    multiSeries: true,
    chartType: 'bar',
    chartOption: {
      dimensions: [
        'switchModel',
        'portSpeed',
        'Traffic (Total)_2.5 Gb/sec',
        'Traffic (Total)_1 Gb/sec'
      ],
      source: [
        [
          'ICX7150-C10ZP',
          '2.5 Gb/sec',
          118633834,
          null
        ],
        [
          'ICX7650-48ZP',
          '1 Gb/sec',
          null,
          1238266301
        ],
        [
          'ICX8200-48P',
          '1 Gb/sec',
          null,
          420828315
        ],
        [
          'ICX7150-C10ZP',
          '1 Gb/sec',
          null,
          2247385121
        ]
      ],
      seriesEncode: [
        {
          x: 'Traffic (Total)_2.5 Gb/sec',
          y: 'switchModel',
          seriesName: '2.5 Gb/sec'
        },
        {
          x: 'Traffic (Total)_1 Gb/sec',
          y: 'switchModel',
          seriesName: '1 Gb/sec'
        }
      ],
      multiSeries: true
    },
    sessionId: '053fd23c-c362-4306-af03-73a26013c61a',
    id: 'e3ec9fdedc1e47c6b69415265798b457',
    chatId: 'e3ec9fdedc1e47c6b69415265798b457'
  }

  const tableData = {
    unit: {
      'Total Traffic (Bytes)': 'BYTES'
    },
    chartType: 'table',
    chartOption: {
      columns: [
        {
          title: 'index',
          dataIndex: 'index',
          key: 'index'
        },
        {
          title: 'Time',
          dataIndex: 'Time',
          key: 'Time'
        },
        {
          title: 'Total Traffic (Bytes)',
          dataIndex: 'Total Traffic (Bytes)',
          key: 'Total Traffic (Bytes)',
          unit: 'BYTES'
        }
      ],
      dataSource: [
        {
          'Total Traffic (Bytes)': '36591498',
          'index': 0,
          'Time': '2025-03-14T00:00:00.000Z'
        },
        {
          'Total Traffic (Bytes)': '175992885',
          'index': 1,
          'Time': '2025-03-14T06:00:00.000Z'
        },
        {
          'Total Traffic (Bytes)': '170293945',
          'index': 2,
          'Time': '2025-03-14T12:00:00.000Z'
        }
      ]
    },
    sessionId: '053fd23c-c362-4306-af03-73a26013c61a',
    id: 'e3ec9fdedc1e47c6b69415265798b457',
    chatId: 'e3ec9fdedc1e47c6b69415265798b457'
  }

  const groupsData = [
    {
      id: 'default_group',
      sectionId: 'default_section',
      type: 'group',
      cards: []
    }
  ]

  it('should render Draggable Single Bar Chart correctly', async () => {
    renderWithDndProvider(
      <Provider>
        <DraggableChart
          data={barChartData as unknown as WidgetListData}
          groups={groupsData}
        />
      </Provider>
    )
    expect(await screen.findByTestId('BarChart')).toBeVisible()
  })

  it('should render Draggable Multiple Bar Chart correctly', async () => {
    renderWithDndProvider(
      <Provider>
        <DraggableChart
          data={multipleBarChartData as unknown as WidgetListData}
          groups={groupsData}
        />
      </Provider>
    )
    expect(await screen.findByTestId('BarChart')).toBeVisible()
  })

  it('should render Draggable Table correctly', async () => {
    renderWithDndProvider(
      <Provider>
        <DraggableChart
          data={tableData as unknown as WidgetListData}
          groups={groupsData}
        />
      </Provider>
    )
    expect(await screen.findByTestId('Table')).toBeVisible()
  })
})