
import { fireEvent } from '@testing-library/react'
import userEvent     from '@testing-library/user-event'
import { Form }      from 'antd'

import { MacRegistrationPool } from '@acx-ui/rc/utils'
import { render, screen }      from '@acx-ui/test-utils'

import MacRegistrationListFormContext from '../MacRegistrationListFormContext'

import { MacRegistrationListSettingForm } from './MacRegistrationListSettingForm'

describe('MacRegistrationListSettingForm', () => {

  it('should render form successfully', async () => {
    render(
      <MacRegistrationListFormContext.Provider value={{ editMode: false,
        data: {} as MacRegistrationPool, setData: jest.fn() }}>
        <Form>
          <MacRegistrationListSettingForm />
        </Form>
      </MacRegistrationListFormContext.Provider>
    )

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'test-policy' } })

    await userEvent.click(screen.getByRole('radio', { name: /by date/i }))
    const datePicker = screen.getByRole('img', { name: /calendar/i })
    expect(datePicker).toBeTruthy()

    await userEvent.click(screen.getByRole('radio', { name: /after.../i }))
    const timeUnit = screen.getByRole('generic', { name: /hours/i })
    expect(timeUnit).toBeTruthy()

    const accessPolicySet = screen.getByRole('combobox', { name: /Access Policy Set/i })
    expect(accessPolicySet).toBeTruthy()
  })
})
