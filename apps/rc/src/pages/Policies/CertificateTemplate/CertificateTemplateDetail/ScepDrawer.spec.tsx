import userEvent from '@testing-library/user-event'

import { ChallengePasswordType, ScepKeyCommonNameType } from '@acx-ui/rc/utils'
import { Provider }                                     from '@acx-ui/store'
import { fireEvent, render, screen, waitFor }           from '@acx-ui/test-utils'

import ScepDrawer from './ScepDrawer'

const mockedAdd = jest.fn()
const mockedEdit = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom')
}))
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddSpecificTemplateScepKeyMutation: () => [mockedAdd],
  useEditSpecificTemplateScepKeyMutation: () => [mockedEdit]
}))

describe('ScepDrawer', () => {
  it('should render the component with data', async () => {
    render(<Provider><ScepDrawer visible={true} onClose={()=>{}}/></Provider>)
    expect(screen.getByText('SCEP Key Information')).toBeInTheDocument()
    expect(screen.getByText('Validity Information')).toBeInTheDocument()
    expect(screen.getByText('Configuration Information')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Challenge Password Type')).toBeInTheDocument()

    await fireEvent.click(screen.getByText('Validity Information'))
    expect(screen.getByLabelText('Expiration Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Allowed Subnets')).toBeInTheDocument()
    expect(screen.getByLabelText('Blocked Subnets')).toBeInTheDocument()

    await fireEvent.click(screen.getByText('Configuration Information'))
    expect(screen.getByLabelText('Days of Access')).toBeInTheDocument()
    expect(screen.getByLabelText('Common Name #1 Mapping')).toBeInTheDocument()
  })

  it('should add scep key correctly', async () => {
    render(<Provider><ScepDrawer visible={true} onClose={()=>{}}/></Provider>)
    await userEvent.type(screen.getByLabelText('Name'), 'testName')
    await userEvent.click(screen.getByText('Add'))
    await waitFor(() => expect(mockedAdd).toBeCalledTimes(1))
  })

  it('should edit scep key correctly', async () => {
    render(<Provider><ScepDrawer
      scepData={{ id: '123',
        name: '123',
        overrideDays: 0,
        scepKey: '123',
        enrollmentUrl: '',
        expirationDate: '',
        challengePasswordType: ChallengePasswordType.NONE,
        cnValue1: ScepKeyCommonNameType.IGNORE,
        cnValue2: ScepKeyCommonNameType.IGNORE,
        cnValue3: ScepKeyCommonNameType.IGNORE }}
      visible={true}
      onClose={()=>{}}/></Provider>)
    await userEvent.click(screen.getByText('Save'))
    await waitFor(() => expect(mockedEdit).toBeCalledTimes(1))
  })

  it('should handle InputNumber min and max values correctly', async () => {
    render(<Provider><ScepDrawer visible={true} onClose={() => {}}/></Provider>)

    const inputNumber = screen.getByLabelText('Days of Access')

    // Test minimum value
    await userEvent.clear(inputNumber)
    await userEvent.type(inputNumber, '0')
    expect(inputNumber).toHaveValue('0')

    // Test maximum value
    await userEvent.clear(inputNumber)
    await userEvent.type(inputNumber, '365')
    expect(inputNumber).toHaveValue('365')

    // Test value below minimum
    await userEvent.clear(inputNumber)
    await userEvent.type(inputNumber, '0')
    expect(inputNumber).toHaveValue('0')
    inputNumber.focus()
    await userEvent.type(inputNumber, '{arrowdown}')
    expect(inputNumber).not.toHaveValue('-1')

    // Test value above maximum
    await userEvent.clear(inputNumber)
    await userEvent.type(inputNumber, '365')
    expect(inputNumber).toHaveValue('365')
    inputNumber.focus()
    await userEvent.type(inputNumber, '{arrowup}')
    expect(inputNumber).not.toHaveValue('366')
  })

  it.skip('should reset form fields when visible is set to false', async () => {
    // eslint-disable-next-line max-len
    const { rerender } = render(<Provider><ScepDrawer visible={true} onClose={() => {}}/></Provider>)

    await userEvent.type(screen.getByLabelText('Name'), 'TestName')
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('TestName'))

    rerender(<Provider><ScepDrawer visible={false} onClose={() => {}}/></Provider>)
    rerender(<Provider><ScepDrawer visible={true} onClose={() => {}}/></Provider>)
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue(''))
  })

  it.skip('should prevent typing spaces in the Name field', async () => {
    render(<Provider><ScepDrawer visible={true} onClose={() => {}}/></Provider>)

    const nameInput = screen.getByLabelText('Name')

    // Try typing a space
    await userEvent.type(nameInput, ' ')

    // Ensure the input value does not contain a space
    expect(nameInput).toHaveValue('')
  })

  it('should show error for invalid subnet format in allowedSubnets', async () => {
    render(<Provider><ScepDrawer visible={true} onClose={() => {}}/></Provider>)

    const allowedSubnetsInput = screen.getByLabelText('Allowed Subnets')
    await userEvent.type(allowedSubnetsInput, 'invalid_subnet')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Invalid subnet format')).toBeInTheDocument()
    })
  })

  it('should show error for invalid subnet format in blockedSubnets', async () => {
    render(<Provider><ScepDrawer visible={true} onClose={() => {}}/></Provider>)

    const blockedSubnetsInput = screen.getByLabelText('Blocked Subnets')
    await userEvent.type(blockedSubnetsInput, 'invalid_subnet')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Invalid subnet format')).toBeInTheDocument()
    })
  })

  // eslint-disable-next-line max-len
  it('should show error for overlapping subnets between allowedSubnets and blockedSubnets', async () => {
    render(<Provider><ScepDrawer visible={true} onClose={() => {}}/></Provider>)

    const allowedSubnetsInput = screen.getByLabelText('Allowed Subnets')
    const blockedSubnetsInput = screen.getByLabelText('Blocked Subnets')

    await userEvent.clear(allowedSubnetsInput)
    await userEvent.type(allowedSubnetsInput, '192.168.1.0/24')
    await userEvent.type(blockedSubnetsInput, '192.168.1.0/24')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(screen.getByText('Same subnet values cannot be given in allowed and blocked')).toBeInTheDocument()
    })
  })

  it('should not show error for valid subnets in allowedSubnets and blockedSubnets', async () => {
    render(<Provider><ScepDrawer visible={true} onClose={() => {}}/></Provider>)

    const allowedSubnetsInput = screen.getByLabelText('Allowed Subnets')
    const blockedSubnetsInput = screen.getByLabelText('Blocked Subnets')

    await userEvent.clear(allowedSubnetsInput)
    await userEvent.type(allowedSubnetsInput, '192.168.1.0/24')
    await userEvent.type(blockedSubnetsInput, '192.168.2.0/24')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(screen.queryByText('Same subnet values cannot be given in allowed and blocked')).not.toBeInTheDocument()
    })
  })

  it('should show error for subnet with out of range address in allowedSubnets', async () => {
    render(<Provider><ScepDrawer visible={true} onClose={() => {}}/></Provider>)

    const allowedSubnetsInput = screen.getByLabelText('Allowed Subnets')
    await userEvent.clear(allowedSubnetsInput)
    await userEvent.type(allowedSubnetsInput, '10.1.11.711')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Invalid subnet format')).toBeInTheDocument()
    })
  })
})
