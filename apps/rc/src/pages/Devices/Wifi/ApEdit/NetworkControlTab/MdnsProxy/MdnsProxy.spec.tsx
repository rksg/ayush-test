import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi }                       from '@acx-ui/rc/services'
import { MdnsProxyUrls, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }             from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { ApEditContext } from '../..'

import {
  mockedMdnsProxyList
} from './__tests__/fixtures'
import { MdnsProxy } from './MdnsProxy'

const mockedUseNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: string) => to
}))

describe('MdnsProxy', () => {
  const editApPath = '/:tenantId/devices/wifi/:serialNumber/edit/networkControl'
  const params = {
    tenantId: '__TENANT_ID__',
    serialNumber: '__SERIAL_NUMBER__'
  }

  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.get(
        MdnsProxyUrls.getMdnsProxyList.url,
        (req, res, ctx) => res(ctx.json([ ...mockedMdnsProxyList ]))
      )
    )
  })

  it.skip('should change the mDNS Proxy', async () => {
    const selectedMdnsProxy = mockedMdnsProxyList[0]
    const updatedMdnsProxy = mockedMdnsProxyList[1]

    const changeMdnsProxyFn = jest.fn()
    const removeMdnsProxyFn = jest.fn()
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (req, res, ctx) => res(ctx.json({
          serialNumber: '991749001099',
          multicastDnsProxyServiceProfileId: selectedMdnsProxy.id
        }))
      ),
      rest.post(
        MdnsProxyUrls.addMdnsProxyAps.url,
        (req, res, ctx) => {
          changeMdnsProxyFn(req.body)
          return res(ctx.json({ requestId: '__REQUEST_ID__' }))
        }
      ),
      rest.delete(
        MdnsProxyUrls.deleteMdnsProxyAps.url,
        (req, res, ctx) => {
          removeMdnsProxyFn(req.body)
          return res(ctx.status(404), ctx.json({ requestId: '__REQUEST_ID__' }))
        }
      )
    )

    const setEditContextDataFn = jest.fn()

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            hasError: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: setEditContextDataFn,
          setEditNetworkControlContextData: jest.fn()
        }}>
          <MdnsProxy />
        </ApEditContext.Provider>
      </Provider>, {
        route: { path: editApPath, params }
      }
    )

    const activateServiceSwitch = await screen.findByRole('switch', { name: /Activate Service/ })
    expect(activateServiceSwitch).toBeChecked()

    const mDnsProxySelectedItem = await screen.findByText(selectedMdnsProxy.serviceName)
    expect(mDnsProxySelectedItem).toBeVisible()

    const mDnsProxyCombobox = await screen.findByRole('combobox', { name: /mDNS Proxy Service/ })
    await userEvent.click(mDnsProxyCombobox)
    await userEvent.click(await screen.findByText(updatedMdnsProxy.serviceName))

    // Verifying the changed detection behavior
    expect(setEditContextDataFn).toHaveBeenCalledWith(expect.objectContaining({
      isDirty: true
    }))

    // Verify changing the mDNS Proxy
    await userEvent.click(screen.getByRole('button', { name: /Apply mDNS Proxy/ }))
    await waitFor(() => {
      expect(changeMdnsProxyFn).toHaveBeenCalledWith([params.serialNumber])
    }, {
      interval: 100,
      timeout: 2000
    })

    // Verify removing the mDNS Proxy & error message
    await userEvent.click(activateServiceSwitch)
    await userEvent.click(screen.getByRole('button', { name: /Apply mDNS Proxy/ }))
    await waitFor(() => {
      expect(removeMdnsProxyFn).toHaveBeenCalledWith([params.serialNumber])
    }, {
      interval: 100,
      timeout: 2000
    })
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

  it('should show error message when changing mDNS Proxy failed', async () => {
    const targetErrorMessage = 'MulticastDnsProxyServiceProfile Not Found'

    mockServer.use(
      rest.get(
        WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (req, res, ctx) => res(ctx.json({
          serialNumber: '121749001049'
        }))
      ),
      rest.post(
        MdnsProxyUrls.addMdnsProxyAps.url,
        (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({
            requestId: 'fa60fbba-529f-4206-a131-3fe778a4202f',
            errors: [{
              code: 'WIFI-10000',
              message: targetErrorMessage
            }]
          }))
        }
      ),
      rest.delete(
        MdnsProxyUrls.deleteMdnsProxyAps.url,
        (req, res, ctx) => res(ctx.status(404), ctx.json({ requestId: 'fa60fbba-529f-4206' }))
      )
    )

    const setEditContextDataFn = jest.fn()

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            hasError: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: setEditContextDataFn,
          setEditNetworkControlContextData: jest.fn()
        }}>
          <MdnsProxy />
        </ApEditContext.Provider>
      </Provider>, {
        route: { path: editApPath, params }
      }
    )

    // Verifying the changed detection behavior
    await userEvent.click(await screen.findByRole('switch', { name: /Activate Service/ }))
    expect(setEditContextDataFn).toHaveBeenCalledWith(expect.objectContaining({
      isDirty: true
    }))

    // Verify error message when changing mDNS Proxy failed
    const mDnsProxyCombobox = await screen.findByRole('combobox', { name: /mDNS Proxy Service/ })
    const updatedMdnsProxy = mockedMdnsProxyList[1]
    await userEvent.click(mDnsProxyCombobox)
    await userEvent.click(await screen.findByText(updatedMdnsProxy.serviceName))
    //await userEvent.click(await screen.findByRole('button', { name: /Apply/ }))
    // expect(await screen.findByText(targetErrorMessage)).toBeVisible()

    // Verify Cancel form behavior
    await userEvent.click(await screen.findByRole('button', { name: /Cancel/ }))
  })
})
