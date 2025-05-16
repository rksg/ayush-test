import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useSendFeedbackMutation } from '@acx-ui/rc/services'
import { RuckusAiChatUrlInfo }     from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { getStreamingWordingKey } from './index.utils'

import AICanvas from '.'

const currentCanvas = {
  id: '001',
  name: 'Dashboard Canvas',
  visible: true,
  dashboardIds: ['123'],
  content: `[{
    "id":"default_section",
    "type":"section",
    "hasTab":false,
    "groups":[
      {
        "id":"default_group",
        "sectionId":"default_section",
        "type":"group",
        "cards":[
          {
            "axisType":"category","multiSeries":false,"chartType":"bar","chartOption":{
            "dimensions":["Current Connection Status","AP Count"],
            "source":[["Offline",3],["Online",1]],
            "seriesEncode":[{"x":"AP Count","y":"Current Connection Status","seriesName":null}],
            "multiSeries":false},"sessionId":"989a8e31-f282-497e-be3b-14478f5c1cf9",
            "id":"685e5931349d4f86867419a67dc93ec92d8900ce-29d3-4677-9ddc-0c5aae9ade15",
            "chatId":"685e5931349d4f86867419a67dc93ec9","type":"card","isShadow":false,
            "width":2,"height":6,"currentSizeIndex":0,
            "sizes":[{"width":2,"height":6},{"width":3,"height":10},{"width":4,"height":12}],
            "gridx":0,"gridy":0}]
          }
        ]
      }
    ]`
}

jest.mock('./HistoryDrawer', () => () => <div>History Drawer</div>)
jest.mock('./Canvas', () => {
  const { forwardRef } = jest.requireActual('react')
  return forwardRef(() => <div>Canvas</div>)
})
jest.mock('./components/WidgetChart', () => ({
  DraggableChart: () => <div>DraggableChart</div>
}))

const mockedSetModal = jest.fn()

const mockedShowActionModal = jest.fn()
jest.mock('@acx-ui/components', () => {
  const Loader = jest.requireActual('@acx-ui/components').Loader
  const Tooltip = jest.requireActual('@acx-ui/components').Tooltip
  const Button = jest.requireActual('antd').Button
  const Card = jest.requireActual('@acx-ui/components').Card
  return {
    Card,
    Button,
    Loader,
    Tooltip,
    showActionModal: () => mockedShowActionModal
  }
})

jest.mock('@acx-ui/rc/services', () => {
  const useGetAllChatsQuery = jest.requireActual('@acx-ui/rc/services').useGetAllChatsQuery
  return {
    useGetAllChatsQuery,
    useGetChatsMutation: () => [
      jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue({
          page: 1,
          totalCount: 5,
          totalPages: 1,
          data: [
            {
              id: 'afa2591ede524f3884e21acd06ccb8b4',
              role: 'AI',
              text: 'Failed to get response from AI....',
              created: '2025-02-10T11:05:26.373+00:00',
              widgets: [{
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
                ]
              }],
              userFeedback: 'THUMBS_UP'
            },
            {
              id: '39f10e1e9daa47adba1dffcbd3dcd0cd',
              role: 'USER',
              text: 'what can you do?',
              created: '2025-02-10T11:05:26.365+00:00'
            },
            {
              id: '9ca71a804ef94a5bb737f810d5e3b42c',
              role: 'AI',
              text: 'There were 0 clients connected to your network yesterday.',
              created: '2025-02-09T06:32:52.032+00:00',
              widgets: [
                {
                  axisType: 'time',
                  chartType: 'line',
                  chartOption: [
                    {
                      key: 'time_Switch Count',
                      name: 'Switch Count',
                      data: [
                        ['2025-04-10T00:00:00.000Z', 1],
                        ['2025-04-10T01:00:00.000Z', 1],
                        ['2025-04-10T02:00:00.000Z', 1]
                      ]
                    }
                  ]
                }
              ],
              userFeedback: 'THUMBS_UP'
            },
            {
              id: 'c135850785b541ab9efbb8f4aedaf4f6',
              role: 'USER',
              text: 'How many clients were connected to my network yesterday?',
              created: '2025-02-09T06:32:44.736+00:00'
            },
            {
              id: 'd259dc3cb138478c9c4bcc48f9270602',
              role: 'SYSTEM',
              text: 'Some older messages have been removed due to the 30-day retention policy',
              created: '2025-02-06T02:10:46.264+00:00'
            },
            {
              id: 'b401cdf8c6274914927151cdde562bb6',
              role: 'USER',
              text: 'hello',
              created: '2025-01-20T09:56:11.258+00:00'
            },
            {
              id: 'f8791011b0704d849b5fdd93fe1deb18',
              role: 'AI',
              text: 'Hello! I can help you!',
              created: '2025-01-20T09:56:11.265+00:00'
            }
          ] })
      }))
    ],
    useChatAiMutation: () => [
      jest.fn().mockResolvedValue({
        data: {
          sessionId: 'b2c7f415-4306-4ecf-a001-dd7288eca7f8',
          title: 'New Chat',
          updatedDate: '2025-01-20T09:56:05.006+00:00',
          messages: [
            {
              id: 'b401cdf8c6274914927151cdde562bb6',
              role: 'USER',
              text: 'hello',
              created: '2025-01-20T09:56:11.258+00:00'
            },
            {
              id: 'f8791011b0704d849b5fdd93fe1deb18',
              role: 'AI',
              text: 'Hello! I can help you!',
              created: '2025-01-20T09:56:11.265+00:00'
            }
          ],
          totalCount: 2
        } })
    ],
    useGetCanvasQuery: () => ({ data: [
      currentCanvas,
      {
        id: '002',
        name: 'Second Canvas',
        content: ''
      }
    ] }),
    useStreamChatsAiMutation: () => [
      jest.fn().mockResolvedValue({
        data: {
          sessionId: 'b2c7f415-4306-4ecf-a001-dd7288eca7f8',
          title: 'New Chat',
          updatedDate: '2025-01-20T09:56:05.006+00:00',
          messages: [
            {
              id: 'b401cdf8c6274914927151cdde562bb6',
              role: 'USER',
              text: 'hello',
              created: '2025-01-20T09:56:11.258+00:00'
            },
            {
              id: 'f8791011b0704d849b5fdd93fe1deb18',
              role: 'STATUS',
              text: '0',
              created: '2025-01-20T09:56:11.265+00:00'
            }
          ],
          totalCount: 2
        } })
    ],
    useStopChatMutation: jest.fn(() => [jest.fn()]),
    useSendFeedbackMutation: jest.fn(() => [jest.fn()])
  }
})

const mockedSendFeedback = jest.fn().mockResolvedValue({})

const chats = [
  {
    id: '2c5e6092-3f76-455e-aba3-d3a978420f6a',
    name: 'Alerts Widget Generation Request',
    updatedDate: '2025-01-13T02:41:03.223+00:00'
  },
  {
    id: 'f71c8bf5-e322-43c9-8bc5-4d0d57213fce',
    name: 'Alerts Widget Generation Request',
    updatedDate: '2025-01-13T02:44:09.304+00:00'
  },
  {
    id: '83907cd3-9d41-47e0-b879-7efecf886e8f',
    name: 'Integration',
    updatedDate: '2025-01-13T02:48:40.069+00:00'
  },
  {
    id: '4a404107-964a-47a1-912e-60b4db2c03ef',
    name: 'Top Wi-Fi Networks Pie Chart Generation Request',
    updatedDate: '2025-01-08T10:21:51.552+00:00'
  },
  {
    id: '2c5e6092-3f76-455e-aba3-d3a978420f6a',
    name: 'Alerts Widget Generation Request',
    updatedDate: '2025-01-13T02:41:03.223+00:00'
  },
  {
    id: 'f71c8bf5-e322-43c9-8bc5-4d0d57213fce',
    name: 'Alerts Widget Generation Request',
    updatedDate: '2025-01-13T02:44:09.304+00:00'
  },
  {
    id: '83907cd3-9d41-47e0-b879-7efecf886e8f',
    name: 'Integration',
    updatedDate: '2025-01-13T02:48:40.069+00:00'
  },
  {
    id: '7bfb1666-7688-4c9a-a39f-f85f65a4fdf5',
    name: 'Device Health Widget Creation',
    updatedDate: '2025-01-13T03:00:19.451+00:00'
  },
  {
    id: '989a8e31-f282-497e-be3b-14478f5c1cf9',
    name: 'test123',
    updatedDate: '2025-01-17T07:57:20.345+00:00'
  },
  {
    id: 'c9f18d3d-b34a-4005-8418-c20b32435eca',
    name: 'Alerts Widget Generation Request',
    updatedDate: '2025-01-20T09:30:40.517+00:00'
  }
]
describe('AICanvas', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RuckusAiChatUrlInfo.getAllChats.url,
        (req, res, ctx) => res(ctx.json(chats))
      )
    );
    (useSendFeedbackMutation as jest.Mock).mockReturnValue([mockedSendFeedback])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render a chat content correctly', async () => {
    render(
      <Provider>
        <AICanvas isModalOpen={true} setIsModalOpen={mockedSetModal}/>
      </Provider>
    )
    expect(await screen.findByText('RUCKUS DSE')).toBeVisible()
    const canvasExpandIcon = await screen.findByTestId('canvasExpandIcon')
    expect(canvasExpandIcon).toBeVisible()
    fireEvent.click(canvasExpandIcon)
    expect(await screen.findByText('Canvas')).toBeVisible()
    const canvasCollapseIcon = await screen.findByTestId('canvasCollapseIcon')
    expect(canvasCollapseIcon).toBeVisible()
    fireEvent.click(canvasCollapseIcon)
    expect(localStorage.getItem('show-canvas')).toBe('false')
    expect(await screen.findByText(
      'Older chat conversations have been deleted due to the 30-day retention policy.'))
      .toBeVisible()
    expect(await screen.findByText('what can you do?')).toBeVisible()
    const newChatBtn = await screen.findByTestId('newChatIcon')
    expect(newChatBtn).toBeVisible()
    fireEvent.click(newChatBtn)
    // New chat cannot be started because the history limit of 10 has been reached.
    expect(await screen.findByText('what can you do?')).toBeVisible()
    const draggableCharts = await screen.findAllByText('DraggableChart')
    expect(draggableCharts.length).toBe(2)
    expect(draggableCharts[0]).toBeVisible()
    const historyBtn = await screen.findByTestId('historyIcon')
    expect(historyBtn).toBeVisible()
    fireEvent.click(historyBtn)
    expect(await screen.findByText('History Drawer')).toBeVisible()
    const searchInput = await screen.findByTestId('search-input')
    await userEvent.type(searchInput, 'hello')
    expect(await screen.findByText('5/300')).toBeVisible()
    fireEvent.keyDown(searchInput, { key: 'Enter' })
    expect(await screen.findByText('hello')).toBeVisible()
    expect(await screen.findByText('Hello! I can help you!')).toBeVisible()
  })

  it('should render a new chat correctly', async () => {
    const scrollTo = jest.fn()
    HTMLElement.prototype.scrollTo = scrollTo
    mockServer.use(
      rest.get(
        RuckusAiChatUrlInfo.getAllChats.url,
        (req, res, ctx) => res(ctx.json([]))
      )
    )
    render(
      <Provider>
        <AICanvas isModalOpen={true} setIsModalOpen={mockedSetModal} />
      </Provider>
    )
    expect(await screen.findByText('RUCKUS DSE')).toBeVisible()
    const canvasExpandIcon = await screen.findByTestId('canvasExpandIcon')
    expect(canvasExpandIcon).toBeVisible()
    fireEvent.click(canvasExpandIcon)
    expect(await screen.findByText('Canvas')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Hello, I am RUCKUS digital system engineer, you can ask me anything about your network.')).toBeVisible()
    // eslint-disable-next-line max-len
    const suggestQuestion = await screen.findByText('How many clients were connected to my network yesterday?')
    expect(suggestQuestion).toBeVisible()
    fireEvent.click(suggestQuestion)
    expect(await screen.findByText('Hello! I can help you!')).toBeVisible()
  })

  it('should close without changes correctly', async () => {
    const scrollTo = jest.fn()
    HTMLElement.prototype.scrollTo = scrollTo
    render(
      <Provider>
        <AICanvas isModalOpen={true} setIsModalOpen={mockedSetModal} />
      </Provider>
    )
    expect(await screen.findByText('RUCKUS DSE')).toBeVisible()
    const canvasExpandIcon = await screen.findByTestId('canvasExpandIcon')
    expect(canvasExpandIcon).toBeVisible()
    fireEvent.click(canvasExpandIcon)
    expect(await screen.findByText('Canvas')).toBeVisible()
    const searchInput = await screen.findByTestId('search-input')
    await userEvent.type(searchInput, 'hello')
    const searchBtn = await screen.findByTestId('search-button')
    await waitFor(() => expect(searchBtn).not.toBeDisabled())
    fireEvent.click(searchBtn)
    expect(await screen.findByText('hello')).toBeVisible()
    const closeBtn = await screen.findByTestId('close-icon')
    fireEvent.click(closeBtn)
    expect(mockedSetModal).toBeCalled()
  })

  it('should render previous chat content and send feedback correctly', async () => {
    render(
      <Provider>
        <AICanvas isModalOpen={true} setIsModalOpen={mockedSetModal}/>
      </Provider>
    )
    expect(await screen.findByText('RUCKUS DSE')).toBeVisible()
    const aiMessage = await screen.findByText('Failed to get response from AI....')
    expect(aiMessage).toBeVisible()
    // eslint-disable-next-line max-len
    const feedbackSection = await screen.findByTestId('user-feedback-afa2591ede524f3884e21acd06ccb8b4')
    expect(feedbackSection).not.toBeVisible()

    const thumbsUpButtons = await screen.findAllByTestId('thumbs-up-btn')
    expect(thumbsUpButtons).toHaveLength(3)
    await userEvent.click(thumbsUpButtons[1])
    expect(mockedSendFeedback).toBeCalledTimes(0)
    const thumbsDownButtons = await screen.findAllByTestId('thumbs-down-btn')
    expect(thumbsDownButtons).toHaveLength(3)
    await userEvent.click(thumbsDownButtons[1])
    expect(mockedSendFeedback).toHaveBeenCalledWith({
      params: expect.objectContaining({
        sessionId: expect.any(String),
        messageId: expect.any(String)
      }),
      payload: false
    })
    const elements = screen.getAllByTestId('messageTail')
    const fixedNarrowerElements = elements.filter(el => el.classList.contains('fixed-narrower'))
    expect(fixedNarrowerElements.length).toBe(1)
    const narrowComputedStyle = window.getComputedStyle(fixedNarrowerElements[0])
    const narrowWidthInPixels = parseFloat(narrowComputedStyle.width)
    expect(narrowWidthInPixels).toBe(200)
    const fixedElements = elements.filter(el => el.classList.contains('ai-message-tail') &&
      el.classList.contains('fixed') && !el.classList.contains('fixed-narrower'))
    expect(fixedElements.length).toBe(1)
    const computedStyle = window.getComputedStyle(fixedElements[0])
    const widthInPixels = parseFloat(computedStyle.width)
    expect(widthInPixels).toBe(300)
  })
})

describe('Test utils', () => {
  it('Test getStreamingWordingKey', async () => {
    expect(getStreamingWordingKey('0')).toBe('INITIALIZING_INTENT')
    expect(getStreamingWordingKey('1')).toBe('INITIALIZING_INTENT')
    expect(getStreamingWordingKey('2')).toBe('SELECTING_DATA_SOURCES')
    expect(getStreamingWordingKey('3')).toBe('PROCESSING_DATA_INITIAL')
    expect(getStreamingWordingKey('1.1')).toBe('PROCESSING_DATA_RETRY_1_1')
    expect(getStreamingWordingKey('2.1')).toBe('PROCESSING_DATA_RETRY_2_1')
    expect(getStreamingWordingKey('3.1')).toBe('PROCESSING_DATA_RETRY_3_1')
    expect(getStreamingWordingKey('1.2')).toBe('PROCESSING_DATA_RETRY_1_2')
    expect(getStreamingWordingKey('2.2')).toBe('PROCESSING_DATA_RETRY_2_2')
    expect(getStreamingWordingKey('3.2')).toBe('PROCESSING_DATA_RETRY_3_2')
    expect(getStreamingWordingKey('1.3')).toBe('PROCESSING_DATA_RETRY_1_2')
    expect(getStreamingWordingKey('2.3')).toBe('PROCESSING_DATA_RETRY_2_2')
    expect(getStreamingWordingKey('2.5')).toBe('PROCESSING_DATA_RETRY_2_2')
    expect(getStreamingWordingKey('3.5')).toBe('PROCESSING_DATA_RETRY_3_2')
    expect(getStreamingWordingKey('4.3')).toBe('PROCESSING_DATA_RETRY_3_2')
    expect(getStreamingWordingKey('4')).toBe('FINALIZING_RESULT')
    expect(getStreamingWordingKey('5')).toBe('FINALIZING_RESULT')
  })
})
