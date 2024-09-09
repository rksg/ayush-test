import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { EdgeHqosProfileFixtures, EdgeHqosProfilesUrls, EdgeHqosViewData, PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { HqosBandwidthFormModel } from '../HqosBandwidthForm'

import EditEdgeHqosBandwidth from '.'
const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures

const { click } = userEvent

const mockedEditFn = jest.fn()
const mockedActivateFn = jest.fn()
const mockedDeactivateFn = jest.fn()
const mockedSubmitDataGen = jest.fn()
const mockedSetFieldFn = jest.fn()
const mockedNavigate = jest.fn()
const mockedGetQosReq = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))
jest.mock('../HqosBandwidthForm', () => ({
  __esModule: true,
  ...jest.requireActual('../HqosBandwidthForm'),
  default: (props: {
    onFinish: (values: HqosBandwidthFormModel) => Promise<boolean | void>
    onCancel: () => void
    editMode: boolean
    editData: EdgeHqosViewData
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div data-testid='rc-QosBandwidthForm'>
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
      <button onClick={() => {
        props.onCancel()
      }}>Cancel</button>
    </div>
  }
}))

const { result } = renderHook(() => Form.useForm())
jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
result.current[0].setFieldValue = mockedSetFieldFn
const params = { tenantId: 't-id', policyId: 't-qos-id' }
const targetPath = getPolicyRoutePath({
  type: PolicyType.HQOS_BANDWIDTH,
  oper: PolicyOperation.LIST
})
describe('Edit Edge HQoS Profile', () => {
  beforeEach(() => {
    mockedEditFn.mockReset()
    mockedActivateFn.mockReset()
    mockedDeactivateFn.mockReset()
    mockedSubmitDataGen.mockReset()
    mockedSetFieldFn.mockReset()
    mockedNavigate.mockReset()
    mockedGetQosReq.mockReset()

    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (req, res, ctx) => {
          mockedGetQosReq(req.body)
          return res(ctx.json(mockEdgeHqosProfileStatusList))
        }
      ),
      rest.put(
        EdgeHqosProfilesUrls.updateEdgeHqosProfile.url,
        (req, res, ctx) => {
          mockedEditFn(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeHqosProfilesUrls.activateEdgeCluster.url,
        (req, res, ctx) => {
          mockedActivateFn(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeHqosProfilesUrls.deactivateEdgeCluster.url,
        (req, res, ctx) => {
          mockedDeactivateFn(req.params)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly edit and actviate/deactivate', async () => {
    const mockQos = mockEdgeHqosProfileStatusList.data[0]
    const reqClusterId = mockQos.edgeClusterIds[0]
    mockedSubmitDataGen.mockReturnValue({
      trafficClassSettings: mockQos.trafficClassSettings,
      name: 'update-QoS-1',
      description: 'description',
      activateChangedClusters: { 'edge-cluster-1': true, [reqClusterId]: false },
      activateChangedClustersInfo: {
        'edge-cluster-1':
        { clusterName: 'cluster-name', venueId: 'venue-id', venueName: 'venue-name' },
        [reqClusterId]:
        { clusterName: 'cluster-name', venueId: 'venue-id', venueName: 'venue-name' }
      }
    })
    render(<Provider>
      <EditEdgeHqosBandwidth />
    </Provider>, {
      route: { params }
    })

    await waitFor(() => expect(mockedGetQosReq).toBeCalled())

    expect(await screen.findByTestId('rc-QosBandwidthForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        trafficClassSettings: mockQos.trafficClassSettings,
        name: 'update-QoS-1',
        description: 'description'
      })
    })
    await waitFor(() => expect(mockedActivateFn).toBeCalledTimes(1))
    await waitFor(() => expect(mockedDeactivateFn).toBeCalledTimes(1))
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      }, { replace: true })
    })
  })

  it('should correctly edit and no actviate/deactivate', async () => {
    const mockQos = mockEdgeHqosProfileStatusList.data[0]
    mockedSubmitDataGen.mockReturnValue({
      trafficClassSettings: mockQos.trafficClassSettings,
      name: 'update-QoS-1',
      description: 'description'
    })
    render(<Provider>
      <EditEdgeHqosBandwidth />
    </Provider>, {
      route: { params }
    })

    await waitFor(() => expect(mockedGetQosReq).toBeCalled())

    expect(await screen.findByTestId('rc-QosBandwidthForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        trafficClassSettings: mockQos.trafficClassSettings,
        name: 'update-QoS-1',
        description: 'description'
      })
    })
    await waitFor(() => expect(mockedActivateFn).toBeCalledTimes(0))
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      }, { replace: true })
    })
  })

  it('should navigate to service list when click cancel', async () => {
    render(<Provider>
      <EditEdgeHqosBandwidth />
    </Provider>, {
      route: { params }
    })

    expect(await screen.findByTestId('rc-QosBandwidthForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      })
    })
  })

})
