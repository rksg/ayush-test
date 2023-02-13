import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MdnsProxyUrls, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                    from '@acx-ui/store'
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
import { MdnsProxyTab } from './MdnsProxyTab'


describe('MdnsProxyTab', () => {
  const editApPath = '/:tenantId/devices/wifi/:serialNumber/edit/settings/proxy'
  const params = {
    tenantId: '__TENANT_ID__',
    serialNumber: '__SERIAL_NUMBER__'
  }

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MdnsProxyUrls.getMdnsProxyList.url,
        (req, res, ctx) => res(ctx.json([ ...mockedMdnsProxyList ]))
      )
    )
  })

  it('should change the mDNS Proxy', async () => {
    const selectedMdnsProxy = mockedMdnsProxyList[0]
    const updatedMdnsProxy = mockedMdnsProxyList[1]
    const targetAp = {
      serialNumber: '121749001049',
      multicastDnsProxyServiceProfileId: selectedMdnsProxy.id
    }

    const changeMdnsProxyFn = jest.fn()
    const removeMdnsProxyFn = jest.fn()
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (req, res, ctx) => res(ctx.json({ ...targetAp }))
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
          return res(ctx.json({ requestId: '__REQUEST_ID__' }))
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
          setEditContextData: setEditContextDataFn
        }}>
          <MdnsProxyTab />
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

    // Verifying the change detection behavior works or not
    await waitFor(() => {
      expect(setEditContextDataFn).toHaveBeenCalledWith(expect.objectContaining({
        isDirty: true
      }))
    })

    // Verify changing the mDNS Proxy
    await userEvent.click(screen.getByRole('button', { name: /Apply mDNS Proxy/ }))
    await waitFor(() => {
      expect(changeMdnsProxyFn).toHaveBeenCalledWith([params.serialNumber])
    })

    // Verify removing the mDNS Proxy
    await userEvent.click(activateServiceSwitch)
    await userEvent.click(screen.getByRole('button', { name: /Apply mDNS Proxy/ }))
    await waitFor(() => {
      expect(removeMdnsProxyFn).toHaveBeenCalledWith([params.serialNumber])
    })
  })
})
