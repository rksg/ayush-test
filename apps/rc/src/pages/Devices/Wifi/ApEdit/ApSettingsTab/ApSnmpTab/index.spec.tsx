import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                                 from '@acx-ui/feature-toggle'
import { apApi, venueApi }                                                                              from '@acx-ui/rc/services'
import { ApSnmpSettings, ApSnmpUrls, CommonUrlsInfo, getUrlForTest, VenueApSnmpSettings, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApEditContext }     from '../..'
import { venueData, r760Ap } from '../../../../__tests__/fixtures'

import { ApSnmp } from '.'

const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

const mockVenueApSnmpSettings: VenueApSnmpSettings = {
  enableApSnmp: true,
  apSnmpAgentProfileId: '1234567890'
}

const mockApSnmpSettings: ApSnmpSettings = {
  useVenueSettings: true,
  enableApSnmp: true,
  apSnmpAgentProfileId: '23456789012'
}

const mockApSnmpAgents = [
  { id: 1234567890, policyName: 'snmp-1' },
  { id: 1234567890, policyName: 'snmp-2' }
]

describe('AP Snmp Settings', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        getUrlForTest(WifiUrlsInfo.getAp).replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(r760Ap))),
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenue),
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        getUrlForTest(ApSnmpUrls.getVenueApSnmpSettings),
        (_, res, ctx) => res(ctx.json(mockVenueApSnmpSettings))),
      rest.get(
        getUrlForTest(ApSnmpUrls.getApSnmpSettings),
        (_, res, ctx) => res(ctx.json(mockApSnmpSettings))),
      rest.get(
        getUrlForTest(ApSnmpUrls.getApSnmpPolicyList),
        (_, res, ctx) => res(ctx.json(mockApSnmpAgents)))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ApSnmp />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/snmp' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    const customizeBtn = await screen.findByRole('button', { name: /Customize/i })
    expect(customizeBtn).toBeVisible()
    await userEvent.click(customizeBtn)

    const enableBtn = await screen.findByTestId('ApSnmp-switch')
    expect(enableBtn).toBeVisible()
    expect(enableBtn).toBeEnabled()
    await userEvent.click(enableBtn)
    //await screen.findByRole('combobox', { name: /SNMP Agent/i })
    //expect(await screen.findByTestId('snmp-select')).toBeVisible()
  })

  it('should handle click Customize/Use Venue settings link', async () => {
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

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ApSnmp-switch')).toBeDisabled()


    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    expect(await screen.findByRole('button', { name: /Use Venue Settings/ })).toBeVisible()
    expect(await screen.findByTestId('ApSnmp-switch')).not.toBeDisabled()


    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ }))

    expect(await screen.findByTestId('ApSnmp-switch')).toBeDisabled()


    await userEvent.click(await screen.findByRole('button', { name: /Apply/ }))
  })

})
