import '@testing-library/jest-dom'
import userEvent        from '@testing-library/user-event'
import { IntlProvider } from 'react-intl'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import HistoryDrawer from './HistoryDrawer'

const historyList = [
  {
    duration: 'Previous 7 days',
    history: [
      {
        id: '989a8e31-f282-497e-be3b-14478f5c1cf9',
        name: 'Switch Traffic Line Chart Request',
        updatedDate: '2025-01-13T08:38:42.916+00:00'
      },
      {
        id: '7bfb1666-7688-4c9a-a39f-f85f65a4fdf5',
        name: 'Device Health Widget Creation',
        updatedDate: '2025-01-13T03:00:19.451+00:00'
      }
    ]
  }
]
const mockedOnClose = jest.fn()
const mockedOnClickChat = jest.fn()

describe('HistoryDrawer', () => {
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
        <HistoryDrawer
          visible={true}
          onClose={mockedOnClose}
          history={historyList}
          sessionId={historyList[0].history[0].id}
          onClickChat={mockedOnClickChat}
        />
      </Provider>
    )
    expect(await screen.findByText('Previous 7 days')).toBeVisible()
    expect(await screen.findByText('Switch Traffic Line Chart Request')).toBeVisible()
    const chatTitle = await screen.findByText('Device Health Widget Creation')
    expect(chatTitle).toBeVisible()
    await userEvent.click(chatTitle)
    expect(mockedOnClickChat).toBeCalled()
    const closeButton = screen.getByRole('button', { name: /close/i })
    await userEvent.click(closeButton)
    expect(mockedOnClickChat).toBeCalled()
  })
})