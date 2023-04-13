/* eslint-disable max-len */
import React from 'react'

import { renderHook } from '@testing-library/react'
import userEvent      from '@testing-library/user-event'

import { useStepFormContext } from '@acx-ui/components'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { FirewallForm } from '../../..'

import { DDoSRateLimitConfigDrawer } from './'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
}
const mockedSetVisible = jest.fn()
jest.mock('../DDoSRuleDialog', () => {

})
describe('DDoS rate limit configuration drawer creation mode', () => {
  beforeEach(() => {
  })

  it('should correctly work', async () => {
    const { result: { current: form } } = renderHook(() => {
      const { form: parentForm } = useStepFormContext<FirewallForm>()
      return parentForm
    })

    const mockedFn = jest.fn()
    jest.mocked(form.getFieldValue).mockImplementation(mockedFn)

    render(
      <Provider>
        <DDoSRateLimitConfigDrawer
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Add New Recipient')
    const nameInputElem = await screen.findByRole('textbox', { name: 'Name' })
    await userEvent.type(nameInputElem, 'testUser')

    const emailInputElem = await screen.findByPlaceholderText('Email')
    await userEvent.type(emailInputElem, 'test_user@gmail.com')
    const emailSwitchElem = (await screen.findAllByRole('switch'))
      .filter((elem) => elem.id === 'emailEnabled')[0]

    expect(emailSwitchElem).not.toEqual(undefined)
    expect(emailSwitchElem).toHaveAttribute('aria-checked', 'true')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)
    expect(form.setFieldsValue).toBeCalledWith({
      description: 'testUser',
      endpoints: [{
        active: true,
        destination: 'test_user@gmail.com',
        type: NotificationEndpointType.email
      }]
    })
    await waitFor(() => {
      expect(mockedSetVisible).toBeCalledWith(false)
    })
  })
})