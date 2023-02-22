/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider } from '@acx-ui/store'
import {
  renderHook,
  render,
  screen
} from '@acx-ui/test-utils'

import RoleSelector from './RoleSelector'


describe('Role selector component', () => {

  it('should render the selector', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <RoleSelector />
        </Form>
      </Provider>
    )

    const selector = await screen.findByRole('combobox')
    expect(selector).not.toBeDisabled()
    await userEvent.click(selector)
    await userEvent.click(await screen.findByRole('option', { name: 'Administrator' }))
  })

  it('should unclickable the selector', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}><RoleSelector disabled={true}/></Form>
      </Provider>
    )

    const selector = await screen.findByRole('combobox')
    expect(selector).toBeDisabled()
  })
})