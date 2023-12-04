import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { venueApi }                                                                  from '@acx-ui/rc/services'
import { ApSnmpUrls }                                                                from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ServerSettingContext }    from '..'
import {
  resultOfGetVenueApSnmpAgentSettings,
  resultOfUpdateApSnmpAgentSettings,
  resultOfGetApSnmpAgentProfiles
} from '../../../../__tests__/fixtures'
import { VenueEditContext, EditContext } from '../../../index'

import { ApSnmp } from './index'

let editContextData = {} as EditContext
const setEditContextData = jest.fn()
let editServerContextData = {} as ServerSettingContext


const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'servers'
}

describe('Ap Snmp', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(ApSnmpUrls.getApSnmpPolicyList.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetApSnmpAgentProfiles))
      }),
      rest.get(ApSnmpUrls.getVenueApSnmpSettings.url, (req, res, ctx) => {
        return res(ctx.json(resultOfGetVenueApSnmpAgentSettings))
      }),
      rest.post(ApSnmpUrls.updateVenueApSnmpSettings.url, (req, res, ctx) => {
        return res(ctx.json(resultOfUpdateApSnmpAgentSettings))
      })
    )
  })

  it('Should Retrive Initial Data From Server and Render', async () => {
    render(
      <Provider>
        <Form>
          <ApSnmp />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Use AP SNMP'))
    expect(await screen.findByText(/Use AP SNMP/)).toBeVisible()
    expect(await screen.findByText(/SNMP-1/)).toBeVisible()

  })

  it('Should Update AP SNMP Agent Profile After Save', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditServerContextData: jest.fn(),
          editServerContextData,
          setEditContextData }}>
          <Form>
            <ApSnmp />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitFor(() => screen.findByText('Use AP SNMP'))
    expect(await screen.findByText(/Use AP SNMP/)).toBeVisible()

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('SNMP-2')
    await userEvent.click(option)
  })

  it('Should Be Able To Handle AP SNMP Switch Turn On/Off', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData,
          setEditServerContextData: jest.fn(),
          editServerContextData,
          setEditContextData }}>
          <Form>
            <ApSnmp />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitFor(() => screen.findByText('Use AP SNMP'))
    expect(await screen.findByText(/Use AP SNMP/)).toBeVisible()

    fireEvent.click(await screen.findByTestId('ApSnmp-switch'))

  })
})
