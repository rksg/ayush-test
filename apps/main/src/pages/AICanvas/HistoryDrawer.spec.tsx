import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import * as CommonComponent from '@acx-ui/components'
import { Provider }         from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import HistoryDrawer from './HistoryDrawer'

const historyData = [
  {
    id: '989a8e31-f282-497e-be3b-14478f5c1cf9',
    name: 'Switch Traffic Line Chart Request',
    updatedDate: '2025-01-10T08:38:42.916+00:00'
  },
  {
    id: '7bfb1666-7688-4c9a-a39f-f85f65a4fdf5',
    name: 'Device Health Widget Creation',
    updatedDate: '2025-01-13T03:00:19.451+00:00'
  },
  {
    id: 'f71c8bf5-e322-43c9-8bc5-4d0d57213fce',
    name: 'Alerts Widget Generation Request',
    updatedDate: '2025-01-19T02:44:09.304+00:00'
  },
  {
    id: '83907cd3-9d41-47e0-b879-7efecf886e8f',
    name: 'Integration',
    updatedDate: '2025-01-20T02:48:40.069+00:00'
  }
]

const mockedOnClose = jest.fn()
const mockedOnClickChat = jest.fn()

const mockedShowActionModal = jest.fn().mockImplementation((props) => props.onOk && props.onOk())
jest.spyOn(CommonComponent, 'showActionModal').mockImplementation(
  mockedShowActionModal
)

jest.mock('moment', () => {
  const moment = jest.requireActual('moment')
  return jest.fn((...args) => {
    if (args.length === 0) {
      // Return the fixed date-time for moment()
      return moment('2025-01-20T02:48:40.069+00:00')
    }
    // Use the original moment function for moment(params)
    return moment(...args)
  })
})

const mockedUpdate = jest.fn().mockResolvedValue({})
const mockedDelete = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  useUpdateChatMutation: () => ([ mockedUpdate ]),
  useDeleteChatMutation: () => ([ mockedDelete ])
}))

describe('HistoryDrawer', () => {
  afterEach(() => {
    jest.clearAllMocks()
    mockedShowActionModal.mockClear()
  })

  it('should render nothing correctly', async () => {
    render(
      <Provider>
        <HistoryDrawer
          visible={true}
          onClose={mockedOnClose}
          historyData={[]}
          sessionId={''}
          onClickChat={mockedOnClickChat}
        />
      </Provider>
    )
    const closeButton = screen.getByRole('button', { name: /close/i })
    await userEvent.click(closeButton)
    expect(mockedOnClose).toBeCalled()
  })
  it('should render history list correctly', async () => {
    render(
      <Provider>
        <HistoryDrawer
          visible={true}
          onClose={mockedOnClose}
          historyData={historyData}
          sessionId={historyData[0].id}
          onClickChat={mockedOnClickChat}
        />
      </Provider>
    )
    expect(await screen.findByText('Today')).toBeVisible()
    expect(await screen.findByText('Yesterday')).toBeVisible()
    expect(await screen.findByText('Previous 7 days')).toBeVisible()
    expect(await screen.findByText('January 10, 2025')).toBeVisible()
    const chatTitle = await screen.findByText('Switch Traffic Line Chart Request')
    expect(chatTitle).toBeVisible()
    await userEvent.click(chatTitle)
    expect(mockedOnClickChat).toBeCalled()
    const closeButton = screen.getByRole('button', { name: /close/i })
    await userEvent.click(closeButton)
    expect(mockedOnClose).toBeCalled()
    const deleteButton = screen.getAllByTestId('delete')
    await userEvent.click(deleteButton[0])
    expect(mockedShowActionModal).toBeCalledTimes(1)
    expect(mockedDelete).toBeCalledTimes(1)
    const editButton = screen.getAllByTestId('edit')
    await userEvent.click(editButton[0])
    const confirmButton = screen.getAllByTestId('confirm')
    await userEvent.click(confirmButton[0])
    expect(mockedUpdate).toBeCalledTimes(1)
  })
})
