import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { apApi, venueApi }                                       from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo, getUrlForTest }           from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

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
  vlanOverrideEnabled: false
}

const mockApManagementVlan = {
  vlanId: 1,
  useVenueSettings: true,
  vlanOverrideEnabled: false
}

const resetApLedSpy = jest.fn()

describe('ApManagementVlanForm', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    resetApLedSpy.mockClear()
    mockServer.use(
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenue),
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        getUrlForTest(WifiUrlsInfo.getVenueApManagementVlan),
        (_, res, ctx) => res(ctx.json(mockVenueApManagementVlan))),
      rest.get(
        getUrlForTest(WifiUrlsInfo.getApManagementVlan),
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

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ap-managment-vlan-vlan-id-span')).toBeVisible()
  })

  it('should handle click Customize/Use Venue settings link', async () => {
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
