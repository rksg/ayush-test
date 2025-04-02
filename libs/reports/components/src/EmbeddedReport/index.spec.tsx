import { rest } from 'msw'

import { getUserProfile as getUserProfileRA, Roles as RolesEnumRA } from '@acx-ui/analytics/utils'
import { RadioBand }                                                from '@acx-ui/components'
import { showActionModal }                                          from '@acx-ui/components'
import * as config                                                  from '@acx-ui/config'
import { useIsSplitOn, Features }                                   from '@acx-ui/feature-toggle'
import {  ReportUrlsInfo, reportsApi }                              from '@acx-ui/reports/services'
import type { GuestToken, EmbeddedResponse }                        from '@acx-ui/reports/services'
import { Provider, store, rbacApiURL, refreshJWT }                  from '@acx-ui/store'
import { render, mockServer, act, waitFor }                         from '@acx-ui/test-utils'
import { RolesEnum as RolesEnumR1 }                                 from '@acx-ui/types'
import { CustomRoleType, getUserProfile as getUserProfileR1 }       from '@acx-ui/user'
import { NetworkPath, useLocaleContext }                            from '@acx-ui/utils'

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

import type { EmbedDashboardParams } from '@superset-ui/embedded-sdk'

// Mocking embeddedObj and its methods
const mockUnmount = jest.fn()
const mockGetScrollSize = jest.fn()

const mockSdk = {
  embedDashboardSpy: jest.fn(),
  embedDashboard: function (props: EmbedDashboardParams) {
    this.embedDashboardSpy(props)
    return Promise.resolve({
      getScrollSize: mockGetScrollSize,
      unmount: mockUnmount
    })
  }
}

jest.mock('@superset-ui/embedded-sdk', () => ({
  embedDashboard: (props: EmbedDashboardParams) => mockSdk.embedDashboard(props)
}))

jest.mock('@acx-ui/utils', () => ({
  __esModule: true,
  ...jest.requireActual('@acx-ui/utils'),
  useLocaleContext: jest.fn(),
  getJwtToken: jest.fn().mockReturnValue('some token')
}))
const localeContext = jest.mocked(useLocaleContext)

jest.mock('@acx-ui/store', () => ({
  __esModule: true,
  ...jest.requireActual('@acx-ui/store'),
  refreshJWT: jest.fn()
}))
const refreshJWTMock = jest.mocked(refreshJWT)

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showActionModal: jest.fn(),
  getDefaultEarliestStart: jest.fn()
}))
const actionModal = jest.mocked(showActionModal)

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn()
}))
const userProfileRA = getUserProfileRA as jest.Mock

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  getUserProfile: jest.fn()
}))
const userProfileR1 = getUserProfileR1 as jest.Mock

const guestTokenReponse = {
  token: 'some token'
} as GuestToken

const embeddedResponse1 = {
  result: {
    allowed_domains: [
      'localhost:8088'
    ],
    changed_by: null,
    changed_on: '2022-12-06T05:57:51.442545',
    dashboard_id: '6',
    uuid: 'ac940866-a6f3-4113-81c1-ffb82983ce51'
  }
} as EmbeddedResponse

const embeddedResponse2 = {
  result: {
    allowed_domains: [
      'localhost:8088'
    ],
    changed_by: null,
    changed_on: '2022-12-06T05:57:51.442545',
    dashboard_id: '6',
    uuid: 'ac940866-a6f3-4113-81c1-ffb82983ce51'
  },
  user_info: {
    is_franchisor: 'false',
    tenant_ids: [
      '1235'
    ],
    tenant_id: '1234',
    own_tenant_id: '1234',
    cache_key: 'cache-key'
  }
} as EmbeddedResponse

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
        (_, res, ctx) => res(ctx.json(embeddedResponse1))
      ),
      rest.post(
        ReportUrlsInfo.getEmbeddedReportToken.url,
        (_, res, ctx) => res(ctx.json(guestTokenReponse))
      ),
      rest.get(`${rbacApiURL}/systems`,
        (_req, res, ctx) => res(ctx.json(systems)))
    )
    userProfileR1.mockReturnValue({
      profile: {
        scopes: [
          'wifi-u',
          'switch-u'
        ],
        firstName: 'John',
        lastName: 'Doe',
        email: 'n9bKZ@example.com',
        roles: [RolesEnumRA.PRIME_ADMINISTRATOR],
        externalId: '1234',
        tenantId: '1234'
      }
    })
  })
  afterEach(() => {
    process.env = oldEnv
    store.dispatch(reportsApi.util.resetApiState())
    jest.clearAllMocks()
    mockSdk.embedDashboardSpy.mockClear()
  })

  const params = { tenantId: 'tenant-id' }
  it.each([
    [RolesEnumRA.PRIME_ADMINISTRATOR, false],
    [RolesEnumRA.ADMINISTRATOR, false],
    [RolesEnumRA.READ_ONLY, true]
  ])(
    'should render the dashboard for SA with correct read-only state',
    async (role, isReadOnly) => {
      get.mockReturnValue('true')
      userProfileRA.mockReturnValue({
        accountId: 'account-id',
        tenants: [],
        invitations: [],
        selectedTenant: {
          id: 'tenant-id',
          permissions: {},
          role
        }
      })
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

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.isReadOnly).toBe(isReadOnly)
    }
  )

  it('should render AP dashboard for ALTO with custom scopes', async () => {
    get.mockReturnValue('')
    // Mock useIsSplitOn to return true for RBAC_PHASE3_TOGGLE and I18N_DATA_STUDIO_TOGGLE
    jest.mocked(useIsSplitOn).mockImplementation((feature) => {
      if (feature === Features.RBAC_PHASE3_TOGGLE) return true
      if (feature === Features.I18N_DATA_STUDIO_TOGGLE) return true
      return false
    })
    localeContext.mockReturnValue({
      messages: { locale: null as unknown as string },
      lang: 'en-US',
      setLang: () => {}
    })

    userProfileR1.mockReturnValue({
      profile: {
        scopes: ['bi.reports-c', 'bi.reports-u', 'bi.reports-d'],
        firstName: 'John',
        lastName: 'Doe',
        email: 'n9bKZ@example.com',
        roles: [],
        externalId: '1234',
        tenantId: '1234'
      }
    })

    render(<Provider>
      <EmbeddedReport
        reportName={ReportType.AP_DETAIL} />
    </Provider>, { route: { params } })

    await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
    const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
    expect(embedDashboardCall.isReadOnly).toBe(false)
  })

  it('should render SWITCH dashboard for ALTO with custom scopes', async () => {
    get.mockReturnValue('')
    // Mock useIsSplitOn to return true for RBAC_PHASE3_TOGGLE and I18N_DATA_STUDIO_TOGGLE
    jest.mocked(useIsSplitOn).mockImplementation((feature) => {
      if (feature === Features.RBAC_PHASE3_TOGGLE) return true
      if (feature === Features.I18N_DATA_STUDIO_TOGGLE) return true
      return false
    })
    localeContext.mockReturnValue({
      messages: { locale: null as unknown as string },
      lang: 'en-US',
      setLang: () => {}
    })

    userProfileR1.mockReturnValue({
      profile: {
        scopes: ['bi.reports-c', 'bi.reports-u', 'bi.reports-d'],
        firstName: 'John',
        lastName: 'Doe',
        email: 'n9bKZ@example.com',
        roles: [],
        externalId: '1234',
        tenantId: '1234'
      }
    })

    render(<Provider>
      <EmbeddedReport
        reportName={ReportType.SWITCH} />
    </Provider>, { route: { params } })

    await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
    const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
    expect(embedDashboardCall.isReadOnly).toBe(false)
  })

  it('should render OVERVIEW dashboard for ALTO without custom scopes', async () => {
    userProfileR1.mockReturnValue({
      profile: {
        scopes: undefined,
        roles: [RolesEnumR1.ADMINISTRATOR]
      }
    })
    get.mockReturnValue('')
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    localeContext.mockReturnValue({
      messages: { locale: null as unknown as string },
      lang: 'en-US',
      setLang: () => {}
    })

    render(<Provider>
      <EmbeddedReport
        reportName={ReportType.OVERVIEW} />
    </Provider>, { route: { params } })

    await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
    const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
    expect(embedDashboardCall.isReadOnly).toBe(false)
  })

  it('should render OVERVIEW dashboard for ALTO without scopes and custom system role',
    async () => {
      userProfileR1.mockReturnValue({
        profile: {
          scopes: undefined,
          customRoleType: CustomRoleType.SYSTEM,
          customRoleName: RolesEnumR1.ADMINISTRATOR,
          roles: ['custom-system-role']
        }
      })
      get.mockReturnValue('')
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      localeContext.mockReturnValue({
        messages: { locale: null as unknown as string },
        lang: 'en-US',
        setLang: () => {}
      })

      render(<Provider>
        <EmbeddedReport
          reportName={ReportType.OVERVIEW} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.isReadOnly).toBe(false)
    })

  it('should call getScroll and set height on mount and cleanup state on unmount',
    async () => {
      mockGetScrollSize.mockResolvedValue({ height: 100 })

      // Create a mock iframe element
      const mockIframeElement = document.createElement('embedded-iframe')
      const mockQuerySelector = jest.spyOn(document, 'querySelector') as jest.Mock
      mockQuerySelector.mockReturnValue(mockIframeElement)

      const { unmount } = render(<Provider>
        <EmbeddedReport
          reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
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

    mockServer.use(
      rest.post(
        ReportUrlsInfo.getEmbeddedDashboardMeta.url,
        (_, res, ctx) => res(ctx.json(embeddedResponse2))
      ))
    render(<Provider>
      <EmbeddedReport
        reportName={ReportType.AP_DETAIL}
        rlsClause='venue filter'/>
    </Provider>, { route: { params } })
  })

  describe('Event listener', () => {
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
          reportName={ReportType.OVERVIEW}
          rlsClause='venue filter'/>
      </Provider>, { route: { params } })

      act(() => {
        window.dispatchEvent(new MessageEvent('message', { data: { type: 'unauthorized' } }))
      })
      expect(addEventListenerMock).toHaveBeenCalledWith('message', expect.any(Function))
      expect(actionModal).toHaveBeenCalled()

      actionModal.mock.calls[0][0].onOk!()
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
    it('should call refreshJWT when event type is refreshToken', () => {
      render(<Provider>
        <EmbeddedReport
          reportName={ReportType.OVERVIEW}
          rlsClause='venue filter'/>
      </Provider>, { route: { params } })

      act(() => {
        window.dispatchEvent(new MessageEvent('message',
          { data: { type: 'refreshToken', headers: { 'login-token': 'token' } } }))
      })
      expect(addEventListenerMock).toHaveBeenCalledWith('message', expect.any(Function))
      expect(refreshJWTMock).toHaveBeenCalledWith(
        { headers: { 'login-token': 'token' }, type: 'refreshToken' })
    })
  })

  describe('Read-only scope functionality', () => {
    beforeEach(() => {
      get.mockReturnValue('') // Set to non-SA mode
      // Mock useIsSplitOn to return true for all features
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      localeContext.mockReturnValue({
        messages: { locale: null as unknown as string },
        lang: 'en-US',
        setLang: () => {}
      })
    })

    it('should be read-only when user has only read scope in RBAC Phase 3', async () => {
      userProfileR1.mockReturnValue({
        profile: {
          scopes: ['bi.reports-r'],
          firstName: 'John',
          lastName: 'Doe',
          email: 'n9bKZ@example.com',
          roles: [],
          externalId: '1234',
          tenantId: '1234'
        }
      })

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.isReadOnly).toBe(true)
    })

    it('should have write access when user has write scope in RBAC Phase 3', async () => {
      userProfileR1.mockReturnValue({
        profile: {
          scopes: ['bi.reports-c', 'bi.reports-u', 'bi.reports-d'],
          firstName: 'John',
          lastName: 'Doe',
          email: 'n9bKZ@example.com',
          roles: [],
          externalId: '1234',
          tenantId: '1234'
        }
      })

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.isReadOnly).toBe(false)
    })

    it('should be read-only when user has system role without write permissions', async () => {
      userProfileR1.mockReturnValue({
        profile: {
          scopes: undefined,
          customRoleType: CustomRoleType.SYSTEM,
          customRoleName: RolesEnumR1.READ_ONLY,
          firstName: 'John',
          lastName: 'Doe',
          email: 'n9bKZ@example.com',
          roles: [],
          externalId: '1234',
          tenantId: '1234'
        }
      })

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.isReadOnly).toBe(true)
    })

    it('should have write access when user has system role with write permissions', async () => {
      userProfileR1.mockReturnValue({
        profile: {
          scopes: undefined,
          customRoleType: CustomRoleType.SYSTEM,
          customRoleName: RolesEnumR1.ADMINISTRATOR,
          firstName: 'John',
          lastName: 'Doe',
          email: 'n9bKZ@example.com',
          roles: [],
          externalId: '1234',
          tenantId: '1234'
        }
      })

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.isReadOnly).toBe(false)
    })

    it('should be read-only when user has no scopes and no write permissions in roles',
      async () => {
        userProfileR1.mockReturnValue({
          profile: {
            scopes: undefined,
            firstName: 'John',
            lastName: 'Doe',
            email: 'n9bKZ@example.com',
            roles: [RolesEnumR1.READ_ONLY],
            externalId: '1234',
            tenantId: '1234'
          }
        })

        render(<Provider>
          <EmbeddedReport reportName={ReportType.AP_DETAIL} />
        </Provider>, { route: { params } })

        await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
        const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
        expect(embedDashboardCall.isReadOnly).toBe(true)
      })

    it('should have write access when user has no scopes but has write permissions in roles',
      async () => {
        userProfileR1.mockReturnValue({
          profile: {
            scopes: undefined,
            firstName: 'John',
            lastName: 'Doe',
            email: 'n9bKZ@example.com',
            roles: [RolesEnumR1.ADMINISTRATOR],
            externalId: '1234',
            tenantId: '1234'
          }
        })

        render(<Provider>
          <EmbeddedReport reportName={ReportType.AP_DETAIL} />
        </Provider>, { route: { params } })

        await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
        const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
        expect(embedDashboardCall.isReadOnly).toBe(false)
      })
  })

  describe('Error handling and edge cases', () => {
    beforeEach(() => {
      get.mockReturnValue('') // Set to non-SA mode
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === Features.RBAC_PHASE3_TOGGLE) return true
        if (feature === Features.I18N_DATA_STUDIO_TOGGLE) return true
        return false
      })
      localeContext.mockReturnValue({
        messages: { locale: null as unknown as string },
        lang: 'en-US',
        setLang: () => {}
      })
    })

    it('should handle guest token fetch error', async () => {
      mockServer.use(
        rest.post(
          ReportUrlsInfo.getEmbeddedReportToken.url,
          (_, res, ctx) => res(ctx.status(500))
        )
      )

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
    })

    it('should handle mixed scopes in RBAC Phase 3', async () => {
      userProfileR1.mockReturnValue({
        profile: {
          scopes: ['bi.reports-r', 'bi.reports-c'],
          firstName: 'John',
          lastName: 'Doe',
          email: 'n9bKZ@example.com',
          roles: [],
          externalId: '1234',
          tenantId: '1234'
        }
      })

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.isReadOnly).toBe(false)
    })

    it('should handle custom role type with unknown role name', async () => {
      userProfileR1.mockReturnValue({
        profile: {
          scopes: undefined,
          customRoleType: CustomRoleType.SYSTEM,
          customRoleName: 'UNKNOWN_ROLE',
          firstName: 'John',
          lastName: 'Doe',
          email: 'n9bKZ@example.com',
          roles: [],
          externalId: '1234',
          tenantId: '1234'
        }
      })

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.isReadOnly).toBe(true)
    })

    it('should handle legacy read-only scopes when RBAC Phase 3 is disabled', async () => {
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === Features.RBAC_PHASE3_TOGGLE) return false
        if (feature === Features.I18N_DATA_STUDIO_TOGGLE) return true
        return false
      })

      userProfileR1.mockReturnValue({
        profile: {
          scopes: ['wifi-r', 'switch-r'],
          firstName: 'John',
          lastName: 'Doe',
          email: 'n9bKZ@example.com',
          roles: [],
          externalId: '1234',
          tenantId: '1234'
        }
      })

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.isReadOnly).toBe(true)
    })

    it('should handle locale from context when I18N is enabled', async () => {
      localeContext.mockReturnValue({
        messages: { locale: 'fr' },
        lang: 'fr-FR',
        setLang: () => {}
      })

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.locale).toBe('fr')
    })

    it('should use default locale when I18N is disabled', async () => {
      jest.mocked(useIsSplitOn).mockImplementation((feature) => {
        if (feature === Features.RBAC_PHASE3_TOGGLE) return true
        if (feature === Features.I18N_DATA_STUDIO_TOGGLE) return false
        return false
      })

      localeContext.mockReturnValue({
        messages: { locale: 'fr' },
        lang: 'fr-FR',
        setLang: () => {}
      })

      render(<Provider>
        <EmbeddedReport reportName={ReportType.AP_DETAIL} />
      </Provider>, { route: { params } })

      await waitFor(() => expect(mockSdk.embedDashboardSpy).toHaveBeenCalledTimes(1))
      const embedDashboardCall = mockSdk.embedDashboardSpy.mock.calls[0][0]
      expect(embedDashboardCall.locale).toBe('en')
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
    const emptyRlsClauseOverviewReport = getSupersetRlsClause(ReportType.OVERVIEW,
          [] as NetworkPath[], [] as RadioBand[])

    expect(rlsClauseWirelessReport).toMatchSnapshot('rlsClauseWirelessReport')
    expect(rlsClauseWiredReport).toMatchSnapshot('rlsClauseWiredReport')
    expect(rlsClauseApplicationReport).toMatchSnapshot('rlsClauseApplicationReport')
    expect(rlsClauseOverviewReport).toMatchSnapshot('rlsClauseOverviewReport')
    expect(emptyRlsClauseOverviewReport).toMatchSnapshot('emptyRlsClauseOverviewReport')
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
