import userEvent        from '@testing-library/user-event'
import { Form }         from 'antd'
import { IntlProvider } from 'react-intl'

import { IpSecAuthEnum, ipSecPskValidator }                                 from '@acx-ui/rc/utils'
import { render, screen, renderHook, waitFor, MockSelect, MockSelectProps } from '@acx-ui/test-utils'

import { AuthenticationFormItem, PreSharedKeyFormItem } from './AuthenticationFormItem'

jest.mock('@acx-ui/components', () => {
  const common = jest.requireActual('@acx-ui/components')
  const Select = (props: MockSelectProps) => <MockSelect {...props}/>
  Select.Option = ({ children, ...otherProps }: {
    children: React.ReactNode;
    [key: string]: unknown
  }) => <option role='option' {...otherProps}>{children}</option>

  return {
    ...common,
    // eslint-disable-next-line max-len
    PasswordInput: (props: { value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => <input
      data-testid='password-input'
      type='password'
      value={props.value || ''}
      onChange={props.onChange}
    />,
    Select
  }
})

// Mock the ipSecPskValidator
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  ipSecPskValidator: jest.fn()
}))

const mockIpSecPskValidator = ipSecPskValidator as jest.MockedFunction<typeof ipSecPskValidator>

describe('AuthenticationFormItem', () => {
  const user = userEvent.setup()

  const renderComponent = () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(<IntlProvider locale='en'>
      <Form form={formRef.current}>
        <AuthenticationFormItem />
      </Form></IntlProvider>)

    return { formRef: formRef.current }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockIpSecPskValidator.mockResolvedValue(undefined)
  })

  describe('Component Rendering', () => {
    it('should render AuthenticationFormItem component with authentication select', () => {
      renderComponent()

      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /authentication/i })).toBeInTheDocument()
    })

    it('should render only Pre-shared Key option in authentication select', () => {
      renderComponent()

      const select = screen.getByRole('combobox', { name: /authentication/i })
      expect(select).toBeInTheDocument()

      // Check that only PSK option is available (Certificate is commented out)
      expect(screen.getByText('Pre-shared Key')).toBeInTheDocument()
      expect(screen.queryByText('Certificate')).not.toBeInTheDocument()
    })

    it('should not render PreSharedKeyFormItem initially when no auth type is selected', () => {
      renderComponent()

      expect(screen.queryByTestId('password-input')).not.toBeInTheDocument()
    })

    it('should not render CertificateFormItem initially when no auth type is selected', () => {
      renderComponent()

      expect(screen.queryByText('Certificate')).not.toBeInTheDocument()
    })
  })

  describe('Authentication Type Selection', () => {
    it('should render PreSharedKeyFormItem when PSK is selected', async () => {
      renderComponent()

      const select = screen.getByRole('combobox', { name: /Authentication/i })
      await user.selectOptions(select, IpSecAuthEnum.PSK)

      expect(screen.getAllByText('Pre-shared Key').length).toBe(2)
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should require authentication type selection', async () => {
      const { formRef } = renderComponent()

      // Trigger form validation
      formRef.submit()

      // Check that validation error is shown
      expect(await screen.findByText('Please enter Authentication')).toBeInTheDocument()
    })

    it('should require pre-shared key when PSK is selected', async () => {
      const { formRef } = renderComponent()

      const select = screen.getByRole('combobox', { name: /authentication/i })
      await user.selectOptions(select, IpSecAuthEnum.PSK)

      const pskInput = screen.getByTestId('password-input')
      await user.clear(pskInput)

      // Trigger form validation
      formRef.submit()

      // Check that validation error is shown
      expect(await screen.findByText('Please enter Pre-shared Key')).toBeInTheDocument()
    })
  })
})

describe('PreSharedKeyFormItem', () => {
  const user = userEvent.setup()

  const renderComponent = () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    return render(<IntlProvider locale='en'><Form form={formRef.current}>
      <PreSharedKeyFormItem />
      <button type='submit'>Submit</button>
    </Form></IntlProvider>)

    // return { formRef: formRef.current }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockIpSecPskValidator.mockResolvedValue(undefined)
  })

  describe('Component Rendering', () => {
    it('should render PreSharedKeyFormItem with correct label and test id', () => {
      renderComponent()

      expect(screen.getByText('Pre-shared Key')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should require pre-shared key input', async () => {
      renderComponent()

      screen.getByTestId('password-input')

      // Trigger form validation
      await user.click(screen.getByRole('button', { name: /submit/i }))

      // Check that validation error is shown
      expect(await screen.findByText('Please enter Pre-shared Key')).toBeInTheDocument()
    })

    it('should validate pre-shared key using ipSecPskValidator when valid input is provided',
      async () => {
        mockIpSecPskValidator.mockResolvedValue(undefined)
        renderComponent()

        const input = screen.getByTestId('password-input')
        await user.type(input, 'validPSK123')

        // Trigger validation
        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
          expect(mockIpSecPskValidator).toHaveBeenCalledWith('validPSK123')
        })
      })

    it('should show validation error when ipSecPskValidator rejects the input', async () => {
      const errorMessage = 'Invalid pre-shared key format'
      mockIpSecPskValidator.mockRejectedValue(errorMessage)
      renderComponent()

      const input = screen.getByTestId('password-input')
      await user.type(input, 'invalidPSK')

      // Trigger validation
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(mockIpSecPskValidator).toHaveBeenCalledWith('invalidPSK')
      })

      expect(await screen.findByText(errorMessage)).toBeInTheDocument()
    })

    it('should validate pre-shared key on form submission', async () => {
      mockIpSecPskValidator.mockResolvedValue(undefined)
      renderComponent()

      const input = screen.getByTestId('password-input')
      await user.type(input, 'testPSK123')

      // Simulate form submission
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(mockIpSecPskValidator).toHaveBeenCalledWith('testPSK123')
      })
    })
  })

  describe('User Interactions', () => {
    it('should allow typing in pre-shared key input field', async () => {
      renderComponent()

      const input = screen.getByTestId('password-input')
      await user.type(input, 'mySecretKey123')

      expect(input).toHaveValue('mySecretKey123')
    })

    it('should allow clearing pre-shared key input field', async () => {
      renderComponent()

      const input = screen.getByTestId('password-input')
      await user.type(input, 'mySecretKey123')
      expect(input).toHaveValue('mySecretKey123')

      await user.clear(input)
      expect(input).toHaveValue('')
    })

    it('should maintain focus on input field after typing', async () => {
      renderComponent()

      const input = screen.getByTestId('password-input')
      await user.click(input)
      await user.type(input, 'testKey')

      expect(input).toHaveFocus()
    })
  })
})