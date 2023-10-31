import { rest } from 'msw'

import { showActionModal }                          from '@acx-ui/components'
import * as config                                  from '@acx-ui/config'
import { useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { ReportUrlsInfo, reportsApi }               from '@acx-ui/reports/services'
import type { UrlInfo }                             from '@acx-ui/reports/services'
import { Provider, store }                          from '@acx-ui/store'
import { render, screen, waitFor, mockServer, act } from '@acx-ui/test-utils'
import { useLocaleContext }                         from '@acx-ui/utils'

import { DataStudio, getHostName } from '.'

const response = {
  redirect_url: '/api/a4rc/explorer/'
} as UrlInfo

jest.mock('@acx-ui/utils', () => ({
  __esModule: true,
  ...jest.requireActual('@acx-ui/utils'),
  useLocaleContext: jest.fn()
}))
const localeContext = jest.mocked(useLocaleContext)

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showActionModal: jest.fn()
}))
const actionModal = jest.mocked(showActionModal)

describe('DataStudio', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        ReportUrlsInfo.authenticate.url.substring(0, ReportUrlsInfo.authenticate.url.indexOf('?')),
        (req, res, ctx) => res(ctx.json(response))
      )
    )
  })
  afterEach(() => {
    jest.clearAllMocks()
    store.dispatch(reportsApi.util.resetApiState())
    get.mockReturnValue('')
  })

  const params = { tenantId: 'tenant-id' }
  it('should render the data studio for ALTO', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    localeContext.mockReturnValue({
      messages: { locale: null as unknown as string },
      lang: 'en-US',
      setLang: () => {}
    })

    render(<Provider>
      <DataStudio/>
    </Provider>, { route: { params } })

    await waitFor(() => {
      expect(screen.getByTitle('data-studio')).toBeVisible()
    })

    const iframe = screen.getByTitle('data-studio') as HTMLIFrameElement
    expect(iframe.src).toBe('http://localhost/api/a4rc/explorer/')
  })

  it('should render the data studio for MLISA SA', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    localeContext.mockReturnValue({
      messages: { locale: 'en' },
      lang: 'en-US',
      setLang: () => {}
    })

    get.mockReturnValue('true')
    render(<Provider>
      <DataStudio/>
    </Provider>, { route: { params } })

    await waitFor(()=>{
      expect(screen.getByTitle('data-studio')).toBeVisible()
    })

    const iframe = screen.getByTitle('data-studio') as HTMLIFrameElement
    expect(iframe.src).toBe('http://localhost/api/a4rc/explorer/')
  })

  describe('dev env', () => {
    it('should get the correct hostname for dev env', async () => {
      const oldEnv = process.env
      process.env = { NODE_ENV: 'development' }
      expect(getHostName(window.location.origin)).toBe('https://dev.ruckus.cloud')
      process.env = oldEnv
    })
    it('should get the correct hostname for MLISA mode in dev env', async () => {
      const oldEnv = process.env
      process.env = { NODE_ENV: 'development' }
      get.mockReturnValue('true')
      expect(getHostName(window.location.origin)).toBe('https://staging.mlisa.io')
      process.env = oldEnv
    })
  })

  it('should get the correct hostname for prod and non MSP env', async () => {
    const oldEnv = process.env
    process.env = { NODE_ENV: 'production' }
    expect(getHostName('https://eu.ruckus.cloud.com')).toBe('https://eu.ruckus.cloud.com')
    process.env = oldEnv
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
        <DataStudio/>
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
        <DataStudio/>
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
