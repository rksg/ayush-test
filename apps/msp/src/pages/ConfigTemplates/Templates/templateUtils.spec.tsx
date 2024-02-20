import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { renderHook }             from '@acx-ui/test-utils'
import { hasRoles }               from '@acx-ui/user'
import { isDelegationMode }       from '@acx-ui/utils'

import { useEcFilters } from './templateUtils'

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
      tenantType: ['MSP_EC']
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
      tenantType: ['MSP_EC']
    })
  })
})
