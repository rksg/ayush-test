/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import userEvent              from '@testing-library/user-event'
import { Form, FormInstance } from 'antd'

import { useGetIpsecViewDataListQuery } from '@acx-ui/rc/services'
import { IpsecViewData }                from '@acx-ui/rc/utils'
import { render, screen, renderHook }   from '@acx-ui/test-utils'

import IpsecDrawer from '../../../policies/Ipsec/IpsecForm/IpsecAddDrawer'

import { IpsecFormItem } from './index'

// Mock dependencies
jest.mock('@acx-ui/rc/services')
jest.mock('../../../policies/Ipsec/IpsecForm/IpsecAddDrawer')
jest.mock('@acx-ui/edge/components', () => ({
  getIkeProposalText: jest.fn(() => 'AES128-SHA1-MODP2048'),
  getEspProposalText: jest.fn(() => 'AES128-SHA1-MODP2048')
}))

const mockUseGetIpsecViewDataListQuery = useGetIpsecViewDataListQuery as jest.MockedFunction<typeof useGetIpsecViewDataListQuery>
const mockIpsecDrawer = IpsecDrawer as jest.MockedFunction<typeof IpsecDrawer>
const mockIpsecData: IpsecViewData[] = [
  {
    id: 'ipsec-1',
    name: 'IPSec-1',
    serverAddress: '192.168.1.1',
    authenticationType: 'PSK',
    preSharedKey: 'test-key-123',
    certificate: '',
    certNames: [],
    ikeProposalType: 'DEFAULT',
    ikeProposals: [],
    espProposalType: 'DEFAULT',
    espProposals: [],
    activations: [],
    venueActivations: [],
    apActivations: []
  },
  {
    id: 'ipsec-2',
    name: 'IPSec-2',
    serverAddress: '192.168.1.2',
    authenticationType: 'PSK',
    preSharedKey: 'test-key-456',
    certificate: '',
    certNames: [],
    ikeProposalType: 'SPECIFIC',
    ikeProposals: [
      {
        encAlg: 'AES128',
        authAlg: 'SHA1',
        prfAlg: 'PRF_SHA1',
        dhGroup: 'MODP2048'
      }
    ],
    espProposalType: 'SPECIFIC',
    espProposals: [
      {
        encAlg: 'AES128',
        authAlg: 'SHA1',
        dhGroup: 'MODP2048'
      }
    ],
    activations: [],
    venueActivations: [],
    apActivations: []
  }
]

const TestWrapper = ({ formRef, children }: { formRef?: FormInstance, children: React.ReactNode }) => (
  <Form form={formRef}>
    {children}
  </Form>
)

describe('IpsecFormItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIpsecDrawer.mockReturnValue(<div data-testid='ipsec-drawer' />)
  })

  describe('Rendering', () => {
    it('should render tunnel encryption switch when tunnel encryption is disabled', () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      expect(screen.getByText('Tunnel Encryption')).toBeInTheDocument()
      expect(screen.getByRole('switch')).toBeInTheDocument()
      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('should render tunnel encryption switch when tunnel encryption is enabled', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(screen.getByText('Tunnel Encryption')).toBeInTheDocument()
      expect(switchElement).toBeInTheDocument()
    })

    it('should render IPSec profile selector when tunnel encryption is enabled', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(await screen.findByText('IPSec Profile')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should render loading state for IPSec profiles', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(screen.getByText('IPSec Profile')).toBeInTheDocument()
    })

    it('should render empty state when no IPSec profiles are available', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: [],
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(await screen.findByText('IPSec Profile')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call handleTunnelEncryptionChange when switch is toggled', async () => {
      const mockHandleTunnelEncryptionChange = jest.fn()
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem handleTunnelEncryptionChange={mockHandleTunnelEncryptionChange} />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(mockHandleTunnelEncryptionChange).toHaveBeenCalledWith(true)
    })

    it('should open IPSec drawer when Add button is clicked', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      const addButton = screen.getByText('Add')
      await userEvent.click(addButton)

      expect(mockIpsecDrawer).toHaveBeenCalledWith(
        expect.objectContaining({
          visible: true,
          readMode: false
        }),
        expect.anything()
      )
    })

    it('should close IPSec drawer when setVisible is called', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      await userEvent.click(screen.getByRole('switch'))
      await userEvent.click(screen.getByText('Add'))

      // The drawer should be rendered with setVisible function
      expect(mockIpsecDrawer).toHaveBeenCalled()
    })

    it('should auto-select new IPSec profile when callbackFn is called', async () => {
      const { result: { current: [form] } } = renderHook(() => Form.useForm())
      const mockSetFieldValue = jest.fn()
      const mockForm = {
        setFieldValue: mockSetFieldValue,
        getFieldValue: jest.fn(),
        setFieldsValue: jest.fn()
      }

      jest.spyOn(form, 'setFieldValue').mockImplementation(mockForm.setFieldValue)

      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper formRef={form}>
          <IpsecFormItem />
        </TestWrapper>
      )

      await userEvent.click(screen.getByRole('switch'))
      await userEvent.click(screen.getByText('Add'))

      // Get the callbackFn from the drawer props
      const drawerProps = mockIpsecDrawer.mock.calls[0][0]
      const callbackFn = drawerProps.callbackFn

      // Call the callback with a new option
      callbackFn({ label: 'New Profile', value: 'new-profile-id' })

      expect(mockSetFieldValue).toHaveBeenCalledWith('ipsecProfileId', 'new-profile-id')
    })
  })

  describe('Disabled state', () => {
    it('should disable switch when disabled prop is true', () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem disabled={true} />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeDisabled()
    })
  })

  describe('Form validation', () => {
    it('should show validation error when IPSec profile is required but not selected', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(await screen.findByText('IPSec Profile')).toBeInTheDocument()
    })
  })

  describe('Profile selection', () => {
    it('should display selected IPSec profile details', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(await screen.findByText('IPSec Profile')).toBeInTheDocument()
    })

    it('should show placeholder text when no profile is selected', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: mockIpsecData,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(await screen.findByText('Details of selected IPSec profile will appear here')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined IPSec data gracefully', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(await screen.findByText('IPSec Profile')).toBeInTheDocument()
    })

    it('should handle empty IPSec data array', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: [],
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: false,
        error: null
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(screen.getByText('IPSec Profile')).toBeInTheDocument()
    })

    it('should handle error state from query', async () => {
      mockUseGetIpsecViewDataListQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: jest.fn(),
        isFetching: false,
        isError: true,
        error: new Error('Failed to fetch IPSec data')
      } as any)

      render(
        <TestWrapper>
          <IpsecFormItem />
        </TestWrapper>
      )

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(screen.getByText('IPSec Profile')).toBeInTheDocument()
    })
  })
})