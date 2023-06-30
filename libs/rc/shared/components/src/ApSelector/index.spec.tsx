import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  screen,
  render,
  renderHook,
  waitFor
}    from '@acx-ui/test-utils'

import { mockedAps } from './__tests__/fixtures'

import { ApSelector } from '.'

describe('ApSelector', () => {
  it('should render the selector', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedAps }))
      )
    )

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}><ApSelector /></Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/' }
      }
    )

    const targetAp = mockedAps.data[0]
    await userEvent.click(await screen.findByRole('combobox', { name: /AP/i }))
    await userEvent.click(await screen.findByText(targetAp.name))

    await waitFor(() => {
      expect(formRef.current.getFieldValue('apSerialNumber')).toEqual(targetAp.serialNumber)
    })
  })
})
