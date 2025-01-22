import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { Store } from 'antd/es/form/interface'
import { rest }  from 'msw'

import { Button, StepsForm }                                         from '@acx-ui/components'
import { EdgeHqosProfileFixtures, EdgeHqosProfilesUrls, EdgeStatus } from '@acx-ui/rc/utils'
import { Provider }                                                  from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                       from '@acx-ui/test-utils'

import { HQoSBandwidthFormItem, useHandleApplyHqos } from '.'

jest.mock('../../../../../Policies/HqosBandwidth/Edge/HqosBandwidthSelectionForm', () => ({
  EdgeHqosProfileSelectionForm: () => <div data-testid='EdgeHqosProfileSelectionForm' />
}))

const mockedActivateHqospApi = jest.fn()
const mockedDeactivateHqosApi = jest.fn()

const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures

const MockComponentForHookTest = ({ formValues }: { formValues: Store }) => {
  const [form] = Form.useForm()
  form.setFieldsValue(formValues)
  const applyDhcp = useHandleApplyHqos(form, 'testVenueId', 'testClusterId')

  return (
    <Form
      form={form}
      onFinish={applyDhcp}
      children={<Button htmlType='submit'>OK</Button>}
    />
  )
}

describe('Edge Cluster Network Control Tab > HQoS Bandwidth', () => {
  beforeEach(() => {
    mockServer.use(
      rest.put(
        EdgeHqosProfilesUrls.activateEdgeCluster.url,
        (_, res, ctx) => {
          mockedActivateHqospApi()
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeHqosProfilesUrls.deactivateEdgeCluster.url,
        (_, res, ctx) => {
          mockedDeactivateHqosApi()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('toggle should be disabled when there is insufficient cpu cores', async () => {
    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )

    const props = {
      currentClusterStatus: {
        clusterId: 'mockClusterId',
        venueId: 'mockVenueId',
        edgeList: [{ cpuCores: 2 }]
      } as unknown as EdgeStatus,
      setEdgeFeatureName: jest.fn()
    }
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <HQoSBandwidthFormItem {...props}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const toggleBtn = screen.getByRole('switch', { name: 'Hierarchical QoS' })
    expect(toggleBtn).toBeDisabled()
  })

  it('should render correctly by switch on/off', async () => {
    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )

    const props = {
      currentClusterStatus: {
        clusterId: 'mockClusterId',
        venueId: 'mockVenueId',
        edgeList: [{ cpuCores: 4 }]
      } as unknown as EdgeStatus,
      setEdgeFeatureName: jest.fn()
    }
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <HQoSBandwidthFormItem {...props}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const toggleBtn = screen.getByRole('switch', { name: 'Hierarchical QoS' })
    expect(toggleBtn).not.toBeChecked()
    expect(screen.queryByTestId('EdgeHqosProfileSelectionForm')).not.toBeInTheDocument()
    await userEvent.click(toggleBtn)
    expect(toggleBtn).toBeChecked()
    expect(await screen.findByTestId('EdgeHqosProfileSelectionForm')).toBeVisible()
  })

  it('switch will be on when there is already HQoS configured', async () => {
    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeHqosProfileStatusList))
      )
    )

    const props = {
      currentClusterStatus: {
        clusterId: 'mockClusterId',
        venueId: 'mockVenueId',
        edgeList: [{ cpuCores: 4 }]
      } as unknown as EdgeStatus,
      setEdgeFeatureName: jest.fn()
    }
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <HQoSBandwidthFormItem {...props}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const toggleBtn = screen.getByRole('switch', { name: 'Hierarchical QoS' })
    await waitFor(() => expect(toggleBtn).toBeChecked())
    expect(await screen.findByTestId('EdgeHqosProfileSelectionForm')).toBeVisible()
  })

  it('Test apply HQoS', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            hqosSwitch: true,
            hqosId: 'testHqosId'
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(mockedActivateHqospApi).toBeCalled())
  })

  it('Test deactivate HQoS', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            hqosSwitch: false,
            originHqosId: 'testHqosId'
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(mockedDeactivateHqosApi).toBeCalled())
  })
})