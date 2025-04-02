import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                                                    from '@acx-ui/feature-toggle'
import { edgeSdLanApi, pinApi, tunnelProfileApi }                                                                    from '@acx-ui/rc/services'
import { EdgePinUrls, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeTunnelProfileFixtures, EdgeUrlsInfo, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                           from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved }                                            from '@acx-ui/test-utils'

import EditTunnelProfile from '.'

const {
  mockedTunnelProfileData,
  mockedDefaultTunnelProfileData
} = EdgeTunnelProfileFixtures
const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
}))
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsTierAllowed: jest.fn(),
  useIsSplitOn: jest.fn(),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))
const editViewPath = '/:tenantId/t/policies/tunnelProfile/:policyId/edit'

describe('EditTunnelProfile', () => {
  let params: { tenantId: string, policyId: string }
  beforeEach(() => {
    params = {
      tenantId: tenantId,
      policyId: 'testPolicyId'
    }

    store.dispatch(tunnelProfileApi.util.resetApiState())

    mockServer.use(
      rest.put(
        TunnelProfileUrls.updateTunnelProfile.url,
        (_req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        TunnelProfileUrls.getTunnelProfile.url,
        (_req, res, ctx) => res(ctx.json(mockedTunnelProfileData))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterServiceList.url,
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })
  it('should update tunnel profile successful', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditTunnelProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, 'TestTunnel')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/tunnelProfile/list`,
      hash: '',
      search: ''
    }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EditTunnelProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Tunnel Profile'
    })).toBeVisible()
  })

  it('Click cancel button and go back to list page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditTunnelProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/tunnelProfile/list`,
      hash: '',
      search: ''
    })
  })

  it('all fields should be grey out when it is default profile', async () => {
    mockServer.use(
      rest.get(
        TunnelProfileUrls.getTunnelProfile.url,
        (_, res, ctx) => res(ctx.json(mockedDefaultTunnelProfileData))
      )
    )

    render(
      <Provider>
        <EditTunnelProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await waitFor(async () => {
      expect(screen.getByRole('textbox', { name: 'Profile Name' })).toBeDisabled()
    })
    expect(screen.getByRole('textbox', { name: 'Profile Name' })).toBeDisabled()
    expect(screen.getByRole('switch')).toBeDisabled()
    const radioButtons = await screen.findAllByRole('radio')
    radioButtons.forEach(item => {
      expect(item).toBeDisabled()
    })
    const ageTimeMinutesInput = (await screen.findAllByRole('spinbutton'))
      .filter(ele => ele.id === 'ageTimeMinutes')[0]
    expect(ageTimeMinutesInput).toBeDisabled()
  })

  describe('when SD-LAN is ready', () => {
    const mockPinList = {
      totalCount: 0,
      data: []
    }

    const mockedSdLanDataList = {
      totalCount: 1,
      data: [{ id: 'testSDLAN' }]
    }

    const mockedReqSdLan = jest.fn()
    const mockedReqPin = jest.fn()
    beforeEach(() => {
      store.dispatch(edgeSdLanApi.util.resetApiState())
      store.dispatch(pinApi.util.resetApiState())
      mockedReqSdLan.mockClear()
      mockedReqPin.mockClear()

      jest.mocked(useIsSplitOn).mockImplementation((flag: string) => {
        if (flag === Features.EDGES_SD_LAN_TOGGLE ||
          flag === Features.EDGES_TOGGLE ||
          flag === Features.EDGE_PIN_HA_TOGGLE) return true
        return false
      })

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedReqSdLan()
            return res(ctx.json(mockedSdLanDataList))
          }
        ),
        rest.post(
          EdgePinUrls.getEdgePinStatsList.url,
          (_, res, ctx) => {
            mockedReqPin()
            return res(ctx.json(mockPinList))
          }
        )
      )
    })

    it('should lock type fields when it is used in PIN / SD-LAN P1', async () => {
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.EDGE_ADV)

      render(
        <Provider>
          <EditTunnelProfile />
        </Provider>
        , { route: { path: editViewPath, params } }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(mockedReqSdLan).toBeCalled()
      expect(mockedReqPin).toBeCalled()
      jest.mocked(useIsTierAllowed).mockReset()
    })

    it('should lock type fields when it is used in SD-LAN HA case', async () => {
      jest.mocked(useIsSplitOn).mockImplementation((flag: string) => {
        if (flag === Features.EDGES_SD_LAN_HA_TOGGLE ||
          flag === Features.EDGES_TOGGLE) return true
        return false
      })

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedReqSdLan()
            return res(ctx.json({ data: mockedSdLanDataListP2 }))
          }
        )
      )
      render(
        <Provider>
          <EditTunnelProfile />
        </Provider>
        , { route: { path: editViewPath, params: {
          ...params,
          policyId: mockedSdLanDataListP2[0].tunnelProfileId
        } } }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(mockedReqSdLan).toBeCalled()
      expect(mockedReqPin).not.toBeCalled()
      expect(screen.queryByText('Enable NAT-T Support')).not.toBeInTheDocument()
    })
  })

  describe('when NAT-T Support P1 is ready', () => {
    const mockedReqSdLan = jest.fn()
    beforeEach(() => {
      jest.mocked(useIsTierAllowed).mockImplementation((flag: string) => {
        if (flag === TierFeatures.EDGE_NAT_T ) return true
        return false
      })
      jest.mocked(useIsSplitOn).mockImplementation((flag: string) => {
        if (flag === Features.EDGES_TOGGLE ||
          flag === Features.EDGES_SD_LAN_HA_TOGGLE ||
          flag === Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE ||
          flag === Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE) return true
        return false
      })

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedReqSdLan()
            return res(ctx.json({ data: mockedSdLanDataListP2 }))
          }
        )
      )
    })

    it('should display "NAT-T Support" field and unlock it when used by SD-LAN', async () => {
      render(
        <Provider>
          <EditTunnelProfile />
        </Provider>
        , { route: { path: editViewPath, params: {
          ...params,
          policyId: mockedSdLanDataListP2[0].tunnelProfileId
        } } }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(mockedReqSdLan).toBeCalled()
      const vlanVxlanRadio = await screen.findByRole('radio', { name: 'VLAN to VNI map' })
      expect(vlanVxlanRadio).toBeChecked()
      expect(vlanVxlanRadio).toBeDisabled()
      expect(screen.getByText('Enable NAT-T Support')).toBeInTheDocument()
      const switchBtns = screen.getAllByRole('switch')
      const natTraversalSwitch = switchBtns.find(btn => btn.id === 'natTraversalEnabled')
      expect(natTraversalSwitch).toBeEnabled()
    })

    it('should display "NAT-T Support" field and lock it when used by DMZ', async () => {
      render(
        <Provider>
          <EditTunnelProfile />
        </Provider>
        , { route: { path: editViewPath, params: {
          ...params,
          policyId: mockedSdLanDataListP2[0].guestTunnelProfileId
        } } }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(mockedReqSdLan).toBeCalled()
      const vlanVxlanRadio = await screen.findByRole('radio', { name: 'VLAN to VNI map' })
      expect(vlanVxlanRadio).toBeChecked()
      expect(vlanVxlanRadio).toBeDisabled()
      expect(screen.getByText('Enable NAT-T Support')).toBeInTheDocument()
      const switchBtns = screen.getAllByRole('switch')
      const natTraversalSwitch = switchBtns.find(btn => btn.id === 'natTraversalEnabled')
      expect(natTraversalSwitch).toBeDisabled()
    })

  })

  describe('when L2GRE is ready', () => {
    const mockPinList = {
      totalCount: 0,
      data: []
    }

    const mockedSdLanDataList = {
      totalCount: 1,
      data: [{ id: 'testSDLAN' }]
    }

    const mockedReqSdLan = jest.fn()
    const mockedReqPin = jest.fn()
    beforeEach(() => {
      store.dispatch(edgeSdLanApi.util.resetApiState())
      store.dispatch(pinApi.util.resetApiState())
      mockedReqSdLan.mockClear()
      mockedReqPin.mockClear()

      jest.mocked(useIsSplitOn).mockImplementation((flag: string) => {
        if (flag === Features.EDGES_SD_LAN_TOGGLE ||
          flag === Features.EDGES_TOGGLE ||
          flag === Features.EDGES_SD_LAN_HA_TOGGLE ||
          flag === Features.EDGE_PIN_HA_TOGGLE ||
          flag === Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE ||
          flag === Features.EDGE_L2GRE_TOGGLE
        ) return true
        return false
      })

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedReqSdLan()
            return res(ctx.json(mockedSdLanDataList))
          }
        ),
        rest.post(
          EdgePinUrls.getEdgePinStatsList.url,
          (_, res, ctx) => {
            mockedReqPin()
            return res(ctx.json(mockPinList))
          }
        )
      )
    })

    it('should lock type fields when it is used in PIN / SD-LAN P1', async () => {
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.EDGE_ADV)

      render(
        <Provider>
          <EditTunnelProfile />
        </Provider>
        , { route: { path: editViewPath, params } }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(mockedReqSdLan).toBeCalled()
      expect(mockedReqPin).toBeCalled()

      jest.mocked(useIsTierAllowed).mockReset()
    })

    it('should lock disabed fields when it is used in SD-LAN HA case', async () => {
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.EDGE_L2GRE)
      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedReqSdLan()
            return res(ctx.json({ data: mockedSdLanDataListP2 }))
          }
        )
      )
      render(
        <Provider>
          <EditTunnelProfile />
        </Provider>
        , { route: { path: editViewPath, params: {
          ...params,
          policyId: mockedSdLanDataListP2[0].tunnelProfileId
        } } }
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(mockedReqSdLan).toBeCalled()
      expect(mockedReqPin).not.toBeCalled()
      expect(screen.getByRole('radio', { name: 'VLAN to VNI map' })).toBeDisabled()
      expect(screen.getByRole('radio', { name: 'VxLAN GPE' })).toBeDisabled()
      expect(screen.getByRole('radio', { name: 'L2GRE' })).toBeDisabled()
      expect(screen.getByRole('combobox', { name: 'Destination RUCKUS Edge cluster' }))
        .toBeDisabled()
      jest.mocked(useIsTierAllowed).mockReset()
    })
  })
})
