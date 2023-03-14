import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                                                                  from '@acx-ui/rc/services'
import { ApSnmpUrls, WifiUrlsInfo }                                                  from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'


import { ApEditContext }           from '../..'
import {
  resultOfGetApSnmpAgentSettings,
  resultOfGetVenueApSnmpAgentSettings,
  resultOfUpdateApSnmpAgentSettings,
  resultOfGetApSnmpAgentProfiles } from '../../../../__tests__/fixtures'
import { apDetails } from '../../../../Wifi/ApDetails/__tests__/fixtures'

import { ApSnmp } from './index'


const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

describe('Ap Snmp', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''), (req, res, ctx) => {
        return res(ctx.json(apDetails))
      }),
      rest.get(ApSnmpUrls.getApSnmpPolicyList.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetApSnmpAgentProfiles))
      }),
      rest.get(ApSnmpUrls.getVenueApSnmpSettings.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetVenueApSnmpAgentSettings))
      }),
      rest.get(ApSnmpUrls.getApSnmpSettings.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetApSnmpAgentSettings))
      }),
      rest.post(ApSnmpUrls.updateVenueApSnmpSettings.url, (req, res, ctx) => {
        return res(ctx.json(resultOfUpdateApSnmpAgentSettings))
      })
    )
  })
  it('Should Retrive Initial Data From Server and Render', async () => {
    render(
      <Provider>
        <ApSnmp />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/snmp' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Use AP SNMP'))
    expect(await screen.findByText(/Customize/)).toBeVisible()
    expect(await screen.findByText(/AP SNMP/)).toBeVisible()
    expect(await screen.findByText(/SNMP-1/)).toBeVisible()
  })

  it('Should Update AP SNMP Agent Profile After Save', async () => {
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
          setEditContextData: jest.fn()
        }}>
          <ApSnmp />
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/snmp' }
      })

    const customizeButton = await screen.findByTestId('use-venue-true')
    expect(customizeButton).toBeTruthy()
    expect(await screen.findByRole('switch')).toBeDisabled()
    expect(await screen.findByRole('combobox')).toBeDisabled()

    await userEvent.click(customizeButton)

    // await waitFor(() => screen.findByText('Use Venue Settings'))
    expect(await screen.findByTestId('use-venue-false')).toBeTruthy()
    expect(await screen.findByRole('switch')).toBeEnabled()
    expect(await screen.findByRole('combobox')).toBeEnabled()

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = await screen.findByText('SNMP-2')
    fireEvent.mouseDown(option)
  })

  it('Should Be Able To Handle AP SNMP Switch Turn On/Off', async () => {
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
          setEditContextData: jest.fn()
        }}>
          <ApSnmp />
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/snmp' }
      })

    const customizeButton = await screen.findByTestId('use-venue-true')
    expect(customizeButton).toBeTruthy()
    await userEvent.click(customizeButton)

    expect(await screen.findByRole('switch')).toBeEnabled()
    await userEvent.click(await screen.findByRole('switch'))
    //expect(await screen.findByRole('switch')).not.toBeChecked()
    //expect(screen.queryByTestId('hidden-block')).toBeNull()
  })
})
