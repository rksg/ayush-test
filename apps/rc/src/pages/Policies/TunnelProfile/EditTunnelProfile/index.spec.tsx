import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }                                             from '@acx-ui/feature-toggle'
import { EdgeSdLanUrls, EdgeTunnelProfileFixtures, NetworkSegmentationUrls, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                  from '@acx-ui/test-utils'

import EditTunnelProfile from '.'

const {
  mockedTunnelProfileData,
  mockedDefaultTunnelProfileData
} = EdgeTunnelProfileFixtures
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
const editViewPath = '/:tenantId/t/policies/tunnelProfile/:policyId/edit'

describe('EditTunnelProfile', () => {
  let params: { tenantId: string, policyId: string }
  beforeEach(() => {
    params = {
      tenantId: tenantId,
      policyId: 'testPolicyId'
    }

    mockServer.use(
      rest.put(
        TunnelProfileUrls.updateTunnelProfile.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        TunnelProfileUrls.getTunnelProfile.url,
        (req, res, ctx) => res(ctx.json(mockedTunnelProfileData))
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
    const policyNameField = await screen.findByRole('textbox', { name: 'Profile Name' })
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

    await waitFor(async () => {
      expect(await screen.findByRole('textbox', { name: 'Profile Name' })).toBeDisabled()
    })
    expect(await screen.findByRole('textbox', { name: 'Profile Name' })).toBeDisabled()
    expect(await screen.findByRole('switch', { name: 'Force Fragmentation' })).toBeDisabled()
    await (await screen.findAllByRole('radio')).forEach(item => {
      expect(item).toBeDisabled()
    })
    const ageTimeMinutesInput = await (await screen.findAllByRole('spinbutton'))
      .filter(ele => ele.id === 'ageTimeMinutes')[0]
    expect(ageTimeMinutesInput).toBeDisabled()
  })

  describe('when SD-LAN is ready', () => {
    const mockNsgList = {
      totalCount: 0,
      data: []
    }

    const mockedSdLanDataList = {
      totalCount: 1,
      data: [{ id: 'testSDLAN' }]
    }

    const mockedReqSdLan = jest.fn()
    const mockedReqNSG = jest.fn()
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation((flag: string) => {
        if (flag === Features.EDGES_SD_LAN_TOGGLE || flag === Features.EDGES_TOGGLE) return true
        return false
      })
      jest.mocked(useIsTierAllowed).mockReturnValue(true)

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedReqSdLan()
            return res(ctx.json(mockedSdLanDataList))
          }
        ),
        rest.post(
          NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
          (_, res, ctx) => {
            mockedReqNSG()
            return res(ctx.json(mockNsgList))
          }
        )
      )
    })

    it('should lock type fields when it is used in NSG/SD-LAN', async () => {
      render(
        <Provider>
          <EditTunnelProfile />
        </Provider>
        , { route: { path: editViewPath, params } }
      )

      await waitFor(() => {
        expect(mockedReqSdLan).toBeCalled()
      })
      expect(mockedReqNSG).toBeCalled()
      const typeField = await screen.findByRole('combobox', { name: 'Tunnel Type' })
      expect(typeField).toBeDisabled()
    })
  })
})
