import { rest } from 'msw'

import {  ReportUrlsInfo, reportsApi } from '@acx-ui/reports/services'
import type { UrlInfo }                from '@acx-ui/reports/services'
import { Provider }                    from '@acx-ui/store'
import { store }                       from '@acx-ui/store'
import { render, screen }              from '@acx-ui/test-utils'
import { mockServer }                  from '@acx-ui/test-utils'

import { DataStudio } from '.'

const AuthenticateResponse = {
  redirect_url: '/api/a4rc/explorer/'
} as UrlInfo

describe('DataStudio', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        ReportUrlsInfo.authenticate.url,
        (req, res, ctx) => res(ctx.json(AuthenticateResponse))
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
    expect(screen.getByTestId('data-studio')).toBeDefined()
  })
})
