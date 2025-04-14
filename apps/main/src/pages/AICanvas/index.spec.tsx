import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { RuckusAiChatUrlInfo } from '@acx-ui/rc/utils'
import { Provider }            from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import AICanvas from '.'


jest.mock('./HistoryDrawer', () => () => <div>History Drawer</div>)
jest.mock('./Canvas', () => {
  const { forwardRef } = jest.requireActual('react')
  return forwardRef(() => <div>Canvas</div>)
})
jest.mock('./components/WidgetChart', () => ({
  DraggableChart: () => <div>DraggableChart</div>
}))

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
  useTenantLink: jest.fn()
}))

const mockedShowActionModal = jest.fn()
jest.mock('@acx-ui/components', () => {
  const Loader = jest.requireActual('@acx-ui/components').Loader
  const Tooltip = jest.requireActual('@acx-ui/components').Tooltip
  const Button = jest.requireActual('@acx-ui/components').Button
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
          totalCount: 4,
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
              id: 'd259dc3cb138478c9c4bcc48f9270602',
              role: 'SYSTEM',
              text: 'Some older messages have been removed due to the 30-day retention policy',
              created: '2025-03-06T02:10:46.264+00:00'
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
    useSendFeedbackMutation: jest.fn(() => [jest.fn()])
  }
})

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
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render a chat content correctly', async () => {
    render(
      <Provider>
        <AICanvas />
      </Provider>
    )
    expect(await screen.findByText('RUCKUS DSE')).toBeVisible()
    expect(await screen.findByText('Canvas')).toBeVisible()
    expect(await screen.findByText(
      'Older chat conversations have been deleted due to the 30-day retention policy.'))
      .toBeVisible()
    expect(await screen.findByText('what can you do?')).toBeVisible()
    const newChatBtn = await screen.findByTestId('newChatIcon')
    expect(newChatBtn).toBeVisible()
    fireEvent.click(newChatBtn)
    // New chat cannot be started because the history limit of 10 has been reached.
    expect(await screen.findByText('what can you do?')).toBeVisible()
    expect(await screen.findByText('DraggableChart')).toBeVisible()
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
        <AICanvas />
      </Provider>
    )
    expect(await screen.findByText('RUCKUS DSE')).toBeVisible()
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
        <AICanvas />
      </Provider>
    )
    expect(await screen.findByText('RUCKUS DSE')).toBeVisible()
    expect(await screen.findByText('Canvas')).toBeVisible()
    const searchInput = await screen.findByTestId('search-input')
    await userEvent.type(searchInput, 'hello')
    const searchBtn = await screen.findByTestId('search-button')
    fireEvent.click(searchBtn)
    expect(await screen.findByText('hello')).toBeVisible()
    const closeBtn = await screen.findByTestId('close-icon')
    fireEvent.click(closeBtn)
    expect(mockedNavigate).toBeCalled()
  })

  it('should render previous chat content correctly', async () => {
    render(
      <Provider>
        <AICanvas />
      </Provider>
    )
    expect(await screen.findByText('RUCKUS DSE')).toBeVisible()
    expect(await screen.findByText('Canvas')).toBeVisible()
    const aiMessage = await screen.findByText('Failed to get response from AI....')
    expect(aiMessage).toBeVisible()
    // eslint-disable-next-line max-len
    const feedbackSection = await screen.findByTestId('user-feedback-afa2591ede524f3884e21acd06ccb8b4')
    expect(feedbackSection).not.toBeVisible()
    await userEvent.hover(aiMessage)
    // eslint-disable-next-line max-len
    const feedbackSectionHovered = await screen.findByTestId('user-feedback-afa2591ede524f3884e21acd06ccb8b4')
    const computedStyle = window.getComputedStyle(feedbackSectionHovered)
    expect(computedStyle.display).toBe('block')
  })
})
