import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { SwitchUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

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

    mockServer.use(
      rest.post(
        SwitchUrlsInfo.traceRoute.url,
        (req, res, ctx) => res(ctx.json(doRunResponse))),
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_traceRoute_result))),
      rest.get(
        SwitchUrlsInfo.getTroubleshootingClean.url,
        (req, res, ctx) => res(ctx.json({}))),
      rest.delete(
        '/switches/:switchId/debugRequests/trace-route',
        (req, res, ctx) => res(ctx.json({
          requestId: '231adbd9-0934-452f-ae59-f8eb20a821c1'
        }))
      )
    )
  })

  it('should copy correctly', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_traceRoute_result)))
    )
    render(<Provider>
      <SwitchTraceRouteForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /copy output/i }))
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
    await (screen.findByRole('img', { name: 'loader' }))
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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(ipAddressField, { target: { value: '1.1.1.1' } })
    })
    const maximumField = await screen.findByRole('textbox', {
      name: /maximum ttl \(hops\)/i
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(maximumField, { target: { value: '255' } })
      maximumField.focus()
    })
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))
  })


  it('should do validation correctly', async () => {
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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(ipAddressField, { target: { value: '1.1' } })
      ipAddressField.focus()
    })
    const maximumField = await screen.findByRole('textbox', {
      name: /maximum ttl \(hops\)/i
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(maximumField, { target: { value: '255' } })
      maximumField.focus()
    })
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))
  })

  it('should clear correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_traceRoute_result)))
    )
    render(<Provider>
      <SwitchTraceRouteForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /clear/i }))
  })


  it('should handle error occurred', async () => {
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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(ipAddressField, { target: { value: '1.1.1.1' } })
    })
    const maximumField = await screen.findByRole('textbox', {
      name: /maximum ttl \(hops\)/i
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(maximumField, { target: { value: '255' } })
      maximumField.focus()
    })
    await userEvent.click(await screen.findByRole('button', { name: /run/i }))
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

})
