import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'

import { networkDetailHeaderData } from './__tests__/fixtures'
import NetworkPageHeader           from './NetworkPageHeader'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

beforeEach(() => {
  mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
})

afterEach(() => {
  mockedUseConfigTemplate.mockRestore()
})

describe('NetworkPageHeader', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getNetworksDetailHeader.url,
        (_, res, ctx) => res(ctx.json(networkDetailHeaderData))
      ),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json([])))
    )
  })

  it('should render correctly in overview', async () => {
    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'overview'
          }
        }
      }
    )
    const dateFilter = await screen.findAllByPlaceholderText('Start date')
    expect(dateFilter).toHaveLength(1)
  })

  it('should render without datefilter in aps/venue', async () => {
    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'aps'
          }
        }
      }
    )
    const dateFilter = screen.queryByPlaceholderText('Start date')
    expect(dateFilter).not.toBeInTheDocument()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'overview'
          }
        }
      }
    )
    expect(await screen.findByText('Wi-Fi')).toBeVisible()
    expect(await screen.findByText('Wi-Fi Networks')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /network list/i
    })).toBeTruthy()
  })

  it('should render breadcrumb correctly with MSP account', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

    render(
      <Provider>
        <NetworkPageHeader />,
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'testId',
            networkId: 'test',
            activeTab: 'overview'
          }
        }
      }
    )
    expect(await screen.findByText('Configuration Templates')).toBeVisible()
  })
})
