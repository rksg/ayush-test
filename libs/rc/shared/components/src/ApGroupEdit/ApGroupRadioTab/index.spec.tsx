import React from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                               from '@acx-ui/feature-toggle'
import { CommonRbacUrlsInfo, CommonUrlsInfo, FirmwareUrlsInfo, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                             from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  apDeviceRadio,
  apGroupRadioCustomization,
  radioData,
  validRadioChannels,
  apGroupApCaps,
  venuelist,
  venueRadioCustomization,
  mockApModelFamilies,
  apGroupTripleBandMode,
  apGroupClientAdmissionControl,
  venueClientAdmissionControl
} from '../__tests__/fixtures'
import { ApGroupEditContext } from '../context'

import { ApGroupRadioTab } from './index'

const setEditContextDataFn = jest.fn()
const setEditRadioContextDataFn = jest.fn()
const mockedUsedNavigate = jest.fn()
const mockedGetApGroupRadioCustomization = jest.fn()
jest.mocked(useIsSplitOn).mockReturnValue(true)
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) => {
    return (<select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>)
  }

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

const venueData = venuelist.data[0]
const venueId = venueData.id

const defaultApGroupCxtdata = {
  isRbacEnabled: true,
  previousPath: '/ap-groups',
  setPreviousPath: jest.fn(),
  isEditMode: false,
  isWifiRbacEnabled: false,
  editContextData: {
    tabTitle: 'Radio',
    isDirty: false
  },
  editRadioContextData: {
    radioData,
    updateWifiRadio: jest.fn(),
    discardWifiRadioChanges: jest.fn()
  },
  venueId,
  venueData,
  apGroupApCaps,
  setEditContextData: setEditContextDataFn,
  setEditRadioContextData: setEditRadioContextDataFn
}

describe('AP Group Edit Radio', () => {
  const params = {
    tenantId: 'tenant-id',
    apGroupId: 'apgroup-id',
    action: 'edit',
    activeTab: 'radio'
  }

  const apListData = {
    data: [
      {
        id: 'ap-1',
        name: 'AP-1',
        model: 'R760',
        apGroupId: params.apGroupId,
        venueId: venueId,
        serialNumber: 'SN001'
      },
      {
        id: 'ap-2',
        name: 'AP-2',
        model: 'R560', // Fixed: Changed from 'R670' to 'R560'
        apGroupId: params.apGroupId,
        venueId: venueId,
        serialNumber: 'SN002'
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUsedNavigate.mockClear()
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (_, res, ctx) => res(ctx.json(mockApModelFamilies))),
      rest.get(
        WifiUrlsInfo.getVenueTripleBandRadioSettings.url,
        (_, res, ctx) => res(ctx.json({ enabled: true }))),
      rest.get(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(
        WifiUrlsInfo.getApRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(apDeviceRadio))),
      rest.get(
        WifiUrlsInfo.getVenueRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(venueRadioCustomization))),
      rest.put(
        WifiUrlsInfo.updateApRadioCustomization.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(apListData))),
      // rbac
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(apListData))),
      rest.get(
        WifiRbacUrlsInfo.getApRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(apDeviceRadio))),
      rest.get(
        WifiRbacUrlsInfo.getApGroupDefaultRegulatoryChannels.url,
        (_, res, ctx) => res(ctx.json(validRadioChannels))),
      rest.get(
        WifiRbacUrlsInfo.getApValidChannel.url,
        (_, res, ctx) => res(ctx.json(validRadioChannels))),
      rest.get(
        WifiRbacUrlsInfo.getVenueRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(venueRadioCustomization))),
      rest.get(WifiRbacUrlsInfo.getApGroupRadioCustomization.url,
        (_, res, ctx) => {
          mockedGetApGroupRadioCustomization()
          return res(ctx.json(apGroupRadioCustomization))
        }),
      rest.post(WifiRbacUrlsInfo.updateApGroupRadioCustomization.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        CommonRbacUrlsInfo.getVenueApModelBandModeSettings.url,
        (_, res, ctx) => res(ctx.json([{ model: 'R760' }]))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApGroupBandModeSettings.url,
        (_, res, ctx) => res(ctx.json(apGroupTripleBandMode))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApGroupClientAdmissionControlSettings.url,
        (_, res, ctx) => res(ctx.json(apGroupClientAdmissionControl))
      ),
      rest.get(
        WifiRbacUrlsInfo.getVenueClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json(venueClientAdmissionControl))
      )
    )
  })

  it('should render correctly with different band mode', async () => {
    render(
      <Provider>
        <ApGroupEditContext.Provider value={{
          ...defaultApGroupCxtdata,
          isEditMode: true
        }}>
          <ApGroupRadioTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByRole('link', { name: 'Wi-Fi Radio' })).toBeVisible()
    expect(await screen.findByRole('heading', { name: /wi\-fi radio settings/i })).toBeVisible()

    await waitFor(() => {
      expect(mockedGetApGroupRadioCustomization).toHaveBeenCalled()
    })

    expect(screen.getByRole('tab', { name: /2\.4 ghz/i })).toBeVisible()
    expect(screen.getByRole('tab', { name: '5 GHz' })).toBeVisible()

    const customizeBandMode = screen.getByTestId('band-management-customizeSettings')
    userEvent.click(customizeBandMode)

    expect(await screen.findByText(/r760/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('tab', { name: /2.4 GHz/ }))
    expect(await screen.findByText(/use inherited 2.4 ghz settings from venue/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('tab', { name: /5 GHz/ }))
    expect(await screen.findByText(/use inherited 5 ghz settings from venue/i)).toBeVisible()

    await userEvent.click(await screen.findByRole('tab', { name: /6 GHz/ }))
    expect(await screen.findByText(/use inherited 6 ghz settings from venue/i)).toBeVisible()
  })

  it('should handle ap group radio change', async () => {
    render(
      <Provider>
        <ApGroupEditContext.Provider value={{
          ...defaultApGroupCxtdata,
          isEditMode: true
        }}>
          <ApGroupRadioTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByRole('link', { name: 'Wi-Fi Radio' })).toBeVisible()
    expect(await screen.findByRole('heading', { name: /wi\-fi radio settings/i })).toBeVisible()

    await waitFor(() => {
      expect(mockedGetApGroupRadioCustomization).toHaveBeenCalled()
    })

    expect(screen.getByRole('tab', { name: /2\.4 ghz/i })).toBeVisible()
    expect(screen.getByRole('tab', { name: '5 GHz' })).toBeVisible()


    let customizeRadio = screen.getByText(/customize 2\.4 ghz settings/i)
    userEvent.click(customizeRadio)

    expect(await screen.findByRole('combobox', { name: /bandwidth/i })).toBeVisible()

    await userEvent.click(await screen.findByRole('tab', { name: /5 GHz/ }))
    expect(await screen.findByText(/use inherited 5 ghz settings from venue/i)).toBeVisible()

    customizeRadio = screen.getByText(/customize 5 ghz settings/i)
    userEvent.click(customizeRadio)

    expect(await screen.findByRole('combobox', { name: /bandwidth/i })).toBeVisible()
  })

  it('should handle ap group radio change WIFI_SWITCHABLE_RF_TOGGLE eanbled', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_SWITCHABLE_RF_TOGGLE || ff === Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)

    render(
      <Provider>
        <ApGroupEditContext.Provider value={{
          ...defaultApGroupCxtdata,
          isEditMode: true
        }}>
          <ApGroupRadioTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByRole('link', { name: 'Wi-Fi Radio' })).toBeVisible()
    expect(await screen.findByRole('heading', { name: /wi\-fi radio settings/i })).toBeVisible()

    expect(screen.getByRole('tab', { name: /2\.4 ghz/i })).toBeVisible()
    expect(screen.getByRole('tab', { name: '5 GHz' })).toBeVisible()


    let customizeRadio = screen.getByText(/customize 2\.4 ghz settings/i)
    userEvent.click(customizeRadio)

    expect(await screen.findByRole('combobox', { name: /bandwidth/i })).toBeVisible()

    await userEvent.click(await screen.findByRole('tab', { name: /5 GHz/ }))
    expect(await screen.findByText(/use inherited 5 ghz settings from venue/i)).toBeVisible()

    customizeRadio = screen.getByText(/customize 5 ghz settings/i)
    userEvent.click(customizeRadio)

    expect(await screen.findByRole('combobox', { name: /bandwidth/i })).toBeVisible()
  })

  it('should handle ap group radio change WIFI_SWITCHABLE_RF_TOGGLE disabled', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_SWITCHABLE_RF_TOGGLE)

    render(
      <Provider>
        <ApGroupEditContext.Provider value={{
          ...defaultApGroupCxtdata,
          isEditMode: true
        }}>
          <ApGroupRadioTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByRole('link', { name: 'Wi-Fi Radio' })).toBeVisible()
    expect(await screen.findByRole('heading', { name: /wi\-fi radio settings/i })).toBeVisible()

    expect(screen.getByRole('tab', { name: /2\.4 ghz/i })).toBeVisible()
    expect(screen.getByRole('tab', { name: '5 GHz' })).toBeVisible()


    let customizeRadio = screen.getByText(/customize 2\.4 ghz settings/i)
    userEvent.click(customizeRadio)

    await userEvent.click(await screen.findByRole('tab', { name: /5 GHz/ }))
    expect(await screen.findByText(/use inherited 5 ghz settings from venue/i)).toBeVisible()

    let triBand = await screen.findByTestId('tri-band-switch')
    userEvent.click(triBand)
    await waitFor(() => expect(triBand).toBeChecked())

    expect(await screen.findByText(/use inherited 2.4 ghz settings from venue/i)).toBeVisible()
  })

  it('should handle client admission control settings', async () => {
    render(
      <Provider>
        <ApGroupEditContext.Provider value={{
          ...defaultApGroupCxtdata,
          isEditMode: true
        }}>
          <ApGroupRadioTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // eslint-disable-next-line max-len
    const customizeClientAdmissionControl = screen.getByTestId('client-admission-control-customizeSettings')
    userEvent.click(customizeClientAdmissionControl)

    const enable24G = await screen.findByTestId('client-admission-control-enable-24g')
    const enable50G = await screen.findByTestId('client-admission-control-enable-50g')
    await userEvent.click(enable24G)
    await userEvent.click(enable50G)

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should pass correct existingTriBandApModels for BandManagement', async () => {
    const mockBandManagement = jest.fn(({ existingTriBandApModels }) => {
      return (
        <div data-testid='band-management-mock'>
          <div data-testid='existing-tri-band-models'>
            {existingTriBandApModels?.join(', ') || 'none'}
          </div>
        </div>
      )
    })

    const BandManagementModule = require('../../BandManagement')
    // eslint-disable-next-line max-len
    const bandManagementSpy = jest.spyOn(BandManagementModule, 'BandManagement').mockImplementation(mockBandManagement)
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_SWITCHABLE_RF_TOGGLE)

    render(
      <Provider>
        <ApGroupEditContext.Provider value={{ ...defaultApGroupCxtdata, isEditMode: true }}>
          <ApGroupRadioTab />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(await screen.findByRole('link', { name: 'Wi-Fi Radio' })).toBeVisible()
    expect(await screen.findByRole('heading', { name: /wi\-fi radio settings/i })).toBeVisible()

    await waitFor(() => {
      expect(screen.getByTestId('band-management-mock')).toBeInTheDocument()
    })

    await waitFor(() => {
      const lastCall = mockBandManagement.mock.calls[mockBandManagement.mock.calls.length - 1]
      const props = lastCall[0]
      expect(props.existingTriBandApModels).toHaveLength(2)
    })

    // Extract props from mock calls
    const lastCall = mockBandManagement.mock.calls[mockBandManagement.mock.calls.length - 1]
    const props = lastCall[0]

    // Verify the correct models
    expect(props.existingTriBandApModels).toContain('R760')
    expect(props.existingTriBandApModels).toContain('R560')

    // Clean up only the mocks created in this test
    bandManagementSpy.mockRestore()
  })
})