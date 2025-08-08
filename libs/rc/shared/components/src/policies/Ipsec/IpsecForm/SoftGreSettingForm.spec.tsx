/* eslint-disable max-len */
import userEvent        from '@testing-library/user-event'
import { Form }         from 'antd'
import { IntlProvider } from 'react-intl'

import { useIsSplitOn }                                                                                                                                     from '@acx-ui/feature-toggle'
import { IpSecAuthEnum, IpSecProposalTypeEnum, IpSecEncryptionAlgorithmEnum, IpSecIntegrityAlgorithmEnum, IpSecDhGroupEnum, IpSecPseudoRandomFunctionEnum } from '@acx-ui/rc/utils'
import { render, screen, renderHook, waitFor }                                                                                                              from '@acx-ui/test-utils'

import { SoftGreSettingForm } from './SoftGreSettingForm'

const mockIpSecData = {
  id: 'test-id',
  name: 'test-ipsec',
  authType: IpSecAuthEnum.PSK,
  preSharedKey: 'test-key',
  serverAddress: '192.168.1.1',
  ikeSecurityAssociation: {
    ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
    ikeProposals: [
      {
        encAlg: IpSecEncryptionAlgorithmEnum.AES128,
        authAlg: IpSecIntegrityAlgorithmEnum.SHA1,
        prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
        dhGroup: IpSecDhGroupEnum.MODP2048
      }
    ]
  },
  espSecurityAssociation: {
    espProposalType: IpSecProposalTypeEnum.DEFAULT,
    espProposals: []
  }
}

// Mock the useConfigTemplate hook
const mockUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockUseConfigTemplate()
}))

jest.mock('./AuthenticationFormItem', () => ({
  ...jest.requireActual('./AuthenticationFormItem'),
  AuthenticationFormItem: () => <div>Authentication</div>
}))

jest.mock('./SecurityAssociation', () => ({
  ...jest.requireActual('./SecurityAssociation'),
  SecurityAssociation: () => <div>Security Association</div>
}))

jest.mock('./MoreSettings', () => ({
  ...jest.requireActual('./MoreSettings'),
  MoreSettings: () => <div>More Settings</div>
}))

describe('SoftGreSettingForm', () => {
  const user = userEvent.setup()

  const renderComponent = (props = {}) => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    const { unmount } = render(<Form form={formRef.current}>
      <SoftGreSettingForm {...props} />
    </Form>)

    return { formRef: formRef.current, unmount }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock for useConfigTemplate
    mockUseConfigTemplate.mockReturnValue({ isTemplate: false })
    // Default mock for useIsSplitOn
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })

  describe('Component Rendering', () => {
    it('should render SoftGreSettingForm component with editData', () => {
      renderComponent({ editData: mockIpSecData })

      expect(screen.getByText('Security Gateway IP/FQDN')).toBeInTheDocument()
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Security Association')).toBeInTheDocument()
    })
    it('should render with policyId prop', () => {
      renderComponent({ policyId: 'test-policy-id' })

      expect(screen.getByText('Security Gateway IP/FQDN')).toBeInTheDocument()
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Security Association')).toBeInTheDocument()
    })
  })

  describe('Security Gateway Validation', () => {
    it('should validate valid IP address when feature flag is disabled', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      mockUseConfigTemplate.mockReturnValue({ isTemplate: false })

      renderComponent()

      const serverAddressField = screen.getByLabelText(/Security Gateway IP\/FQDN/i)
      await user.type(serverAddressField, '192.168.1.1')
      await user.tab()

      // Should not show validation error
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid IP address or FQDN')).not.toBeInTheDocument()
      })
    })

    it('should validate valid FQDN when feature flag is disabled', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      mockUseConfigTemplate.mockReturnValue({ isTemplate: false })

      renderComponent()

      const serverAddressField = screen.getByLabelText(/Security Gateway IP\/FQDN/i)
      await user.type(serverAddressField, 'example.com')
      await user.tab()

      // Should not show validation error
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid IP address or FQDN')).not.toBeInTheDocument()
      })
    })

    it('should validate invalid input when feature flag is disabled', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      mockUseConfigTemplate.mockReturnValue({ isTemplate: false })

      renderComponent()

      const serverAddressField = screen.getByLabelText(/Security Gateway IP\/FQDN/i)
      await user.type(serverAddressField, 'invalid-input')
      await user.tab()

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid IP address or FQDN')).toBeInTheDocument()
      })
    })

    it('should validate valid IPv6 address when feature flag is enabled and not template', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockUseConfigTemplate.mockReturnValue({ isTemplate: false })

      renderComponent()

      const serverAddressField = screen.getByLabelText(/Security Gateway IP\/FQDN/i)
      await user.type(serverAddressField, '2001:db8::1')
      await user.tab()

      // Should not show validation error
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid IP address or FQDN')).not.toBeInTheDocument()
      })
    })

    it('should validate valid FQDN with IPv6 when feature flag is enabled and not template', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockUseConfigTemplate.mockReturnValue({ isTemplate: false })

      renderComponent()

      const serverAddressField = screen.getByLabelText(/Security Gateway IP\/FQDN/i)
      await user.type(serverAddressField, 'ipv6.example.com')
      await user.tab()

      // Should not show validation error
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid IP address or FQDN')).not.toBeInTheDocument()
      })
    })

    it('should validate invalid IPv6 input when feature flag is enabled and not template', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockUseConfigTemplate.mockReturnValue({ isTemplate: false })

      renderComponent()

      const serverAddressField = screen.getByLabelText(/Security Gateway IP\/FQDN/i)
      await user.type(serverAddressField, 'invalid-ipv6')
      await user.tab()

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid IP address or FQDN')).toBeInTheDocument()
      })
    })

    it('should use domainNameRegExp when feature flag is enabled but is template', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockUseConfigTemplate.mockReturnValue({ isTemplate: true })

      renderComponent()

      const serverAddressField = screen.getByLabelText(/Security Gateway IP\/FQDN/i)
      await user.type(serverAddressField, 'example.com')
      await user.tab()

      // Should not show validation error for valid FQDN
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid IP address or FQDN')).not.toBeInTheDocument()
      })

      // Clear and test invalid input
      await user.clear(serverAddressField)
      await user.type(serverAddressField, 'invalid-input')
      await user.tab()

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid IP address or FQDN')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined editData gracefully', () => {
      renderComponent({ editData: undefined })

      expect(screen.getByText('Security Gateway IP/FQDN')).toBeInTheDocument()
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Security Association')).toBeInTheDocument()
    })

    it('should handle empty editData object', () => {
      renderComponent({ editData: {} })

      expect(screen.getByText('Security Gateway IP/FQDN')).toBeInTheDocument()
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Security Association')).toBeInTheDocument()
    })

    it('should handle undefined policyId gracefully', () => {
      renderComponent({ policyId: undefined })

      expect(screen.getByText('Security Gateway IP/FQDN')).toBeInTheDocument()
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Security Association')).toBeInTheDocument()
    })

    it('should handle empty string input in server address field', async () => {
      const { result: formRef } = renderHook(() => {
        const [form] = Form.useForm()
        return form
      })

      render(
        <IntlProvider locale='en'>
          <Form form={formRef.current}>
            <SoftGreSettingForm />
          </Form>
        </IntlProvider>
      )

      const serverAddressField = screen.getByLabelText(/Security Gateway IP\/FQDN/i)
      await user.clear(serverAddressField)
      await user.tab()

      // Should not show validation error for empty field (required validation is separate)
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid IP address or FQDN')).not.toBeInTheDocument()
      })
    })
  })

  describe('Feature Flag Combinations', () => {
    it('should handle all feature flag combinations correctly', () => {
      const combinations = [
        { isSplitOn: false, isTemplate: false },
        { isSplitOn: false, isTemplate: true },
        { isSplitOn: true, isTemplate: false },
        { isSplitOn: true, isTemplate: true }
      ]

      combinations.forEach(({ isSplitOn, isTemplate }) => {
        jest.mocked(useIsSplitOn).mockReturnValue(isSplitOn)
        mockUseConfigTemplate.mockReturnValue({ isTemplate })

        const { unmount } = renderComponent()

        expect(screen.getByText('Security Gateway IP/FQDN')).toBeInTheDocument()
        expect(screen.getByText('Authentication')).toBeInTheDocument()
        expect(screen.getByText('Security Association')).toBeInTheDocument()

        unmount()
      })
    })
  })

  // describe('Accessibility', () => {
  //   it('should have proper labels for form fields', () => {
  //     renderComponent()

  //     expect(screen.getByLabelText(/Security Gateway IP\/FQDN/i)).toBeInTheDocument()
  //   })

  //   it('should have proper tooltip accessibility', () => {
  //     renderComponent()

  //     const tooltipIcon = screen.getByRole('img', { name: /question/i })
  //     expect(tooltipIcon).toBeInTheDocument()
  //   })
  // })
})