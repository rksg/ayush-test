import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { ConfigTemplateDriftType, ConfigTemplateType } from '@acx-ui/rc/utils'
import { renderHook }                                  from '@acx-ui/test-utils'
import { hasRoles }                                    from '@acx-ui/user'
import { isDelegationMode }                            from '@acx-ui/utils'

import { getConfigTemplateDriftStatusLabel, getConfigTemplateTypeLabel, useEcFilters } from './templateUtils'

const userProfileContextMockValues = {
  region: '[NA, EU, ASIA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://dev.ruckus.cloud',
      current: true
    },
    {
      name: 'Asia',
      description: 'APAC region',
      link: 'https://int.ruckus.cloud',
      current: false
    },
    {
      name: 'EU',
      description: 'European Union',
      link: 'https://qa.ruckus.cloud',
      current: false
    }
  ],
  externalId: '003D200000mT4dXIAS',
  pver: 'ruckus-one',
  companyName: 'msp.cfgtemp.9',
  firstName: 'msp',
  lastName: 'cfgtemp.9',
  username: 'msp.cfgtemp.9@rwbigdog.com',
  role: 'PRIME_ADMIN',
  roles: [
    'PRIME_ADMIN',
    'VAR_ADMIN'
  ],
  detailLevel: 'debug',
  dateFormat: 'mm/dd/yyyy',
  newDateFormat: 'MM/dd/yyyy',
  email: 'msp.cfgtemp.9@rwbigdog.com',
  var: true,
  tenantId: 'dc2146381a874d04a824bdd8c7bb991d',
  varTenantId: 'dc2146381a874d04a824bdd8c7bb991d',
  adminId: 'af13900b3d2d45d89708d0147eff774f',
  support: false,
  dogfood: false,
  preferredLanguage: 'en-US',
  fullName: 'msp cfgtemp.9',
  initials: 'MC'
}

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: userProfileContextMockValues }),
  hasRoles: jest.fn()
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  isDelegationMode: jest.fn()
}))

describe('TemplateUtils', () => {
  beforeEach(() => {
    jest.mocked(hasRoles).mockReturnValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should get the ecFilters correctly', async () => {
    const { result } = renderHook(() => useEcFilters())

    expect(result.current).toEqual({
      tenantType: ['MSP_EC', 'MSP_REC']
    })
  })

  it('should get the ecFilters correctly when the delegation mode is false', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE)
    jest.mocked(isDelegationMode).mockReturnValue(false)
    jest.mocked(hasRoles).mockReturnValue(false)

    const { result } = renderHook(() => useEcFilters())

    expect(result.current).toEqual({
      mspAdmins: [userProfileContextMockValues.adminId],
      tenantType: ['MSP_EC', 'MSP_REC']
    })
  })

  describe('getConfigTemplateTypeLabel', () => {
    it('should return the policy type label if it exists', () => {
      expect(getConfigTemplateTypeLabel(ConfigTemplateType.RADIUS)).toBe('RADIUS Server')
    })

    it('should return the service type label if it exists', () => {
      expect(getConfigTemplateTypeLabel(ConfigTemplateType.DPSK)).toBe('DPSK')
    })

    // eslint-disable-next-line max-len
    it('should return the default label if policy and service types do not exist but rest type label exists', () => {
      expect(getConfigTemplateTypeLabel(ConfigTemplateType.AP_GROUP)).toBe('AP Group')
    })

    it('should return the configTemplateType if no mappings exist', () => {
      expect(getConfigTemplateTypeLabel('UNKNOWN_TYPE' as ConfigTemplateType)).toBe('UNKNOWN_TYPE')
    })
  })

  describe('getConfigTemplateDriftStatusLabel', () => {
    it('should return an empty string when driftStatus is undefined', () => {
      expect(getConfigTemplateDriftStatusLabel(undefined)).toBe('')
    })

    it('should return the corresponding label when driftStatus is defined', () => {
      // eslint-disable-next-line max-len
      expect(getConfigTemplateDriftStatusLabel(ConfigTemplateDriftType.DRIFT_DETECTED)).toBe('Drift Detected')
      expect(getConfigTemplateDriftStatusLabel(ConfigTemplateDriftType.IN_SYNC)).toBe('In Sync')
    })
  })
})
