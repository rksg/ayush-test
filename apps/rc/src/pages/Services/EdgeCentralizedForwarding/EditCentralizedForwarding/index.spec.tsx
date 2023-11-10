import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { EdgeCentralizedForwardingUrls, EdgeUrlsInfo, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
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

import { mockEdgeList }                   from '../__tests__/fixtures'
import { CentralizedForwardingFormModel } from '../CentralizedForwardingForm'

import EditEdgeCentralizedForwarding from '.'

const { click } = userEvent

const mockedEditFn = jest.fn()
const mockedSubmitDataGen = jest.fn()
const mockedSetFieldFn = jest.fn()
const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))
jest.mock('../CentralizedForwardingForm', () => ({
  ...jest.requireActual('../CentralizedForwardingForm'),
  default: (props: {
    onFinish: (values: CentralizedForwardingFormModel) => Promise<boolean | void>
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div
      data-testid='rc-CentralizedForwardingForm'
    >
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))

const { result } = renderHook(() => Form.useForm())
jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
result.current[0].setFieldValue = mockedSetFieldFn
describe('Edit Edge Centralized Forwarding service', () => {
  beforeEach(() => {
    mockedEditFn.mockReset()
    mockedSubmitDataGen.mockReset()
    mockedSetFieldFn.mockReset()

    const edgeList = {
      ...mockEdgeList,
      total: 1,
      data: [mockEdgeList.data[0]]
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_, res, ctx) => res(ctx.json(edgeList))
      ),
      rest.get(
        EdgeCentralizedForwardingUrls.getEdgeCentralizedForwarding.url,
        (_, res, ctx) => res(ctx.json({ data: {} }))
      ),
      rest.patch(
        EdgeCentralizedForwardingUrls.updateEdgeCentralizedForwardingPartial.url,
        (req, res, ctx) => {
          mockedEditFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly edit service', async () => {
    mockedSubmitDataGen.mockReturnValue({
      name: 'testEditCFService',
      networkIds: ['network_1'],
      activatedNetworks: [{
        id: 'network_1',
        name: 'Network1'
      }],
      tunnelProfileId: 't-tunnelProfile-id'
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
      oper: ServiceOperation.LIST
    })

    render(<Provider>
      <EditEdgeCentralizedForwarding />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: 't-cf-id' },
        path: '/:tenantId/services/edgeCentralizedForwarding/:serviceId/edit'
      }
    })

    expect(await screen.findByTestId('rc-CentralizedForwardingForm')).toBeVisible()
    await waitFor(() => {
      expect(mockedSetFieldFn).toBeCalledWith('venueId', 'venue_00001')
    })
    expect(mockedSetFieldFn).toBeCalledWith('venueName', 'Venue01')
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        name: 'testEditCFService',
        networkIds: ['network_1'],
        tunnelProfileId: 't-tunnelProfile-id'
      })
    })
    expect(mockedEditFn).toBeCalledTimes(1)
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      }, { replace: true })
    })
  })

  it('network is allowed to be empty', async () => {
    mockedSubmitDataGen.mockReturnValue({
      name: 'testEditCFService2',
      networkIds: [],
      activatedNetworks: [],
      tunnelProfileId: 't-tunnelProfile2-id'
    })

    render(<Provider>
      <EditEdgeCentralizedForwarding />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: 't-cf-id' },
        path: '/:tenantId/services/edgeCentralizedForwarding/:serviceId/edit'
      }
    })

    expect(await screen.findByTestId('rc-CentralizedForwardingForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        name: 'testEditCFService2',
        networkIds: [],
        tunnelProfileId: 't-tunnelProfile2-id'
      })
    })
    expect(mockedEditFn).toBeCalledTimes(1)
    await waitFor(() => {
      expect(mockedNavigate).toBeCalled()
    })
  })
})