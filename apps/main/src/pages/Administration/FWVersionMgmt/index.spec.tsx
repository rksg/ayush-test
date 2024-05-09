import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { firmwareApi }                                        from '@acx-ui/rc/services'
import {
  FirmwareUrlsInfo, SigPackUrlsInfo, SwitchFirmwareFixtures
} from '@acx-ui/rc/utils'
import {
  Provider, store
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps } from '@acx-ui/user'


import {
  availableVersions, versionLatest,
  switchLatest, switchVenue,
  venue, version, preference, mockedApModelFamilies,
  mockedFirmwareVenuesPerApModel
} from './__tests__/fixtures'

import FWVersionMgmt from '.'

const { mockSwitchCurrentVersions } = SwitchFirmwareFixtures
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./SwitchFirmware/VenueFirmwareList', () => ({
  ...jest.requireActual('./SwitchFirmware/VenueFirmwareList'),
  VenueFirmwareList: () => <div data-testid='mocked-SwitchFirmware-table'></div>
}))
jest.mock('./ApFirmware/VenueFirmwareList', () => ({
  ...jest.requireActual('./ApFirmware/VenueFirmwareList'),
  VenueFirmwareList: () => <div data-testid='mocked-ApFirmware-table'></div>
}))
jest.mock('./ApFirmware/VenueFirmwareListPerApModel', () => ({
  ...jest.requireActual('./ApFirmware/VenueFirmwareListPerApModel'),
  VenueFirmwareListPerApModel: () => <div>VenueFirmwareListPerApModel</div>
}))
jest.mock('./ApFirmware/VersionBannerPerApModel', () => ({
  ...jest.requireActual('./ApFirmware/VersionBannerPerApModel'),
  VersionBannerPerApModel: () => <div>VersionBannerPerApModel</div>
}))
jest.mock('../ApplicationPolicyMgmt', () => ({
  ...jest.requireActual('../ApplicationPolicyMgmt'),
  default: () => {
    return <div data-testid='mocked-application-policy-mgmt'></div>
  }
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitchCurrentVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  })
}))

describe('Firmware Version Management', () => {
  const params: { tenantId: string, activeTab: string, activeSubTab: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    activeTab: 'fwVersionMgmt',
    activeSubTab: 'apFirmware'
  }

  beforeEach(async () => {
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      ),
      rest.get(
        FirmwareUrlsInfo.getLatestFirmwareList.url.replace('?status=latest', ''),
        (req, res, ctx) => res(ctx.json(versionLatest))
      ),
      rest.get(
        FirmwareUrlsInfo.getVenueVersionList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(venue))
      ),
      rest.get(
        FirmwareUrlsInfo.getFirmwareVersionIdList.url,
        (req, res, ctx) => res(ctx.json(version))
      ),
      rest.get(
        FirmwareUrlsInfo.getAvailableFirmwareList.url.replace('?status=release', ''),
        (req, res, ctx) => res(ctx.json(availableVersions))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatest))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatest))
      ),
      rest.post(
        FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenue))
      ),
      rest.get(
        SigPackUrlsInfo.getSigPack.url.replace('?changesIncluded=:changesIncluded', ''),
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (req, res, ctx) => res(ctx.json(mockedApModelFamilies))
      )
    )
  })

  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.AP_FW_MGMT_UPGRADE_BY_MODEL)
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getLatestFirmwareList.url.replace('?status=latest', ''),
        (req, res, ctx) => res(ctx.json([]))
      )
    )
    render(
      <Provider>
        <UserProfileContext.Provider value={{} as UserProfileContextProps}>
          <FWVersionMgmt />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/apFirmware' }
      })
    await screen.findByTestId('mocked-ApFirmware-table')
    userEvent.click(await screen.findByRole('tab', { name: /Switch Firmware/ }))
    await screen.findByTestId('mocked-SwitchFirmware-table')
  })

  // eslint-disable-next-line max-len
  it('should render upgradable hint correctly when the FF "ap-fw-mgmt-upgrade-by-model" is true', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.AP_FW_MGMT_UPGRADE_BY_MODEL)

    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getVenueApModelFirmwareList.url,
        (req, res, ctx) => res(ctx.json(mockedFirmwareVenuesPerApModel))
      )
    )
    render(
      <Provider>
        <UserProfileContext.Provider value={{} as UserProfileContextProps}>
          <FWVersionMgmt />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/apFirmware' }
      })

    const apFirmwareTab = await screen.findByRole('tab', { name: /AP Firmware/ })
    expect(await within(apFirmwareTab).findByTestId('InformationSolid')).toBeVisible()
  })
})
