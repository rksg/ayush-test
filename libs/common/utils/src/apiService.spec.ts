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
  isShowImprovedErrorSuggestion,
  convertApiInfoForRecConfigTemplate
} from './apiService'
import * as pathUtils from './pathUtils'

const mockedIsRecSite = jest.spyOn(pathUtils, 'isRecSite')

const fetchWithBQSuccess: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<
unknown, FetchBaseQueryError, FetchBaseQueryMeta>> = jest.fn().mockResolvedValue('success')

const fetchWithBQFail: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<
unknown, FetchBaseQueryError, FetchBaseQueryMeta>> = jest.fn().mockRejectedValue('error')

describe('ApiInfo', () => {
  beforeEach(() => {
    mockedIsRecSite.mockReturnValue(true)
  })

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

    expect(getUrlForTest(apiInfo1)).toBe('/venues/aaaServers/query')

    expect(getUrlForTest({
      ...apiInfo1,
      newApi: true
    })).toBe('/venues/aaaServers/query')

    expect(getUrlForTest({
      ...apiInfo1,
      oldUrl: '/api/switch/tenant/:tenantId/aaaServer/query'
    })).toBe('/api/switch/tenant/:tenantId/aaaServer/query')
  })

  describe('getOpsApi', () => {
    it('should return empty string when opsApi is not provided', () => {
      const apiInfo = {
        method: 'post',
        url: '/venues/aaaServers/query'
      }

      expect(getOpsApi(apiInfo)).toBe('')
    })

    it('should return opsApi value when isRecSite returns false', () => {
      mockedIsRecSite.mockReturnValue(false)

      const apiInfo = {
        method: 'post',
        url: '/venues/aaaServers/query',
        opsApi: 'POST:/venues/aaaServers/query'
      }

      expect(getOpsApi(apiInfo)).toBe('POST:/venues/aaaServers/query')
    })

    // eslint-disable-next-line max-len
    it('should return opsApi value when isRecSite returns false and opsApi does not contain templates', () => {
      mockedIsRecSite.mockReturnValue(false)

      const apiInfo = {
        method: 'post',
        url: '/venues/aaaServers/query',
        opsApi: 'POST:/nonrec/api'
      }

      expect(getOpsApi(apiInfo)).toBe('POST:/nonrec/api')
    })

    it('should replace :/templates with :/rec/templates when isRecSite returns true', () => {
      mockedIsRecSite.mockReturnValue(true)

      const apiInfo = {
        method: 'post',
        url: '/venues/aaaServers/query',
        opsApi: 'POST:/templates/api'
      }

      expect(getOpsApi(apiInfo)).toBe('POST:/rec/templates/api')
    })

    // eslint-disable-next-line max-len
    it('should replace :/templates with :/rec/templates when isRecSite returns true and opsApi contains multiple templates', () => {
      mockedIsRecSite.mockReturnValue(true)

      const apiInfo = {
        method: 'post',
        url: '/venues/aaaServers/query',
        opsApi: 'POST:/templates/api/templates/another'
      }

      expect(getOpsApi(apiInfo)).toBe(
        'POST:/rec/templates/api/templates/another'
      )
    })

    it('should not replace other parts of opsApi when isRecSite returns true', () => {
      mockedIsRecSite.mockReturnValue(true)

      const apiInfo = {
        method: 'post',
        url: '/venues/aaaServers/query',
        opsApi: 'POST:/templates/api:/other/path'
      }

      expect(getOpsApi(apiInfo)).toBe(
        'POST:/rec/templates/api:/other/path'
      )
    })

    it('should handle empty opsApi when isRecSite returns true', () => {
      mockedIsRecSite.mockReturnValue(true)

      const apiInfo = {
        method: 'post',
        url: '/venues/aaaServers/query',
        opsApi: ''
      }

      expect(getOpsApi(apiInfo)).toBe('')
    })

    it('should handle opsApi with only :/templates when isRecSite returns true', () => {
      mockedIsRecSite.mockReturnValue(true)

      const apiInfo = {
        method: 'post',
        url: '/venues/aaaServers/query',
        opsApi: ':/templates'
      }

      expect(getOpsApi(apiInfo)).toBe(':/rec/templates')
    })
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

  describe('convertApiInfoForRecConfigTemplate', () => {
    beforeEach(() => {
      process.env.TEST_REC_API_CONVERT = 'true'
    })

    afterEach(() => {
      delete process.env.TEST_REC_API_CONVERT
    })
    it('should return apiInfo unchanged when isRecSite returns false', () => {
      mockedIsRecSite.mockReturnValue(false)
      const apiInfo = {
        method: 'post',
        url: '/templates/api'
      }
      const result = convertApiInfoForRecConfigTemplate(apiInfo)
      expect(result).toEqual(apiInfo)
    })
    it('should replace /templates with /rec/templates when isRecSite returns true', () => {
      mockedIsRecSite.mockReturnValue(true)
      const apiInfo = {
        method: 'post',
        url: '/templates/api'
      }
      const result = convertApiInfoForRecConfigTemplate(apiInfo)
      expect(result).toEqual({
        method: 'post',
        url: '/rec/templates/api'
      })
    })
    it('should replace multiple occurrences of /templates when isRecSite returns true', () => {
      mockedIsRecSite.mockReturnValue(true)
      const apiInfo = {
        method: 'post',
        url: '/templates/api/templates/another'
      }
      const result = convertApiInfoForRecConfigTemplate(apiInfo)
      expect(result).toEqual({
        method: 'post',
        url: '/rec/templates/api/templates/another'
      })
    })
    it('should handle url without /templates when isRecSite returns true', () => {
      mockedIsRecSite.mockReturnValue(true)
      const apiInfo = {
        method: 'post',
        url: '/other/api'
      }
      const result = convertApiInfoForRecConfigTemplate(apiInfo)
      expect(result).toEqual(apiInfo)
    })
  })
})
