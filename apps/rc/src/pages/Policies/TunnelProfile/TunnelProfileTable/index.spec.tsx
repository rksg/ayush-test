import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features }                             from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                from '@acx-ui/rc/components'
import { networkApi, pinApi, tunnelProfileApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  EdgePinUrls,
  EdgeSdLanUrls,
  EdgeTunnelProfileFixtures,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  TunnelProfileUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockedNetworkOptions, mockedPinOptions } from '../__tests__/fixtures'

import TunnelProfileTable from '.'
const {
  mockedTunnelProfileViewData,
  mockedDefaultVlanVxlanTunnelProfileViewData
} = EdgeTunnelProfileFixtures
const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
const mockedUsedNavigate = jest.fn()
const mockUseLocationValue = {
  pathname: getPolicyListRoutePath(),
  search: '',
  hash: '',
  state: null
}
const mockedSdLanDataList = {
  totalCount: 1,
  data: [{ id: 'testSDLAN' }]
}
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const mockedSingleDeleteApi = jest.fn()

describe('TunnelProfileList', () => {
  let params: { tenantId: string }
  const tablePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.LIST
  })
  beforeEach(() => {
    params = {
      tenantId: tenantId
    }
    store.dispatch(tunnelProfileApi.util.resetApiState())
    store.dispatch(pinApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    mockedSingleDeleteApi.mockClear()

    mockServer.use(
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      ),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_, res, ctx) => res(ctx.json(mockedPinOptions))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockedNetworkOptions))
      ),
      rest.delete(
        TunnelProfileUrls.deleteTunnelProfile.url,
        (_, res, ctx) => {
          mockedSingleDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataList }))
      )
    )
  })

  it('should create TunnelProfileList successfully', async () => {
    render(
      <Provider>
        <TunnelProfileTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /tunnelProfile/i })
    expect(row.length).toBe(2)
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <TunnelProfileTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('TunnelProfile detail page link should be correct', async () => {
    render(
      <Provider>
        <TunnelProfileTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const smartEdgeLink = await screen.findByRole('link',
      { name: 'tunnelProfile1' }) as HTMLAnchorElement
    expect(smartEdgeLink.href)
      .toContain(`/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.TUNNEL_PROFILE,
        oper: PolicyOperation.DETAIL,
        policyId: 'tunnelProfileId1'
      })}`)
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <TunnelProfileTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /tunnelProfile1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.TUNNEL_PROFILE,
        oper: PolicyOperation.EDIT,
        policyId: 'tunnelProfileId1'
      })}`,
      hash: '',
      search: ''
    })
  })

  it('edit button will remove when select above 1 row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <TunnelProfileTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /tunnelProfile/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    await user.click(within(row[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should delete selected row - single', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <TunnelProfileTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /tunnelProfile1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText('Delete "tunnelProfile1"?')
    await user.click(within(dialog).getByRole('button', { name: 'Delete Policy' }))
    await waitFor(() => {
      expect(mockedSingleDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('should delete selected row - multiple', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <TunnelProfileTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /tunnelProfile/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    await user.click(within(row[1]).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText('Delete "2 Policy"?')
    await user.click(within(dialog).getByRole('button', { name: 'Delete Policy' }))
    await waitFor(() => {
      expect(mockedSingleDeleteApi).toBeCalledTimes(2)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('edit button will remove when select Default Tunnel Profile', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <TunnelProfileTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /Default/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
  })

  describe('when Keep Alive is ready', () => {
    beforeEach(() => {
      mockServer.use(
        rest.post(
          TunnelProfileUrls.getTunnelProfileViewDataList.url,
          (req, res, ctx) => res(ctx.json(mockedDefaultVlanVxlanTunnelProfileViewData))
        )
      )
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE)
    })

    it('should display Network Segment Type column', async () => {
      render(
        <Provider>
          <TunnelProfileTable />
        </Provider>, {
          route: { params, path: tablePath }
        })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByRole('columnheader', { name: 'Network Segment Type' }))
        .toBeVisible()
    })
  })

  describe('when SD-LAN is ready', () => {
    const mockedSdLanReq = jest.fn()
    const mockedSdLanDataList = {
      totalCount: 1,
      data: [{ id: 'mocked_sdlan_id', name: 'testSDLAN' }]
    }

    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGES_TOGGLE
          || ff === Features.EDGES_SD_LAN_TOGGLE
          || ff === Features.EDGES_SD_LAN_HA_TOGGLE)
      mockServer.use(
        rest.post(
          TunnelProfileUrls.getTunnelProfileViewDataList.url,
          (req, res, ctx) => res(ctx.json(mockedDefaultVlanVxlanTunnelProfileViewData))
        ),
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedSdLanReq()
            return res(ctx.json(mockedSdLanDataList))
          }
        )
      )
    })

    it('should display SD-LAN column', async () => {
      render(
        <Provider>
          <TunnelProfileTable />
        </Provider>, {
          route: { params, path: tablePath }
        })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      await screen.findAllByRole('row', { name: /Default/i })
      await screen.findByRole('columnheader', { name: 'SD-LAN' })
      const tableFilters = await screen.findAllByTestId('options-selector')
      await waitFor(() => {
        expect(tableFilters.length).toBe(2)
      })
      expect(tableFilters[0]).toHaveTextContent(/SD-LAN/)
      expect(tableFilters[1]).toHaveTextContent(/Networks/)
      expect(mockedSdLanReq).toBeCalled()
    })

    it('edit button and delete button will remove when select VLAN_VxLAN Default Tunnel Profile',
      async () => {
        const user = userEvent.setup()
        render(
          <Provider>
            <TunnelProfileTable />
          </Provider>, {
            route: { params, path: tablePath }
          })

        await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
        // eslint-disable-next-line max-len
        const row = await screen.findAllByRole('row', { name: /Default tunnel profile \(SD-LAN\)/i })
        await user.click(within(row[0]).getByRole('checkbox'))
        expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
        expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
      })
  })

  describe('when L2GRE is ready', () => {
    const mockedSdLanReq = jest.fn()
    const mockedSdLanDataList = {
      totalCount: 1,
      data: [{ id: 'mocked_sdlan_id', name: 'testSDLAN' }]
    }

    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_L2GRE_TOGGLE
          || ff === Features.EDGES_SD_LAN_TOGGLE
          || ff === Features.EDGES_SD_LAN_HA_TOGGLE
          || ff === Features.EDGE_PIN_HA_TOGGLE
        )

      mockServer.use(
        rest.post(
          TunnelProfileUrls.getTunnelProfileViewDataList.url,
          (req, res, ctx) => res(ctx.json(mockedDefaultVlanVxlanTunnelProfileViewData))
        ),
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedSdLanReq()
            return res(ctx.json(mockedSdLanDataList))
          }
        )
      )
    })

    it('should display Tunnel Type, Destination SD-LAN and Personal Identity Network column',
      async () => {
        render(
          <Provider>
            <TunnelProfileTable />
          </Provider>, {
            route: { params, path: tablePath }
          })

        await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
        await screen.findAllByRole('row', { name: /Default/i })
        await screen.findByRole('columnheader', { name: 'Tunnel Type' })
        await screen.findByRole('columnheader', { name: 'Destination' })
        await screen.findByRole('columnheader', { name: 'Personal Identity Network' })
        await screen.findByRole('columnheader', { name: 'SD-LAN' })
        const tableFilters = await screen.findAllByTestId('options-selector')
        await waitFor(() => {
          expect(tableFilters.length).toBe(3)
        })
        expect(tableFilters[0]).toHaveTextContent(/Tunnel Type/)
        expect(tableFilters[1]).toHaveTextContent(/Personal Identity Network/)
        expect(tableFilters[2]).toHaveTextContent(/SD-LAN/)
      })

    it('show edit and delete button when select Default Tunnel Profile', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <TunnelProfileTable />
        </Provider>, {
          route: { params, path: tablePath }
        })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const row = await screen.findAllByRole('row', { name: /Default tunnel profile \(SD-LAN\)/i })
      await user.click(within(row[0]).getByRole('checkbox'))
      expect(screen.queryByRole('button', { name: 'Edit' })).toBeVisible()
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeVisible()
    })
  })
})