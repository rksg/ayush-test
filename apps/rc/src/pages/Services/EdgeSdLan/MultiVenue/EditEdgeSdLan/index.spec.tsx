import userEvent              from '@testing-library/user-event'
import { Form, FormInstance } from 'antd'
import { groupBy, transform } from 'lodash'
import { rest }               from 'msw'

import { edgeApi, edgeSdLanApi } from '@acx-ui/rc/services'
import {
  EdgeGeneralFixtures,
  EdgeMvSdLanExtended,
  EdgeMvSdLanNetworks,
  EdgeSdLanFixtures,
  EdgeSdLanUrls,
  EdgeUrlsInfo,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType } from '@acx-ui/rc/utils'
import {
  Provider, store
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { RequestPayload } from '@acx-ui/types'

import { sdLanFormDefaultValues } from '../Form'

import { EditEdgeSdLan } from '.'


const { mockedMvSdLanDataList, mockedMvSdLanServiceDmz } = EdgeSdLanFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

const { click } = userEvent

const mockedEditFn = jest.fn()
const mockedSubmitDataGen = jest.fn()
const mockedNavigate = jest.fn()
const mockedApiReqCallbackData = jest.fn()
const mockedApiReqSucceed = jest.fn()
const mockedSdLanViewModelReq = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedNavigate
}))

const MockForm = Form
jest.mock('../Form', () => ({
  __esModule: true,
  ...jest.requireActual('../Form'),
  EdgeSdLanFormContainer: (props: {
    form: FormInstance,
    editData: EdgeMvSdLanExtended | undefined,
    onFinish: () => Promise<boolean | void>
  }) => {
    const submitData = mockedSubmitDataGen()
    jest.spyOn(props.form, 'getFieldsValue').mockReturnValue(submitData)

    return <MockForm
      form={props.form}
      data-testid='rc-EdgeSdLanForm'
      initialValues={props.editData}
      onFinish={props.onFinish}
    >
      <div data-testid='rc-EdgeSdLanForm-dc-cluster-id'>{props.editData?.edgeClusterId}</div>
      <div data-testid='rc-EdgeSdLanForm-guestTunnelEnabled'>
        {props.editData?.isGuestTunnelEnabled+''}
      </div>
      <div data-testid='rc-EdgeSdLanForm-networks'>
        {
          // eslint-disable-next-line max-len
          props.editData?.networks && Object.entries(props.editData?.networks).map(([venueId, networks]) => {
            return `${venueId}=${networks.join(',')}`
          })}
      </div>
      <button onClick={() => {
        props.form.submit()
      }}>Submit</button>
    </MockForm>
  }
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useEdgeMvSdLanActions: () => {
    return { editEdgeSdLan: (_originData: EdgeMvSdLanExtended, req: RequestPayload) => {
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
  networks: { venue_00002: ['network_1'] },
  activatedNetworks: { venue_00002: [{
    id: 'network_1',
    name: 'Network1'
  }, {
    id: 'network_4',
    name: 'Network4'
  }] },
  tunnelProfileId: 't-tunnelProfile-id',
  isGuestTunnelEnabled: true,
  guestEdgeClusterId: 'mock_edge_id_2',
  guestEdgeClusterVenueId: 'mock_venue_id',
  guestTunnelProfileId: 't-tunnelProfile-id-2',
  guestNetworks: { venue_00002: ['network_4'] },
  activatedGuestNetworks: { venue_00002: [{
    id: 'network_4',
    name: 'Network4'
  }] }
}

const targetPath = getServiceRoutePath({
  type: ServiceType.EDGE_SD_LAN,
  oper: ServiceOperation.LIST
})

describe('Edit SD-LAN service', () => {
  beforeEach(() => {
    store.dispatch(edgeSdLanApi.util.resetApiState())
    store.dispatch(edgeApi.util.resetApiState())

    mockedEditFn.mockReset()
    mockedSubmitDataGen.mockReset()
    mockedNavigate.mockReset()
    mockedSdLanViewModelReq.mockReset()
    mockedApiReqCallbackData.mockReset().mockReturnValue([])
    mockedApiReqSucceed.mockReset().mockReturnValue(true)

    mockServer.use(
      rest.get(
        EdgeSdLanUrls.getEdgeSdLanIsDmz.url,
        (_, res, ctx) => res(ctx.json({ isGuestTunnelEnabled: true }))
      ),
      rest.get(
        EdgeSdLanUrls.getEdgeSdLan.url,
        (_, res, ctx) => res(ctx.json(mockedMvSdLanServiceDmz))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          mockedSdLanViewModelReq()
          return res(ctx.json({ data: mockedMvSdLanDataList }))
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
  })

  it('should correctly edit service', async () => {
    const originData = mockedMvSdLanDataList[0]
    const mockedDCData = {
      ...mockedDmzData,
      isGuestTunnelEnabled: false
    }

    mockServer.use(
      rest.get(
        EdgeSdLanUrls.getEdgeSdLanIsDmz.url,
        (_, res, ctx) => res(ctx.json({ isGuestTunnelEnabled: false }))
      )
    )

    mockedSubmitDataGen.mockReturnValue(mockedDCData)

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: mockedCdId },
        path: '/:tenantId/services/edgeMvEdgeSdLan/:serviceId/edit'
      }
    })

    const form = await basicCheck(false)
    expect(within(form).getByTestId('rc-EdgeSdLanForm-networks'))
      .toHaveTextContent('network_1,network_4')

    await click(within(form).getByRole('button', { name: 'Submit' }))
    const originGuestNetworks: EdgeMvSdLanNetworks = {}
    Object.entries(groupBy(originData.tunneledGuestWlans, 'venueId'))
      .forEach(([venueId, wlans]) => {
        originGuestNetworks[venueId] = wlans.map(wlan => wlan.networkId)
      })

    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        id: mockedCdId,
        venueId: mockedDCData.venueId,
        name: mockedDCData.name,
        networks: transform(mockedDCData.activatedNetworks, (result, value, key) => {
          result[key] = value.map(v => v.id)
        }, {} as EdgeMvSdLanNetworks),
        tunnelProfileId: mockedDCData.tunnelProfileId,
        isGuestTunnelEnabled: mockedDCData.isGuestTunnelEnabled,
        guestEdgeClusterId: originData.guestEdgeClusterId,
        guestEdgeClusterVenueId: mockedDCData.guestEdgeClusterVenueId,
        guestTunnelProfileId: originData.guestTunnelProfileId,
        guestNetworks: originGuestNetworks
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
    expect(mockedNavigate).toBeCalledTimes(1)
  })
  it('should correctly handle guest network enabled case', async () => {
    const mockedDmzData = {
      ...sdLanFormDefaultValues,
      name: 'testEditDMZSdLanService',
      venueId: 'mock_venue_id',
      edgeClusterId: 'mock_edge_id',
      networks: { venue_00003: ['network_2'] },
      activatedNetworks: { venue_00003: [{
        id: 'network_2',
        name: 'Network2'
      }] },
      tunnelProfileId: 't-tunnelProfile-id',
      isGuestTunnelEnabled: true,
      guestEdgeClusterId: 'mock_edge_id_2',
      guestEdgeClusterVenueId: 'mock_venue_id_2',
      guestTunnelProfileId: 't-tunnelProfile-id-2',
      guestNetworks: { venue_00003: ['network_2'] },
      activatedGuestNetworks: { venue_00003: [{
        id: 'network_2',
        name: 'Network2'
      }] }
    }
    mockedSubmitDataGen.mockReturnValue(mockedDmzData)

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: mockedCdId },
        path: '/:tenantId/services/edgeMvEdgeSdLan/:serviceId/edit'
      }
    })

    const form = await basicCheck(true)
    await click(within(form).getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(mockedEditFn).toBeCalledWith({
        id: mockedCdId,
        venueId: mockedDmzData.venueId,
        name: mockedDmzData.name,
        networks: transform(mockedDmzData.activatedNetworks, (result, value, key) => {
          result[key] = value.map(v => v.id)
        }, {} as EdgeMvSdLanNetworks),
        tunnelProfileId: mockedDmzData.tunnelProfileId,
        isGuestTunnelEnabled: mockedDmzData.isGuestTunnelEnabled,
        guestEdgeClusterId: mockedDmzData.guestEdgeClusterId,
        guestEdgeClusterVenueId: mockedDmzData.guestEdgeClusterVenueId,
        guestTunnelProfileId: mockedDmzData.guestTunnelProfileId,
        guestNetworks: transform(mockedDmzData.activatedGuestNetworks, (result, value, key) => {
          result[key] = value.map(v => v.id)
        }, {} as EdgeMvSdLanNetworks)
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
    expect(mockedNavigate).toBeCalledTimes(1)
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
        path: '/:tenantId/services/edgeMvEdgeSdLan/:serviceId/edit'
      }
    })
    const form = await basicCheck(true)
    await click(within(form).getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(mockedEditFn).toBeCalledTimes(1))
    await waitFor(() => expect(mockedConsoleFn).toBeCalled())
    expect(mockedNavigate).toBeCalledTimes(1)
  })
  it('should catch relation API error', async () => {
    mockedSubmitDataGen.mockReturnValue(mockedDmzData)
    mockedApiReqSucceed.mockReturnValue(true)
    mockedApiReqCallbackData.mockReturnValue({ status: 400 })

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: mockedCdId },
        path: '/:tenantId/services/edgeMvEdgeSdLan/:serviceId/edit'
      }
    })

    const form = await basicCheck(true)
    await click(within(form).getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(mockedEditFn).toBeCalledTimes(1))
    await waitFor(() => expect(mockedNavigate).toBeCalledTimes(1))
  })

  it('should skip req API when get profile API error', async () => {
    const mockedConsoleFn = jest.fn()
    jest.spyOn(console, 'log').mockImplementation(mockedConsoleFn)

    mockServer.use(
      rest.get(
        EdgeSdLanUrls.getEdgeSdLan.url,
        (_, res, ctx) => res(ctx.status(400))
      )
    )
    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: {
        params: { tenantId: 't-id', serviceId: mockedCdId },
        path: '/:tenantId/services/edgeMvEdgeSdLan/:serviceId/edit'
      }
    })
    const form = await screen.findByTestId('rc-EdgeSdLanForm')
    expect(form).toBeVisible()
    expect(mockedSdLanViewModelReq).toBeCalledTimes(0)
  })
})

const basicCheck = async (isDmz: boolean): Promise<HTMLElement> => {
  const form = await screen.findByTestId('rc-EdgeSdLanForm')
  expect(form).toBeVisible()
  expect(within(form).getByTestId('rc-EdgeSdLanForm-dc-cluster-id'))
    .toHaveTextContent('96B968BD2C76ED11EEA8E4B2E81F537A94')
  expect(within(form).getByTestId('rc-EdgeSdLanForm-guestTunnelEnabled'))
    .toHaveTextContent(String(isDmz))
  return form
}