/* eslint-disable testing-library/no-node-access */
import { rest } from 'msw'

import { Features, useIsSplitOn, useSplitOverride }              from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo }                                from '@acx-ui/rc/utils'
import { Provider, store, dataApiURL }                           from '@acx-ui/store'
import { render, screen, mockGraphqlQuery, mockServer, waitFor } from '@acx-ui/test-utils'
import { DateRange }                                             from '@acx-ui/utils'
import type { AnalyticsFilter }                                  from '@acx-ui/utils'

import { topAppsByTrafficFixture, topAppsByTrafficFixtureNoData } from './__tests__/fixtures'
import { api }                                                    from './services'

import { dataFormatter, TopAppsByTraffic } from './index'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId: 'tenantId' })
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(),
  useSplitOverride: jest.fn()
}))

describe('TopAppsByTrafficWidget', () => {
  const settingsEnabled = {
    privacyFeatures: [
      {
        featureName: 'APP_VISIBILITY',
        isEnabled: true
      }
    ]
  }

  const settingsDisabled = {
    privacyFeatures: [
      {
        featureName: 'APP_VISIBILITY',
        isEnabled: false
      }
    ]
  }
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.mocked(useSplitOverride).mockReturnValue({
      treatments: {
        [Features.RA_PRIVACY_SETTINGS_APP_VISIBILITY_TOGGLE]: 'on'
      },
      isReady: true
    })

    mockServer.use(
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (_req, res, ctx) => res(ctx.json(settingsEnabled)))
    )
    store.dispatch(api.util.resetApiState())
  })

  afterEach(() => {
    jest.mocked(useIsSplitOn).mockClear()
    jest.mocked(useSplitOverride).mockClear()
    mockServer.resetHandlers()
  })

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: topAppsByTrafficFixture } }
    })
    render(<Provider><TopAppsByTraffic filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('Top Applications by Traffic')
  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: {
        topNAppByTotalTraffic: []
      } } }
    })
    const { asFragment } = render(<Provider>
      <TopAppsByTraffic filters={filters}/>
    </Provider>)
    await screen.findByText('No data to display')
    expect(asFragment()).toMatchSnapshot('NoData')
  })

  it('should render chart when APP_VISIBILITY is enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: topAppsByTrafficFixture } }
    })
    const { asFragment } = render(<Provider><TopAppsByTraffic filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect(screen.queryByText('No permission to view application data')).not.toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })

  it('should show no data when APP_VISIBILITY is disabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (_req, res, ctx) => res(ctx.json(settingsDisabled)))
    )
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: topAppsByTrafficFixtureNoData } }
    })

    render(<Provider>
      <TopAppsByTraffic filters={filters}/>
    </Provider>)

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    }, { timeout: 5000 })
    await waitFor(() => {
      expect(screen.queryByTestId('donut-chart')).not.toBeInTheDocument()
    }, { timeout: 5000 })
    expect(screen.getByText('No data to display')).toBeInTheDocument()
  })

  it('should show no permission when app privacy api is failed', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (_req, res, ctx) => res(ctx.status(500), ctx.json(null)))
    )
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: topAppsByTrafficFixtureNoData } }
    })

    const { asFragment } = render(<Provider>
      <TopAppsByTraffic filters={filters}/>
    </Provider>)

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
    }, { timeout: 5000 })
    await waitFor(() => {
      expect(screen.queryByTestId('donut-chart')).not.toBeInTheDocument()
    }, { timeout: 5000 })

    expect(screen.getByText('No data to display')).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot('No data when privacy api is failed')
  })

  it('should render chart when IS_MLISA_RA is true', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const originalEnv = process.env
    process.env.NX_IS_MLISA_SA = 'true'
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: topAppsByTrafficFixture } }
    })
    render(<Provider><TopAppsByTraffic filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect(screen.queryByText('No permission to view application data')).not.toBeInTheDocument()
    process.env = originalEnv
  })

  it('should return the correct formatted data', async () => {
    expect(dataFormatter(12113243434)).toEqual('11.3 GB')
  })
})
