import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import {
  EdgeGeneralFixtures,
  EdgeSdLanSettingP2,
  EdgeSdLanUrls,
  EdgeUrlsInfo,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType } from '@acx-ui/rc/utils'
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
import { RequestPayload } from '@acx-ui/types'

import { sdLanFormDefaultValues } from '../EdgeSdLanForm'

import EditEdgeSdLan from '.'

const { mockEdgeList } = EdgeGeneralFixtures

const { click } = userEvent

const mockedEditFn = jest.fn()
const mockedSubmitDataGen = jest.fn()
const mockedSetFieldFn = jest.fn()
const mockedNavigate = jest.fn()
const mockedGetSdLanReq = jest.fn()
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
      return new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)()
        }, 300)
      })
    } }
  }
}))

const { result } = renderHook(() => Form.useForm())
jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
result.current[0].setFieldValue = mockedSetFieldFn

const mockedCdId = 't-cf-id'
const mockedDmzData = {
  ...sdLanFormDefaultValues,
  name: 'testEditDMZSdLanService',
  venueId: 'mock_venue_id',
  edgeId: 'mock_edge_id',
  networkIds: ['network_1'],
  activatedNetworks: [{
    id: 'network_1',
    name: 'Network1'
  }],
  tunnelProfileId: 't-tunnelProfile-id',
  isGuestTunnelEnabled: true,
  guestEdgeId: 'mock_edge_id_2',
  guestTunnelProfileId: 't-tunnelProfile-id-2',
  guestNetworkIds: ['network_4'],
  activatedGuestNetworks: [{
    id: 'network_4',
    name: 'Network4'
  }]
}

describe('Edit SD-LAN service', () => {
  beforeEach(() => {
    mockedEditFn.mockReset()
    mockedSubmitDataGen.mockReset()
    mockedSetFieldFn.mockReset()
    mockedNavigate.mockReset()
    mockedGetSdLanReq.mockReset()
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
        EdgeSdLanUrls.getEdgeSdLan.url,
        (_, res, ctx) => {
          mockedGetSdLanReq()
          return res(ctx.json({ data: {} }))
        }
      ),
      rest.patch(
        EdgeSdLanUrls.updateEdgeSdLanPartial.url,
        (req, res, ctx) => {
          mockedEditFn(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly edit service', async () => {
    const mockedDCData = {
      ...mockedDmzData,
      isGuestTunnelEnabled: false
    }
    mockedSubmitDataGen.mockReturnValue(mockedDCData)

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_SD_LAN_P2,
      oper: ServiceOperation.LIST
    })

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
        .toHaveTextContent('cd572eda8d494a79aa2331fdc26086d9'))

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
        guestEdgeId: mockedDCData.guestEdgeId,
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
      edgeId: 'mock_edge_id',
      networkIds: ['network_1'],
      activatedNetworks: [{
        id: 'network_1',
        name: 'Network1'
      }],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeId: 'mock_edge_id_2',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworkIds: ['network_4'],
      activatedGuestNetworks: [{
        id: 'network_4',
        name: 'Network4'
      }]
    }
    mockedSubmitDataGen.mockReturnValue(mockedDmzData)

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_SD_LAN_P2,
      oper: ServiceOperation.LIST
    })

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
        .toHaveTextContent('cd572eda8d494a79aa2331fdc26086d9'))

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
        guestEdgeId: mockedDmzData.guestEdgeId,
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
})