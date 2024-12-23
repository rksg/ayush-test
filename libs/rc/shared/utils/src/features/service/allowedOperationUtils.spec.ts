import { renderHook } from '@acx-ui/test-utils'

import { ServiceType }     from '../../constants'
import { PolicyType }      from '../../types'
import { PolicyOperation } from '../policy'

import {
  applyTemplateIfNeeded,
  getServiceAllowedOperation,
  useServiceAllowedOperation,
  getPolicyAllowedOperation,
  usePolicyAllowedOperation
} from './allowedOperationUtils'
import { ServiceOperation } from './serviceRouteUtils'

describe('allowedOperationUtils', () => {
  describe('applyTemplateIfNeeded', () => {
    it('should modify the operation when isTemplate is true', () => {
      const operation = 'http:/path'
      expect(applyTemplateIfNeeded(operation, true)).toBe('http:/templates/path')
    })

    it('should not modify the operation when isTemplate is false', () => {
      const operation = 'http:/path'
      expect(applyTemplateIfNeeded(operation, false)).toBe('http:/path')
    })
  })

  describe('getServiceAllowedOperation', () => {
    it('should retrieve the correct service operation', () => {
      // eslint-disable-next-line max-len
      expect(getServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.CREATE)).toBe('POST:/wifiCallingServiceProfiles')
    })
  })

  describe('getPolicyAllowedOperation', () => {
    it('should retrieve the correct policy operation', () => {
      // eslint-disable-next-line max-len
      expect(getPolicyAllowedOperation(PolicyType.AAA, PolicyOperation.CREATE)).toBe('POST:/radiusServerProfiles')
    })
  })

  describe('useServiceAllowedOperation', () => {
    it('should use the correct service operation', () => {
      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.CREATE))
      expect(result.current).toBe('POST:/wifiCallingServiceProfiles')
    })
  })

  describe('usePolicyAllowedOperation', () => {
    it('should use the correct policy operation', () => {
      // eslint-disable-next-line max-len
      const { result } = renderHook(() => usePolicyAllowedOperation(PolicyType.AAA, PolicyOperation.CREATE))
      expect(result.current).toBe('POST:/radiusServerProfiles')
    })
  })
})
