/* eslint-disable max-len */
import _ from 'lodash'

import { ExpirationType, PassphraseFormatEnum } from '@acx-ui/rc/utils'

import { mockQueryApi }                                        from './__tests__/fixtures'
import { addDpskFn, addDpskWithIdentityGroupFn, updateDpskFn } from './dpsk'


const mockedCreateHttpRequest = jest.fn()
const mockedBatchApi = jest.fn()
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createHttpRequest: (...args: any) => mockedCreateHttpRequest.apply(null, args),
  batchApi: () => mockedBatchApi()
}))

describe('dpsk.utils', () => {
  afterEach(() => {
    jest.clearAllMocks()
    mockedBatchApi.mockRestore()
  })

  describe('executeAddDpsk', () => {
    const mockProps = {
      queryArgs: {
        params: {},
        payload: {
          id: undefined,
          name: 'name',
          passphraseLength: 16,
          passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
          expirationType: ExpirationType.DAYS_AFTER_TIME,
          expirationOffset: 1,
          policySetId: '12345678'
        },
        enableRbac: true
      },
      apiInfo: {
        url: '/dpskServices',
        oldUrl: '/api/dpskServices',
        method: 'post',
        newApi: true,
        defaultHeaders: {
          'Accept': 'application/vnd.ruckus.v1.1+json',
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        }
      },
      rbacApiInfo: { url: '/dpskServices',
        oldUrl: '/api/dpskServices',
        method: 'post', newApi: true, defaultHeaders: {
          'Accept': 'application/vnd.ruckus.v1.1+json',
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        }
      },
      policyApiInfo: {
        method: 'put',
        url: '/dpskServices/:serviceId/policySets/:policySetId',
        newApi: true,
        defaultHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1+json',
          'Accept': 'application/vnd.ruckus.v1+json'
        }
      },
      fetchWithBQ: jest.fn()
    }

    it('should return error when fetchWithBQ fails', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ error: 'error' })

      const result = await addDpskFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.rbacApiInfo, mockProps.queryArgs.params)
      expect(result).toEqual({ error: 'error' })
    })

    it('should call rbac api with correct parameters when enableRbac is true', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ data: { id: '987654321' } })
      const result = await addDpskFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.rbacApiInfo, mockProps.queryArgs.params)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
        body: JSON.stringify(_.omit(mockProps.queryArgs.payload, 'policySetId'))
      }))
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.policyApiInfo, {
        serviceId: '987654321',
        policySetId: '12345678'
      })
      expect(result).toEqual({ data: { id: '987654321' } })
    })

    it('should call legacy API when enableRbac is false', async () => {
      const mockNonRbacProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: false } }
      mockNonRbacProps.fetchWithBQ.mockResolvedValueOnce({ data: { response: { id: '987654321' } } })
      const result = await addDpskFn()(mockNonRbacProps.queryArgs, mockQueryApi, {}, mockNonRbacProps.fetchWithBQ)
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.apiInfo, mockProps.queryArgs.params)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
        body: JSON.stringify(mockProps.queryArgs.payload)
      }))
      expect(result).toEqual({ data: { response: { id: '987654321' } } })
    })
  })

  describe('executeUpdateDpsk', () => {
    const mockProps = {
      queryArgs: {
        params: {
          serviceId: '987654321'
        },
        payload: {
          id: '987654321',
          name: 'name',
          passphraseLength: 16,
          passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
          expirationType: ExpirationType.DAYS_AFTER_TIME,
          expirationOffset: 1,
          policySetId: '12345678'
        },
        enableRbac: true
      },
      apiInfo: {
        url: '/dpskServices/:serviceId',
        oldUrl: '/api/dpskServices/:serviceId',
        method: 'put',
        newApi: true,
        defaultHeaders: {
          'Accept': 'application/vnd.ruckus.v1.1+json',
          'Content-Type': 'application/vnd.ruckus.v1.1+json'
        }
      },
      getDpskService: { url: '/dpskServices/:serviceId',
        oldUrl: '/api/dpskServices/:serviceId',
        method: 'get',
        newApi: true
      },
      updatePolicyApiInfo: {
        method: 'put',
        url: '/dpskServices/:serviceId/policySets/:policySetId',
        newApi: true,
        defaultHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1+json',
          'Accept': 'application/vnd.ruckus.v1+json'
        }
      },
      deletePolicyApiInfo: {
        method: 'delete',
        url: '/dpskServices/:serviceId/policySets',
        newApi: true,
        defaultHeaders: {
          'Content-Type': 'application/vnd.ruckus.v1+json',
          'Accept': 'application/vnd.ruckus.v1+json'
        }
      },
      fetchWithBQ: jest.fn()
    }

    it('should return error when fetchWithBQ fails', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ error: 'error' })

      const result = await updateDpskFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(result).toEqual({ error: 'error' })
    })

    it('should call rbac api with correct parameters when enableRbac is true, policySet remain unchanged', async () => {
      const mockNonRbacProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: true } }
      mockNonRbacProps.fetchWithBQ.mockResolvedValueOnce({ data: { response: { id: '987654321' } } })
        .mockResolvedValueOnce({ data: {
          id: '987654321',
          name: 'name',
          passphraseLength: 16,
          passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
          expirationType: ExpirationType.DAYS_AFTER_TIME,
          expirationOffset: 1,
          policySetId: '12345678'
        }
        })
      const result = await updateDpskFn()(mockNonRbacProps.queryArgs, mockQueryApi, {}, mockNonRbacProps.fetchWithBQ)
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.apiInfo, mockProps.queryArgs.params)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
        body: JSON.stringify(_.omit(mockProps.queryArgs.payload, 'policySetId'))
      }))
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.getDpskService, { serviceId: '987654321' })
      expect(mockedCreateHttpRequest).not.toHaveBeenCalledWith(mockProps.updatePolicyApiInfo, expect.anything())
      expect(result).toEqual({ data: { response: { id: '987654321' } } })
    })

    it('should call rbac api with correct parameters when enableRbac is true, policySet changed', async () => {
      const mockNonRbacProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: true } }
      mockNonRbacProps.fetchWithBQ.mockResolvedValueOnce({ data: { response: { id: '987654321' } } })
        .mockResolvedValueOnce({ data: {
          id: '987654321',
          name: 'name',
          passphraseLength: 16,
          passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
          expirationType: ExpirationType.DAYS_AFTER_TIME,
          expirationOffset: 1,
          policySetId: 'original'
        }
        })
      const result = await updateDpskFn()(mockNonRbacProps.queryArgs, mockQueryApi, {}, mockNonRbacProps.fetchWithBQ)
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.apiInfo, mockProps.queryArgs.params)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
        body: JSON.stringify(_.omit(mockProps.queryArgs.payload, 'policySetId'))
      }))
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.getDpskService, { serviceId: '987654321' })
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.updatePolicyApiInfo, {
        serviceId: '987654321',
        policySetId: '12345678'
      })
      expect(result).toEqual({ data: { response: { id: '987654321' } } })
    })

    it('should call rbac api with correct parameters when enableRbac is true, policySet removed', async () => {
      const mockNonRbacProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: true } }
      mockNonRbacProps.fetchWithBQ.mockResolvedValueOnce({ data: { response: { id: '987654321' } } })
        .mockResolvedValueOnce({ data: {
          id: '987654321',
          name: 'name',
          passphraseLength: 16,
          passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
          expirationType: ExpirationType.DAYS_AFTER_TIME,
          expirationOffset: 1,
          policySetId: 'original'
        }
        })
      const result = await updateDpskFn()(_.omit(mockNonRbacProps.queryArgs, 'payload.policySetId'), mockQueryApi, {}, mockNonRbacProps.fetchWithBQ)
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.apiInfo, mockProps.queryArgs.params)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
        body: JSON.stringify(_.omit(mockProps.queryArgs.payload, 'policySetId'))
      }))
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.getDpskService, { serviceId: '987654321' })
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.deletePolicyApiInfo, { serviceId: '987654321' })
      expect(result).toEqual({ data: { response: { id: '987654321' } } })
    })

    it('should call legacy API when enableRbac is false', async () => {
      const mockNonRbacProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: false } }
      mockNonRbacProps.fetchWithBQ.mockResolvedValueOnce({ data: { response: { id: '987654321' } } })
      const result = await updateDpskFn()(mockNonRbacProps.queryArgs, mockQueryApi, {}, mockNonRbacProps.fetchWithBQ)
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.apiInfo, mockProps.queryArgs.params)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
        body: JSON.stringify(mockProps.queryArgs.payload)
      }))
      expect(result).toEqual({ data: { response: { id: '987654321' } } })
    })
  })

  describe('addDpskWithIdentityGroupFn', () => {
    const mockProps = {
      queryArgs: {
        params: {
          serviceId: '987654321'
        },
        payload: {
          id: '987654321',
          name: 'name',
          passphraseLength: 16,
          passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
          expirationType: ExpirationType.DAYS_AFTER_TIME,
          expirationOffset: 1,
          identityGroupId: '123123123'
        },
        enableRbac: true
      },
      apiInfo: {
        url: '/templates/identityGroups/:identityGroupId/dpskServices',
        opsApi: 'POST:/templates/identityGroups/{id}/dpskServices',
        method: 'post',
        newApi: true,
        defaultHeaders: {
          'Accept': 'application/vnd.ruckus.v1+json',
          'Content-Type': 'application/vnd.ruckus.v1+json'
        }
      },
      fetchWithBQ: jest.fn()
    }

    it('should call template api to create pool with identity group', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ data: { id: '987654321' } } )
      const result = await addDpskWithIdentityGroupFn(true)(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.apiInfo, mockProps.queryArgs.params)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
        body: JSON.stringify(_.omit(mockProps.queryArgs.payload, 'identityGroupId'))
      }))
      expect(result).toEqual({ data: { id: '987654321' } } )
    })
  })
})
