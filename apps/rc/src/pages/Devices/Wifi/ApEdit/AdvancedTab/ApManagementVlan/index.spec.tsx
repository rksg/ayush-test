import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { apApi, venueApi }                                                from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }                                   from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '../..'
import { r760Ap, venueData }            from '../../../../__tests__/fixtures'

import { ApManagementVlanForm } from '.'


const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

const mockVenueApManagementVlan = {
  vlanId: 1,
  vlanOverrideEnabled: true
}

const mockApManagementVlan = {
  vlanId: 1,
  useVenueSettings: true,
  vlanOverrideEnabled: true
}

const resetApLedSpy = jest.fn()
const getVenueApManagementVlanSpy = jest.fn()

describe('ApManagementVlanForm', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    resetApLedSpy.mockClear()
    getVenueApManagementVlanSpy.mockClear()
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(WifiUrlsInfo.getVenueApManagementVlan.url,
        (_, res, ctx) => {
          getVenueApManagementVlanSpy()
          return res(ctx.json(mockVenueApManagementVlan))
        }),
      rest.get(WifiUrlsInfo.getApManagementVlan.url,
        (_, res, ctx) => res(ctx.json(mockApManagementVlan)))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <Form>
          <ApDataContext.Provider value={{ apData: r760Ap }}>
            <ApManagementVlanForm />
          </ApDataContext.Provider>
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => expect(getVenueApManagementVlanSpy).toBeCalledTimes(1))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ap-managment-vlan-vlan-id-span')).toBeVisible()
  })

  it.skip('should handle click Customize/Use Venue settings link', async () => {
    render(
      <Provider>
        <Form>
          <ApEditContext.Provider value={{
            editContextData: {
              tabTitle: '',
              isDirty: false,
              hasError: false,
              updateChanges: jest.fn(),
              discardChanges: jest.fn()
            },
            setEditContextData: jest.fn(),
            editAdvancedContextData: {
              updateApManagementVlan: jest.fn(),
              discardApManagementVlan: jest.fn()
            },
            setEditAdvancedContextData: jest.fn()
          }}>
            <ApDataContext.Provider value={{ apData: r760Ap }}>
              <ApManagementVlanForm />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ap-managment-vlan-vlan-id-span')).toBeVisible()
    expect(screen.queryByTestId('ap-managment-vlan-vlan-id-input')).toBeNull()

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    expect(await screen.findByRole('button', { name: /Use Venue Settings/ })).toBeVisible()
    expect(screen.queryByTestId('ap-managment-vlan-vlan-id-span')).toBeNull()
    expect(await screen.findByTestId('ap-managment-vlan-vlan-id-input')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ }))
    expect(await screen.findByTestId('ap-managment-vlan-vlan-id-span')).toBeVisible()
    expect(screen.queryByTestId('ap-managment-vlan-vlan-id-input')).toBeNull()
  })
})
