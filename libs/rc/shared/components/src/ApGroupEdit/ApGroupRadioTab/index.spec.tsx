import { rest } from 'msw'

import { useIsSplitOn }                                                                         from '@acx-ui/feature-toggle'
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
  apDeviceRadio, apGroupRadioCustomization, radioData,
  tripleBandMode,
  validRadioChannels,
  apGroupApCaps,
  venuelist,
  venueRadioCustomization, mockApModelFamilies
} from '../__tests__/fixtures'
import { ApGroupEditContext } from '../context'

import { ApGroupRadioTab } from './index'

const setEditContextDataFn = jest.fn()
const setEditRadioContextDataFn = jest.fn()
const mockedUsedNavigate = jest.fn()
const mockedGetApGroupRadioCustomization = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

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

describe('AP Group Edit Radio', () => {
  const params = {
    tenantId: 'tenant-id',
    apGroupId: 'apgroup-id',
    action: 'edit',
    activeTab: 'radio'
  }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedUsedNavigate.mockClear()

    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (_, res, ctx) => res(ctx.json(mockApModelFamilies))
      ),
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
      // rbac
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
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
        (_, res, ctx) => res(ctx.json([tripleBandMode]))
      ),
      rest.get(
        WifiRbacUrlsInfo.getApGroupBandModeSettings.url,
        (_, res, ctx) => res(ctx.json([tripleBandMode]))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ApGroupEditContext.Provider value={{
          ...defaultApGroupCxtdata,
          isEditMode: true, isApGroupTableFlag: true
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
  })
})
