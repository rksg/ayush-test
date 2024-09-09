import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeHqosProfilesUrls, PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { HqosBandwidthFormModel } from '../HqosBandwidthForm'

import AddEdgeHqosBandwidth from '.'

const { click } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedAddFn = jest.fn()
const mockedActivateFn = jest.fn()
const mockedSubmitDataGen = jest.fn()

jest.mock('../HqosBandwidthForm', () => ({
  __esModule: true,
  ...jest.requireActual('../HqosBandwidthForm'),
  default: (props: {
    onFinish: (values: HqosBandwidthFormModel) => Promise<boolean | void>
    onCancel: () => void
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

const params = { tenantId: 't-id' }
const targetPath = getPolicyRoutePath({
  type: PolicyType.HQOS_BANDWIDTH,
  oper: PolicyOperation.LIST
})

describe('Add Edge HQoS Profile', () => {
  beforeEach(() => {
    mockedAddFn.mockReset()
    mockedActivateFn.mockReset()
    mockedSubmitDataGen.mockReset()

    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.addEdgeHqosProfile.url,
        (req, res, ctx) => {
          mockedAddFn(req.body)
          return res(ctx.json({ response: { id: 't-qos-id' } }))
        }
      ),
      rest.put(
        EdgeHqosProfilesUrls.activateEdgeCluster.url,
        (req, res, ctx) => {
          mockedActivateFn(req.params)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly add and activate', async () => {
    mockedSubmitDataGen.mockReturnValueOnce({
      trafficClassSettings: [
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: 'VIDEO',
          priority: 'HIGH',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: 'VOICE',
          priority: 'HIGH',
          priorityScheduling: false
        }
      ],
      name: 'Test-QoS-1',
      description: 'description',
      activateChangedClusters: { 'edge-cluster-1': true },
      activateChangedClustersInfo: { 'edge-cluster-1':
        { clusterName: 'cluster-name', venueId: 'venue-id', venueName: 'venue-name' } }
    })
    render(<Provider>
      <AddEdgeHqosBandwidth />
    </Provider>, {
      route: { params }
    })

    expect(await screen.findByTestId('rc-QosBandwidthForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        trafficClassSettings: [
          {
            maxBandwidth: 100,
            minBandwidth: 1,
            trafficClass: 'VIDEO',
            priority: 'HIGH',
            priorityScheduling: false
          },
          {
            maxBandwidth: 100,
            minBandwidth: 1,
            trafficClass: 'VOICE',
            priority: 'HIGH',
            priorityScheduling: false
          }
        ],
        name: 'Test-QoS-1',
        description: 'description'
      })
    })

    await waitFor(() => expect(mockedActivateFn).toBeCalledTimes(1))
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      }, { replace: true })
    })
  })

  it('should correctly add and no activate', async () => {
    mockedSubmitDataGen.mockReturnValueOnce({
      trafficClassSettings: [
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: 'VIDEO',
          priority: 'HIGH',
          priorityScheduling: false
        }
      ],
      name: 'Test-QoS-1',
      description: 'description'
    })
    render(<Provider>
      <AddEdgeHqosBandwidth />
    </Provider>, {
      route: { params }
    })

    expect(await screen.findByTestId('rc-QosBandwidthForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        trafficClassSettings: [
          {
            maxBandwidth: 100,
            minBandwidth: 1,
            trafficClass: 'VIDEO',
            priority: 'HIGH',
            priorityScheduling: false
          }
        ],
        name: 'Test-QoS-1',
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
      <AddEdgeHqosBandwidth />
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
