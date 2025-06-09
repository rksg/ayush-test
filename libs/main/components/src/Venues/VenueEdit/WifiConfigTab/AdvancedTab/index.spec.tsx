import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { venueApi }                                                                  from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiRbacUrlsInfo, WifiUrlsInfo }                            from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { VenueUtilityContext }           from '..'
import { VenueEditContext, EditContext } from '../..'
import {
  venueData,
  venueCaps,
  venueLed,
  venueApModels,
  venueBssColoring,
  venueApManagementVlan
} from '../../../__tests__/fixtures'
import { defaultValue } from '../../../contentsMap'

import { AdvancedTab, AdvanceSettingContext } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetVenueApModelsQuery: () => ({
    data: {
      models: []
    }
  })
}))

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

const editContextData = {} as EditContext
const setEditContextData = jest.fn()
let editAdvancedContextData = {} as AdvanceSettingContext
const setEditAdvancedContextData = jest.fn()

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./AccessPointUSB', () => ({
  ...jest.requireActual('./AccessPointUSB'),
  AccessPointUSB: () => <div data-testid='mocked-AP-USB'></div>
}))

jest.mock('./RebootTimeout', () => ({
  ...jest.requireActual('./AccessPointUSB'),
  RebootTimeout: () => <div data-testid='mocked-Reboot-Timeout'></div>
}))

const mockAdvancedTab = (
  <VenueUtilityContext.Provider value={{
    venueApCaps: venueCaps,
    isLoadingVenueApCaps: false
  }}>
    <AdvancedTab />
  </VenueUtilityContext.Provider>
)

describe('AdvancedTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(CommonUrlsInfo.getVenueLedOn.url,
        (_, res, ctx) => res(ctx.json(venueLed))),
      rest.get(CommonUrlsInfo.getVenueApModels.url,
        (_, res, ctx) => res(ctx.json(venueApModels))),
      rest.put(CommonUrlsInfo.updateVenueLedOn.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(WifiUrlsInfo.getVenueBssColoring.url,
        (_, res, ctx) => res(ctx.json(venueBssColoring))),
      rest.put(WifiUrlsInfo.updateVenueBssColoring.url,
        (_, res, ctx) => res(ctx.json({}))),
      // RBAC API
      rest.get(WifiRbacUrlsInfo.getVenueApManagementVlan.url,
        (_, res, ctx) => res(ctx.json({ venueApManagementVlan }))),
      rest.put(WifiRbacUrlsInfo.updateVenueApManagementVlan.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(WifiRbacUrlsInfo.getVenueLedOn.url,
        (_, res, ctx) => res(ctx.json(venueLed))),
      rest.put(WifiRbacUrlsInfo.updateVenueLedOn.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(WifiRbacUrlsInfo.getVenueBssColoring.url,
        (_, res, ctx) => res(ctx.json(venueBssColoring))),
      rest.put(WifiRbacUrlsInfo.updateVenueBssColoring.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(WifiRbacUrlsInfo.getVenueApIpMode.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(CommonUrlsInfo.getVenueLedOn.url,
        (_, res, ctx) => res(ctx.json([])))
    )

    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi'
    }
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          ...defaultValue,
          editContextData,
          setEditContextData,
          editAdvancedContextData,
          setEditAdvancedContextData }}>
          {mockAdvancedTab}
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await screen.findByText('LEDs Status')
    await screen.findByRole('button', { name: 'Add Model' })
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should handle add/edit/delete action', async () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi'
    }
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          ...defaultValue,
          editContextData,
          setEditContextData,
          editAdvancedContextData,
          setEditAdvancedContextData }}>
          {mockAdvancedTab}
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await screen.findByText('E510')
    fireEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    expect(screen.getByRole('button', { name: 'Add Model' })).toBeDisabled()

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('option')
    expect(allOptions).toHaveLength(venueCaps.apModels.length - 1)
    fireEvent.click(allOptions[0])

    const toggle = screen.getAllByRole('switch')
    fireEvent.click(toggle[0])
    const deleteBtns = screen.getAllByRole('deleteBtn')
    fireEvent.click(deleteBtns[deleteBtns.length - 1])
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should navigate to venue list page when clicking cancel button', async () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi',
      activeSubTab: 'settings'
    }
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          ...defaultValue,
          editContextData,
          setEditContextData,
          editAdvancedContextData,
          setEditAdvancedContextData }}>
          {mockAdvancedTab}
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues`,
      hash: '',
      search: ''
    })
  })

  it('should show BssColoring', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_COMPATIBILITY_BY_MODEL)
    const advanceSettingContext = {
      updateAccessPointLED: jest.fn(),
      updateBssColoring: jest.fn()
    }

    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData,
        setEditContextData,
        editAdvancedContextData: advanceSettingContext,
        setEditAdvancedContextData: jest.fn()
      }}>
        {mockAdvancedTab}
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable BSS Coloring'))
    expect(await screen.findByTestId('bss-coloring-switch')).toBeInTheDocument()

    const bssToggleBtn = await screen.findByTestId('bss-coloring-switch')
    fireEvent.click(bssToggleBtn)
    userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should render AP Management VLAN if feature flag is On', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_COMPATIBILITY_BY_MODEL)
    const mockUpdateApManagementVlan = jest.fn()
    const advanceSettingContext = {
      updateAccessPointLED: jest.fn(),
      updateBssColoring: jest.fn(),
      updateApManagementVlan: mockUpdateApManagementVlan
    }

    render(<Provider>
      <VenueEditContext.Provider value={{
        ...defaultValue,
        editContextData,
        setEditContextData,
        editAdvancedContextData: advanceSettingContext,
        setEditAdvancedContextData: jest.fn()
      }}>
        {mockAdvancedTab}
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    await waitFor(() => screen.findByText('Management VLAN'))

    const inputField = await screen.findByTestId('venue-ap-mgmt-vlan')
    fireEvent.change(inputField, { target: { value: '17' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    expect(mockUpdateApManagementVlan).toBeCalledTimes(1)
  })
})
