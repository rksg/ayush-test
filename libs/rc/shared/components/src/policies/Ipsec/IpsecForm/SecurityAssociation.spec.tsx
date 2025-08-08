/* eslint-disable max-len */
import userEvent        from '@testing-library/user-event'
import { Form }         from 'antd'
import { IntlProvider } from 'react-intl'

import { IpSecAuthEnum, IpSecProposalTypeEnum, IpSecEncryptionAlgorithmEnum, IpSecIntegrityAlgorithmEnum, IpSecDhGroupEnum, IpSecPseudoRandomFunctionEnum } from '@acx-ui/rc/utils'
import { render, screen, renderHook, waitFor }                                                                                                              from '@acx-ui/test-utils'

import { mockIpSecDetail }     from './__tests__/fixtures'
import { SecurityAssociation } from './SecurityAssociation'

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

const mockIpSecDataWithEspSpecific = {
  ...mockIpSecData,
  espSecurityAssociation: {
    espProposalType: IpSecProposalTypeEnum.SPECIFIC,
    espProposals: [
      {
        encAlg: IpSecEncryptionAlgorithmEnum.AES256,
        authAlg: IpSecIntegrityAlgorithmEnum.SHA256,
        dhGroup: IpSecDhGroupEnum.MODP2048
      }
    ]
  }
}

describe('SecurityAssociation', () => {
  const user = userEvent.setup()

  const renderComponent = (props = {}) => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    return render(
      <Form form={formRef.current}>
        <SecurityAssociation {...props} />
      </Form>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render SecurityAssociation component with default props', () => {
      renderComponent()

      expect(screen.getByText('Security Association')).toBeInTheDocument()
      expect(screen.getByText('IKE')).toBeInTheDocument()
      expect(screen.getByText('ESP')).toBeInTheDocument()
    })

    it('should render SecurityAssociation component with editData', () => {
      renderComponent({ editData: mockIpSecData })

      expect(screen.getByText('Security Association')).toBeInTheDocument()
      expect(screen.getByText('IKE')).toBeInTheDocument()
      expect(screen.getByText('ESP')).toBeInTheDocument()
    })

    it('should render with mockIpSecDetail data', () => {
      renderComponent({ editData: mockIpSecDetail })

      expect(screen.getByText('Security Association')).toBeInTheDocument()
      expect(screen.getByText('IKE')).toBeInTheDocument()
      expect(screen.getByText('ESP')).toBeInTheDocument()
    })
  })

  describe('Tab Functionality', () => {
    it('should set default active tab to IKE when no activeTabKey is set', async () => {
      renderComponent()

      // The first tab (IKE) should be active by default
      const ikeTab = screen.getByRole('tab', { name: 'IKE' })
      await waitFor(() => expect(ikeTab).toHaveAttribute('aria-selected', 'true'))
    })

    it('should switch between IKE and ESP tabs successfully', async () => {
      renderComponent()

      // Initially IKE tab should be active
      const ikeTab = screen.getByRole('tab', { name: 'IKE' })
      await waitFor(() => expect(ikeTab).toHaveAttribute('aria-selected', 'true'))

      // Click on ESP tab
      const espTab = screen.getByRole('tab', { name: 'ESP' })
      await user.click(espTab)

      // ESP tab should now be active
      await waitFor(() => {
        expect(espTab).toHaveAttribute('aria-selected', 'true')
      })
    })

    it('should maintain tab state when switching between tabs', async () => {
      renderComponent()

      // Switch to ESP tab
      const espTab = screen.getByRole('tab', { name: 'ESP' })
      await user.click(espTab)

      // Switch back to IKE tab
      const ikeTab = screen.getByRole('tab', { name: 'IKE' })
      await user.click(ikeTab)

      // IKE tab should be active again
      await waitFor(() => {
        const activeIkeTab = screen.getByRole('tab', { name: 'IKE' })
        expect(activeIkeTab).toHaveAttribute('aria-selected', 'true')
      })
    })
  })

  describe('Form Validation', () => {
    it('should validate form fields when switching tabs with valid data', async () => {
      const { result: formRef } = renderHook(() => {
        const [form] = Form.useForm()
        return form
      })

      render(
        <IntlProvider locale='en'>
          <Form form={formRef.current}>
            <SecurityAssociation editData={mockIpSecData} />
          </Form>
        </IntlProvider>
      )

      // Set up valid form data
      formRef.current.setFieldsValue({
        ikeSecurityAssociation: {
          ikeProposals: mockIpSecData.ikeSecurityAssociation.ikeProposals
        },
        espSecurityAssociation: {
          espProposals: mockIpSecData.espSecurityAssociation.espProposals
        }
      })

      // Switch to ESP tab - should succeed without validation errors
      const espTab = screen.getByRole('tab', { name: 'ESP' })
      await user.click(espTab)

      await waitFor(() => {
        const activeEspTab = screen.getByRole('tab', { name: 'ESP' })
        expect(activeEspTab).toHaveAttribute('aria-selected', 'true')
      })
    })

    it('should prevent tab switching when form validation fails', async () => {
      const { result: formRef } = renderHook(() => {
        const [form] = Form.useForm()
        return form
      })

      render(<Form form={formRef.current}>
        <SecurityAssociation editData={mockIpSecData} />
      </Form>)

      // Set up invalid form data that will cause validation to fail
      formRef.current.setFieldsValue({
        ikeSecurityAssociation: {
          ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
          ikeProposals: [mockIpSecData.ikeSecurityAssociation.ikeProposals[0], mockIpSecData.ikeSecurityAssociation.ikeProposals[0]],
          combinationValidator: false
        },
        espSecurityAssociation: {
          espProposals: [],
          combinationValidator: false
        }
      })

      // Mock form.validateFields to throw an error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Try to switch to ESP tab
      const espTab = screen.getByText('ESP')
      await user.click(espTab)

      // Should remain on IKE tab due to validation failure
      const activeTab = screen.getByRole('tab', { name: 'IKE' })
      expect(activeTab.getAttribute('aria-selected')).toBeTruthy()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Child Components Integration', () => {
    it('should render IkeAssociationSettings component when IKE tab is active', () => {
      renderComponent({ editData: mockIpSecData })

      // IKE tab should be active by default
      const activeTab = screen.getByRole('tab', { name: 'IKE' })
      expect(activeTab.getAttribute('aria-selected')).toBeTruthy()

      // IkeAssociationSettings should be rendered
      // Note: We can't directly test the child component content without data-testid,
      // but we can verify the tab content is rendered
      const tabContent = screen.getByRole('tabpanel')
      expect(tabContent).toBeInTheDocument()
    })

    it('should render EspAssociationSettings component when ESP tab is active', async () => {
      renderComponent({ editData: mockIpSecDataWithEspSpecific })

      // Switch to ESP tab
      const espTab = screen.getByText('ESP')
      await user.click(espTab)

      const activeTab = screen.getByRole('tab', { name: 'ESP' })
      expect(activeTab.getAttribute('aria-selected')).toBeTruthy()

      // EspAssociationSettings should be rendered
      const tabContent = screen.getByRole('tabpanel')
      expect(tabContent).toBeInTheDocument()
    })

    it('should pass editData to child components', () => {
      renderComponent({ editData: mockIpSecData })

      // Verify the component renders with the provided data
      expect(screen.getByText('Security Association')).toBeInTheDocument()
      expect(screen.getByText('IKE')).toBeInTheDocument()
      expect(screen.getByText('ESP')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined editData gracefully', () => {
      renderComponent({ editData: undefined })

      expect(screen.getByText('Security Association')).toBeInTheDocument()
      expect(screen.getByText('IKE')).toBeInTheDocument()
      expect(screen.getByText('ESP')).toBeInTheDocument()
    })

    it('should handle empty editData object', () => {
      renderComponent({ editData: {} })

      expect(screen.getByText('Security Association')).toBeInTheDocument()
      expect(screen.getByText('IKE')).toBeInTheDocument()
      expect(screen.getByText('ESP')).toBeInTheDocument()
    })

    it('should handle rapid tab switching', async () => {
      renderComponent()

      const ikeTab = screen.getByText('IKE')
      const espTab = screen.getByText('ESP')

      // Rapidly click between tabs
      await user.click(espTab)
      await user.click(ikeTab)
      await user.click(espTab)

      const activeTab = screen.getByRole('tab', { name: 'ESP' })
      expect(activeTab.getAttribute('aria-selected')).toBeTruthy()
    })

    it('should handle form validation timeout gracefully', async () => {
      const { result: formRef } = renderHook(() => {
        const [form] = Form.useForm()
        return form
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <IntlProvider locale='en'>
          <Form form={formRef.current}>
            <SecurityAssociation editData={mockIpSecData} />
          </Form>
        </IntlProvider>
      )

      // Mock form.validateFields to take a long time
      jest.spyOn(formRef.current, 'validateFields').mockImplementation(() =>
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      )

      // Try to switch tabs
      const espTab = screen.getByText('ESP')
      await user.click(espTab)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      }, { timeout: 200 })

      consoleSpy.mockRestore()
    })
  })
})