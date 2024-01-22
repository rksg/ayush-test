import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { switchApi }                                           from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                      from '@acx-ui/rc/utils'
import { Provider, store }                                     from '@acx-ui/store'
import { act, fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  doRunResponse,
  troubleshootingResult_traceRoute_empty,
  troubleshootingResult_traceRoute_emptyResult,
  troubleshootingResult_traceRoute_result,
  troubleshootingResult_traceRoute_syncing
} from './__tests__/fixtures'
import { SwitchTraceRouteForm } from './switchTraceRouteForm'



const params = {
  tenantId: 'tenant-id',
  switchId: 'serial-number',
  tab: 'traceroute',
  troubleshootingType: 'traceroute'
}

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

describe('SwitchTraceRouteForm', () => {

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.traceRoute.url,
        (req, res, ctx) => res(ctx.json(doRunResponse))),
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_traceRoute_result)))
    )
  })

  it('should copy correctly', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')
    render(<Provider>
      <SwitchTraceRouteForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /copy output/i }))

    // eslint-disable-next-line max-len
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(troubleshootingResult_traceRoute_result.response.result)
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_traceRoute_empty)))
    )
    render(<Provider>
      <SwitchTraceRouteForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Target host or IP address/i)).toBeVisible()
  })

  it('should render syncing result correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_traceRoute_syncing)))
    )
    render(<Provider>
      <SwitchTraceRouteForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Target host or IP address/i)).toBeVisible()
    expect(await screen.findByRole('img', { name: 'loader' })).toBeVisible()
  })


  it('should render empty result correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_traceRoute_emptyResult)))
    )
    render(<Provider>
      <SwitchTraceRouteForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Target host or IP address/i)).toBeVisible()
  })


  it('should do run correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_traceRoute_empty)))
    )
    render(<Provider>
      <SwitchTraceRouteForm />
    </Provider>, { route: { params } })

    const ipAddressField = await screen.findByRole('textbox', {
      name: /target host or ip address/i
    })
    const maximumField = await screen.findByRole('textbox', {
      name: /maximum ttl \(hops\)/i
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(ipAddressField, { target: { value: '1.1.1.1' } })
      ipAddressField.focus()
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(maximumField, { target: { value: '255' } })
      maximumField.focus()
    })
    await waitFor(() => expect(screen.getByRole('button', { name: /run/i })).not.toBeDisabled())

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(ipAddressField, { target: { value: '1.1' } })
      ipAddressField.focus()
    })
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
        }
      )
    )
    render(<Provider>
      <SwitchTraceRouteForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /clear/i }))
    await waitFor(()=> expect(mockCleanSpy).toHaveBeenCalledTimes(1))
  })


  it.skip('should handle error occurred', async () => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.traceRoute.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({})))
    )
    render(<Provider>
      <SwitchTraceRouteForm />
    </Provider>, { route: { params } })

    const ipAddressField = await screen.findByRole('textbox', {
      name: /target host or ip address/i
    })
    const maximumField = await screen.findByRole('textbox', {
      name: /maximum ttl \(hops\)/i
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(ipAddressField, { target: { value: '1.1.1.1' } })
      ipAddressField.focus()
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(maximumField, { target: { value: '255' } })
      maximumField.focus()
    })

    await waitFor(() => expect(screen.getByRole('button', { name: /run/i })).not.toBeDisabled())
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /run/i })).toBeDisabled())
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

})
