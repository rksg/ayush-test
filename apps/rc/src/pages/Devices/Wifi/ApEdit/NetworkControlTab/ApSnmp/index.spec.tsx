import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                                                       from '@acx-ui/rc/services'
import { ApSnmpRbacUrls }                                                 from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'


import { ApDataContext, ApEditContext } from '../..'
import {
  resultOfGetApSnmpAgentSettings,
  resultOfUpdateApSnmpAgentSettings,
  venueData,
  mockApSnmpViewModel,
  mockVenueApSnmpViewModel,
  resultOfGetRbacApSnmpAgentProfiles
} from '../../../../__tests__/fixtures'
import { apDetails, apDetailsCustomize } from '../../../ApDetails/__tests__/fixtures'

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
      rest.post(ApSnmpRbacUrls.getApSnmpFromViewModel.url,
        (req, res, ctx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const filters = (req?.body as any)?.filters
          if (filters) {
            if (filters['apSerialNumbers']) {
              // custom Ap Snmp
              //console.log('venueApSnmp')
              return res(ctx.json(mockApSnmpViewModel))
            } else if (filters['venueIds']){
              // venue Ap Snmp
              //console.log('venueApSnmp')
              return res(ctx.json(mockVenueApSnmpViewModel))
            }
          }
          // All Ap Snmp
          //console.log('allApSnmp')
          return res(ctx.json(mockApSnmpViewModel))
        }),
      rest.get(ApSnmpRbacUrls.getApSnmpPolicy.url,
        (req, res, ctx) => {
          //console.log('req: ', req)
          return res(ctx.json(resultOfGetRbacApSnmpAgentProfiles[0]))
        }
      ),
      rest.get(ApSnmpRbacUrls.getApSnmpSettings.url,
        (_, res, ctx) => res(ctx.json(resultOfGetApSnmpAgentSettings))
      ),
      rest.put(ApSnmpRbacUrls.updateVenueApSnmpSettings.url,
        (_, res, ctx) => res(ctx.json(resultOfUpdateApSnmpAgentSettings))
      ),
      rest.delete(ApSnmpRbacUrls.resetVenueApSnmpSettings.url,
        (_, res, ctx) => res(ctx.json(resultOfUpdateApSnmpAgentSettings))
      )
    )
  })


  it('Should Retrieve Initial Data From Server and Render', async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{ apData: apDetails, venueData }}>
          <ApSnmp />
        </ApDataContext.Provider>
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
          setEditContextData: jest.fn(),
          setEditNetworkControlContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={{ apData: apDetails, venueData }}>
            <ApSnmp />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networkControl' }
      })

    const customizeButton = await screen.findByRole('button', { name: 'Customize' })
    expect(customizeButton).toBeTruthy()
    expect(await screen.findByRole('switch')).toBeDisabled()
    expect(await screen.findByRole('combobox')).toBeDisabled()

    await userEvent.click(customizeButton)

    // await waitFor(() => screen.findByText('Use Venue Settings'))
    const useVenueButton = await screen.findByRole('button', { name: 'Use Venue Settings' })
    expect(useVenueButton).toBeTruthy()
    expect(await screen.findByRole('switch')).toBeEnabled()
    const combobox = await screen.findByRole('combobox')
    expect(combobox).toBeEnabled()

    //fireEvent.mouseDown(combobox)
    //const option = await screen.findByText('SNMP-2')
    //fireEvent.mouseDown(option)
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
          setEditContextData: jest.fn(),
          setEditNetworkControlContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={{ apData: apDetails, venueData }}>
            <ApSnmp />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networkControl' }
      })

    const customizeButton = await screen.findByRole('button', { name: 'Customize' })
    await userEvent.click(customizeButton)
    const useVenueButton = await screen.findByRole('button', { name: 'Use Venue Settings' })
    expect(useVenueButton).toBeTruthy()

    expect(await screen.findByRole('switch')).toBeEnabled()
    await userEvent.click(await screen.findByRole('switch'))
    expect(await screen.findByRole('switch')).not.toBeChecked()
  })

  it('Should Be Able To Handle AP SNMP Switch Turn On/Off with customize', async () => {
    mockServer.use(
      rest.get(ApSnmpRbacUrls.getApSnmpSettings.url, (req, res, ctx) => {
        return res(ctx.json({
          apSnmpAgentProfileId: 'c1082e7d05d74eb897bb3600a15c1dc7',
          useVenueSettings: false,
          enableApSnmp: true
        }))
      })
    )

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
          setEditContextData: jest.fn(),
          setEditNetworkControlContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={{ apData: apDetailsCustomize, venueData }}>
            <ApSnmp />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networkControl' }
      })

    const useVenueButton = await screen.findByRole('button', { name: 'Use Venue Settings' })
    await userEvent.click(useVenueButton)
    const customizeButton = await screen.findByRole('button', { name: 'Customize' })
    expect(customizeButton).toBeTruthy()
  })
})
