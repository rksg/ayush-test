import '@testing-library/jest-dom'
import { rest } from 'msw'

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
jest.mock('./Canvas', () => () => <div>Canvas</div>)
jest.mock('./components/WidgetChart', () => ({
  DraggableChart: () => <div>DraggableChart</div>
}))

jest.mock('@acx-ui/react-router-dom', () => ({
  useNavigate: jest.fn(),
  useTenantLink: jest.fn()
}))

jest.mock('@acx-ui/rc/services', () => {
  const useGetAllChatsQuery = jest.requireActual('@acx-ui/rc/services').useGetAllChatsQuery
  return {
    useGetAllChatsQuery,
    useLazyGetChatQuery: () => [
      jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue({
          sessionId: 'c9f18d3d-b34a-4005-8418-c20b32435eca',
          title: 'Alerts Widget Generation Request',
          updatedDate: '2025-01-20T09:26:46.706+00:00',
          messages: [
            {
              id: 'f33c9c53f28046be95290127776ba022',
              role: 'USER',
              text: 'what can you do?',
              created: '2025-01-20T09:26:53.446+00:00'
            },
            {
              id: '884877e7ee8248bf8edf677d1be593e9',
              role: 'AI',
              text: `I am happy to assist you with analyzing and visualizing Ruckus WiFi
               related data. Please try again.`,
              created: '2025-01-20T09:27:53.446+00:00',
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
              }]
            }
          ],
          totalCount: 4
        })
      }))
    ],
    useChatAiMutation: () => [
      jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue({
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
        })
      }))
    ]
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
    expect(await screen.findByText('RUCKUS One Assistant')).toBeVisible()
    expect(await screen.findByText('Canvas')).toBeVisible()
    expect(await screen.findByText('History Drawer')).toBeVisible()
    expect(await screen.findByTestId('historyIcon')).toBeVisible()
    expect(await screen.findByTestId('newChatIcon')).toBeVisible()
    expect(await screen.findByText('what can you do?')).toBeVisible()
    expect(await screen.findByText('DraggableChart')).toBeVisible()
  })

  it('should render a new chat correctly', async () => {
    const scrollTo = jest.fn()
    HTMLElement.prototype.scrollTo = scrollTo
    render(
      <Provider>
        <AICanvas />
      </Provider>
    )
    expect(await screen.findByText('RUCKUS One Assistant')).toBeVisible()
    expect(await screen.findByText('Canvas')).toBeVisible()
    const searchInput = await screen.findByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'hello' } })
    const searchBtn = await screen.findByTestId('search-button')
    fireEvent.click(searchBtn)
    expect(await screen.findByText('hello')).toBeVisible()
    expect(await screen.findByText('Hello! I can help you!')).toBeVisible()
  })
})