import { renderHook } from '@acx-ui/test-utils'

import { ServiceType }     from '../../constants'
import { PolicyType }      from '../../types'
import { PolicyOperation } from '../policy'

import {
  applyTemplateIfNeeded,
  getServiceAllowedOperation,
  getPolicyAllowedOperation,
  useTemplateAwareServiceAllowedOperation,
  useTemplateAwarePolicyAllowedOperation
} from './allowedOperationUtils'
import { ServiceOperation } from './serviceRouteUtils'

const mockedUseConfigTemplate = jest.fn()
jest.mock('../../configTemplate', () => ({
  ...jest.requireActual('../../configTemplate'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('allowedOperationUtils', () => {

  afterEach(() => {
    mockedUseConfigTemplate.mockReset()
  })

  describe('applyTemplateIfNeeded', () => {
    it('should modify the operation when isTemplate is true', () => {
      const operation = ['http:/path']
      expect(applyTemplateIfNeeded(operation, true)).toBe('http:/templates/path')
    })

    it('should not modify the operation when isTemplate is false', () => {
      const operation = ['http:/path']
      expect(applyTemplateIfNeeded(operation, false)).toBe('http:/path')
    })
  })

  describe('getServiceAllowedOperation', () => {
    it('should retrieve the correct service operation', () => {
      expect(getServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.CREATE))
        .toBe('POST:/wifiCallingServiceProfiles')

      expect(getServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.CREATE, true))
        .toBe('POST:/templates/wifiCallingServiceProfiles')
    })
  })

  describe('getPolicyAllowedOperation', () => {
    it('should retrieve the correct policy operation', () => {
      expect(getPolicyAllowedOperation(PolicyType.AAA, PolicyOperation.CREATE))
        .toBe('POST:/radiusServerProfiles')

      expect(getPolicyAllowedOperation(PolicyType.AAA, PolicyOperation.CREATE, true))
        .toBe('POST:/templates/radiusServerProfiles')
    })
  })

  it('useTemplateAwareServiceAllowedOperation', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => {
      return useTemplateAwareServiceAllowedOperation(ServiceType.DHCP, ServiceOperation.CREATE)
    })
    expect(result.current).toBe('POST:/templates/dhcpConfigServiceProfiles')
  })

  it('useTemplateAwarePolicyAllowedOperation', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => {
      return useTemplateAwarePolicyAllowedOperation(PolicyType.AAA, PolicyOperation.CREATE)
    })
    expect(result.current).toBe('POST:/templates/radiusServerProfiles')
  })
})
