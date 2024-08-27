import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { EdgeQosProfileFixtures, EdgeQosProfilesUrls, EdgeQosViewData, PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
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

import { QosBandwidthFormModel } from '../QosBandwidthForm'

import EditEdgeQosBandwidth from '.'
const { mockEdgeQosProfileStatusList } = EdgeQosProfileFixtures

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
jest.mock('../QosBandwidthForm', () => ({
  __esModule: true,
  ...jest.requireActual('../QosBandwidthForm'),
  default: (props: {
    onFinish: (values: QosBandwidthFormModel) => Promise<boolean | void>
    editMode: boolean
    editData: EdgeQosViewData
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div data-testid='rc-QosBandwidthForm'>
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))

const { result } = renderHook(() => Form.useForm())
jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
result.current[0].setFieldValue = mockedSetFieldFn
const params = { tenantId: 't-id', policyId: 't-qos-id' }
const targetPath = getPolicyRoutePath({
  type: PolicyType.QOS_BANDWIDTH,
  oper: PolicyOperation.LIST
})
describe('Edit Edge QoS Profile', () => {
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
        EdgeQosProfilesUrls.getEdgeQosProfileViewDataList.url,
        (req, res, ctx) => {
          mockedGetQosReq(req.body)
          return res(ctx.json(mockEdgeQosProfileStatusList))
        }
      ),
      rest.put(
        EdgeQosProfilesUrls.updateEdgeQosProfile.url,
        (req, res, ctx) => {
          mockedEditFn(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeQosProfilesUrls.activateEdgeCluster.url,
        (req, res, ctx) => {
          mockedActivateFn(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeQosProfilesUrls.deactivateEdgeCluster.url,
        (req, res, ctx) => {
          mockedDeactivateFn(req.params)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly edit and actviate/deactivate', async () => {
    const mockQos = mockEdgeQosProfileStatusList.data[0]
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
      <EditEdgeQosBandwidth />
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
    const mockQos = mockEdgeQosProfileStatusList.data[0]
    mockedSubmitDataGen.mockReturnValue({
      trafficClassSettings: mockQos.trafficClassSettings,
      name: 'update-QoS-1',
      description: 'description'
    })
    render(<Provider>
      <EditEdgeQosBandwidth />
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

})