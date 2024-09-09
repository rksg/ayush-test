import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { EdgeHqosProfileFixtures, EdgeHqosProfilesUrls }           from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { HqosBandwidthDeatilDrawer } from './HqosBandwidthDetailDrawer'


const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures
const { click } = userEvent

const params = { tenantId: 't-id' }

describe('SmartEdgeForm > QosBandwidthDeatilDrawer', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(
        EdgeHqosProfilesUrls.getEdgeHqosProfileById.url,
        (req, res, ctx) => res(ctx.json(mockEdgeHqosProfileStatusList.data[1]))
      )
    )
  })

  it('HQoS profile detail', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldValue('qosId', mockEdgeHqosProfileStatusList.data[1].id)

    render(
      <Provider>
        <Form form={formRef.current}>
          <HqosBandwidthDeatilDrawer />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    await click(await screen.findByRole('button', { name: /Profile Details/i }))
    const drawer = await screen.findByRole('dialog')
    await screen.findByText(/QoS Bandwidth Profile Detail/i)
    expect((await screen.findAllByText(/Best effort/i)).length).toBe(2)
    await waitFor(() => expect(drawer).toBeVisible())
  })

  it('Should close modal while clicking Close button', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldValue('qosId', mockEdgeHqosProfileStatusList.data[1].id)

    render(
      <Provider>
        <Form form={formRef.current}>
          <HqosBandwidthDeatilDrawer />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    await click(await screen.findByRole('button', { name: /Profile Details/i }))
    const drawer = await screen.findByRole('dialog')
    await screen.findByText(/QoS Bandwidth Profile Detail/i)
    await waitFor(() => expect(drawer).toBeVisible())
    const closeButton = within(drawer).getByLabelText('Close')
    await click(closeButton)
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[0].parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })
})
