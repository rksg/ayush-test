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

const { result } = renderHook(() => Form.useForm())
jest.spyOn(Form, 'useForm').mockImplementation(() => result.current)
result.current[0].setFieldValue = mockedSetFieldFn
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
    mockedSubmitDataGen.mockReturnValue({
      name: 'testEditSdLanService',
      networkIds: ['network_1'],  // the origin profile data
      activatedNetworks: [{
        id: 'network_1',
        name: 'Network1'
      }],
      tunnelProfileId: 't-tunnelProfile-id'
    })

    const targetPath = getServiceRoutePath({
      type: ServiceType.EDGE_SD_LAN_P2,
      oper: ServiceOperation.LIST
    })

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: 't-cf-id' },
        path: '/:tenantId/services/edgeEdgeSdLanP2/:serviceId/edit'
      }
    })

    await waitFor(() => expect(mockedGetSdLanReq).toBeCalled())
    await waitFor(async () =>
      expect(await screen.findByTestId('rc-EdgeSdLanForm-venue-id'))
        .toHaveTextContent('cd572eda8d494a79aa2331fdc26086d9'))

    expect(await screen.findByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        name: 'testEditSdLanService',
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

  it('should correctly handle guest network enabled case', async () => {
    const mockedDmzData = {
      name: 'testEditDMZSdLanService',
      networkIds: ['network_1'], // the origin profile data
      activatedNetworks: [{
        id: 'network_4',
        name: 'Network4'
      }],
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestTunnelProfileId: 't-tunnelProfile-id-2',
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
        params: { tenantId: 't-id', serviceId: 't-cf-id' },
        path: '/:tenantId/services/edgeEdgeSdLanP2/:serviceId/edit'
      }
    })

    await waitFor(() => expect(mockedGetSdLanReq).toBeCalled())
    await waitFor(async () =>
      expect(await screen.findByTestId('rc-EdgeSdLanForm-venue-id'))
        .toHaveTextContent('cd572eda8d494a79aa2331fdc26086d9'))

    expect(await screen.findByTestId('rc-EdgeSdLanForm')).toBeVisible()
    await click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        name: mockedDmzData.name,
        networkIds: mockedDmzData.activatedNetworks.map(item => item.id),
        tunnelProfileId: mockedDmzData.tunnelProfileId,
        guestNetworkIds: mockedDmzData.activatedGuestNetworks.map(item => item.id),
        guestTunnelProfileId: mockedDmzData.guestTunnelProfileId
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