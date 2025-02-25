/* eslint-disable testing-library/no-node-access */
import { rest } from 'msw'

import { useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo }                       from '@acx-ui/rc/utils'
import { Provider, store, dataApiURL }                  from '@acx-ui/store'
import { render, screen, mockGraphqlQuery, mockServer } from '@acx-ui/test-utils'
import { DateRange }                                    from '@acx-ui/utils'
import type { AnalyticsFilter }                         from '@acx-ui/utils'

import { topAppsByTrafficFixture } from './__tests__/fixtures'
import { api }                     from './services'

import { dataFormatter, TopAppsByTraffic } from './index'

const params = { tenantId: 'tenant-id' }

const settingsEnabled = {
  privacyFeatures: [
    {
      featureName: 'APP_VISIBILITY',
      isEnabled: true
    },
    {
      featureName: 'ARC',
      isEnabled: true
    }
  ]
}

const settingsDisabled = {
  privacyFeatures: [
    {
      featureName: 'APP_VISIBILITY',
      isEnabled: false
    },
    {
      featureName: 'ARC',
      isEnabled: false
    }
  ]
}

describe('TopAppsByTrafficWidget', () => {
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() =>{
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockServer.use(
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (_req, res, ctx) => res(ctx.json(settingsEnabled))),
      rest.patch(AdministrationUrlsInfo.updatePrivacySettings.url,
        (_req, res, ctx) => res(ctx.json(settingsEnabled)))
    )
    store.dispatch(api.util.resetApiState())
  })

  afterEach(() => {
    mockServer.resetHandlers()
  })

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: topAppsByTrafficFixture } }
    })
    render( <Provider> <TopAppsByTraffic filters={filters}/></Provider>, { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('Top Applications by Traffic')

  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: {
        topNAppByTotalTraffic: []
      } } }
    })
    const { asFragment } = render( <Provider>
      <TopAppsByTraffic filters={filters}/>
    </Provider>, { route: { params } })
    await screen.findByText('No data to display')
    expect(asFragment()).toMatchSnapshot('NoData')
  })
  it('should render chart when APP_VISIBILITY is true', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: topAppsByTrafficFixture } }
    })
    render( <Provider> <TopAppsByTraffic filters={filters}/></Provider>, { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument()
  })
  it('should render for empty data when APP_VISIBILITY is false', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (_req, res, ctx) => res(ctx.json(settingsDisabled))),
      rest.patch(AdministrationUrlsInfo.updatePrivacySettings.url,
        (_req, res, ctx) => res(ctx.json(settingsDisabled)))
    )
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: {
        topNAppByTotalTraffic: []
      } } }
    })
    const { asFragment } = render( <Provider>
      <TopAppsByTraffic filters={filters}/>
    </Provider>, { route: { params } })
    await screen.findByText('No data to display')
    expect(asFragment()).toMatchSnapshot('NoData when APP_VISIBILITY is false')
  })
  it('should render for empty data when app privacy api is failed', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (_req, res, ctx) => res(ctx.status(500), ctx.json(null))),
      rest.patch(AdministrationUrlsInfo.updatePrivacySettings.url,
        (_req, res, ctx) => res(ctx.status(500), ctx.json(null)))
    )
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: {
        topNAppByTotalTraffic: []
      } } }
    })
    const { asFragment } = render( <Provider>
      <TopAppsByTraffic filters={filters}/>
    </Provider>, { route: { params } })
    await screen.findByText('No data to display')
    expect(asFragment()).toMatchSnapshot('NoData when privacy api is failed')
  })
  it('should render chart when IS_MLISA_RA is true', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const originalEnv = process.env
    process.env.NX_IS_MLISA_SA = 'true'
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: topAppsByTrafficFixture } }
    })
    render( <Provider> <TopAppsByTraffic filters={filters}/></Provider>, { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument()
    process.env = originalEnv
  })
  it('should return the correct formatted data', async () => {
    expect(dataFormatter(12113243434)).toEqual('11.3 GB')
  })

})
