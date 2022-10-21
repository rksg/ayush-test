import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { venueApi }        from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { emptyList, mockAaaSetting_with_order, radiusList } from '../../../__tests__/fixtures'

import { AAASettings } from './AAASettings'


const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('AAASettings', () => {
  afterEach(() =>
    act(() => {
      store.dispatch(venueApi.util.resetApiState())
    })
  )

  it('should have cascade: SSH and Telnet', async () => {

    mockServer.use(
      rest.get(SwitchUrlsInfo.getAaaSetting.url, (req, res, ctx) =>
        res(ctx.json(mockAaaSetting_with_order))
      ),
      rest.post(SwitchUrlsInfo.getAaaServerList.url, (req, res, ctx) => {
        const body = req.body as { serverType: string }
        if (body.serverType === 'RADIUS') return res(ctx.json(radiusList))
        return res(ctx.json(emptyList))
      }),
      rest.put(SwitchUrlsInfo.updateAaaSetting.url, (req, res, ctx) =>
        res(ctx.json({}))
      )
    )
    render(<Provider>
      <Form><AAASettings /></Form>
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const sshCbx = await screen.findByLabelText('SSH Authentication')
    expect(sshCbx).not.toBeChecked()

    const telnetCbx = screen.getByLabelText('Telnet Authentication')
    fireEvent.click(telnetCbx)

    const popconfirm = await screen.findByRole('tooltip',
      { name: /Telnet Authentication requires SSH Authentication/i })

    fireEvent.click(within(popconfirm).getByRole('button', { name: 'Cancel' }))
    expect(telnetCbx).not.toBeChecked()

    fireEvent.click(telnetCbx)
    fireEvent.click(within(popconfirm).getByRole('button', { name: 'OK' }))

    expect(sshCbx).toBeChecked()
    expect(sshCbx).toBeDisabled()
    expect(telnetCbx).toBeChecked()
  })
})
