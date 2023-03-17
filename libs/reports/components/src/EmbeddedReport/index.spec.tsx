import { rest } from 'msw'

import {  ReportUrlsInfo, reportsApi }        from '@acx-ui/reports/services'
import type { GuestToken, DashboardMetadata } from '@acx-ui/reports/services'
import { Provider }                           from '@acx-ui/store'
import { store }                              from '@acx-ui/store'
import { render }                             from '@acx-ui/test-utils'
import { mockServer }                         from '@acx-ui/test-utils'

import { ReportType, reportTypeDataStudioMapping } from '../mapping/reportsMapping'

import { EmbeddedReport, convertDateTimeToSqlFormat } from '.'

const mockEmbedDashboard = jest.fn()
jest.mock('@superset-ui/embedded-sdk', () => ({
  embedDashboard: () => mockEmbedDashboard
}))
jest.mock('@acx-ui/analytics/components', () => ({
  getSupersetRlsClause: () => ({
    networkClause: 'network clause',
    radioBandClause: 'radio band clause'
  })
}))

const guestTokenReponse = {
  token: 'some token'
} as GuestToken

const getEmbeddedReponse = {
  result: {
    allowed_domains: [
      'localhost:8088'
    ],
    changed_by: null,
    changed_on: '2022-12-06T05:57:51.442545',
    dashboard_id: '6',
    uuid: 'ac940866-a6f3-4113-81c1-ffb82983ce51'
  }
} as DashboardMetadata

describe('convertDateTimeToSqlFormat', () => {
  it('should convert date to sqlDateTimeFormat', () => {
    expect(convertDateTimeToSqlFormat('2022-12-16T08:05:00+05:30'))
      .toEqual('2022-12-16 02:35:00')
  })
})

describe('EmbeddedDashboard', () => {
  const oldEnv = process.env
  beforeEach(() => {
    mockServer.use(
      rest.post(
        ReportUrlsInfo.getEmbeddedDashboardMeta.url,
        (req, res, ctx) => res(ctx.json(getEmbeddedReponse))
      ),
      rest.post(
        ReportUrlsInfo.getEmbeddedReportToken.url,
        (req, res, ctx) => res(ctx.json(guestTokenReponse))
      )
    )
  })
  afterEach(() => {
    process.env = oldEnv
    store.dispatch(reportsApi.util.resetApiState())
  })

  const params = { tenantId: 'tenant-id' }
  it('should render the dashboard', async () => {
    rest.post(
      ReportUrlsInfo.getEmbeddedDashboardMeta.url,
      (req, res, ctx) => res(ctx.json(getEmbeddedReponse))
    )
    render(<Provider>
      <EmbeddedReport
        embedDashboardName={reportTypeDataStudioMapping[ReportType.AP_DETAIL]} />
    </Provider>, { route: { params } })
    // expect(mockEmbedDashboard).toHaveBeenCalledWith()
    // TODO - Will revisit this
  })
  it('should set the Host name to devalto for dev', () => {
    process.env = { NODE_ENV: 'development' }
    render(<Provider>
      <EmbeddedReport
        embedDashboardName={reportTypeDataStudioMapping[ReportType.AP_DETAIL]} />
    </Provider>, { route: { params } })
  })
  it('should render the dashboard rls clause', async () => {
    rest.post(
      ReportUrlsInfo.getEmbeddedDashboardMeta.url,
      (req, res, ctx) => res(ctx.json(getEmbeddedReponse))
    )
    render(<Provider>
      <EmbeddedReport
        embedDashboardName={reportTypeDataStudioMapping[ReportType.AP_DETAIL]}
        rlsClause='venue filter'/>
    </Provider>, { route: { params } })
  })
})
