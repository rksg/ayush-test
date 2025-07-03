import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { firmwareApi }                                        from '@acx-ui/rc/services'
import {
  EdgeFirmwareFixtures,
  FirmwareRbacUrlsInfo,
  CommonUrlsInfo,
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
  availableVersions, version,
  preference, mockedApModelFamilies
} from './__tests__/fixtures'
import { switchLatestV1002,
  switchVenueV1002
} from './SwitchFirmwareV1002/__tests__/fixtures'

import FWVersionMgmt, { isApFirmwareUpToDate } from '.'

const { mockedVenueFirmwareList, mockedLatestEdgeFirmwares } = EdgeFirmwareFixtures
const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


jest.mock('./SwitchFirmwareV1002/VenueFirmwareList', () => ({
  ...jest.requireActual('./SwitchFirmwareV1002/VenueFirmwareList'),
  VenueFirmwareList: () => <div data-testid='mocked-SwitchFirmwareV1002-table'></div>
}))
jest.mock('./ApFirmware/VenueFirmwareListPerApModel', () => ({
  ...jest.requireActual('./ApFirmware/VenueFirmwareListPerApModel'),
  // eslint-disable-next-line max-len
  VenueFirmwareListPerApModel: () => <div data-testid='mocked-ApFirmware-table'>VenueFirmwareListPerApModel</div>
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
jest.mock('./EdgeFirmware/VenueFirmwareList', () => ({
  ...jest.requireActual('./EdgeFirmware/VenueFirmwareList'),
  VenueFirmwareList: () => <div data-testid='mocked-EdgeFirmware-table'></div>
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitchDefaultVersionsQuery: () => ({
    data: mockSwitchCurrentVersionsV1002
  })
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn()
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
        FirmwareRbacUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenueV1002))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),

      rest.get(
        FirmwareUrlsInfo.getUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
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
        SigPackUrlsInfo.getSigPack.url.replace('?changesIncluded=:changesIncluded', ''),
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        SigPackUrlsInfo.getSigPackRbac.url.replace('?changesIncluded=:changesIncluded', ''),
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (req, res, ctx) => res(ctx.json(mockedApModelFamilies))
      )
    )
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_req, res, ctx) => res(ctx.json(mockedVenueFirmwareList))
      ),
      rest.get(
        FirmwareUrlsInfo.getLatestEdgeFirmware.url.replace('?latest=true', ''),
        (_req, res, ctx) => res(ctx.json(mockedLatestEdgeFirmwares))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
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
    await userEvent.click(await screen.findByRole('tab', { name: /Switch Firmware/ }))
    await screen.findByTestId('mocked-SwitchFirmwareV1002-table')

    const edgeFirmwareTab = screen.getByRole('tab', { name: /RUCKUS Edge Firmware/ })
    expect(await within(edgeFirmwareTab).findByTestId('InformationSolid')).toBeVisible()
  })

  it('should return the correct isApFirmwareUpToDate value', () => {
    expect(isApFirmwareUpToDate()).toBe(true)
    expect(isApFirmwareUpToDate(true)).toBe(true)
    expect(isApFirmwareUpToDate(false)).toBe(false)
  })
})
