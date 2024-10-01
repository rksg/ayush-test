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
    expect(screen.getByLabelText('SCEP Key')).toBeInTheDocument()
    expect(screen.getByLabelText('Challenge Password Type')).toBeInTheDocument()

    await fireEvent.click(screen.getByText('Validity Information'))
    expect(screen.getByLabelText('Expiration Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Allowed Subnets')).toBeInTheDocument()
    expect(screen.getByLabelText('Blocked Subnets')).toBeInTheDocument()

    await fireEvent.click(screen.getByText('Configuration Information'))
    expect(screen.getByLabelText('Days of Access')).toBeInTheDocument()
    expect(screen.getByLabelText('Common Name #1 Mapping')).toBeInTheDocument()
    expect(screen.getByLabelText('Common Name #2 Mapping')).toBeInTheDocument()
    expect(screen.getByLabelText('Common Name #3 Mapping')).toBeInTheDocument()
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
    await userEvent.type(inputNumber, '-1')
    expect(inputNumber).toHaveValue('-1')

    // Test maximum value
    await userEvent.clear(inputNumber)
    await userEvent.type(inputNumber, '365')
    expect(inputNumber).toHaveValue('365')

    // Test value below minimum
    await userEvent.clear(inputNumber)
    await userEvent.type(inputNumber, '-1')
    expect(inputNumber).toHaveValue('-1')
    inputNumber.focus()
    await userEvent.type(inputNumber, '{arrowdown}')
    expect(inputNumber).not.toHaveValue('-2')

    // Test value above maximum
    await userEvent.clear(inputNumber)
    await userEvent.type(inputNumber, '365')
    expect(inputNumber).toHaveValue('365')
    inputNumber.focus()
    await userEvent.type(inputNumber, '{arrowup}')
    expect(inputNumber).not.toHaveValue('366')
  })
})
