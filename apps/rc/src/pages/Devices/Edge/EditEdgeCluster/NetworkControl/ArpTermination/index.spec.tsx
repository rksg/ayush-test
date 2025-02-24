import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { Store } from 'antd/es/form/interface'
import { rest }  from 'msw'

import { Button, StepsForm } from '@acx-ui/components'
import { useIsBetaEnabled }  from '@acx-ui/feature-toggle'
import { firmwareApi }       from '@acx-ui/rc/services'
import {
  EdgeGeneralFixtures,
  EdgeUrlsInfo,
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'


import { ArpTerminationFormItem, useHandleApplyArpTermination } from '.'

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetEdgeFeatureSetsQuery: jest.fn(() => ({
    data: {
      featureSets: [{
        featureName: 'ARP_TERMINATION',
        requiredFw: '2.3.0'
      }]
    }
  })),
  useGetEdgeClusterArpTerminationSettingsQuery: jest.fn(() => ({
    data: {
      enabled: true,
      agingTimeSec: 600
    }
  }))
}))
jest.mock('@acx-ui/rc/components', () => ({
  ApCompatibilityToolTip: ({ onClick }: { onClick: () => void }) =>
    <div data-testid='ApCompatibilityToolTip' onClick={onClick} />
}))
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))


const { mockedVenueFirmwareList } = EdgeGeneralFixtures

const mockedUpdateArptSettingsReq = jest.fn()

const MockComponentForHookTest = ({ formValues }: { formValues: Store }) => {
  const [form] = Form.useForm()
  form.setFieldsValue(formValues)
  const applyDhcp = useHandleApplyArpTermination(form, 'testVenueId', 'testClusterId')

  return (
    <Form
      form={form}
      onFinish={applyDhcp}
      children={<Button htmlType='submit'>OK</Button>}
    />
  )
}

describe('Edge Cluster Network Control Tab > ARP Termination', () => {
  let params: { tenantId: string, clusterId: string, activeTab: string }
  beforeEach(() => {
    mockedUpdateArptSettingsReq.mockReset()
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: 'testClusterId',
      activeTab: 'networkControl'
    }
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (req, res, ctx) => res(ctx.json(mockedVenueFirmwareList))
      ),
      rest.put(
        EdgeUrlsInfo.updateEdgeClusterArpTerminationSettings.url,
        (req, res, ctx) => {
          mockedUpdateArptSettingsReq(req.url.pathname, req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('renders correctly when isArpControllable is true', async () => {
    const mockVenueId = 'mock_venue_3'
    const mockClusterId= params.clusterId
    const props = {
      currentClusterStatus: {
        clusterId: mockClusterId,
        venueId: mockVenueId
      },
      setEdgeFeatureName: jest.fn()
    }

    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <ArpTerminationFormItem
            currentClusterStatus={props.currentClusterStatus}
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

    expect(await screen.findByText('ARP Termination')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'ARP Termination' })).toBeChecked()
    expect(screen.getByText('ARP Termination Aging Timer')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton')).toHaveValue('600')
  })

  it('renders correctly when isArpControllable is false', async () => {
    const mockVenueId = 'mock_venue_2'
    const mockClusterId= params.clusterId
    const props = {
      currentClusterStatus: {
        clusterId: mockClusterId,
        venueId: mockVenueId
      },
      setEdgeFeatureName: jest.fn()
    }

    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <ArpTerminationFormItem
            currentClusterStatus={props.currentClusterStatus}
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

    expect(await screen.findByText('ARP Termination')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'ARP Termination' })).toBeDisabled()
  })

  it('should invoke setEdgeFeatureName correctly when click compatibility tooltip', async () => {
    const mockVenueId = 'mock_venue_3'
    const mockClusterId= params.clusterId
    const mockSetEdgeFeatureName = jest.fn()
    const props = {
      currentClusterStatus: {
        clusterId: mockClusterId,
        venueId: mockVenueId
      },
      setEdgeFeatureName: mockSetEdgeFeatureName
    }
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <ArpTerminationFormItem {...props}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )
    const compatibilityToolTip = await screen.findByTestId('ApCompatibilityToolTip')
    await userEvent.click(compatibilityToolTip)
    expect(mockSetEdgeFeatureName).toBeCalled()
  })

  it('Test apply ARP Termination settings', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            originalArpSettings: {
              enabled: true,
              agingTimeSec: 600
            },
            arpTerminationSwitch: false,
            agingTimeSec: 600
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(mockedUpdateArptSettingsReq).toBeCalledWith(
      '/venues/testVenueId/edgeClusters/testClusterId/arpTerminationSettings',
      { agingTimeSec: 600, enabled: false }
    ))
  })

  it('should not trigger API when there is no change', async () => {
    render(
      <Provider>
        <MockComponentForHookTest
          formValues={{
            originalArpSettings: {
              enabled: true,
              agingTimeSec: 600
            },
            arpTerminationSwitch: true,
            agingTimeSec: 600
          }}
        />
      </Provider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedUpdateArptSettingsReq).not.toBeCalled()
  })

  it('should show BetaIndicator when ARP Termination is beta feature', async () => {
    jest.mocked(useIsBetaEnabled).mockReturnValue(true)
    const mockVenueId = 'mock_venue_2'
    const mockClusterId= params.clusterId
    const props = {
      currentClusterStatus: {
        clusterId: mockClusterId,
        venueId: mockVenueId
      },
      setEdgeFeatureName: jest.fn()
    }

    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <ArpTerminationFormItem
            currentClusterStatus={props.currentClusterStatus}
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

    expect(await screen.findByTestId('RocketOutlined')).toBeVisible()
  })
})