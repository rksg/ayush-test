import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockedApModelFirmwares } from './__tests__/fixtures'

import { VersionBannerPerApModel } from '.'

const mockedUseTestDataFn = jest.fn()
jest.mock('../VenueFirmwareListPerApModel/UpdateNowPerApModel/ApFirmwareUpdateGroupPanel', () => ({
  // eslint-disable-next-line max-len
  ...jest.requireActual('../VenueFirmwareListPerApModel/UpdateNowPerApModel/ApFirmwareUpdateGroupPanel'),
  useTestData: () => mockedUseTestDataFn()
}))

describe('VersionBannerPerApModel', () => {
  const params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAllApModelFirmwareList.url,
        (req, res, ctx) => res(ctx.json(mockedApModelFirmwares))
      )
    )
  })

  afterEach(() => {
    mockedUseTestDataFn.mockRestore()
  })

  it('should render the banner with the "Show More" link', async () => {
    mockedUseTestDataFn.mockReturnValue({ data: mockedApModelFirmwares, isLoading: false })

    render(
      <Provider>
        <VersionBannerPerApModel />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.0.0.104.1242')).toBeVisible()
    expect(screen.getByText(/For devices/i)).toBeVisible()

    expect(screen.queryByText('6.2.4.103.244')).toBeNull()

    await userEvent.click(screen.getByText('Show more available firmware'))
    expect(screen.getByText('6.2.4.103.244')).toBeVisible()
  })

  it('should render the banner without the "Show More" link', async () => {
    mockedUseTestDataFn.mockReturnValue({ data: [ mockedApModelFirmwares[0] ], isLoading: false })

    render(
      <Provider>
        <VersionBannerPerApModel />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.0.0.104.1242')).toBeVisible()
    expect(screen.getByText(/For devices/i)).toBeVisible()
    expect(screen.queryByText('Show more available firmware')).toBeNull()
  })
})
