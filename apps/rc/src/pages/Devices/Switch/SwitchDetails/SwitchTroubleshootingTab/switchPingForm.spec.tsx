import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { SwitchUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

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
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.ping.url,
        (req, res, ctx) => res(ctx.json(doRunResponse))),
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_result))),
      rest.delete(
        SwitchUrlsInfo.getTroubleshootingClean.url,
        (req, res, ctx) => res(ctx.json({})))
    )
  })

  it('should copy correctly', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_result)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /copy output/i }))
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

    expect(await screen.findByText(/Target host or IP address/i)).toBeVisible()
  })

  it('should do run correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_result)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })

    const ipAddressField = await screen.findByRole('textbox', {
      name: /target host or ip address/i
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(ipAddressField, { target: { value: '1.1.1.1' } })
      ipAddressField.focus()
    })
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))
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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(ipAddressField, { target: { value: '1.1' } })
      ipAddressField.focus()
    })
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))
  })

  it('should clear correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_result)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /clear/i }))
  })

  it('should handle error correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_result))),
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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(ipAddressField, { target: { value: '1.1.1.1' } })
      ipAddressField.focus()
    })
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })
})
