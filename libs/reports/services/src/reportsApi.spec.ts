import { rest } from 'msw'

import { store }      from '@acx-ui/store'
import { mockServer } from '@acx-ui/test-utils'

import {  ReportUrlsInfo, reportsApi, UrlInfo } from '.'

import type { GuestToken, DashboardMetadata } from '.'

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

const AuthenticateResponse = {
  redirect_url: '/api/a4rc/explorer/'
} as UrlInfo

describe('reportsApi', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        ReportUrlsInfo.getEmbeddedDashboardMeta.url,
        (req, res, ctx) => res(ctx.json(getEmbeddedReponse))
      ),
      rest.post(
        ReportUrlsInfo.getEmbeddedReportToken.url,
        (req, res, ctx) => res(ctx.json(guestTokenReponse))
      ),
      rest.post(
        ReportUrlsInfo.authenticate.url,
        (req, res, ctx) => res(ctx.json(AuthenticateResponse))
      )
    )
  })
  afterEach(() =>
    store.dispatch(reportsApi.util.resetApiState())
  )
  it('should return embedded ID', async () => {
    const response = await store.dispatch(reportsApi.endpoints.embeddedId.initiate({
      payload: { dashboard_title: 'some dashboard' }
    })).unwrap()
    expect(response).toEqual(getEmbeddedReponse.result.uuid)
  })
  it('should return guest token', async () => {
    const response = await store.dispatch(reportsApi.endpoints.guestToken.initiate({
      payload: {
        user: {},
        resources: [{
          type: 'dashboard',
          id: getEmbeddedReponse.result.uuid
        }],
        rls: []
      }
    })).unwrap()
    expect(response).toEqual(guestTokenReponse.token)
  })
  it('should return redirect url', async () => {
    const response = await store.dispatch(
      reportsApi.endpoints.authenticate.initiate({
        params: {
          locale: 'en'
        }
      })).unwrap()
    expect(response).toEqual(AuthenticateResponse.redirect_url)
  })
})
