import '@testing-library/jest-dom'
import { rest }         from 'msw'
import { IntlProvider } from 'react-intl'

import { RuckusAiChatUrlInfo } from '@acx-ui/rc/utils'
import { Provider }            from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import AICanvas from '.'


jest.mock('./HistoryDrawer', () => () => <div>History Drawer</div>)
jest.mock('./Canvas', () => () => <div>Canvas</div>)
jest.mock('./components/WidgetChart', () => () => <div>DraggableChart</div>)

jest.mock('@acx-ui/react-router-dom', () => ({
  useNavigate: jest.fn(),
  useTenantLink: jest.fn()
}))

jest.mock('@acx-ui/rc/services', () => {
  const actualModule = jest.requireActual('@acx-ui/rc/services')
  return {
    ...actualModule,
    useStartConversationsMutation: () => [
      jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue({
          sessionId: 'testSessionId',
          nextStep: 'testNextStep',
          description: 'testDescription',
          payload: {}
        })
      }))
    ]
  }
})

const chats = [
  {
    id: '15e761e9-8526-49cb-bbf0-55e3883bec29',
    name: 'Exploring My Capabilities and Features',
    updatedDate: '2025-01-08T08:15:32.145+00:00'
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

  const renderWithIntl = (component: JSX.Element) => {
    return render(
      <IntlProvider locale='en'>
        {component}
      </IntlProvider>
    )
  }

  it('should render correctly', async () => {
    renderWithIntl(
      <Provider>
        <AICanvas />
      </Provider>
    )
    expect(await screen.findByText('RUCKUS One Assistant')).toBeVisible()
    expect(await screen.findByText('Canvas')).toBeVisible()
    expect(await screen.findByText('History Drawer')).toBeVisible()
  })

})