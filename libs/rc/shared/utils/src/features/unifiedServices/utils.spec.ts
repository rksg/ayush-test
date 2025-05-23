import { defineMessage } from 'react-intl'

import { RadioCardCategory } from '@acx-ui/components'
import { getIntl }           from '@acx-ui/utils'

import { generatePolicyListBreadcrumb, generateServiceListBreadcrumb, getPolicyRoutePath, getServiceRoutePath, policyTypeLabelMapping, serviceTypeDescMapping, serviceTypeLabelMapping } from '..'
import { ServiceOperation, ServiceType }                                                                                                                                                 from '../../constants'
import { PolicyOperation, PolicyType, policyTypeDescMapping }                                                                                                                            from '../../types'

import { UnifiedService, UnifiedServiceCategory, UnifiedServiceSourceType }                                                                                                                          from './constants'
import { buildUnifiedServices, getUnifiedServiceRoute, hasUnifiedServiceCreatePermission, canCreateAnyUnifiedService, isUnifiedServiceAvailable, generateUnifiedServicesBreadcrumb, collectAvailableProductsAndCategories } from './utils'

const mockedHasServicePermission = jest.fn(() => true)
const mockedHasPolicyPermission = jest.fn(() => true)
jest.mock('../service', () => ({
  ...jest.requireActual('../service'),
  getServiceCatalogRoutePath: jest.fn(() => '/catalog/path'),
  hasServicePermission: () => mockedHasServicePermission(),
  hasPolicyPermission: () => mockedHasPolicyPermission(),
  hasSomePoliciesPermission: jest.fn(() => true),
  hasSomeServicesPermission: jest.fn(() => false),
  isPolicyCardEnabled: jest.fn(() => true),
  isServiceCardEnabled: jest.fn(() => false)
}))

describe('utils', () => {
  beforeEach(() => {
    mockedHasServicePermission.mockClear()
    mockedHasPolicyPermission.mockClear()
  })
  describe('buildUnifiedServices', () => {
    it('should map incoming list to enriched unified services list', () => {
      const { $t } = getIntl()
      const input = [{
        type: ServiceType.DPSK,
        sourceType: UnifiedServiceSourceType.SERVICE,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY
      }, {
        type: PolicyType.AAA,
        sourceType: UnifiedServiceSourceType.POLICY,
        products: [RadioCardCategory.WIFI],
        category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
        searchKeywords: [defineMessage({ defaultMessage: 'AAA Keyword' })]
      }]

      const result = buildUnifiedServices(input)

      expect(result[0].label).toBe($t(serviceTypeLabelMapping[ServiceType.DPSK]))
      expect(result[0].description).toBe($t(serviceTypeDescMapping[ServiceType.DPSK]))
      // eslint-disable-next-line max-len
      expect(result[0].route).toBe(getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST }))
      expect(result[0].breadcrumb).toEqual(generateServiceListBreadcrumb(ServiceType.DPSK, true))

      expect(result[1].label).toBe($t(policyTypeLabelMapping[PolicyType.AAA]))
      expect(result[1].description).toBe($t(policyTypeDescMapping[PolicyType.AAA]))
      // eslint-disable-next-line max-len
      expect(result[1].route).toBe(getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST }))
      expect(result[1].breadcrumb).toEqual(generatePolicyListBreadcrumb(PolicyType.AAA, true))
      expect(result[1].searchKeywords).toEqual(['AAA Keyword'])
    })
  })

  describe('getUnifiedServiceRoute', () => {
    it('should return service route path', () => {
      const routeList = getUnifiedServiceRoute({
        type: ServiceType.DPSK,
        sourceType: UnifiedServiceSourceType.SERVICE
      }, 'list')

      // eslint-disable-next-line max-len
      expect(routeList).toBe(getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST }))

      const routeCreate = getUnifiedServiceRoute({
        type: ServiceType.DPSK,
        sourceType: UnifiedServiceSourceType.SERVICE
      }, 'create')

      // eslint-disable-next-line max-len
      expect(routeCreate).toBe(getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE }))
    })

    it('should return policy route path', () => {
      const routeList = getUnifiedServiceRoute({
        type: PolicyType.AAA,
        sourceType: UnifiedServiceSourceType.POLICY
      }, 'list')

      // eslint-disable-next-line max-len
      expect(routeList).toBe(getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST }))

      const routeCreate = getUnifiedServiceRoute({
        type: PolicyType.AAA,
        sourceType: UnifiedServiceSourceType.POLICY
      }, 'create')

      // eslint-disable-next-line max-len
      expect(routeCreate).toBe(getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE }))
    })
  })

  describe('hasUnifiedServiceCreatePermission', () => {
    it('should return true for service sourceType', () => {
      const result = hasUnifiedServiceCreatePermission({
        type: ServiceType.DPSK,
        sourceType: UnifiedServiceSourceType.SERVICE
      })

      expect(mockedHasServicePermission).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return true for policy sourceType', () => {
      const result = hasUnifiedServiceCreatePermission({
        type: PolicyType.AAA,
        sourceType: UnifiedServiceSourceType.POLICY
      })

      expect(mockedHasPolicyPermission).toHaveBeenCalled()
      expect(result).toBe(true)
    })
  })

  describe('canCreateAnyUnifiedService', () => {
    it('should return true if any policy or service create permission exists', () => {
      expect(canCreateAnyUnifiedService()).toBe(true)
    })
  })

  describe('isUnifiedServiceAvailable', () => {
    it('should return false if service card is not enabled', () => {
      const result = isUnifiedServiceAvailable({
        type: ServiceType.DPSK,
        sourceType: UnifiedServiceSourceType.SERVICE
      })
      expect(result).toBe(false)
    })

    it('should return true if policy card is enabled', () => {
      const result = isUnifiedServiceAvailable({
        type: PolicyType.AAA,
        sourceType: UnifiedServiceSourceType.POLICY
      })
      expect(result).toBe(true)
    })
  })

  describe('generateUnifiedServicesBreadcrumb', () => {
    it('should generate Service Catalog breadcrumb when coming from catalog', () => {
      const breadcrumb = generateUnifiedServicesBreadcrumb({ pathname: '/catalog/path' })
      expect(breadcrumb[1].text).toBe('Service Catalog')
    })

    it('should generate My Services breadcrumb otherwise', () => {
      const breadcrumb = generateUnifiedServicesBreadcrumb()
      expect(breadcrumb[1].text).toBe('My Services')
    })
  })

  describe('collectAvailableProductsAndCategories', () => {
    const baseUnifiedService: UnifiedService = {
      type: PolicyType.AAA,
      sourceType: UnifiedServiceSourceType.POLICY,
      label: 'RADIUS Server',
      products: [RadioCardCategory.WIFI],
      category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
      route: ''
    }

    it('should return empty arrays for empty services array', () => {
      const services: UnifiedService[] = []
      const result = collectAvailableProductsAndCategories(services)
      expect(result.products).toEqual([])
      expect(result.categories).toEqual([])
    })

    it('should return products and categories for single service', () => {
      const services: UnifiedService[] = [
        {
          ...baseUnifiedService,
          products: [RadioCardCategory.WIFI],
          category: UnifiedServiceCategory.NETWORK_SERVICES
        }
      ]
      const result = collectAvailableProductsAndCategories(services)
      expect(result.products).toEqual([RadioCardCategory.WIFI])
      expect(result.categories).toEqual([UnifiedServiceCategory.NETWORK_SERVICES])
    })

    it('should return products and categories for multiple services', () => {
      const services: UnifiedService[] = [
        {
          ...baseUnifiedService,
          products: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
          category: UnifiedServiceCategory.NETWORK_SERVICES,
        },
        {
          ...baseUnifiedService,
          products: [RadioCardCategory.WIFI],
          category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
        },
      ]
      const result = collectAvailableProductsAndCategories(services)
      expect(result.products).toEqual([RadioCardCategory.WIFI, RadioCardCategory.EDGE])
      expect(result.categories).toEqual([UnifiedServiceCategory.NETWORK_SERVICES, UnifiedServiceCategory.AUTHENTICATION_IDENTITY])
    })

    it('should remove duplicates from products and categories', () => {
      const services: UnifiedService[] = [
        {
          ...baseUnifiedService,
          products: [RadioCardCategory.WIFI, RadioCardCategory.WIFI],
          category: UnifiedServiceCategory.NETWORK_SERVICES,
        },
        {
          ...baseUnifiedService,
          products: [RadioCardCategory.WIFI],
          category: UnifiedServiceCategory.NETWORK_SERVICES,
        },
      ]
      const result = collectAvailableProductsAndCategories(services)
      expect(result.products).toEqual([RadioCardCategory.WIFI])
      expect(result.categories).toEqual([UnifiedServiceCategory.NETWORK_SERVICES])
    })
  })
})
