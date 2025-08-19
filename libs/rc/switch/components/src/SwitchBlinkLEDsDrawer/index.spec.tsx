import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi }       from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  waitFor
} from '@acx-ui/test-utils'

import { stackMembersData } from './__tests__/fixtures'

import { SwitchBlinkLEDsDrawer } from '.'

describe('SwitchBlinkLEDsDrawer', () => {
  const requestSpy = jest.fn()
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'switch-serialNumber',
    venueId: 'venue-id'
  }

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.blinkLeds.url,
        (_, res, ctx) => {
          requestSpy()
          return res(ctx.json({
            requestId: 'request-id',
            response: {}
          }))
        })
    )
  })

  afterEach(() => {
    requestSpy.mockClear()
    Modal.destroyAll()
  })

  it('should render Switch Blink LEDs Drawer correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(<Provider>
      <SwitchBlinkLEDsDrawer
        visible={true}
        switches={[{ venueId: params.venueId, switchId: params.switchId }]}
        setVisible={mockedCloseDrawer}
        isStack={false} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/t/devices/switch'
      }
    })

    expect(await screen.findByText(/Blink LEDs/i)).toBeVisible()
    const startBtn = screen.getByRole('button', { name: 'Start' })
    await userEvent.click(startBtn)
    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
  })

  it('should render Stack Blink LEDs Drawer correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(<Provider>
      <SwitchBlinkLEDsDrawer
        visible={true}
        switches={[{
          venueId: params.venueId,
          switchId: params.switchId,
          stackMembers: stackMembersData
        }]}
        setVisible={mockedCloseDrawer}
        isStack={true} />
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/t/devices/switch'
      }
    })

    expect(await screen.findByText(/Blink LEDs/i)).toBeVisible()
    expect(await screen.findByText(/Unit/i)).toBeVisible()
    const startBtn = screen.getByRole('button', { name: 'Start' })
    await userEvent.click(startBtn)
    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))
  })

})
