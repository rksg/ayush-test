import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  EdgeSdLanFixtures,
  EdgeSdLanSettingP2,
  EdgeSdLanUrls,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { RequestPayload } from '@acx-ui/types'

import { sdLanFormDefaultValues } from '../EdgeSdLanForm'

import EditEdgeSdLan from '.'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures

const { click } = userEvent

const mockedEditFn = jest.fn()
const mockedSubmitDataGen = jest.fn()
const mockedNavigate = jest.fn()
const mockedApiReqCallbackData = jest.fn()
const mockedApiReqSucceed = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))
jest.mock('../EdgeSdLanForm', () => ({
  __esModule: true,
  ...jest.requireActual('../EdgeSdLanForm'),
  default: (props: {
    editData: EdgeSdLanSettingP2 | undefined,
    onFinish: (values: unknown) => Promise<boolean | void>
  }) => {
    const submitData = mockedSubmitDataGen()
    return <div
      data-testid='rc-EdgeSdLanForm'
    >
      <div data-testid='rc-EdgeSdLanForm-venue-id'>{props.editData?.venueId}</div>
      <button onClick={() => {
        props.onFinish(submitData)
      }}>Submit</button>
    </div>
  }
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useEdgeSdLanActions: () => {
    return { editEdgeSdLan: (_originData: EdgeSdLanSettingP2, req: RequestPayload) => {
      mockedEditFn(req.payload)
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

const mockedCdId = 't-cf-id'
const mockedDmzData = {
  ...sdLanFormDefaultValues,
  name: 'testEditDMZSdLanService',
  venueId: 'mock_venue_id',
  edgeClusterId: 'mock_edge_id',
  networkIds: ['network_1'],
  activatedNetworks: [{
    id: 'network_1',
    name: 'Network1'
  }],
  tunnelProfileId: 't-tunnelProfile-id',
  isGuestTunnelEnabled: true,
  guestEdgeClusterId: 'mock_edge_id_2',
  guestTunnelProfileId: 't-tunnelProfile-id-2',
  guestNetworkIds: ['network_4'],
  activatedGuestNetworks: [{
    id: 'network_4',
    name: 'Network4'
  }]
}

const targetPath = getServiceRoutePath({
  type: ServiceType.EDGE_SD_LAN,
  oper: ServiceOperation.LIST
})

describe('Edit SD-LAN service', () => {
  beforeEach(() => {
    mockedEditFn.mockReset()
    mockedSubmitDataGen.mockReset()
    mockedNavigate.mockReset()
    mockedApiReqCallbackData.mockReset().mockReturnValue([])
    mockedApiReqSucceed.mockReset().mockReturnValue(true)

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2 }))
      )
    )
  })

  it('should correctly edit service', async () => {
    const mockedDCData = {
      ...mockedDmzData,
      isGuestTunnelEnabled: false
    }
    mockedSubmitDataGen.mockReturnValue(mockedDCData)

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: mockedCdId },
        path: '/:tenantId/services/edgeEdgeSdLanP2/:serviceId/edit'
      }
    })

    await waitFor(async () =>
      expect(await screen.findByTestId('rc-EdgeSdLanForm-venue-id'))
        .toHaveTextContent('a307d7077410456f8f1a4fc41d861567'))

    expect(screen.getByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        id: mockedCdId,
        venueId: mockedDCData.venueId,
        name: mockedDCData.name,
        networkIds: mockedDCData.activatedNetworks.map(network => network.id),
        tunnelProfileId: mockedDCData.tunnelProfileId,
        isGuestTunnelEnabled: mockedDCData.isGuestTunnelEnabled,
        guestEdgeClusterId: mockedDCData.guestEdgeClusterId,
        guestTunnelProfileId: mockedDCData.guestTunnelProfileId,
        guestNetworkIds: mockedDCData.activatedGuestNetworks.map(network => network.id!)
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

  it('should correctly handle guest network enabled case', async () => {
    const mockedDmzData = {
      ...sdLanFormDefaultValues,
      name: 'testEditDMZSdLanService',
      venueId: 'mock_venue_id',
      edgeClusterId: 'mock_edge_id',
      networkIds: ['network_1'],
      activatedNetworks: [{
        id: 'network_1',
        name: 'Network1'
      }],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeClusterId: 'mock_edge_id_2',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_4'],
      activatedGuestNetworks: [{
        id: 'network_4',
        name: 'Network4'
      }]
    }
    mockedSubmitDataGen.mockReturnValue(mockedDmzData)

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: mockedCdId },
        path: '/:tenantId/services/edgeEdgeSdLanP2/:serviceId/edit'
      }
    })

    await waitFor(async () =>
      expect(await screen.findByTestId('rc-EdgeSdLanForm-venue-id'))
        .toHaveTextContent('a307d7077410456f8f1a4fc41d861567'))

    expect(screen.getByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        id: mockedCdId,
        venueId: mockedDmzData.venueId,
        name: mockedDmzData.name,
        networkIds: mockedDmzData.activatedNetworks.map(network => network.id),
        tunnelProfileId: mockedDmzData.tunnelProfileId,
        isGuestTunnelEnabled: mockedDmzData.isGuestTunnelEnabled,
        guestEdgeClusterId: mockedDmzData.guestEdgeClusterId,
        guestTunnelProfileId: mockedDmzData.guestTunnelProfileId,
        guestNetworkIds: mockedDmzData.activatedGuestNetworks.map(network => network.id!)
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

  it('should catch profile API error', async () => {
    const mockedConsoleFn = jest.fn()
    jest.spyOn(console, 'log').mockImplementation(mockedConsoleFn)
    mockedSubmitDataGen.mockReturnValue(mockedDmzData)
    mockedApiReqSucceed.mockReturnValue(false)

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: mockedCdId },
        path: '/:tenantId/services/edgeEdgeSdLanP2/:serviceId/edit'
      }
    })

    await waitFor(async () =>
      expect(await screen.findByTestId('rc-EdgeSdLanForm-venue-id'))
        .toHaveTextContent('a307d7077410456f8f1a4fc41d861567'))

    expect(screen.getByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledTimes(1)
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
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: mockedCdId },
        path: '/:tenantId/services/edgeEdgeSdLanP2/:serviceId/edit'
      }
    })

    await waitFor(async () =>
      expect(await screen.findByTestId('rc-EdgeSdLanForm-venue-id'))
        .toHaveTextContent('a307d7077410456f8f1a4fc41d861567'))
    expect(screen.getByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedNavigate).toBeCalledTimes(1)
    })
  })
})