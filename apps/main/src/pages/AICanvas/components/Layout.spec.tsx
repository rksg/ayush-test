import '@testing-library/jest-dom'
import userEvent       from '@testing-library/user-event'
import { rest }        from 'msw'
import { DndProvider } from 'react-dnd'
import { TestBackend } from 'react-dnd-test-backend'

import { BarChartData, TimeSeriesChartData } from '@acx-ui/analytics/utils'
import { DonutChartData }                    from '@acx-ui/components'
import { RuckusAiChatUrlInfo, TableData }    from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  fireEvent
} from '@acx-ui/test-utils'

import { CardInfo, Group, LayoutConfig, Section } from '../Canvas'

import Layout             from './Layout'
import { getChartConfig } from './WidgetChart'

const DEFAULT_CANVAS = [
  {
    id: 'default_section',
    type: 'section',
    hasTab: false,
    groups: [
      {
        id: 'default_group',
        sectionId: 'default_section',
        type: 'group',
        cards: [
          {
            axisType: 'category',
            multiSeries: false,
            chartType: 'bar',
            chartOption: {
              dimensions: [
                'Current Connection Status',
                'AP Count'
              ],
              source: [
                [
                  'Offline',
                  3
                ],
                [
                  'Online',
                  1
                ]
              ],
              seriesEncode: [
                {
                  x: 'AP Count',
                  y: 'Current Connection Status',
                  seriesName: null
                }
              ],
              multiSeries: false
            },
            sessionId: '989a8e31-f282-497e-be3b-14478f5c1cf9',
            id: '685e5931349d4f86867419a67dc93ec92d8900ce-29d3-4677-9ddc-0c5aae9ade15',
            chatId: '685e5931349d4f86867419a67dc93ec9',
            type: 'card',
            isShadow: false,
            width: 2,
            height: 6,
            currentSizeIndex: 0,
            sizes: [
              {
                width: 2,
                height: 6
              },
              {
                width: 3,
                height: 10
              },
              {
                width: 4,
                height: 12
              }
            ],
            gridx: 0,
            gridy: 0
          },
          {
            axisType: 'time',
            multiSeries: false,
            chartType: 'line',
            chartOption: [
              {
                key: 'time_Alert Count',
                name: 'Alert Count',
                data: [
                  [
                    '2025-01-12T07:00:00.000Z',
                    2
                  ],
                  [
                    '2025-01-12T11:00:00.000Z',
                    1
                  ],
                  [
                    '2025-01-12T12:00:00.000Z',
                    2
                  ],
                  [
                    '2025-01-12T17:00:00.000Z',
                    1
                  ],
                  [
                    '2025-01-12T21:00:00.000Z',
                    1
                  ]
                ]
              }
            ],
            sessionId: '2c5e6092-3f76-455e-aba3-d3a978420f6a',
            id: '4b253c8ae13a4bc691ab5f31f199dcf271273268-bed1-4383-8670-f66981c32ca2',
            chatId: '4b253c8ae13a4bc691ab5f31f199dcf2',
            type: 'card',
            isShadow: false,
            width: 2,
            height: 6,
            currentSizeIndex: 0,
            sizes: [
              {
                width: 2,
                height: 6
              },
              {
                width: 4,
                height: 8
              }
            ],
            gridx: 2,
            gridy: 0
          },
          {
            multiSeries: false,
            chartType: 'pie',
            chartOption: [
              {
                name: 'RKS-Samsung-OWE_24_6',
                value: 7
              },
              {
                name: 'RKS-Samsung-WPA3-SAE_24_5',
                value: 1
              },
              {
                name: 'RKS-Samsung-WPA3-SAE_5_6',
                value: 1
              }
            ],
            sessionId: '4a404107-964a-47a1-912e-60b4db2c03ef',
            id: '677dc63aeb844f6f93334b0a41b5ad15dda4181f-4c05-4cde-9950-04bbafcf6aed',
            chatId: '677dc63aeb844f6f93334b0a41b5ad15',
            type: 'card',
            isShadow: false,
            width: 1,
            height: 4,
            currentSizeIndex: 0,
            sizes: [
              {
                width: 1,
                height: 4
              },
              {
                width: 2,
                height: 8
              },
              {
                width: 4,
                height: 12
              }
            ],
            gridx: 0,
            gridy: 6
          },
          {
            multiSeries: false,
            chartType: 'table',
            chartOption: {
              columns: [
                {
                  title: 'index',
                  dataIndex: 'index',
                  key: 'index'
                },
                {
                  title: 'severity',
                  dataIndex: 'severity',
                  key: 'severity'
                },
                {
                  title: 'category',
                  dataIndex: 'category',
                  key: 'category'
                },
                {
                  title: 'eventType',
                  dataIndex: 'eventType',
                  key: 'eventType'
                },
                {
                  title: 'reason',
                  dataIndex: 'reason',
                  key: 'reason'
                },
                {
                  title: 'Event Count',
                  dataIndex: 'Event Count',
                  key: 'Event Count'
                }
              ],
              dataSource: [
                {
                  'severity': 'Informational',
                  'reason': 'Unknown',
                  'Event Count': 31,
                  'index': 0,
                  'eventType': 'clientInfoUpdate',
                  'category': 'Client'
                },
                {
                  'severity': 'Informational',
                  'reason': 'Unknown',
                  'Event Count': 28,
                  'index': 1,
                  'eventType': 'clientJoin',
                  'category': 'Client'
                },
                {
                  'severity': 'Informational',
                  'reason': 'Unknown',
                  'Event Count': 11,
                  'index': 2,
                  'eventType': 'clientInactivityTimeout',
                  'category': 'Client'
                },
                {
                  'severity': 'Informational',
                  'reason': 'Unknown',
                  'Event Count': 9,
                  'index': 3,
                  'eventType': 'clientDisconnect',
                  'category': 'Client'
                },
                {
                  'severity': 'Informational',
                  'reason': 'Unknown',
                  'Event Count': 6,
                  'index': 4,
                  'eventType': 'apChannelChanged',
                  'category': 'AP'
                },
                {
                  'severity': 'Informational',
                  'reason': 'Unknown',
                  'Event Count': 1,
                  'index': 5,
                  'eventType': 'apDiscoverySuccess',
                  'category': 'AP'
                },
                {
                  'severity': 'Informational',
                  'reason': 'Unknown',
                  'Event Count': 1,
                  'index': 6,
                  'eventType': 'apHealthAirtimeUtilizationClear',
                  'category': 'AP'
                },
                {
                  'severity': 'Warning',
                  'reason': 'Unknown',
                  'Event Count': 1,
                  'index': 7,
                  'eventType': 'apHealthAirtimeUtilizationFlag',
                  'category': 'AP'
                },
                {
                  'severity': 'Warning',
                  'reason': 'Unknown',
                  'Event Count': 1,
                  'index': 8,
                  'eventType': 'apHealthLatencyFlag',
                  'category': 'AP'
                },
                {
                  'severity': 'Informational',
                  'reason': 'Unknown',
                  'Event Count': 1,
                  'index': 9,
                  'eventType': 'clientRoaming',
                  'category': 'Client'
                },
                {
                  'severity': 'Informational',
                  'reason': 'Unknown',
                  'Event Count': 1,
                  'index': 10,
                  'eventType': 'clientSessionRenewal',
                  'category': 'Client'
                }
              ]
            },
            sessionId: '8f0bb053-a4ba-466d-8ff2-e0c27a6f390e',
            id: 'dab6c3ec87c7430fb5eeb98df1f93310b7d911f9-561b-4311-9d20-609aeb67b86e',
            chatId: 'dab6c3ec87c7430fb5eeb98df1f93310',
            type: 'card',
            isShadow: false,
            width: 2,
            height: 6,
            currentSizeIndex: 0,
            sizes: [
              {
                width: 2,
                height: 6
              },
              {
                width: 4,
                height: 10
              }
            ],
            gridx: 1,
            gridy: 6
          }
        ]
      }
    ]
  }
] as unknown as Section[]

const PIE_CANVAS = [
  {
    id: 'default_section',
    type: 'section',
    hasTab: false,
    groups: [
      {
        id: 'default_group',
        sectionId: 'default_section',
        type: 'group',
        cards: [
          {
            multiSeries: false,
            chartType: 'pie',
            chartOption: [
              {
                name: 'RKS-Samsung-OWE_24_6',
                value: 7
              },
              {
                name: 'RKS-Samsung-WPA3-SAE_24_5',
                value: 1
              },
              {
                name: 'RKS-Samsung-WPA3-SAE_5_6',
                value: 1
              }
            ],
            sessionId: '4a404107-964a-47a1-912e-60b4db2c03ef',
            id: '677dc63aeb844f6f93334b0a41b5ad15dda4181f-4c05-4cde-9950-04bbafcf6aed',
            chatId: '677dc63aeb844f6f93334b0a41b5ad15',
            type: 'card',
            isShadow: false,
            width: 1,
            height: 4,
            currentSizeIndex: 0,
            sizes: [
              {
                width: 1,
                height: 4
              },
              {
                width: 2,
                height: 8
              },
              {
                width: 4,
                height: 12
              }
            ],
            gridx: 0,
            gridy: 6
          }
        ]
      }
    ]
  }
] as unknown as Section[]

const chart = {
  chartOption: [
    {
      key: 'switchId_Total Uplink Traffic (Bytes)',
      name: 'Total Uplink Traffic (Bytes)',
      data: [
        [
          'D4:C1:9E:15:E9:21',
          278871529
        ],
        [
          '58:FB:96:0E:81:B2',
          46174041
        ]
      ]
    },
    {
      key: 'switchId_Total Downlink Traffic (Bytes)',
      name: 'Total Downlink Traffic (Bytes)',
      data: [
        [
          'D4:C1:9E:15:E9:21',
          12376117
        ],
        [
          '58:FB:96:0E:81:B2',
          6073197
        ]
      ]
    }
  ]
}

const layout: LayoutConfig = {
  containerWidth: 1200,
  containerHeight: 700, // min height
  calWidth: 380,
  rowHeight: 50,
  col: 4, // fixed (for R1)
  margin: [20, 10],
  containerPadding: [0, 0] // deprecated
}

// jest.mock('./GroupItem', () => () => <div>GroupItem</div>)
const mockedSetGroups = jest.fn()
const mockedSetLayout = jest.fn()
const mockedSetShadowCard = jest.fn()

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

jest.mock('./CustomizeWidgetDrawer', () => () => <div>CustomizeWidgetDrawer</div>)

jest.mock('@acx-ui/rc/services', () => {
  return {
    useGetWidgetQuery: jest.fn().mockReturnValue(chart),
    useCreateWidgetMutation: () => [
      jest.fn(() => ({
        then: jest.fn().mockResolvedValue({
          id: '123'
        })
      }))
    ]
  }
})

describe('Layout', () => {
  const renderWithDndProvider = (component: JSX.Element) => {
    return render(
      <DndProvider backend={TestBackend}>
        {component}
      </DndProvider>
    )
  }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RuckusAiChatUrlInfo.getWidget.url,
        (req, res, ctx) => res(ctx.json(chart))
      )
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly', async () => {
    renderWithDndProvider(
      <Provider>
        <Layout
          sections={DEFAULT_CANVAS}
          groups={DEFAULT_CANVAS.reduce((acc:Group[], cur:Section) => [...acc, ...cur.groups], [])}
          setGroups={mockedSetGroups}
          compactType={'horizontal'}
          layout={layout}
          setLayout={mockedSetLayout}
          shadowCard={{} as CardInfo}
          setShadowCard={mockedSetShadowCard}
          canvasId={DEFAULT_CANVAS[0].id}
        />
      </Provider>
    )
    expect(await screen.findByTestId('BarChart')).toBeVisible()
    expect(await screen.findByTestId('DonutChart')).toBeVisible()
    expect(await screen.findByTestId('StackedAreaChart')).toBeVisible()
    expect(await screen.findByTestId('Table')).toBeVisible()
    const dragItem = await screen.findByTestId('BarChart')
    const dropItem = await screen.findByTestId('dropGroup')
    fireEvent.dragStart(dragItem)
    fireEvent.dragEnter(dropItem)
    await new Promise((resolve) => setTimeout(resolve, 100))
    fireEvent.drop(dropItem)
    fireEvent.dragLeave(dropItem)
    fireEvent.dragEnd(dragItem)
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(mockedSetGroups).toHaveBeenCalled()
  })

  it('should operate card correctly', async () => {
    renderWithDndProvider(
      <Provider>
        <Layout
          sections={PIE_CANVAS}
          groups={PIE_CANVAS.reduce((acc:Group[], cur:Section) => [...acc, ...cur.groups], [])}
          setGroups={mockedSetGroups}
          compactType={'horizontal'}
          layout={layout}
          setLayout={mockedSetLayout}
          shadowCard={{} as CardInfo}
          setShadowCard={mockedSetShadowCard}
          canvasId={PIE_CANVAS[0].id}
        />
      </Provider>
    )
    expect(await screen.findByTestId('DonutChart')).toBeVisible()
    const increaseCard = await screen.findByTestId('increaseCard')
    await userEvent.click(increaseCard)
    expect(mockedSetGroups).toBeCalled()
    const decreaseCard = await screen.findByTestId('decreaseCard')
    await userEvent.click(decreaseCard)
    expect(mockedSetGroups).toBeCalled()
    const deleteCard = await screen.findByTestId('deleteCard')
    await userEvent.click(deleteCard)
    expect(mockedSetGroups).toBeCalled()
  })

  it('should execute getChartConfig correctly', () => {
    expect(getChartConfig( {
      id: '123',
      chatId: '456',
      sessionId: '789',
      chartType: 'pie',
      chartOption: [] as unknown as DonutChartData[] & TimeSeriesChartData[]
        & BarChartData & TableData
    })).toEqual({
      width: 1,
      height: 4,
      currentSizeIndex: 0,
      sizes: [
        {
          width: 1,
          height: 4
        },
        {
          width: 2,
          height: 8
        },
        {
          width: 4,
          height: 12
        }
      ]
    })
  })
})