/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { validateRecoveryPassphrasePart } from '@acx-ui/rc/utils'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import  { MultiPartyPassword } from './MultiPartyPassword'

const fakeData = ['3577', '5764', '1724', '9799']

describe('Multi-party password component', () => {
  it('should password literal changable', async () => {
    render(
      <MultiPartyPassword
        data={fakeData}
        label='Recovery Network Passphrase'
      />
    )

    expect(await screen.findAllByTestId(/pwdg_[0-3]/)).toHaveLength(4)
    const inputElem = await screen.findByTestId('pwdg_0')
    await userEvent.type(inputElem, '123')
    expect(inputElem).toHaveAttribute('value', '3577123')

    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '456')
    expect(inputElem).toHaveAttribute('value', '456')
  })

  it('should validation works correctly', async () => {
    render(
      <MultiPartyPassword
        data={fakeData}
        label='Recovery Network Passphrase'
        rules={[
          {
            validator: (_, value) => validateRecoveryPassphrasePart(value)
          }
        ]}
      />
    )

    expect(await screen.findAllByTestId(/pwdg_[0-3]/)).toHaveLength(4)
    const inputElem = await screen.findByTestId('pwdg_0')
    await userEvent.type(inputElem, '123')
    const errorMessage = await screen.findByRole('alert')
    expect(errorMessage.textContent).toBe('Passphrase part must be exactly 4 digits long')
    expect(errorMessage).toBeVisible()

    await userEvent.clear(inputElem)
    await userEvent.type(inputElem, '1236')

    await waitForElementToBeRemoved(() => screen.queryByRole('alert'))
  })

  it('should toggle to display literal password', async () => {
    render(
      <MultiPartyPassword
        data={fakeData}
        label='Recovery Network Passphrase'
      />
    )

    expect(await screen.findAllByTestId(/pwdg_[0-3]/)).toHaveLength(4)
    const toggleVisible = await screen.findByRole('img', { name: 'eye' })
    fireEvent.click(toggleVisible)
    expect(await screen.findByTestId('pwdg_1')).toHaveDisplayValue('5764')
  })

  it('should display tooltip if it has', async () => {
    render(
      <MultiPartyPassword
        data={fakeData}
        label='Recovery Network Passphrase'
        tooltip='Must be 16 digits long'
      />
    )

    expect(await screen.findAllByTestId(/pwdg_[0-3]/)).toHaveLength(4)
    const tooltip = await screen.findByRole('img', { name: 'question-circle' })
    fireEvent.mouseOver(tooltip)
    await screen.findByText('Must be 16 digits long')
  })

  it('should invoke onChange correctly if it has', async () => {
    const mockedOnChange = jest.fn()

    render(
      <MultiPartyPassword
        data={fakeData}
        label='Recovery Network Passphrase'
        onChange={mockedOnChange}
      />
    )

    expect(await screen.findAllByTestId(/pwdg_[0-3]/)).toHaveLength(4)
    const inputElem = await screen.findByTestId('pwdg_0')
    await userEvent.type(inputElem, '1')
    expect(mockedOnChange).toBeCalledWith(0, ['35771', '5764', '1724', '9799'])
  })

  it('should invoke onVlidated correctly if it has', async () => {
    const mockedOnValidated = jest.fn()
    render(
      <MultiPartyPassword
        data={fakeData}
        label='Recovery Network Passphrase'
        rules={[
          {
            validator: (_, value) => validateRecoveryPassphrasePart(value)
          }
        ]}
        onValidated={mockedOnValidated}
      />
    )

    expect(await screen.findAllByTestId(/pwdg_[0-3]/)).toHaveLength(4)
    const inputElem = await screen.findByTestId('pwdg_0')

    await userEvent.type(inputElem, '1')
    expect(inputElem).toHaveAttribute('value', '35771')
    await waitFor(() => {
      expect(mockedOnValidated).toBeCalledWith(false)
    })

    await userEvent.type(inputElem, '{backspace}')
    await waitFor(() => {
      expect(mockedOnValidated).toBeCalledWith(true)
    })
  })
})