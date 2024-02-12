import { rest } from 'msw'

import { RadioBand }                          from '@acx-ui/components'
import { showActionModal }                    from '@acx-ui/components'
import * as config                            from '@acx-ui/config'
import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import {  ReportUrlsInfo, reportsApi }        from '@acx-ui/reports/services'
import type { GuestToken, DashboardMetadata } from '@acx-ui/reports/services'
import { Provider, store, rbacApiURL }        from '@acx-ui/store'
import { render, mockServer, act, waitFor }   from '@acx-ui/test-utils'
import { NetworkPath, useLocaleContext }      from '@acx-ui/utils'

import { ReportType } from '../mapping/reportsMapping'

import {
  paths,
  radioBands,
  apNetworkPath,
  switchNetworkPath,
  systems,
  systemMap } from './__tests__/fixtures'

import {
  EmbeddedReport,
  convertDateTimeToSqlFormat,
  getSupersetRlsClause,
  getRLSClauseForSA } from '.'


// Mocking embeddedObj and its methods
const mockUnmount = jest.fn()
const mockGetScrollSize = jest.fn()
jest.mock('@superset-ui/embedded-sdk', () => ({
  embedDashboard: () => {
    return Promise.resolve({
      getScrollSize: mockGetScrollSize,
      unmount: mockUnmount
    })
  }
}))

jest.mock('@acx-ui/utils', () => ({
  __esModule: true,
  ...jest.requireActual('@acx-ui/utils'),
  useLocaleContext: jest.fn(),
  getJwtToken: jest.fn().mockReturnValue('some token')
}))
const localeContext = jest.mocked(useLocaleContext)

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showActionModal: jest.fn()
}))
const actionModal = jest.mocked(showActionModal)

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
  const embedDashboardSpy = jest.fn()

  beforeEach(() => {
    mockServer.use(
      rest.post(
        ReportUrlsInfo.getEmbeddedDashboardMeta.url,
        (_, res, ctx) => {
          embedDashboardSpy()
          return res(ctx.json(getEmbeddedReponse))
        }
      ),
      rest.post(
        ReportUrlsInfo.getEmbeddedReportToken.url,
        (_, res, ctx) => res(ctx.json(guestTokenReponse))
      ),
      rest.get(`${rbacApiURL}/systems`,
        (_req, res, ctx) => res(ctx.json(systems)))
    )
  })
  afterEach(() => {
    process.env = oldEnv
    store.dispatch(reportsApi.util.resetApiState())
    get.mockReturnValue('')
    embedDashboardSpy.mockClear()
  })

  const params = { tenantId: 'tenant-id' }
  it('should render the dashboard', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    localeContext.mockReturnValue({
      messages: { locale: null as unknown as string },
      lang: 'en-US',
      setLang: () => {}
    })

    render(<Provider>
      <EmbeddedReport
        reportName={ReportType.AP_DETAIL} />
    </Provider>, { route: { params } })

    await waitFor(() => expect(embedDashboardSpy).toHaveBeenCalledTimes(1))
  })

  it('should call getScroll and set height on mount and cleanup state on unmount', async () => {
    mockGetScrollSize.mockResolvedValue({ height: 100 })

    // Create a mock iframe element
    const mockIframeElement = document.createElement('embedded-iframe')
    const mockQuerySelector = jest.spyOn(document, 'querySelector') as jest.Mock
    mockQuerySelector.mockReturnValue(mockIframeElement)

    const { unmount } = render(<Provider>
      <EmbeddedReport
        reportName={ReportType.AP_DETAIL} />
    </Provider>, { route: { params } })

    await waitFor(() => expect(embedDashboardSpy).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(mockGetScrollSize).toHaveBeenCalledTimes(1))

    expect(mockIframeElement.style.height).toBe('100px')

    unmount()

    await waitFor(() => expect(mockUnmount).toHaveBeenCalledTimes(1))
    mockQuerySelector.mockRestore()
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
    localeContext.mockReturnValue({
      messages: { locale: 'en' },
      lang: 'en-US',
      setLang: () => {}
    })

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

  describe('401 Unauthorized', () => {
    beforeAll(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...window.location,
          reload: jest.fn()
        }
      })
    })

    let addEventListenerMock: jest.SpyInstance
    let removeEventListenerMock: jest.SpyInstance

    beforeEach(() => {
      addEventListenerMock = jest.spyOn(window, 'addEventListener')
      removeEventListenerMock = jest.spyOn(window, 'removeEventListener')
    })

    afterEach(() => {
      addEventListenerMock.mockRestore()
      removeEventListenerMock.mockRestore()
      jest.resetAllMocks()
    })

    it('should call showExpiredSessionModal when event type is unauthorized', () => {
      render(<Provider>
        <EmbeddedReport
          reportName={ReportType.AP_DETAIL}
          rlsClause='venue filter'/>
      </Provider>, { route: { params } })

      act(() => {
        window.dispatchEvent(new MessageEvent('message', { data: { type: 'unauthorized' } }))
      })
      expect(addEventListenerMock).toHaveBeenCalledWith('message', expect.any(Function))
      expect(actionModal).toHaveBeenCalled()

      actionModal.mock.calls[0][0].onOk!()
      expect(window.location.reload).toHaveBeenCalled()
    })

    it('should NOT call showExpiredSessionModal when event type is NOT unauthorized', () => {
      const { unmount } = render(<Provider>
        <EmbeddedReport
          reportName={ReportType.AP_DETAIL}
          rlsClause='venue filter'/>
      </Provider>, { route: { params } })

      act(() => {
        window.dispatchEvent(new MessageEvent('message', { data: { type: 'something' } }))
      })
      expect(addEventListenerMock).toHaveBeenCalledWith('message', expect.any(Function))
      expect(actionModal).not.toHaveBeenCalled()

      unmount()
      expect(removeEventListenerMock).toHaveBeenCalledWith('message', expect.any(Function))
    })
  })
})

describe('getSupersetRlsClause',() => {
  it('should return RLS clause based network filters and report type',() => {
    const rlsClauseWirelessReport = getSupersetRlsClause(ReportType.WIRELESS,
      paths as NetworkPath[], radioBands as RadioBand[])
    const rlsClauseWiredReport = getSupersetRlsClause(ReportType.WIRED,
      paths as NetworkPath[], radioBands as RadioBand[])
    const rlsClauseApplicationReport = getSupersetRlsClause(ReportType.APPLICATION,
      paths as NetworkPath[], radioBands as RadioBand[])
    const rlsClauseOverviewReport = getSupersetRlsClause(ReportType.OVERVIEW,
        paths as NetworkPath[], radioBands as RadioBand[])

    expect(rlsClauseWirelessReport).toMatchSnapshot('rlsClauseWirelessReport')
    expect(rlsClauseWiredReport).toMatchSnapshot('rlsClauseWiredReport')
    expect(rlsClauseApplicationReport).toMatchSnapshot('rlsClauseApplicationReport')
    expect(rlsClauseOverviewReport).toMatchSnapshot('rlsClauseOverviewReport')
  })
})

describe('getRLSClauseForSA', () => {
  it('should return RLS clause based on report type - AP', () => {
    const rlsClause = getRLSClauseForSA(
      apNetworkPath as NetworkPath, systemMap, ReportType.WIRELESS)
    expect(rlsClause).toMatchSnapshot('rlsClauseAPForSA')
  })
  it('should return RLS clause based on report type - SWITCH', () => {
    const rlsClause = getRLSClauseForSA(
      switchNetworkPath as NetworkPath, systemMap, ReportType.WIRED)
    expect(rlsClause).toMatchSnapshot('rlsClauseSwitchForSA')
  })
  it('should return empty RLS clause for Overview', () => {
    const rlsClause = getRLSClauseForSA(
      switchNetworkPath as NetworkPath, systemMap, ReportType.OVERVIEW)
    expect(rlsClause).toMatchSnapshot('rlsClauseOverviewForSA')
  })
  it('should handle systems with same name', () => {
    const sameNameSystemMap = {
      ...systemMap,
      'ICXM-Scale': [
        systemMap['ICXM-Scale'][0],
        {
          ...systemMap['ICXM-Scale'][0],
          deviceId: '00000000-0000-0000-0000-000000000000'
        }
      ]
    }
    const rlsClause = getRLSClauseForSA(
      apNetworkPath as NetworkPath, sameNameSystemMap, ReportType.WIRELESS)
    expect(rlsClause).toMatchSnapshot('rlsClauseOverviewForSA')
  })
})
