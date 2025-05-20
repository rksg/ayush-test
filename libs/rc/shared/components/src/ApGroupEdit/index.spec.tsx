
import React from 'react'

import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  WifiRbacUrlsInfo,
  CommonUrlsInfo,
  WifiUrlsInfo,
  FirmwareUrlsInfo,
  CommonRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  apDeviceRadio,
  apGroupApCaps, apGroupRadioCustomization, apGroupTripleBandMode, apGroupValidRadioChannels,
  mockApModelFamilies,
  radioData, validRadioChannels,
  venuelist,
  venueRadioCustomization
} from './__tests__/fixtures'
import { ApGroupEditContext } from './context'

import { ApGroupEdit } from './index'
const mockAPGroupList = {
  fields: [
    'venueId',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'apgroup-id',
      venueId: '5e75f787e010471984b18ad0eb156487'
    }
  ]
}
const mockedUsedNavigate = jest.fn()
const mockedApGroupListReq = jest.fn()
const setEditContextDataFn = jest.fn()
const setEditRadioContextDataFn = jest.fn()
const mockedGetApGroupRadioCustomization = jest.fn()
const mockedUpdateApGroupRadioCustomization = jest.fn()
const mockedGetApGroupDefaultRegulatoryChannels = jest.fn()
const mockedGetApGroupBandModeSettings = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ApGroupVlanRadioTab', () => ({
  ApGroupVlanRadioTab: () => <div data-testid={'vlanRadioTab'}></div>
}))

describe('AP Group Edit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockedUsedNavigate.mockClear()

    mockServer.use(
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => {
          mockedApGroupListReq()
          return res(ctx.json(mockAPGroupList))
        }
      ),
      rest.post(
        WifiUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockAPGroupList))
        }
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      ))
  })

  it('should render correctly - Add ApGroup', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      action: 'add',
      activeTab: 'general'
    }

    render(
      <Provider>
        <ApGroupEdit />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )
    const title = await screen.findByText('Add AP Group')
    expect(title).toBeVisible()
    const tabs = screen.queryAllByRole('tab')
    expect(tabs).toHaveLength(0)
  })

  it('should render correctly - default Edit ApGroup', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      action: 'edit'
    }

    render(
      <Provider>
        <ApGroupEdit />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/' }
      }
    )
    const title = await screen.findByText('Edit AP Group')
    expect(title).toBeVisible()
    const tabs = screen.queryAllByRole('tab')
    expect(tabs).toHaveLength(0)
  })

  it('should render correctly - Edit AP Group', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      action: 'edit',
      activeTab: 'vlanRadio'
    }

    render(
      <Provider>
        <ApGroupEditContext.Provider value={{
          isEditMode: true, isApGroupTableFlag: true, venueId: venuelist.data[0].id
        }}>
          <ApGroupEdit />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    const title = await screen.findByText('Edit AP Group')
    expect(title).toBeVisible()
    const tabs = screen.queryAllByRole('tab')
    expect(tabs).toHaveLength(2)

    expect(await screen.findByTestId('vlanRadioTab')).toBeVisible()
    fireEvent.click(await screen.findByRole('tab', { name: 'General' }))

    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: '/tenant-id/t/devices/apgroups/apgroup-id/edit/general',
      search: ''
    })

  })

  it('should radio tab render correctly - Edit AP Group', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      action: 'edit',
      activeTab: 'radio'
    }

    render(
      <Provider>
        <ApGroupEdit />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    const title = await screen.findByText('Edit AP Group')
    expect(title).toBeVisible()
    const tabs = screen.queryAllByRole('tab')
    expect(tabs).toHaveLength(6) // 2 tabs and 4 radio tabs

    fireEvent.click(await screen.findByRole('tab', { name: 'General' }))

    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: '/tenant-id/t/devices/apgroups/apgroup-id/edit/general',
      search: ''
    })

  })

  it('should render correctly - not found', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      action: 'edit',
      activeTab: 'found'
    }

    render(
      <Provider>
        <ApGroupEdit />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    const title = await screen.findByText('Edit AP Group')
    expect(title).toBeVisible()

    const tabs = screen.queryAllByRole('tab')
    expect(tabs).toHaveLength(0)
  })
})

const venueId = venuelist.data[0].id
const venueData = venuelist.data[0]

const defaultApGroupCxtdata = {
  isRbacEnabled: true,
  previousPath: '/ap-groups',
  setPreviousPath: jest.fn(),
  isEditMode: false,
  isApGroupTableFlag: false,
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

describe('AP Group Edit Radio with unsaved changes dialog', () => {
  const params = {
    tenantId: 'tenant-id',
    apGroupId: 'apgroup-id',
    action: 'edit',
    activeTab: 'radio'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUsedNavigate.mockClear()
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => {
          mockedApGroupListReq()
          return res(ctx.json(mockAPGroupList))
        }
      ),
      rest.post(
        WifiUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => {
          mockedApGroupListReq()
          return res(ctx.json(mockAPGroupList))
        }
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      ),
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
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      // rbac
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      rest.get(
        WifiRbacUrlsInfo.getApRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(apDeviceRadio))),
      rest.get(
        WifiRbacUrlsInfo.getApGroupDefaultRegulatoryChannels.url,
        (_, res, ctx) => {
          mockedGetApGroupDefaultRegulatoryChannels()
          return res(ctx.json(apGroupValidRadioChannels))
        }),
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
      rest.put(WifiRbacUrlsInfo.updateApGroupRadioCustomization.url,
        (_, res, ctx) => {
          mockedUpdateApGroupRadioCustomization()
          return res(ctx.json({}))
        }),
      rest.get(
        CommonRbacUrlsInfo.getVenueApModelBandModeSettings.url,
        (_, res, ctx) => res(ctx.json([{ model: 'R760' }]))),
      rest.get(
        WifiRbacUrlsInfo.getApGroupBandModeSettings.url,
        (_, res, ctx) => {
          mockedGetApGroupBandModeSettings()
          return res(ctx.json(apGroupTripleBandMode))
        }),
      rest.put(
        WifiRbacUrlsInfo.updateApGroupBandModeSettings.url,
        (_, res, ctx) => {
          return res(ctx.json({}))
        }),
      rest.get(
        WifiRbacUrlsInfo.getApGroupApCapabilities.url,
        (_, res, ctx) => res(ctx.json(apGroupApCaps)))
    )
  })

  it('should render correctly with unsaved dialogs', async () => {
    render(
      <Provider>
        <ApGroupEditContext.Provider value={{
          ...defaultApGroupCxtdata,
          isEditMode: true, isApGroupTableFlag: true
        }}>
          <ApGroupEdit />
        </ApGroupEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    await waitFor(() => { expect(mockedApGroupListReq).toHaveBeenCalled() })
    await waitFor(() => { expect(mockedGetApGroupBandModeSettings).toHaveBeenCalled() })

    expect(await screen.findByRole('link', { name: 'Wi-Fi Radio' })).toBeVisible()
    expect(await screen.findByRole('heading', { name: /wi\-fi radio settings/i })).toBeVisible()

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(screen.getByRole('tab', { name: /2\.4 ghz/i })).toBeVisible()
    expect(screen.getByRole('tab', { name: '5 GHz' })).toBeVisible()

    const customizeBandMode = screen.getByText(/customize settings/i)
    userEvent.click(customizeBandMode)
    expect(await screen.findByText(/r760/i)).toBeVisible()

    let customizeRadio = screen.getByText(/customize 2\.4 ghz settings/i)
    userEvent.click(customizeRadio)

    expect(await screen.findByRole('tab', { name: 'Radio *' })).toBeVisible()


    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(saveButton)
    await waitFor(() => expect(mockedUpdateApGroupRadioCustomization).toBeCalled())
    expect(saveButton).toBeVisible()
  })
})
