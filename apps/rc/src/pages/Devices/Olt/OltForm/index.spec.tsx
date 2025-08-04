import { Form } from 'antd'
import { rest } from 'msw'

import { CommonUrlsInfo }                         from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { screen, render, renderHook, mockServer } from '@acx-ui/test-utils'

import OltForm from './index'

describe('AddOlt', ()=>{ //TODO
  const mockedFinish = jest.fn()
  const params = {
    tenantId: 'tenant-id',
    action: 'add'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should render correctly', () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <OltForm
          form={formRef.current}
          onFinish={mockedFinish}
        />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Optical Switch')).toBeInTheDocument()
  })
})
