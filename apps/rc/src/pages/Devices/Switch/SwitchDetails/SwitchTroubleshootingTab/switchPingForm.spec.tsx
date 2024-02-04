import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { switchApi }                           from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  doRunResponse,
  troubleshootingResult_ping_empty,
  troubleshootingResult_ping_emptyResult,
  troubleshootingResult_ping_isSyncing,
  troubleshootingResult_ping_result
} from './__tests__/fixtures'
import { SwitchPingForm } from './switchPingForm'



const params = {
  tenantId: 'tenant-id',
  switchId: 'serial-number',
  tab: 'ping',
  troubleshootingType: 'ping'
}

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

describe('TroubleshootingPingForm', () => {

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.ping.url,
        (req, res, ctx) => res(ctx.json(doRunResponse))),
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_result)))
    )
  })

  it('should copy correctly', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /copy output/i }))

    // eslint-disable-next-line max-len
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(troubleshootingResult_ping_result.response.result)
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_empty)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Target host or IP address/i)).toBeVisible()
  })

  it('should render empty result correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_emptyResult)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/No data to display./i)).toBeVisible()
  })

  it('should do validation correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_isSyncing)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })

    const ipAddressField = await screen.findByRole('textbox', {
      name: /target host or ip address/i
    })
    await userEvent.type(ipAddressField, '1.1')

    await waitFor(() => expect(screen.getByRole('button', { name: /run/i })).toBeDisabled())
  })

  it('should clear correctly', async () => {
    const mockCleanSpy = jest.fn()
    mockServer.use(
      rest.delete(
        SwitchUrlsInfo.getTroubleshootingClean.url,
        (req, res, ctx) => {
          mockCleanSpy()
          return res(ctx.json({}))
        })
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()

    expect(await screen.findByRole('button', { name: /clear/i })).not.toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /clear/i }))
    await waitFor(()=> expect(mockCleanSpy).toHaveBeenCalledTimes(1))
  })

  it.skip('should handle error correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.ping.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({})))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })

    const ipAddressField = await screen.findByRole('textbox', {
      name: /target host or ip address/i
    })
    await userEvent.type(ipAddressField, '1.1.1.1')

    await waitFor(() => expect(screen.getByRole('button', { name: /run/i })).not.toBeDisabled())

    await userEvent.click(await screen.findByRole('button', { name: /run/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /run/i })).toBeDisabled())
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })
})
