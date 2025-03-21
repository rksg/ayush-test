/* eslint-disable testing-library/no-node-access */
import { rest } from 'msw'

import { Features, useIsSplitOn, useSplitOverride }                from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo }                                  from '@acx-ui/rc/utils'
import { dataApiURL, Provider, store }                             from '@acx-ui/store'
import { fireEvent, render, screen, mockGraphqlQuery, mockServer } from '@acx-ui/test-utils'
import type { AnalyticsFilter }                                    from '@acx-ui/utils'
import { DateRange }                                               from '@acx-ui/utils'

import { topApplicationByTrafficFixture } from './__tests__/fixtures'
import { api }                            from './services'

import { TopApplicationsByTraffic } from './index'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId: 'tenantId' })
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(),
  useSplitOverride: jest.fn()
}))

type ColumnElements = Array<HTMLElement|SVGSVGElement>

const extractRows = (doc:DocumentFragment)=>{
  const rows: Array<ColumnElements>=[]
  doc.querySelectorAll('table > tbody > tr').forEach((row) => {
    const columns = row.querySelectorAll('td')
    const extractedColumns: ColumnElements = []
    columns.forEach((column,colIndex)=>{
      if(colIndex === 2){
        const svgElement = column.querySelector('svg')
        if(svgElement)
          extractedColumns.push(svgElement)
      }else{
        extractedColumns.push(column)
      }
    })
    rows.push(extractedColumns)
  })
  return rows
}

describe('TopApplicationsByTrafficWidget', () => {
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

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
        (_req, res, ctx) => res(ctx.json(settingsEnabled))),
      rest.patch(AdministrationUrlsInfo.updatePrivacySettings.url,
        (_req, res, ctx) => res(ctx.json(settingsEnabled)))
    )
    store.dispatch(api.util.resetApiState())
  })

  afterEach(() => {
    mockServer.resetHandlers()
  })

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      data: { network: { hierarchyNode: topApplicationByTrafficFixture } }
    })
    render( <Provider> <TopApplicationsByTraffic filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      data: { network: { hierarchyNode: {
        uploadAppTraffic: null,
        downloadAppTraffic: null,
        topNAppByUpload: [],
        topNAppByDownload: []
      } } }
    })
    const { asFragment } = render( <Provider>
      <TopApplicationsByTraffic filters={filters}/>
    </Provider>)
    await screen.findByText('No data to display')
    expect(asFragment()).toMatchSnapshot('NoData')
  })

  it('should render table with sparkline svg', async () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      data: { network: { hierarchyNode: topApplicationByTrafficFixture } }
    })
    const { asFragment } = render( <Provider> <TopApplicationsByTraffic
      filters={filters}/></Provider>)
    await screen.findByText('Top Applications by Traffic')
    const contentSwitcher = asFragment()
      .querySelector('div.ant-card-body > div > div:nth-child(1) > div')
    expect(contentSwitcher).toMatchSnapshot('contentSwitcher')
    const tableHeaders = asFragment().querySelector('div > table > thead')
    expect(tableHeaders).toMatchSnapshot('tableHeaders')
    const uploadRows = extractRows(asFragment())
    expect(uploadRows).toMatchSnapshot('uploadRows')
    fireEvent.click(screen.getByText('Download'))
    const downloadRows = extractRows(asFragment())
    expect(downloadRows).toMatchSnapshot('downloadRows')
  })

  it('should render chart when APP_VISIBILITY is true', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      data: { network: { hierarchyNode: topApplicationByTrafficFixture } }
    })
    render( <Provider> <TopApplicationsByTraffic filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect(screen.queryByText('No permission to view application data')).not.toBeInTheDocument()
  })
  it('should render for empty data when APP_VISIBILITY is false', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (_req, res, ctx) => res(ctx.json(settingsDisabled))),
      rest.patch(AdministrationUrlsInfo.updatePrivacySettings.url,
        (_req, res, ctx) => res(ctx.json(settingsDisabled)))
    )
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      data: { network: { hierarchyNode: topApplicationByTrafficFixture } }
    })
    render( <Provider>
      <TopApplicationsByTraffic filters={filters}/>
    </Provider>)
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument()
  })
  it('should render for empty data when app privacy api is failed', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (_req, res, ctx) => res(ctx.status(500), ctx.json(null))),
      rest.patch(AdministrationUrlsInfo.updatePrivacySettings.url,
        (_req, res, ctx) => res(ctx.status(500), ctx.json(null)))
    )
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      data: { network: { hierarchyNode: topApplicationByTrafficFixture } }
    })
    const { asFragment } = render( <Provider>
      <TopApplicationsByTraffic filters={filters}/>
    </Provider>)
    await screen.findByText('No permission to view application data')
    expect(asFragment()).toMatchSnapshot('No permission when privacy api is failed')
  })
  it('should render chart when IS_MLISA_RA is true', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const originalEnv = process.env
    process.env.NX_IS_MLISA_SA = 'true'
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
      data: { network: { hierarchyNode: topApplicationByTrafficFixture } }
    })
    render( <Provider> <TopApplicationsByTraffic filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect(screen.queryByText('No permission to view application data')).not.toBeInTheDocument()
    process.env = originalEnv
  })

})
