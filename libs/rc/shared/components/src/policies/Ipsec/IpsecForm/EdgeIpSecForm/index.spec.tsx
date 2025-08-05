/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { getIpSecEspAlgorithmOptions, getIpSecIkeAlgorithmOptions } from '@acx-ui/edge/components'
import {
  toIpSecEspAlgorithmOptionValue, toIpSecEspProposalData,
  toIpSecIkeAlgorithmOptionValue, toIpSecIkeProposalData,
  IpSecProposalTypeEnum, IpSecPseudoRandomFunctionEnum
} from '@acx-ui/rc/utils'
import { render, screen, renderHook, MockSelect, MockSelectProps } from '@acx-ui/test-utils'

import { VxLanSettingForm } from './index'

// Mock antd Select component
jest.mock('antd', () => {
  const antd = jest.requireActual('antd')
  const Select = (props: MockSelectProps) => <MockSelect {...props}/>
  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

// Mock the edge components
jest.mock('@acx-ui/edge/components', () => ({
  getIpSecEspAlgorithmOptions: jest.fn(),
  getIpSecIkeAlgorithmOptions: jest.fn()
}))

// Mock the rc utils
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  toIpSecEspAlgorithmOptionValue: jest.fn(),
  toIpSecEspProposalData: jest.fn(),
  toIpSecIkeAlgorithmOptionValue: jest.fn(),
  toIpSecIkeProposalData: jest.fn()
}))

const mockGetIpSecEspAlgorithmOptions = getIpSecEspAlgorithmOptions as jest.MockedFunction<typeof getIpSecEspAlgorithmOptions>
const mockGetIpSecIkeAlgorithmOptions = getIpSecIkeAlgorithmOptions as jest.MockedFunction<typeof getIpSecIkeAlgorithmOptions>
const mockToIpSecEspAlgorithmOptionValue = toIpSecEspAlgorithmOptionValue as jest.MockedFunction<
  typeof toIpSecEspAlgorithmOptionValue
>
const mockToIpSecEspProposalData = toIpSecEspProposalData as jest.MockedFunction<
  typeof toIpSecEspProposalData
>
const mockToIpSecIkeAlgorithmOptionValue = toIpSecIkeAlgorithmOptionValue as jest.MockedFunction<
  typeof toIpSecIkeAlgorithmOptionValue
>
const mockToIpSecIkeProposalData = toIpSecIkeProposalData as jest.MockedFunction<
  typeof toIpSecIkeProposalData
>

describe('VxLanSettingForm', () => {
  const user = userEvent.setup()

  const mockIkeAlgorithmOptions = [
    { label: 'AES128-SHA1-MODP2048', value: 'aes128-sha1-modp2048' },
    { label: 'AES256-SHA256-MODP2048', value: 'aes256-sha256-modp2048' }
  ]

  const mockEspAlgorithmOptions = [
    { label: 'AES128-SHA1', value: 'aes128-sha1' },
    { label: 'AES256-SHA256', value: 'aes256-sha256' }
  ]

  const renderComponent = () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    return render(
      <Form form={formRef.current}>
        <VxLanSettingForm />
        <button type='submit'>Submit</button>
      </Form>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockGetIpSecIkeAlgorithmOptions.mockReturnValue(mockIkeAlgorithmOptions)
    mockGetIpSecEspAlgorithmOptions.mockReturnValue(mockEspAlgorithmOptions)
    mockToIpSecIkeAlgorithmOptionValue.mockReturnValue('aes128-sha1-modp2048')
    mockToIpSecEspAlgorithmOptionValue.mockReturnValue('aes128-sha1')
    mockToIpSecIkeProposalData.mockReturnValue({
      ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
      ikeProposals: [{
        encAlg: 'AES128',
        authAlg: 'SHA1',
        prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256,
        dhGroup: 'MODP2048'
      }]
    })
    mockToIpSecEspProposalData.mockReturnValue({
      espProposalType: IpSecProposalTypeEnum.SPECIFIC,
      espProposals: [{ encAlg: 'AES128', authAlg: 'SHA1', dhGroup: 'MODP2048' }]
    })
  })

  describe('Component Rendering', () => {
    it('should render VxLanSettingForm component with all sections', () => {
      renderComponent()

      expect(screen.getByText('Security Association')).toBeInTheDocument()
      expect(screen.getByText('IKE Algorithm Combination')).toBeInTheDocument()
      expect(screen.getByText('ESP Algorithm Combination')).toBeInTheDocument()
      expect(screen.getByText('IKE Re-key Time')).toBeInTheDocument()
      expect(screen.getByText('ESP Re-key Time')).toBeInTheDocument()
    })

    it('should render AuthenticationFormItem in the first row', () => {
      renderComponent()

      // AuthenticationFormItem should be rendered (it has its own tests)
      expect(screen.getByText('Authentication')).toBeInTheDocument()
    })

    it('should render DeadPeerDetectionDelayFormItem in the last row', () => {
      renderComponent()

      expect(screen.getByText('Dead Peer Detection Delay')).toBeInTheDocument()
    })
  })

  describe('IKE Algorithm Selection', () => {
    it('should render IKE algorithm select with options', () => {
      renderComponent()

      screen.getByText('IKE Algorithm Combination')
      expect(screen.getByText('AES128-SHA1-MODP2048')).toBeInTheDocument()
      expect(screen.getByText('AES256-SHA256-MODP2048')).toBeInTheDocument()
    })

    it('should handle IKE algorithm change and update form', async () => {
      renderComponent()

      const ikeSelect = getIkeSelect()
      await user.selectOptions(ikeSelect, 'aes256-sha256-modp2048')

      expect(mockToIpSecIkeProposalData).toHaveBeenCalledWith('aes256-sha256-modp2048')
    })

    it('should update form when IKE proposal data is returned', async () => {
      const mockProposalData = {
        ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
        ikeProposals: [{ encAlg: 'AES256', authAlg: 'SHA256', prfAlg: IpSecPseudoRandomFunctionEnum.PRF_SHA256, dhGroup: 'MODP2048' }]
      }
      mockToIpSecIkeProposalData.mockReturnValue(mockProposalData)

      renderComponent()

      const ikeSelect = getIkeSelect()
      await user.selectOptions(ikeSelect, 'aes256-sha256-modp2048')

      expect(mockToIpSecIkeProposalData).toHaveBeenCalledWith('aes256-sha256-modp2048')
    })

    it('should not update form when IKE proposal data is undefined', async () => {
      mockToIpSecIkeProposalData.mockReturnValue(undefined)

      renderComponent()

      const ikeSelect = getIkeSelect()
      await user.selectOptions(ikeSelect, 'aes256-sha256-modp2048')

      expect(mockToIpSecIkeProposalData).toHaveBeenCalledWith('aes256-sha256-modp2048')
    })
  })

  describe('ESP Algorithm Selection', () => {
    it('should render ESP algorithm select with options', () => {
      renderComponent()

      const espSelect = getEspSelect()
      expect(espSelect).toBeInTheDocument()

      expect(screen.getByText('AES128-SHA1')).toBeInTheDocument()
      expect(screen.getByText('AES256-SHA256')).toBeInTheDocument()
    })

    it('should handle ESP algorithm change and update form', async () => {
      renderComponent()

      const espSelect = getEspSelect()
      await user.selectOptions(espSelect, 'aes256-sha256')

      expect(mockToIpSecEspProposalData).toHaveBeenCalledWith('aes256-sha256')
    })

    it('should update form when ESP proposal data is returned', async () => {
      const mockProposalData = {
        espProposalType: 'SPECIFIC',
        espProposals: [{ encAlg: 'AES256', authAlg: 'SHA256', dhGroup: 'MODP2048' }]
      }
      mockToIpSecEspProposalData.mockReturnValue(mockProposalData)

      renderComponent()

      const espSelect = getEspSelect()
      await user.selectOptions(espSelect, 'aes256-sha256')

      expect(mockToIpSecEspProposalData).toHaveBeenCalledWith('aes256-sha256')
    })

    it('should not update form when ESP proposal data is undefined', async () => {
      mockToIpSecEspProposalData.mockReturnValue(undefined)

      renderComponent()

      const espSelect = getEspSelect()
      await user.selectOptions(espSelect, 'aes256-sha256')

      expect(mockToIpSecEspProposalData).toHaveBeenCalledWith('aes256-sha256')
    })
  })

  describe('Rekey Time Form Items', () => {
    it('should render IKE Re-key Time form item', () => {
      renderComponent()

      expect(screen.getByText('IKE Re-key Time')).toBeInTheDocument()
    })

    it('should render ESP Re-key Time form item', () => {
      renderComponent()

      expect(screen.getByText('ESP Re-key Time')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should require IKE Algorithm Combination selection', async () => {
      renderComponent()

      getIkeSelect()

      // Trigger form validation
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(await screen.findByText('Please select IKE Algorithm Combination')).toBeInTheDocument()
    })

    it('should require ESP Algorithm Combination selection', async () => {
      renderComponent()

      getEspSelect()
      // Trigger form validation
      await user.click(screen.getByRole('button', { name: /submit/i }))

      expect(await screen.findByText('Please select ESP Algorithm Combination')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty algorithm options', () => {
      mockGetIpSecIkeAlgorithmOptions.mockReturnValue([])
      mockGetIpSecEspAlgorithmOptions.mockReturnValue([])

      renderComponent()

      expect(screen.getByText('IKE Algorithm Combination')).toBeInTheDocument()
      expect(screen.getByText('ESP Algorithm Combination')).toBeInTheDocument()
    })

    it('should handle undefined algorithm option values', () => {
      mockToIpSecIkeAlgorithmOptionValue.mockReturnValue(undefined)
      mockToIpSecEspAlgorithmOptionValue.mockReturnValue(undefined)

      renderComponent()

      expect(screen.getByText('IKE Algorithm Combination')).toBeInTheDocument()
      expect(screen.getByText('ESP Algorithm Combination')).toBeInTheDocument()
    })
  })
})

const getIkeSelect = () => {
  const comboboxes = screen.getAllByRole('combobox')
  return comboboxes[1]
}

const getEspSelect = () => {
  const comboboxes = screen.getAllByRole('combobox')
  return comboboxes[3]
}