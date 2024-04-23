import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { firmwareApi }                        from '@acx-ui/rc/services'
import { FirmwareCategory, FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockedApModelFirmwares } from './__tests__/fixtures'

import { VersionBannerPerApModel } from '.'

const generateApModelFirmwares = jest.fn()

describe('VersionBannerPerApModel', () => {
  const params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  beforeEach(() => {
    store.dispatch(firmwareApi.util.resetApiState())

    generateApModelFirmwares.mockReturnValue(mockedApModelFirmwares)

    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAllApModelFirmwareList.url,
        (req, res, ctx) => {
          const result = generateApModelFirmwares()
          return res(ctx.json(result))
        }
      )
    )
  })

  it('should render the banner with the "Show More" link', async () => {
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

    await userEvent.click(screen.getByText('Show more'))
    expect(screen.getByText('6.2.4.103.244')).toBeVisible()
  })

  it('should render the banner without the "Show More" link', async () => {
    generateApModelFirmwares.mockReturnValue(mockedApModelFirmwares.slice(0, 1))

    render(
      <Provider>
        <VersionBannerPerApModel />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.0.0.104.1242')).toBeVisible()
    expect(screen.getByText(/For devices/i)).toBeVisible()
    await waitFor(() => expect(screen.queryByText('Show more')).toBeNull())
  })

  it('should render the banner when there is no AP in the tenant', async () => {
    generateApModelFirmwares.mockReturnValue([{
      id: '7.0.0.104.1242',
      name: '7.0.0.104.1242',
      releaseDate: '2024-02-27T07:27:53.405+00:00',
      onboardDate: '2024-02-21T05:18:57.254+0000',
      category: FirmwareCategory.RECOMMENDED
    }])

    render(
      <Provider>
        <VersionBannerPerApModel />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.0.0.104.1242')).toBeVisible()
    expect(screen.getByText('For devices --')).toBeVisible()
  })
})
