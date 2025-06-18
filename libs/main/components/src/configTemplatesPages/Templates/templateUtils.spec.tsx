import userEvent from '@testing-library/user-event'

import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { ConfigTemplateDriftType, ConfigTemplateType, PolicyType } from '@acx-ui/rc/utils'
import { screen, render, renderHook }                              from '@acx-ui/test-utils'
import { hasRoles }                                                from '@acx-ui/user'
import { isDelegationMode }                                        from '@acx-ui/utils'

import { mockedUserProfile }                                                                                                                     from './__tests__/fixtures'
import { ConfigTemplateDriftStatus, getConfigTemplateEnforcementLabel, getConfigTemplateTypeLabel, useEcFilters, ViewConfigTemplateDetailsLink } from './templateUtils'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: mockedUserProfile }),
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
      mspAdmins: [mockedUserProfile.adminId],
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

  describe('ConfigTemplateDriftStatus', () => {
    const baseData = {
      id: '1',
      name: 'Template 1',
      createdOn: 1690598400000,
      createdBy: 'Author 1',
      type: ConfigTemplateType.NETWORK,
      lastModified: 1690598400000,
      lastApplied: 1690598405000
    }
    it('renders empty when the Drift Status is falsy', () => {
      const { container } = render(<ConfigTemplateDriftStatus row={baseData} />)
      // eslint-disable-next-line testing-library/no-node-access
      expect(container.firstChild).toHaveTextContent('--')
    })

    it('renders label and callback when the Drift Status is clickable', async () => {
      const row = { ...baseData, driftStatus: ConfigTemplateDriftType.DRIFT_DETECTED }
      const callback = jest.fn()
      render(<ConfigTemplateDriftStatus
        row={row}
        callbackMap={{ [ConfigTemplateDriftType.DRIFT_DETECTED]: callback }}
      />)
      const span = screen.getByText('Drift Detected')
      expect(span).toBeInTheDocument()
      await userEvent.click(span)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('getConfigTemplateEnforcementLabel', () => {
    it('returns empty string when enforced is undefined', () => {
      expect(getConfigTemplateEnforcementLabel(undefined)).toBe('--')
    })

    it('returns "Enforced" when enforced is true', () => {
      expect(getConfigTemplateEnforcementLabel(true)).toBe('Enforced')
    })

    it('returns "Not enforced" when enforced is false', () => {
      expect(getConfigTemplateEnforcementLabel(false)).toBe('Not enforced')
    })
  })

  describe('ViewConfigTemplateDetailsLink', () => {
    it('calls setAccessControlSubPolicyVisible when TemplateNameLink is clicked', async () => {
      const mockedLayer2Template = {
        id: '4',
        name: 'Template 4',
        createdOn: 1690598500000,
        createdBy: 'Author 4',
        type: ConfigTemplateType.LAYER_2_POLICY,
        lastModified: 1690598500000
      }
      const mockedSetAccessControlSubPolicyVisible = jest.fn()

      render(<ViewConfigTemplateDetailsLink
        template={mockedLayer2Template}
        setAclSubPolicyVisible={mockedSetAccessControlSubPolicyVisible}
        label={'View Configuration'}
      />, { route: {
        params: { tenantId: '__TENANT_ID', activeTab: 'templates' },
        path: '/:tenantId/v/templates/:activeTab'
      } })

      const templateNameButton = screen.getByRole('button', { name: 'View Configuration' })
      expect(templateNameButton).toBeInTheDocument()

      await userEvent.click(templateNameButton)

      expect(mockedSetAccessControlSubPolicyVisible).toHaveBeenCalledWith(
        expect.objectContaining({
          [PolicyType.LAYER_2_POLICY]: {
            id: mockedLayer2Template.id,
            visible: true,
            drawerViewMode: true
          }
        })
      )
    })
  })
})
