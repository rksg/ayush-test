import userEvent from '@testing-library/user-event'

import { getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { RequestPayload } from '@acx-ui/types'

import { EdgeSdLanFormModelP2 } from '../EdgeSdLanForm'

import AddEdgeSdLan from '.'

const { click } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const mockedAddFn = jest.fn()
const mockedSubmitDataGen = jest.fn()
const mockedApiReqCallbackData = jest.fn()
const mockedApiReqSucceed = jest.fn()

jest.mock('../EdgeSdLanForm', () => ({
  __esModule: true,
  ...jest.requireActual('../EdgeSdLanForm'),
  default: (props: {
    onFinish: (values: EdgeSdLanFormModelP2) => Promise<boolean | void>
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div data-testid='rc-EdgeSdLanForm'>
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useEdgeSdLanActions: () => {
    return { addEdgeSdLan: (req: RequestPayload) => {
      mockedAddFn(req.payload)
      const cbData = mockedApiReqCallbackData()
      const isSucceed = mockedApiReqSucceed()

      return new Promise((resolve, reject) => {
        isSucceed ? resolve(true) : reject()
        if (isSucceed) {
          setTimeout(() => {
            (req.callback as Function)(cbData)
          }, 300)
        }
      })
    } }
  }
}))

const targetPath = getServiceRoutePath({
  type: ServiceType.EDGE_SD_LAN_P2,
  oper: ServiceOperation.LIST
})
const mockedDmzData = {
  name: 'testAddDMZSdLanService',
  edgeId: '0000000002',
  corePortMac: 't-coreport2-key',
  activatedNetworks: [{
    id: 'network_4',
    name: 'Network4'
  }],
  tunnelProfileId: 't-tunnelProfile-id',
  isGuestTunnelEnabled: true,
  guestEdgeId: '0000000005',
  guestTunnelProfileId: 't-tunnelProfile-id-2',
  activatedGuestNetworks: [{
    id: 'network_4',
    name: 'Network4'
  }]
}

describe('Add SD-LAN service', () => {
  beforeEach(() => {
    mockedAddFn.mockReset()
    mockedSubmitDataGen.mockReset()
    mockedNavigate.mockReset()
    mockedApiReqCallbackData.mockReset().mockReturnValue([])
    mockedApiReqSucceed.mockReset().mockReturnValue(true)
  })

  it('should correctly add service', async () => {
    const mockedFormData = {
      name: 'testAddSdLanService',
      edgeId: '0000000001',
      corePortMac: 't-coreport-key',
      tunnelProfileId: 't-tunnelProfile-id',
      activatedNetworks: [{
        id: 'network_1',
        name: 'Network1'
      }],
      isGuestTunnelEnabled: false
    }
    mockedSubmitDataGen.mockReturnValueOnce(mockedFormData)

    render(<Provider>
      <AddEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/services/edgeEdgeSdLanP2/create'
      }
    })

    expect(await screen.findByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        name: mockedFormData.name,
        edgeId: mockedFormData.edgeId,
        corePortMac: mockedFormData.corePortMac,
        tunnelProfileId: mockedFormData.tunnelProfileId,
        networkIds: mockedFormData.activatedNetworks.map(item => item.id),
        isGuestTunnelEnabled: mockedFormData.isGuestTunnelEnabled
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
    const mockeFormData = {
      name: 'testAddSdLanService2',
      edgeId: '0000000002',
      corePortMac: 't-coreport2-key',
      tunnelProfileId: 't-tunnelProfile2-id',
      activatedNetworks: [],
      isGuestTunnelEnabled: false
    }
    mockedSubmitDataGen.mockReturnValueOnce(mockeFormData)

    render(<Provider>
      <AddEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/services/edgeEdgeSdLan/create'
      }
    })

    expect(await screen.findByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        name: mockeFormData.name,
        edgeId: mockeFormData.edgeId,
        corePortMac: mockeFormData.corePortMac,
        tunnelProfileId: mockeFormData.tunnelProfileId,
        networkIds: mockeFormData.activatedNetworks.map(item => item.id),
        isGuestTunnelEnabled: mockeFormData.isGuestTunnelEnabled
      })
    })
    expect(mockedAddFn).toBeCalledTimes(1)
    await waitFor(() => {
      expect(mockedNavigate).toBeCalled()
    })
  })

  it('should correctly handle guest network enabled case', async () => {
    mockedSubmitDataGen.mockReturnValueOnce(mockedDmzData)

    render(<Provider>
      <AddEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: 't-cf-id' },
        path: '/:tenantId/services/edgeEdgeSdLanP2/create'
      }
    })

    expect(await screen.findByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledWith({
        name: mockedDmzData.name,
        edgeId: mockedDmzData.edgeId,
        corePortMac: mockedDmzData.corePortMac,
        tunnelProfileId: mockedDmzData.tunnelProfileId,
        networkIds: mockedDmzData.activatedNetworks.map(item => item.id),
        isGuestTunnelEnabled: mockedDmzData.isGuestTunnelEnabled,
        guestEdgeId: mockedDmzData.guestEdgeId,
        guestNetworkIds: mockedDmzData.activatedGuestNetworks.map(item => item.id),
        guestTunnelProfileId: mockedDmzData.guestTunnelProfileId
      })
    })
    expect(mockedAddFn).toBeCalledTimes(1)
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/t-id/t/'+targetPath,
        search: ''
      }, { replace: true })
    })
  })

  it('should catch profile API error', async () => {
    const mockedConsoleFn = jest.fn()
    jest.spyOn(console, 'log').mockImplementation(mockedConsoleFn)
    mockedSubmitDataGen.mockReturnValue(mockedDmzData)
    mockedApiReqSucceed.mockReturnValue(false)

    render(<Provider>
      <AddEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/services/edgeEdgeSdLanP2/create'
      }
    })

    expect(screen.getByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedConsoleFn).toBeCalled()
    })
    expect(mockedNavigate).toBeCalledTimes(0)
  })
  it('should catch relation API error', async () => {
    const mockedConsoleFn = jest.fn()
    jest.spyOn(console, 'log').mockImplementation(mockedConsoleFn)
    mockedSubmitDataGen.mockReturnValue(mockedDmzData)
    mockedApiReqSucceed.mockReturnValue(true)
    mockedApiReqCallbackData.mockReturnValue({ status: 400 })

    render(<Provider>
      <AddEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/services/edgeEdgeSdLanP2/create'
      }
    })

    expect(screen.getByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedAddFn).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledTimes(1)
    })
  })
})