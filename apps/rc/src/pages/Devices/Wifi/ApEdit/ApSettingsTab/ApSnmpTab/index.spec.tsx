import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                                                                  from '@acx-ui/rc/services'
import { ApSnmpUrls }                                                                from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'


import { ApEditContext }           from '../..'
import {
  resultOfGetApSnmpAgentSettings,
  resultOfUpdateApSnmpAgentSettings,
  resultOfGetApSnmpAgentProfiles } from '../../../../__tests__/fixtures'

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
      rest.get(ApSnmpUrls.getApSnmpPolicyList.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetApSnmpAgentProfiles))
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
    await waitFor(() => screen.findByText('AP SNMP'))
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


    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('SNMP-2')
    await userEvent.click(option)
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
    fireEvent.click(await screen.findByTestId('ApSnmp-switch'))
    expect(await screen.findByTestId('hidden-block')).toBeVisible()
  })
})
