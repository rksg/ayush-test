import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                              from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import {
  doRunResponse,
  troubleshootingResult_ping_empty,
  troubleshootingResult_ping_emptyResult,
  troubleshootingResult_ping_isSyncing,
  troubleshootingResult_ping_result
} from './__tests__/fixtures'
import { SwitchPingForm } from './switchPingForm'



const params = { tenantId: 'tenant-id', switchId: 'serial-number' }


describe('TroubleshootingSwitchTraceRouteForm', () => {

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.post(
        SwitchUrlsInfo.ping.url,
        (req, res, ctx) => res(ctx.json(doRunResponse))),
      rest.post(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_result))),
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
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
      rest.post(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_emptyResult)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Target host or IP address/i)).toBeVisible()
  })


  it('should copy correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_result)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })
    await userEvent.click(await screen.findByRole('button', { name: /copy output/i }))
  })

  it('should do run correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_isSyncing)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })

    const ipAddressField = screen.getByRole('textbox', {
      name: /target host or ip address/i
    })
    fireEvent.change(ipAddressField, { target: { value: '1.1.1.1' } })
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))
    expect(screen.queryByRole('img', { name: 'loader' })).toBeVisible()
  })


  it('should clear correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_result)))
    )
    render(<Provider>
      <SwitchPingForm />
    </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('button', { name: /clear/i }))
  })
})
