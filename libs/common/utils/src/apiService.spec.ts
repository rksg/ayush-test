import { QueryReturnValue }                                   from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { MaybePromise }                                       from '@reduxjs/toolkit/dist/query/tsHelpers'
import { FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import {
  enableNewApi,
  isDev, isIntEnv,
  isLocalHost, isQA,
  isScale, isStage, isProdEnv,
  isIgnoreErrorModal, isShowApiError,
  createHttpRequest,
  getFilters,
  getUrlForTest,
  patchApi
} from './apiService'

const fetchWithBQSuccess: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<
unknown, FetchBaseQueryError, FetchBaseQueryMeta>> = jest.fn().mockResolvedValue('success')

const fetchWithBQFail: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<
unknown, FetchBaseQueryError, FetchBaseQueryMeta>> = jest.fn().mockRejectedValue('error')

describe('ApiInfo', () => {
  it('Check the envrionment', async () => {
    expect(isLocalHost()).toBe(true)
    expect(isDev()).toBe(false)
    expect(isQA()).toBe(false)
    expect(isScale()).toBe(false)
    expect(isIntEnv()).toBe(false)
    expect(isStage()).toBe(false)
    expect(isProdEnv()).toBe(false)
  })

  it('Check the error modal flag', async () => {
    expect(isIgnoreErrorModal()).toBe(false)
    expect(isShowApiError()).toBe(false)
    const req = new Request('/foo/bar')
    req.headers.set('Build-In-Error-Modal', 'ignore')
    expect(isIgnoreErrorModal(req)).toBe(true)
    expect(isShowApiError(new Request('/foo/bar'))).toBe(false)
  })

  it('getFilters', async () => {
    expect(getFilters({})).toStrictEqual({})
    expect(getFilters({
      networkId: 'networkId',
      venueId: 'venueId'
    })).toStrictEqual({
      networkId: ['networkId'],
      venueId: ['venueId']
    })
  })

  it('Check enable new API', async () => {
    const apiInfo1 = {
      method: 'post',
      url: '/venues/aaaServers/query',
      oldUrl: '/api/switch/tenant/:tenantId/aaaServer/query',
      newApi: true
    }

    const apiInfo2 = {
      method: 'post',
      url: '/venues/aaaServers/query'
    }

    const httpRequest = {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
      url: 'http://localhost/venues/aaaServers/query'
    }

    expect(enableNewApi(apiInfo1)).toBe(true)
    expect(enableNewApi(apiInfo2)).toBe(false)
    expect(createHttpRequest(apiInfo1)).toStrictEqual(httpRequest)
    expect(createHttpRequest(apiInfo2)).toStrictEqual(httpRequest)
    expect(getUrlForTest(apiInfo1)).toBe('/venues/aaaServers/query')
    expect(getUrlForTest(apiInfo2)).toBe('/venues/aaaServers/query')
  })

  it('patchApi: success', async () => {
    expect(await patchApi(
      {
        method: 'delete',
        url: '/venues/{venueId}/switches'
      },
      [
        { params: { venueId: '905493085d224d1aabfbcf91e5139218' }, payload: ['FMF4250Q06L'] },
        { params: { venueId: '905493085d224d1aabfbcf91e5139219' }, payload: ['FMF4250Q07L'] }
      ],
      fetchWithBQSuccess
    )).toEqual({ data: ['success', 'success'] })
  })

  it('patchApi: fail', async () => {
    expect(await patchApi(
      {
        method: 'delete',
        url: '/venues/{venueId}/switches'
      },
      [
        { params: { venueId: '905493085d224d1aabfbcf91e5139218' }, payload: ['FMF4250Q06L'] },
        { params: { venueId: '905493085d224d1aabfbcf91e5139219' }, payload: ['FMF4250Q07L'] }
      ],
      fetchWithBQFail
    )).toEqual('error')
  })

})
