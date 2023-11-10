import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeCentralizedForwardingUrls, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { CentralizedForwardingFormModel } from '../CentralizedForwardingForm'

import AddEdgeCentralizedForwarding from '.'

const { click } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedAddFn = jest.fn()
const mockedSubmitDataGen = jest.fn()

jest.mock('../CentralizedForwardingForm', () => ({
  __esModule: true,
  ...jest.requireActual('../CentralizedForwardingForm'),
  default: (props: {
    onFinish: (values: CentralizedForwardingFormModel) => Promise<boolean | void>
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div data-testid='rc-CentralizedForwardingForm'>
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))

describe('Add Edge Centralized Forwarding service', () => {
  beforeEach(() => {
    mockedAddFn.mockReset()
    mockedSubmitDataGen.mockReset()

    mockServer.use(
      rest.post(
        EdgeCentralizedForwardingUrls.addEdgeCentralizedForwarding.url,
        (req, res, ctx) => {
          mockedAddFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly add service', async () => {
    mockedSubmitDataGen.mockReturnValueOnce({
      name: 'testAddCFService',
      edgeId: '0000000001',
      corePortMac: 't-coreport-mac',
      tunnelProfileId: 't-tunnelProfile-id',
      activatedNetworks: [{
        id: 'network_1',
        name: 'Network1'
      }]
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
      oper: ServiceOperation.LIST
    })

    render(<Provider>
      <AddEdgeCentralizedForwarding />
    </Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/services/edgeCentralizedForwarding/create'
      }
    })

    expect(await screen.findByTestId('rc-CentralizedForwardingForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        name: 'testAddCFService',
        edgeId: '0000000001',
        corePortMac: 't-coreport-mac',
        tunnelProfileId: 't-tunnelProfile-id',
        networkIds: ['network_1']
      })
    })
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
      name: 'testAddCFService2',
      edgeId: '0000000002',
      corePortMac: 't-coreport2-mac',
      tunnelProfileId: 't-tunnelProfile2-id',
      activatedNetworks: []
    })

    render(<Provider>
      <AddEdgeCentralizedForwarding />
    </Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/services/edgeCentralizedForwarding/create'
      }
    })

    expect(await screen.findByTestId('rc-CentralizedForwardingForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        name: 'testAddCFService2',
        edgeId: '0000000002',
        corePortMac: 't-coreport2-mac',
        tunnelProfileId: 't-tunnelProfile2-id',
        networkIds: []
      })
    })
    expect(mockedAddFn).toBeCalledTimes(1)
    await waitFor(() => {
      expect(mockedNavigate).toBeCalled()
    })
  })
})
