import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { apApi, venueApi }                                                from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo }                                               from '@acx-ui/rc/utils'
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
  vlanId: 1
}

const mockApManagementVlan = {
  vlanId: 1,
  useVenueSettings: true,
  vlanOverrideEnabled: true
}

const resetApLedSpy = jest.fn()
const getVenueApManagementVlanSpy = jest.fn()

describe('ApManagementVlanForm', () => {
  const defaultR760ApCtxData = { apData: r760Ap, venueData }

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    resetApLedSpy.mockClear()
    getVenueApManagementVlanSpy.mockClear()
    mockServer.use(
      rest.get(WifiRbacUrlsInfo.getVenueApManagementVlan.url,
        (_, res, ctx) => {
          getVenueApManagementVlanSpy()
          return res(ctx.json(mockVenueApManagementVlan))
        }),
      rest.get(WifiRbacUrlsInfo.getApManagementVlan.url,
        (_, res, ctx) => res(ctx.json(mockApManagementVlan)))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <Form>
          <ApDataContext.Provider value={defaultR760ApCtxData}>
            <ApManagementVlanForm />
          </ApDataContext.Provider>
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => expect(getVenueApManagementVlanSpy).toBeCalledTimes(1))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    const vlanId = screen.getByTestId('ap-managment-vlan-vlan-id-span')
    expect(vlanId).toBeVisible()
    await waitFor(() => expect(vlanId).toHaveTextContent('1'))
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
            <ApDataContext.Provider value={defaultR760ApCtxData}>
              <ApManagementVlanForm />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitFor(() => expect(getVenueApManagementVlanSpy).toBeCalledTimes(1))

    const customizeBtn = screen.getByRole('button', { name: /Customize/ })
    expect(customizeBtn).toBeVisible()
    const vlanId = screen.getByTestId('ap-managment-vlan-vlan-id-span')
    expect(vlanId).toBeVisible()
    await waitFor(() => expect(vlanId).toHaveTextContent('1'))
    expect(screen.queryByTestId('ap-managment-vlan-vlan-id-input')).toBeNull()

    await userEvent.click(customizeBtn)

    const venueSettingBtn = await screen.findByRole('button', { name: /Use Venue Settings/ })
    expect(venueSettingBtn).toBeVisible()
    expect(screen.queryByTestId('ap-managment-vlan-vlan-id-span')).toBeNull()
    expect(screen.getByTestId('ap-managment-vlan-vlan-id-input')).toBeVisible()

    await userEvent.click(venueSettingBtn)
    await screen.findByRole('button', { name: /Customize/ })
    expect(screen.getByTestId('ap-managment-vlan-vlan-id-span')).toBeVisible()
    expect(screen.queryByTestId('ap-managment-vlan-vlan-id-input')).toBeNull()
  })
})
