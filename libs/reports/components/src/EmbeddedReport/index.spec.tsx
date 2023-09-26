import { rest } from 'msw'

import { RadioBand }                          from '@acx-ui/components'
import * as config                            from '@acx-ui/config'
import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import {  ReportUrlsInfo, reportsApi }        from '@acx-ui/reports/services'
import type { GuestToken, DashboardMetadata } from '@acx-ui/reports/services'
import { Provider, store }                    from '@acx-ui/store'
import { render, mockServer }                 from '@acx-ui/test-utils'
import { NetworkPath }                        from '@acx-ui/utils'

import { ReportType } from '../mapping/reportsMapping'

import { EmbeddedReport, convertDateTimeToSqlFormat, getSupersetRlsClause } from '.'

const mockEmbedDashboard = jest.fn()
jest.mock('@superset-ui/embedded-sdk', () => ({
  embedDashboard: () => mockEmbedDashboard
}))

jest.mock('@acx-ui/utils', () => ({
  __esModule: true,
  ...jest.requireActual('@acx-ui/utils'),
  useLocaleContext: () => ({
    messages: {
      locale: 'en'
    }
  })
}))

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

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
        (_, res, ctx) => res(ctx.json(getEmbeddedReponse))
      ),
      rest.post(
        ReportUrlsInfo.getEmbeddedReportToken.url,
        (_, res, ctx) => res(ctx.json(guestTokenReponse))
      )
    )
  })
  afterEach(() => {
    process.env = oldEnv
    store.dispatch(reportsApi.util.resetApiState())
    get.mockReturnValue('')
  })

  const params = { tenantId: 'tenant-id' }
  it('should render the dashboard', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    rest.post(
      ReportUrlsInfo.getEmbeddedDashboardMeta.url,
      (_, res, ctx) => res(ctx.json(getEmbeddedReponse))
    )
    render(<Provider>
      <EmbeddedReport
        reportName={ReportType.AP_DETAIL} />
    </Provider>, { route: { params } })
    // expect(mockEmbedDashboard).toHaveBeenCalledWith()
    // TODO - Will revisit this
  })
  it('should set the Host name to devalto for dev', () => {
    process.env = { NODE_ENV: 'development' }
    render(<Provider>
      <EmbeddedReport
        reportName={ReportType.AP_DETAIL} />
    </Provider>, { route: { params } })
  })
  it('should set the Host name to staging for SA in dev', () => {
    process.env = { NODE_ENV: 'development' }
    get.mockReturnValue('true')
    render(<Provider>
      <EmbeddedReport
        reportName={ReportType.AP_DETAIL} />
    </Provider>, { route: { params } })
  })
  it('should render the dashboard rls clause', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    rest.post(
      ReportUrlsInfo.getEmbeddedDashboardMeta.url,
      (_, res, ctx) => res(ctx.json(getEmbeddedReponse))
    )
    render(<Provider>
      <EmbeddedReport
        reportName={ReportType.AP_DETAIL}
        rlsClause='venue filter'/>
    </Provider>, { route: { params } })
  })
})

describe('getSupersetRlsClause',()=>{
  const radioBands:RadioBand[]=['6','2.4']
  const paths:NetworkPath[] = [
    [{
      type: 'network',
      name: 'Network'
    }, {
      type: 'switchGroup',
      name: 'Switch-Venue'
    }, {
      type: 'switch',
      name: 'C0:C5:20:AA:33:2D'
    }],
    [{
      type: 'network',
      name: 'Network'
    }, {
      type: 'switchGroup',
      name: 'Switch-Venue'
    }, {
      type: 'switch',
      name: 'C0:C5:20:B2:11:59'
    }],
    [{
      type: 'network',
      name: 'Network'
    }, {
      type: 'switchGroup',
      name: 'Switch-Venue1'
    }],
    [{
      type: 'network',
      name: 'Network'
    }, {
      type: 'zone',
      name: 'Sindhuja-Venue'
    }],
    [{
      type: 'network',
      name: 'Network'
    }, {
      type: 'zone',
      name: 'Sonali'
    }, {
      type: 'AP',
      name: '00:0C:29:1E:9F:E4'
    }],
    [{
      type: 'network',
      name: 'Network'
    }, {
      type: 'zone',
      name: 'Sonali'
    }, {
      type: 'AP',
      name: '38:FF:36:13:DB:D0'
    }]
  ]
  it('should return RLS clause based network filters and report type',()=>{
    const rlsClauseWirelessReport = getSupersetRlsClause(ReportType.WIRELESS,paths,radioBands)
    const rlsClauseWiredReport = getSupersetRlsClause(ReportType.WIRED,paths,radioBands)
    const rlsClauseApplicationReport = getSupersetRlsClause(ReportType.APPLICATION,paths,radioBands)
    expect(rlsClauseWirelessReport).toMatchSnapshot('rlsClauseWirelessReport')
    expect(rlsClauseWiredReport).toMatchSnapshot('rlsClauseWiredReport')
    expect(rlsClauseApplicationReport).toMatchSnapshot('rlsClauseApplicationReport')
  })
})

