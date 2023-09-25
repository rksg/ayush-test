import { rest } from 'msw'

import * as config                             from '@acx-ui/config'
import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { ReportUrlsInfo, reportsApi }          from '@acx-ui/reports/services'
import type { UrlInfo }                        from '@acx-ui/reports/services'
import { Provider, store }                     from '@acx-ui/store'
import { render, screen, waitFor, mockServer } from '@acx-ui/test-utils'

import { DataStudio, getHostName } from '.'

const response = {
  redirect_url: '/api/a4rc/explorer/'
} as UrlInfo

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

describe('DataStudio', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        ReportUrlsInfo.authenticate.url,
        (req, res, ctx) => res(ctx.json(response))
      )
    )
  })
  afterEach(() => {
    store.dispatch(reportsApi.util.resetApiState())
    get.mockReturnValue('')
  })

  const params = { tenantId: 'tenant-id' }
  it('should render the data studio for ALTO', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <DataStudio/>
    </Provider>, { route: { params } })

    expect(screen.getByTestId('data-studio')).toBeInTheDocument()

    await waitFor(()=>{
      expect(screen.getByTitle('data-studio')).toBeVisible()
    })

    const iframe = screen.getByTitle('data-studio') as HTMLIFrameElement
    expect(iframe.src).toBe('http://localhost/api/a4rc/explorer/')
  })

  it('should render the data studio for MLISA SA', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    get.mockReturnValue('true')
    render(<Provider>
      <DataStudio/>
    </Provider>, { route: { params } })

    expect(screen.getByTestId('data-studio')).toBeInTheDocument()

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
})
