/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  renderHook,
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'

import { fakedPrivilegeGroupList } from '../__tests__/fixtures'

import PrivilegeGroupSelector from './PrivilegeGroupSelector'

describe('Role selector component', () => {
  const mockReqPrivilegeGroupData = jest.fn()

  mockServer.use(
    rest.get(
      AdministrationUrlsInfo.getPrivilegeGroups.url,
      (req, res, ctx) => {
        mockReqPrivilegeGroupData()
        return res(ctx.json(fakedPrivilegeGroupList))
      }
    )
  )

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
    await userEvent.click(selector)
    await userEvent.click(await screen.findByRole('option', { name: 'PRIME_ADMIN' }))
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