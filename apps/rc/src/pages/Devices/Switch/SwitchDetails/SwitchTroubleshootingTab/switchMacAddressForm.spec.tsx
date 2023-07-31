import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { SwitchUrlsInfo }                                from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'

import {
  doRunResponse,
  portlist,
  troubleshootingResult_macaddress_empty,
  troubleshootingResult_macaddress_emptyResult,
  troubleshootingResult_macaddress_mac,
  troubleshootingResult_macaddress_port,
  troubleshootingResult_macaddress_result,
  troubleshootingResult_macaddress_timeout,
  troubleshootingResult_macaddress_vlan,
  vlanlist
} from './__tests__/fixtures'
import { SwitchMacAddressForm } from './switchMacAddressForm'



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

describe('SwitchMacAddressForm', () => {

  beforeEach(() => {

    mockServer.use(
      rest.post(
        SwitchUrlsInfo.macAddressTable.url,
        (req, res, ctx) => res(ctx.json(doRunResponse))),
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_result))),
      rest.delete(
        SwitchUrlsInfo.getTroubleshootingClean.url,
        (req, res, ctx) => res(ctx.json({}))),
      rest.post(
        SwitchUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portlist))),
      rest.post(
        SwitchUrlsInfo.getVlanListBySwitchLevel.url,
        (req, res, ctx) => res(ctx.json(vlanlist)))

    )
  })

  it('should copy correctly', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_result)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /copy output/i }))
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_empty)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Refine table by/i)).toBeVisible()
  })

  it('should render empty result correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_emptyResult)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Refine table by/i)).toBeVisible()
  })


  it('should do run correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_empty)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('button', { name: /show table/i }))
  })


  it('should query port correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_port)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /show table/i }))
  })

  it('should query vlan correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_vlan)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /show table/i }))
  })

  it('should query mac correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_mac)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /show table/i }))
  })


  it('should manuelly query mac correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_mac)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    const view = screen.getByTestId('inputMacAddress')
    const textbox = await within(view).findByRole('textbox')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(textbox, { target: { value: 'aa:aa:aa:aa:aa:aa' } })
      textbox.focus()
    })
    await userEvent.click(await screen.findByRole('button', { name: /show table/i }))
  })

  it('should check mac validation correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_mac)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    const view = screen.getByTestId('inputMacAddress')
    const textbox = await within(view).findByRole('textbox')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(textbox, { target: { value: 'aa:aa:aa' } })
      textbox.focus()
    })
    await userEvent.click(await screen.findByRole('button', { name: /show table/i }))
  })

  it('should clear correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_timeout)))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /clear/i }))
  })

  it('should handle error correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_macaddress_port))),
      rest.post(
        SwitchUrlsInfo.macAddressTable.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({})))
    )
    render(<Provider>
      <SwitchMacAddressForm />
    </Provider>, { route: { params } })

    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /show table/i }))
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

})
