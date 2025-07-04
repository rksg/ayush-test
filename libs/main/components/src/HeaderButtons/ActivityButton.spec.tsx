import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockRestApiQuery,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import { activities } from './__tests__/activitiesFixtures'
import ActivityButton from './ActivityButton'

const mockUseNavigate = jest.fn()
const mockedSaveFn = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockUseNavigate
}))

const mockedInitActivitySocketFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  initActivitySocket: (handler: (msg:string) => void) => {
    return mockedInitActivitySocketFn(handler)
  },
  closeActivitySocket: () => jest.fn()
}))

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }
const mockedSocket = {
  on: (eventName: string, handler: (msg:string) => void) => {
    if (eventName === 'activityChangedEvent') setTimeout(handler, 0)
    // Simulate receving the message from websocket
  }
}
const allUserSettings = {
  COMMON: '{"activity":{"showUnreadMark":false,"isFirstTime":true}}'
}
describe('ActivityButton', () => {
  beforeEach(() => {
    mockedInitActivitySocketFn.mockImplementation(() => mockedSocket)
    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
    mockServer.use(
      rest.get(
        UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => {
          return res(ctx.json(allUserSettings))
        }
      ),
      rest.put(
        UserUrlsInfo.saveUserSettings.url,
        (req, res, ctx) => {
          mockedSaveFn({
            params: req.url.pathname,
            body: req.body
          })
          return res(ctx.status(200))
        }
      )
    )
  })

  afterEach(() => {
    mockedInitActivitySocketFn.mockRestore()
  })
  it('should render ActivityButton correctly', async () => {
    render(<Provider>
      <ActivityButton />
    </Provider>, { route: { params } })

    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(await screen.findByText('123roam')).toBeVisible()
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByTitle('Pending'))
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
  })

  it('should get activity message correctly', async () => {
    mockedInitActivitySocketFn.mockImplementation((handler: (msg:string) => void) => {
      // Simulate receving the message from websocket
      setTimeout(handler, 0, JSON.stringify({
        requestId: '3723ea91-42b2-4e4d-aac1-95d8641c1907',
        product: 'SWITCH',
        status: 'IN_PROGRESS',
        useCase: 'AddSwitch',
        entityId: 'FEK3224R0AC'
      }))
      return mockedSocket
    })

    render(<Provider>
      <ActivityButton />
    </Provider>, { route: { params } })
    await waitFor(() => expect(mockedInitActivitySocketFn).toHaveBeenCalled())
    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(await screen.findByText('123roam')).toBeVisible()
    await waitFor(() => {
      expect(mockedSaveFn).toBeCalledTimes(2)
    })
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByTitle('Pending'))
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
  })

  it('should navigate to all activities', async () => {
    render(<Provider>
      <ActivityButton />
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('123roam')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'View all activities' }))

    expect(mockUseNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: '/a27e3eb0bd164e01ae731da8d976d3b1/t/timeline',
      search: ''
    })
  })

  it('should open/close activity drawer', async () => {
    render(<Provider>
      <ActivityButton />
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    const activity = await screen.findByText('123roam')

    await userEvent.click(activity)
    expect(await screen.findByText('Start Time')).toBeVisible()
    await userEvent.click((await screen.findAllByRole('button', { name: 'Close' }))[1])
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[0].parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[1].parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')

    await userEvent.click(screen.getAllByRole('button')[0])
    await userEvent.click(activity)
    expect(await screen.findByText('Start Time')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Back' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[0].parentNode)
      .not.toHaveClass('ant-drawer-content-wrapper-hidden')
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[1].parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })
})
