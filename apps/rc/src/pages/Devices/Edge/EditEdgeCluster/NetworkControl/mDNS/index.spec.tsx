import userEvent          from '@testing-library/user-event'
import { Form }           from 'antd'
import { Store }          from 'antd/es/form/interface'
import { cloneDeep, get } from 'lodash'
import { rest }           from 'msw'

import { Button, StepsForm } from '@acx-ui/components'
import {
  EdgeMdnsFixtures,
  EdgeMdnsProxyUrls,
  EdgeMdnsProxyViewData
} from '@acx-ui/rc/utils'
import { Provider }                                                                           from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'
import { RequestPayload }                                                                     from '@acx-ui/types'

import { MdnsProxyFormItem, useHandleApplyMdns } from '.'

const { mockEdgeMdnsViewDataList, mockEdgeMdnsSetting } = EdgeMdnsFixtures
const mockAddFn = jest.fn()
const mockedActivateMdnsApi = jest.fn()
const mockedDeactivateMdnsApi = jest.fn()

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={''}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  AddEdgeMdnsProxyForm: (props:{
    onFinish: (data: EdgeMdnsProxyViewData) => Promise<void>
    onCancel: () => void
  }) => {
    return <form data-testid='rc-AddEdgeMdnsProxyForm'>
      <button data-testid='mock-submit-btn'
        onClick={async () => {
          const mockFormData = {
            ...mockEdgeMdnsViewDataList[0],
            name: 'test-add',
            activations: []
          } as EdgeMdnsProxyViewData
          await props.onFinish(mockFormData)
        }}>Submit</button>
      <button data-testid='mock-cancel-btn' onClick={props.onCancel}>Cancel</button>
    </form>
  },
  ApCompatibilityToolTip: ({ onClick }: { onClick: () => void }) =>
    <div data-testid='ApCompatibilityToolTip' onClick={onClick} />
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddEdgeMdnsProxyMutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          mockAddFn()
          const cbFn = (req.callback as Function)
          cbFn({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    }]
  }
}))

const MockComponentForHookTest = ({ formValues }: { formValues: Store }) => {
  const [form] = Form.useForm()
  form.setFieldsValue(formValues)
  const applyDhcp = useHandleApplyMdns(form, 'testVenueId', 'testClusterId')

  return (
    <Form
      form={form}
      onFinish={applyDhcp}
      children={<Button htmlType='submit'>OK</Button>}
    />
  )
}

describe('Edge Cluster Network Control Tab > mDNS', () => {
  const mockVenueId = 'mock_venue_1'
  const mockClusterId= 'mock_cluster_2'
  let params: { tenantId: string, clusterId: string, activeTab?: string } = {
    tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
    clusterId: mockClusterId,
    activeTab: 'networkControl'
  }

  beforeEach(() => {
    mockedActivateMdnsApi.mockReset()
    mockedDeactivateMdnsApi.mockReset()
    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (req, res, ctx) => {
          const isSearch = get(req.body, 'matchFields')
          // isSearch == true: mock as no bound mDNS for current cluster
          return res(ctx.json({
            data: isSearch ? [] : mockEdgeMdnsViewDataList
          }))
        }
      ),
      rest.get(
        EdgeMdnsProxyUrls.getEdgeMdnsProxy.url,
        (_, res, ctx) => res(ctx.json(mockEdgeMdnsSetting))
      ),
      rest.put(
        EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster.url,
        (req, res, ctx) => {
          mockedActivateMdnsApi(req.url.pathname)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster.url,
        (req, res, ctx) => {
          mockedDeactivateMdnsApi(req.url.pathname)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly display', async () => {
    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <MdnsProxyFormItem
            venueId={mockVenueId}
            clusterId={mockClusterId}
            setEdgeFeatureName={jest.fn()}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByRole('switch')).not.toBeChecked()
    expect(screen.queryByRole('button', { name: 'Profile Details' })).toBeNull()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('should greyout profile detail button until a profile is selected', async () => {
    const { result: { current: formRef } } = renderHook(() => Form.useForm()[0])

    render(<Provider>
      <StepsForm form={formRef}>
        <StepsForm.StepForm>
          <MdnsProxyFormItem
            venueId={mockVenueId}
            clusterId={mockClusterId}
            setEdgeFeatureName={jest.fn()}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
      }
    })

    const toggleBtn = await screen.findByRole('switch')
    expect(toggleBtn).not.toBeChecked()
    await userEvent.click(toggleBtn)

    const detailBtn = await screen.findByRole('button', { name: 'Profile Details' })
    expect(detailBtn).toBeDisabled()
    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      await screen.findByRole('option', { name: 'edge-mdns-proxy-name-2' })
    )
    expect(detailBtn).not.toBeDisabled()
  })

  it('should display the selected profile`s detail', async () => {
    const mockData = cloneDeep(mockEdgeMdnsViewDataList[1])
    mockData.forwardingRules = mockData.forwardingRules.map(item => ({
      ...item,
      serviceType: item.service
    }))

    mockServer.use(
      rest.get(
        EdgeMdnsProxyUrls.getEdgeMdnsProxy.url,
        (_, res, ctx) => res(ctx.json(mockData))
      )
    )

    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <MdnsProxyFormItem
            venueId={mockVenueId}
            clusterId={mockClusterId}
            setEdgeFeatureName={jest.fn()}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
      }
    })

    await userEvent.click(await screen.findByRole('switch'))
    const detailBtn = await screen.findByRole('button', { name: 'Profile Details' })
    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      await screen.findByRole('option', { name: 'edge-mdns-proxy-name-2' })
    )
    expect(detailBtn).not.toBeDisabled()
    await userEvent.click(detailBtn)
    const dialog = await screen.findByRole('dialog')
    await waitForElementToBeRemoved(() => within(dialog).queryByRole('img', { name: 'loader' }))
    expect(within(dialog).queryByText('Forwarding rules:')).toBeVisible()
    within(dialog).getByRole('row', { name: /AirPlay/i })
    within(dialog).getByRole('row', { name: /test7878/i })
    within(dialog).getByRole('row', { name: /Apple File Sharing/i })
    expect(within(dialog).queryAllByRole('row').length).toBe(4) // including header row
  })

  it('should be able to add new profile', async () => {
    render(<Provider><StepsForm>
      <StepsForm.StepForm>
        <MdnsProxyFormItem
          venueId={mockVenueId}
          clusterId={mockClusterId}
          setEdgeFeatureName={jest.fn()}
        />
      </StepsForm.StepForm>
    </StepsForm>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
      }
    })

    await userEvent.click(await screen.findByRole('switch'))
    const addBtn = await screen.findByRole('button', { name: 'Add Service' })
    await userEvent.click(addBtn)
    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).queryByTestId('rc-AddEdgeMdnsProxyForm')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(mockAddFn).toBeCalled())
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should be able to close new profile modal', async () => {
    render(<Provider><StepsForm>
      <StepsForm.StepForm>
        <MdnsProxyFormItem
          venueId={mockVenueId}
          clusterId={mockClusterId}
          setEdgeFeatureName={jest.fn()}
        />
      </StepsForm.StepForm>
    </StepsForm>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
      }
    })

    await userEvent.click(await screen.findByRole('switch'))
    const addBtn = await screen.findByRole('button', { name: 'Add Service' })
    await userEvent.click(addBtn)
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByTestId('rc-AddEdgeMdnsProxyForm')).toBeVisible()
    await userEvent.click(await within(dialog).findByTestId('mock-cancel-btn'))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should invoke setEdgeFeatureName correctly when click compatibility tooltip', async () => {
    const mockSetEdgeFeatureName = jest.fn()
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <MdnsProxyFormItem
              venueId={mockVenueId}
              clusterId={mockClusterId}
              setEdgeFeatureName={mockSetEdgeFeatureName}
            />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    const compatibilityToolTip = await screen.findByTestId('ApCompatibilityToolTip')
    await userEvent.click(compatibilityToolTip)
    expect(mockSetEdgeFeatureName).toBeCalled()
  })

  it('Test apply mDNS', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            edgeMdnsSwitch: true,
            edgeMdnsId: 'testEdgeMdnsId'
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    // eslint-disable-next-line max-len
    await waitFor(() => expect(mockedActivateMdnsApi).toBeCalledWith('/edgeMulticastDnsProxyProfiles/testEdgeMdnsId/venues/testVenueId/edgeClusters/testClusterId'))
  })

  it('Test deactivate mDNS', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            edgeMdnsSwitch: false,
            originEdgeMdnsId: 'testEdgeMdnsId'
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    // eslint-disable-next-line max-len
    await waitFor(() => expect(mockedDeactivateMdnsApi).toBeCalledWith('/edgeMulticastDnsProxyProfiles/testEdgeMdnsId/venues/testVenueId/edgeClusters/testClusterId'))
  })

  it('should not trigger API when there is no change', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            edgeMdnsSwitch: true,
            edgeMdnsId: 'testEdgeMdnsId',
            originEdgeMdnsId: 'testEdgeMdnsId'
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedActivateMdnsApi).not.toBeCalled()
    expect(mockedDeactivateMdnsApi).not.toBeCalled()
  })
})