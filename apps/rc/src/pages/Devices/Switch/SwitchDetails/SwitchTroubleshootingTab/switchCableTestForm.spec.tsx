import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { switchApi }                           from '@acx-ui/rc/services'
import { SwitchRbacUrlsInfo }                  from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { SwitchDetailsContext }     from '..'
import { switchDetailsContextData } from '../__tests__/fixtures'

import {
  doRunResponse,
  portlist,
  troubleshootingResult_cableTest_empty,
  troubleshootingResult_cableTest_emptyResult,
  troubleshootingResult_cableTest_result
} from './__tests__/fixtures'
import { SwitchCableTestForm } from './switchCableTestForm'



const params = {
  tenantId: 'tenant-id',
  switchId: 'serial-number',
  tab: 'cable-test',
  troubleshootingType: 'cable-test'
}

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

describe('TroubleshootingCableTestForm', () => {

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchRbacUrlsInfo.cableTest.url,
        (req, res, ctx) => res(ctx.json(doRunResponse))),
      rest.get(
        SwitchRbacUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_cableTest_result))),
      rest.delete(
        SwitchRbacUrlsInfo.getTroubleshootingClean.url,
        (req, res, ctx) => res(ctx.json({}))),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portlist)))
    )
  })

  it('should copy correctly', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchCableTestForm />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /copy cli output/i }))

    // eslint-disable-next-line max-len
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(troubleshootingResult_cableTest_result.response.result)
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchRbacUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_cableTest_empty)))
    )
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchCableTestForm />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.getByRole('button', { name: /run test/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled()
  })

  it('should render empty result correctly', async () => {
    mockServer.use(
      rest.get(
        SwitchRbacUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_cableTest_emptyResult)))
    )
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchCableTestForm />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })
    expect(await screen.findByText(/No data to display./i)).toBeVisible()
  })

  it('should run correctly', async () => {
    const mockRunSpy = jest.fn()
    mockServer.use(
      rest.get(
        SwitchRbacUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => {
          mockRunSpy()
          return res(ctx.json(troubleshootingResult_cableTest_result))
        })
    )
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchCableTestForm />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('combobox', { name: /port/i }))
    await userEvent.click(await screen.findByText( '1/1/1' ))
    await userEvent.click(await screen.findByRole('button', { name: /run test/i }))
    expect(await screen.findByText(/Proceed Cable Test?/i)).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: /yes/i }))
    await waitFor(()=> expect(mockRunSpy).toHaveBeenCalled())
  })

  it('should clear correctly', async () => {
    const mockCleanSpy = jest.fn()
    mockServer.use(
      rest.delete(
        SwitchRbacUrlsInfo.getTroubleshootingClean.url,
        (req, res, ctx) => {
          mockCleanSpy()
          return res(ctx.json({}))
        })
    )
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData,
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchCableTestForm />
      </SwitchDetailsContext.Provider>
    </Provider>, { route: { params } })
    expect(await screen.findByText(/Last synced at/i)).toBeVisible()

    expect(await screen.findByRole('button', { name: /clear/i })).not.toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /clear/i }))
    await waitFor(()=> expect(mockCleanSpy).toHaveBeenCalled())
  })

})
