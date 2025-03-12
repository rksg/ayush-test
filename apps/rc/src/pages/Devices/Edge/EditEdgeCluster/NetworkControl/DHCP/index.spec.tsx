
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { Store } from 'antd/es/form/interface'
import { rest }  from 'msw'

import { Button, StepsForm }                                            from '@acx-ui/components'
import { useIsEdgeFeatureReady }                                        from '@acx-ui/rc/components'
import { EdgeDHCPFixtures, EdgeDhcpUrls, EdgePinFixtures, EdgePinUrls } from '@acx-ui/rc/utils'
import { Provider }                                                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                          from '@acx-ui/test-utils'

import { DhcpFormItem, useHandleApplyDhcp } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ApCompatibilityToolTip: ({ onClick }: { onClick: () => void }) =>
    <div data-testid='ApCompatibilityToolTip' onClick={onClick} />,
  EdgeDhcpSelectionForm: () => <div data-testid='EdgeDhcpSelectionForm' />,
  useIsEdgeFeatureReady: jest.fn()
}))

const mockedActivateDhcpApi = jest.fn()
const mockedDeactivateDhcpApi = jest.fn()

const { mockDhcpStatsData } = EdgeDHCPFixtures
const { mockPinStatsList } = EdgePinFixtures

const MockComponentForHookTest = ({ formValues }: { formValues: Store }) => {
  const [form] = Form.useForm()
  form.setFieldsValue(formValues)
  const applyDhcp = useHandleApplyDhcp(form, 'testVenueId', 'testClusterId')

  return (
    <Form
      form={form}
      onFinish={applyDhcp}
      children={<Button htmlType='submit'>OK</Button>}
    />
  )
}

describe('Edge Cluster Network Control Tab > DHCP', () => {
  beforeEach(() => {
    mockedActivateDhcpApi.mockReset()
    mockedDeactivateDhcpApi.mockReset()
    mockServer.use(
      rest.put(
        EdgeDhcpUrls.activateDhcpService.url,
        (req, res, ctx) => {
          mockedActivateDhcpApi(req.url.pathname)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeDhcpUrls.deactivateDhcpService.url,
        (req, res, ctx) => {
          mockedDeactivateDhcpApi(req.url.pathname)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render correctly by switch on/off', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )

    const props = {
      currentClusterStatus: {
        clusterId: 'mockClusterId',
        venueId: 'mockVenueId'
      },
      setEdgeFeatureName: jest.fn()
    }
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <DhcpFormItem {...props}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const toggleBtn = screen.getByRole('switch', { name: 'DHCP Service' })
    expect(toggleBtn).not.toBeChecked()
    expect(screen.queryByTestId('EdgeDhcpSelectionForm')).not.toBeInTheDocument()
    await userEvent.click(toggleBtn)
    expect(toggleBtn).toBeChecked()
    expect(await screen.findByTestId('EdgeDhcpSelectionForm')).toBeVisible()
  })

  it('switch will be on when there is already dhcp configured', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json(mockDhcpStatsData))
      )
    )

    const props = {
      currentClusterStatus: {
        clusterId: 'mockClusterId',
        venueId: 'mockVenueId'
      },
      setEdgeFeatureName: jest.fn()
    }
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <DhcpFormItem {...props}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const toggleBtn = screen.getByRole('switch', { name: 'DHCP Service' })
    await waitFor(() => expect(toggleBtn).toBeChecked())
    expect(await screen.findByTestId('EdgeDhcpSelectionForm')).toBeVisible()
  })

  it('switch should be disabled when there is PIN configured', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockPinStatsList))
      )
    )

    const props = {
      currentClusterStatus: {
        clusterId: 'mockClusterId',
        venueId: 'mockVenueId'
      },
      setEdgeFeatureName: jest.fn()
    }
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <DhcpFormItem {...props}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const toggleBtn = screen.getByRole('switch', { name: 'DHCP Service' })
    await waitFor(() => expect(toggleBtn).toBeDisabled())
  })

  it('should invoke setEdgeFeatureName correctly when click compatibility tooltip', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
    const mockSetEdgeFeatureName = jest.fn()
    const props = {
      currentClusterStatus: {
        clusterId: 'mockClusterId',
        venueId: 'mockVenueId'
      },
      setEdgeFeatureName: mockSetEdgeFeatureName
    }
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <DhcpFormItem {...props}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const compatibilityToolTip = await screen.findByTestId('ApCompatibilityToolTip')
    await userEvent.click(compatibilityToolTip)
    expect(mockSetEdgeFeatureName).toBeCalled()
  })

  it('Test apply dhcp', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            dhcpSwitch: true,
            dhcpId: 'testDhcpId'
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    // eslint-disable-next-line max-len
    await waitFor(() => expect(mockedActivateDhcpApi).toBeCalledWith('/edgeDhcpServices/testDhcpId/venues/testVenueId/edgeClusters/testClusterId'))
  })

  it('Test deactivate dhcp', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            dhcpSwitch: false,
            originDhcpId: 'testDhcpId'
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    // eslint-disable-next-line max-len
    await waitFor(() => expect(mockedDeactivateDhcpApi).toBeCalledWith('/edgeDhcpServices/testDhcpId/venues/testVenueId/edgeClusters/testClusterId'))
  })

  it('should not trigger API when there is no change', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            dhcpSwitch: true,
            dhcpId: 'testDhcpId',
            originDhcpId: 'testDhcpId'
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedActivateDhcpApi).not.toBeCalled()
    expect(mockedDeactivateDhcpApi).not.toBeCalled()
  })
})