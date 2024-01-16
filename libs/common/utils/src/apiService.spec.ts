import { QueryReturnValue }                                   from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { MaybePromise }                                       from '@reduxjs/toolkit/dist/query/tsHelpers'
import { FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import {
  isIgnoreErrorModal, isShowApiError,
  createHttpRequest,
  getFilters,
  batchApi
} from './apiService'

const fetchWithBQSuccess: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<
unknown, FetchBaseQueryError, FetchBaseQueryMeta>> = jest.fn().mockResolvedValue('success')

const fetchWithBQFail: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<
unknown, FetchBaseQueryError, FetchBaseQueryMeta>> = jest.fn().mockRejectedValue('error')

describe('ApiInfo', () => {
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
      url: '/venues/aaaServers/query'
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

    expect(createHttpRequest(apiInfo1)).toStrictEqual(httpRequest)
    expect(createHttpRequest(apiInfo2)).toStrictEqual(httpRequest)
    expect(apiInfo1.url).toBe('/venues/aaaServers/query')
    expect(apiInfo2.url).toBe('/venues/aaaServers/query')
  })

  it('batchApi: success', async () => {
    expect(await batchApi(
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

  it('batchApi: fail', async () => {
    expect(await batchApi(
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
