import { rest } from 'msw'

import {  ReportUrlsInfo, reportsApi } from '@acx-ui/reports/services'
import type { UrlInfo }                from '@acx-ui/reports/services'
import { Provider }                    from '@acx-ui/store'
import { store }                       from '@acx-ui/store'
import { render, screen, waitFor }     from '@acx-ui/test-utils'
import { mockServer }                  from '@acx-ui/test-utils'

import { DataStudio, getHostName } from '.'

const response = {
  redirect_url: '/api/a4rc/explorer/'
} as UrlInfo

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  isMSP: jest.fn()
}))

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
  })

  const params = { tenantId: 'tenant-id' }
  it('should render the data studio', async () => {
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
  it('should get the correct hostname for dev env', async () => {
    const oldEnv = process.env
    process.env = { NODE_ENV: 'development' }
    expect(getHostName(window.location.origin)).toBe('https://dev.ruckus.cloud')
    process.env = oldEnv
  })
  it('should get the correct hostname for prod and non MSP env', async () => {
    const oldEnv = process.env
    process.env = { NODE_ENV: 'production' }
    expect(getHostName('https://eu.ruckus.cloud.com')).toBe('https://eu.ruckus.cloud.com')
    process.env = oldEnv
  })
})
