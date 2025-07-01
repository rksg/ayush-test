import { rest } from 'msw'

import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { FirmwareRbacUrlsInfo, FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { EdgeFirmwareFixtures }                   from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { render, screen, mockServer, fireEvent }  from '@acx-ui/test-utils'
import { UserRbacUrlsInfo, UserUrlsInfo }         from '@acx-ui/user'

import {
  allUserSettings,
  cloudMessageBanner,
  cloudVersion,
  venueApModelFirmwareList
} from './__tests__/fixtures'

import { CloudMessageBanner } from '.'

const { mockedVenueFirmwareList } = EdgeFirmwareFixtures
jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)

const mockedUseLayoutContext = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useLayoutContext: () => mockedUseLayoutContext()
}))

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('cloud Message Banner', () => {
  const route = {
    params: { tenantId: '3061bd56e37445a8993ac834c01e2710' },
    path: '/:tenantId/'
  }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        UserUrlsInfo.getCloudMessageBanner.url,
        (_, res, ctx) => res(ctx.json(cloudMessageBanner))
      ),
      rest.get(
        UserRbacUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json(allUserSettings))
      ),
      rest.get(
        UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json(allUserSettings))
      ),
      rest.get(
        UserUrlsInfo.getCloudVersion.url,
        (_, res, ctx) => res(ctx.json(cloudVersion))
      ),
      rest.post(
        FirmwareUrlsInfo.getVenueApModelFirmwareList.url,
        (_, res, ctx) => res(ctx.json(venueApModelFirmwareList))
      ),
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedVenueFirmwareList))
      ),
      rest.get(
        FirmwareUrlsInfo.getAllApModelFirmwareList.url,
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })
  it('should render message banner', async () => {
    const mockShowMessageBanner = jest.fn()
    mockedUseLayoutContext.mockReturnValue({
      showMessageBanner: true,
      setShowMessageBanner: mockShowMessageBanner
    })
    render(<Provider><CloudMessageBanner /></Provider>, { route })
    // eslint-disable-next-line max-len
    expect(await screen.findByText('we are aware of ongoing problem with User management, RUCKUS engineering is working on a solution')).toBeVisible()

    fireEvent.click(await screen.findByLabelText('close'))
    expect(mockShowMessageBanner).toHaveBeenCalled()
  })
  it('should hide message banner', async () => {
    mockedUseLayoutContext.mockReturnValue({
      showMessageBanner: undefined,
      setShowMessageBanner: jest.fn()
    })
    render(<Provider><CloudMessageBanner /></Provider>, { route })
    // eslint-disable-next-line max-len
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
  it('should render upgrade schedule message', async () => {
    mockedUseLayoutContext.mockReturnValue({
      showMessageBanner: true,
      setShowMessageBanner: jest.fn()
    })
    mockServer.use(
      rest.get(
        UserUrlsInfo.getCloudMessageBanner.url,
        (_, res, ctx) => res(ctx.json(null))
      )
    )
    render(<Provider><CloudMessageBanner /></Provider>, { route })
    // eslint-disable-next-line max-len
    expect(await screen.findByText('An upgrade schedule for the new firmware version is available.')).toBeVisible()

    fireEvent.click(screen.getByText('More details'))
    expect(mockedUsedNavigate).toHaveBeenCalled()
  })
})
