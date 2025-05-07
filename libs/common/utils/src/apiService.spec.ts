import { QueryReturnValue, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import { MaybePromise } from '@acx-ui/types'

import {
  isDev,
  isLocalHost,
  isIgnoreErrorModal, isShowApiError,
  createHttpRequest,
  getFilters,
  getUrlForTest,
  getOpsApi,
  batchApi,
  isShowImprovedErrorSuggestion
} from './apiService'

const fetchWithBQSuccess: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<
unknown, FetchBaseQueryError, FetchBaseQueryMeta>> = jest.fn().mockResolvedValue('success')

const fetchWithBQFail: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<
unknown, FetchBaseQueryError, FetchBaseQueryMeta>> = jest.fn().mockRejectedValue('error')

describe('ApiInfo', () => {
  it('Check the envrionment', async () => {
    expect(isLocalHost()).toBe(true)
    expect(isDev()).toBe(false)
  })
  it('Check the error modal flag', async () => {
    expect(isIgnoreErrorModal()).toBe(false)
    expect(isShowApiError()).toBe(false)
    const req = new Request('/foo/bar')
    req.headers.set('Build-In-Error-Modal', 'ignore')
    expect(isIgnoreErrorModal(req)).toBe(true)
    expect(isShowApiError(new Request('/foo/bar'))).toBe(false)
  })

  it('Check the getEnabledDialogImproved flag', async () => {
    expect(isIgnoreErrorModal()).toBe(false)
  })

  it('Check the isShowImprovedErrorSuggestion flag with empty errors', async () => {
    expect(isShowImprovedErrorSuggestion({ errors: [] })).toBe(false)
  })

  it('Check the isShowImprovedErrorSuggestion flag with errors', async () => {
    expect(isShowImprovedErrorSuggestion({ errors: [{ reason: 'test' }] })).toBe(true)
  })

  it('Check the isShowImprovedErrorSuggestion flag with empty error', async () => {
    expect(isShowImprovedErrorSuggestion({ error: {} })).toBe(false)
  })

  it('Check the isShowImprovedErrorSuggestion flag with error', async () => {
    expect(isShowImprovedErrorSuggestion({ error: { reason: 'test' } })).toBe(true)
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
    expect(getFilters({
      apGroupId: 'apGroupId'
    })).toStrictEqual({
      deviceGroupId: ['apGroupId']
    })
  })

  it('Check enable new API', async () => {
    const apiInfo1 = {
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
    expect(apiInfo1.url).toBe('/venues/aaaServers/query')
  })

  it('Check enable new API with newApi flag', async () => {
    const apiInfo1 = {
      method: 'post',
      url: '/venues/aaaServers/query',
      oldUrl: '/api/switch/tenant/:tenantId/aaaServer/query',
      newApi: true
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
    expect(apiInfo1.url).toBe('/venues/aaaServers/query')
  })

  it('test getUrlForTest', async () => {
    const apiInfo1 = {
      method: 'post',
      url: '/venues/aaaServers/query'
    }

    expect(getUrlForTest({
      ...apiInfo1,
      newApi: true
    })).toBe('/venues/aaaServers/query')

    expect(getUrlForTest({
      ...apiInfo1,
      oldUrl: '/api/switch/tenant/:tenantId/aaaServer/query'
    })).toBe('/api/switch/tenant/:tenantId/aaaServer/query')
  })

  it('test getOpsApi', async () => {
    const apiInfo1 = {
      method: 'post',
      url: '/venues/aaaServers/query'
    }

    expect(getOpsApi(apiInfo1)).toBe('')
    expect(getOpsApi({
      ...apiInfo1,
      opsApi: 'POST:/venues/aaaServers/query'
    })).toBe('POST:/venues/aaaServers/query')
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
