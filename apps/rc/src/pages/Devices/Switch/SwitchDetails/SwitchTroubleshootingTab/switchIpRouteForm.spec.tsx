import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { switchApi }                            from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                       from '@acx-ui/rc/utils'
import { Provider, store }                      from '@acx-ui/store'
import {  mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  doRunResponse,
  troubleshootingResult_route_empty,
  troubleshootingResult_route_emptyResult,
  troubleshootingResult_route_result,
  troubleshootingResult_route_syncing
} from './__tests__/fixtures'
import { SwitchIpRouteForm } from './switchIpRouteForm'

const params = {
  tenantId: 'tenant-id',
  switchId: 'serial-number',
  tab: 'ipRoute',
  troubleshootingType: 'ipRoute'
}

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

describe('TroubleshootingIpRouteForm', () => {

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.ipRoute.url,
        (req, res, ctx) => res(ctx.json(doRunResponse))),
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_route_result)))
    )
  })

  it('should render and copy correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_route_empty)))
    )
    render(<Provider>
      <SwitchIpRouteForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Show Route/i)).toBeVisible()
  })

  it('should render empty result correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_route_emptyResult)))
    )
    render(<Provider>
      <SwitchIpRouteForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Show Route/i)).toBeVisible()
  })

  it('should render syncing result correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_route_syncing)))
    )
    render(<Provider>
      <SwitchIpRouteForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Show Route/i)).toBeVisible()
    expect(await screen.findByRole('img', { name: 'loader' })).toBeVisible()
  })



  it('should do run correctly', async () => {
    render(<Provider>
      <SwitchIpRouteForm />
    </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('button', { name: /show route/i }))
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
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
      <SwitchIpRouteForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /clear/i }))
    await waitFor(()=> expect(mockCleanSpy).toHaveBeenCalledTimes(1))
  })

  it.skip('should copy correctly', async () => {
    //TODO: fix refetch warning
    jest.spyOn(navigator.clipboard, 'writeText')
    render(<Provider>
      <SwitchIpRouteForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /copy output/i }))

    // eslint-disable-next-line max-len
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(troubleshootingResult_route_result.response.result)
  })


  it.skip('should handle error correctly', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.ipRoute.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({})))
    )
    render(<Provider>
      <SwitchIpRouteForm />
    </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('button', { name: /show route/i }))
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

})
