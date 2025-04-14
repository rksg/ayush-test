import { renderHook }                     from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import { ServiceType, ServiceOperation } from '../../constants'
import { PolicyType, PolicyOperation }   from '../../types'

import {
  applyTemplateIfNeeded,
  getServiceAllowedOperation,
  getPolicyAllowedOperation,
  useTemplateAwareServiceAllowedOperation,
  useTemplateAwarePolicyAllowedOperation,
  useActivativationPermission
} from './allowedOperationUtils'

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
      expect(applyTemplateIfNeeded(operation, true)).toEqual(['http:/templates/path'])
    })

    it('should not modify the operation when isTemplate is false', () => {
      const operation = ['http:/path']
      expect(applyTemplateIfNeeded(operation, false)).toEqual(['http:/path'])
    })
  })

  describe('getServiceAllowedOperation', () => {
    it('should retrieve the correct service operation', () => {
      expect(getServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.CREATE))
        .toEqual(['POST:/wifiCallingServiceProfiles'])

      expect(getServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.CREATE, true))
        .toEqual(['POST:/templates/wifiCallingServiceProfiles'])
    })
  })

  describe('getPolicyAllowedOperation', () => {
    it('should retrieve the correct policy operation', () => {
      expect(getPolicyAllowedOperation(PolicyType.AAA, PolicyOperation.CREATE))
        .toEqual(['POST:/radiusServerProfiles'])

      expect(getPolicyAllowedOperation(PolicyType.AAA, PolicyOperation.CREATE, true))
        .toEqual(['POST:/templates/radiusServerProfiles'])
    })
  })

  it('useTemplateAwareServiceAllowedOperation', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => {
      return useTemplateAwareServiceAllowedOperation(ServiceType.DHCP, ServiceOperation.CREATE)
    })
    expect(result.current).toEqual(['POST:/templates/dhcpConfigServiceProfiles'])
  })

  it('useTemplateAwarePolicyAllowedOperation', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result } = renderHook(() => {
      return useTemplateAwarePolicyAllowedOperation(PolicyType.AAA, PolicyOperation.CREATE)
    })
    expect(result.current).toEqual(['POST:/templates/radiusServerProfiles'])
  })

  describe('useActivativationPermission', () => {
    const props = {
      activateApiInfo: { url: '/activation', method: 'put', opsApi: 'activate-api-info' },
      // eslint-disable-next-line max-len
      activateTemplateApiInfo: { url: '/templates/activation', method: 'put', opsApi: 'activate-template-api-info' },
      deactivateApiInfo: { url: '/deactivation', method: 'delete', opsApi: 'deactivate-api-info' },
      // eslint-disable-next-line max-len
      deactivateTemplateApiInfo: { url: '/templates/deactivation', method: 'delete', opsApi: 'deactivate-template-api-info' }
    }

    it('should return correct activateOpsApi and deactivateOpsApi when isTemplate is true', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      const { result } = renderHook(() => useActivativationPermission(props))
      expect(result.current.activateOpsApi).toBe('activate-template-api-info')
      expect(result.current.deactivateOpsApi).toBe('deactivate-template-api-info')
    })

    it('should return correct activateOpsApi and deactivateOpsApi when isTemplate is false', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

      const { result } = renderHook(() => useActivativationPermission(props))
      expect(result.current.activateOpsApi).toBe('activate-api-info')
      expect(result.current.deactivateOpsApi).toBe('deactivate-api-info')
    })

    it('should return correct hasFullActivationPermission', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

      setUserProfile({
        ...getUserProfile(),
        allowedOperations: [props.activateApiInfo.opsApi, props.deactivateApiInfo.opsApi],
        rbacOpsApiEnabled: true
      })

      const { result } = renderHook(() => useActivativationPermission(props))
      expect(result.current.hasFullActivationPermission).toBe(true)

      setUserProfile({
        ...getUserProfile(),
        allowedOperations: [props.activateApiInfo.opsApi],
        rbacOpsApiEnabled: true
      })

      const { result: result2 } = renderHook(() => useActivativationPermission(props))
      expect(result2.current.hasFullActivationPermission).toBe(false)
    })
  })
})
