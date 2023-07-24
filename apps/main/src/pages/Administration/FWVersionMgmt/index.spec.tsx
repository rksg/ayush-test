import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps } from '@acx-ui/user'

import {
  availableVersions, versionLatest,
  switchLatest, switchVenue,
  venue, version, preference
} from './__tests__/fixtures'

import FWVersionMgmt from '.'

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

describe('Firmware Version Management', () => {
  let params: { tenantId: string, activeTab: string, activeSubTab: string }
  beforeEach(async () => {
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
      rest.post(
        FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenue))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      activeTab: 'fwVersionMgmt',
      activeSubTab: 'apFirmware'
    }
  })

  it('should render correctly', async () => {
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

  it('should render version banner (Recommended) correctly', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider value={{} as UserProfileContextProps}>
          <FWVersionMgmt />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/apFirmware' }
      })
    await screen.findByTestId('mocked-ApFirmware-table')

    expect(await screen.findByText(/Latest Version/i)).toBeVisible()
    expect(await screen.findByText(/6.2.1.103.1580/i)).toBeVisible()
    expect(await screen.findByText(/Recommended/i)).toBeVisible()
    expect(await screen.findByText(/12\/16\/2022/i)).toBeVisible()
  })

  it('should render version banner (critical) correctly', async () => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getLatestFirmwareList.url.replace('?status=latest', ''),
        (req, res, ctx) => res(ctx.json([{
          ...versionLatest,
          category: 'CRITICAL'
        }]))
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

    expect(await screen.findByText(/Latest Version/i)).toBeVisible()
    expect(await screen.findByText(/6.2.1.103.1580/i)).toBeVisible()
    expect(await screen.findByText(/Critical/i)).toBeVisible()
  })
})
