/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider } from '@acx-ui/store'
import {
  renderHook,
  render,
  screen
} from '@acx-ui/test-utils'

import { fakedPrivilegeGroupList } from '../__tests__/fixtures'

import PrivilegeGroupSelector from './PrivilegeGroupSelector'

const services = require('@acx-ui/rc/services')

describe('Role selector component', () => {
  const mockReqPrivilegeGroupData = jest.fn()

  services.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
    mockReqPrivilegeGroupData()
    return { data: fakedPrivilegeGroupList }
  })

  it('should render the selector', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <PrivilegeGroupSelector />
        </Form>
      </Provider>
    )

    const selector = await screen.findByRole('combobox')
    expect(selector).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: 'Administrator' }))
  })

  it('should unclickable the selector', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}><PrivilegeGroupSelector disabled={true}/></Form>
      </Provider>
    )

    const selector = await screen.findByRole('combobox')
    expect(selector).toBeDisabled()
  })
})