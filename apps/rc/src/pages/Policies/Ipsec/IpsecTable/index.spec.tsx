import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { getVxlanEspProposalText, getVxlanIkeProposalText }                                                                                                   from '@acx-ui/edge/components'
import { Features, useIsSplitOn }                                                                                                                             from '@acx-ui/feature-toggle'
import { ipSecApi, useGetIpsecViewDataListQuery, useGetTunnelProfileViewDataListQuery }                                                                       from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType, IpsecUrls, getPolicyDetailsLink, getPolicyRoutePath, CommonUrlsInfo, useIsEdgeFeatureReady, EdgeTunnelProfileFixtures } from '@acx-ui/rc/utils'
import { Path }                                                                                                                                               from '@acx-ui/react-router-dom'
import { Provider, store }                                                                                                                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                                                                                        from '@acx-ui/test-utils'

import { mockedVenueQueryData, mockIpSecDetailFromListQueryWithVxlan, mockIpSecTable } from '../__tests__/fixtures'

import IpsecTable from '.'

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const mockedUsedNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: '/ecc2d7cf9d2342fdb31ae0e24958fcac/t',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetIpsecViewDataListQuery: jest.fn(),
  useGetTunnelProfileViewDataListQuery: jest.fn()
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  SimpleListTooltip: (props: {
    displayText: string,
    items: string[]
  }) => <div data-testid='SimpleListTooltip'>
    <div data-testid='SimpleListTooltip-display'>{props.displayText}</div>
    <div data-testid='SimpleListTooltip-items'>{props.items.join(', ')}</div>
  </div>
}))

jest.mock('@acx-ui/edge/components', () => ({
  ...jest.requireActual('@acx-ui/edge/components'),
  getVxlanIkeProposalText: jest.fn(),
  getVxlanEspProposalText: jest.fn()
}))

const mockUseGetIpsecViewDataListQuery = useGetIpsecViewDataListQuery as jest.Mock
const mockUseGetTunnelProfileViewDataListQuery = useGetTunnelProfileViewDataListQuery as jest.Mock

const tablePath = '/:tenantId/t/' + getPolicyRoutePath({
  type: PolicyType.IPSEC,
  oper: PolicyOperation.LIST
})
const policyId = '380043b71ed7411d8e95a41af65d0f50'
const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
}

describe('IpsecTable', () => {
  jest.mocked(useIsSplitOn)
    .mockImplementation(ff => ff === Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const mockedSingleDeleteApi = jest.fn()

  beforeEach(async () => {
    store.dispatch(ipSecApi.util.resetApiState())
    mockedSingleDeleteApi.mockClear()

    mockUseGetIpsecViewDataListQuery.mockReturnValue({ data: mockIpSecTable })
    mockUseGetTunnelProfileViewDataListQuery.mockReturnValue({ data: [] })

    mockServer.use(
      rest.delete(
        IpsecUrls.deleteIpsec.url,
        (_, res, ctx) => {
          mockedSingleDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json(mockedVenueQueryData))
      )
    )
  })

  afterEach(() => jest.clearAllMocks())

  it('should render Breadcrumb and IpsecTable correctly', async () => {
    render(
      <Provider>
        <IpsecTable />
      </Provider>,
      { route: { params, path: tablePath } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(await screen.findByText('IPsec (4)')).toBeInTheDocument()
    const rows = await screen.findAllByRole('row', { name: /ipsecProfileName/i })
    expect(rows).toHaveLength(4)
  })

  it('should navigate to IpSecDetail Page correctly', async () => {
    render(
      <Provider>
        <IpsecTable />
      </Provider>,
      { route: { params, path: tablePath } }
    )

    const ipsecProfileLink = await screen.findByRole('link',
      { name: 'ipsecProfileName4' }) as HTMLAnchorElement
    expect(ipsecProfileLink.href).toContain(`/${params.tenantId}/t/${getPolicyDetailsLink({
      type: PolicyType.IPSEC,
      oper: PolicyOperation.DETAIL,
      policyId: policyId
    })}`)
  })

  it('should delete selected row - single', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <IpsecTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /ipsecProfileName4/i })
    await user.click(within(row).getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await(within(dialog).findByText('Delete "ipsecProfileName4"?'))

    await user.click(within(dialog).getByRole('button', { name: 'Delete Profile' }))
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
        <IpsecTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /ipsecProfileName/i })
    await user.click(within(row[1]).getByRole('checkbox'))
    await user.click(within(row[3]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText('Delete "2 Profiles"?')

    await user.click(within(dialog).getByRole('button', { name: 'Delete Profiles' }))
    await waitFor(() => {
      expect(mockedSingleDeleteApi).toBeCalledTimes(2)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('should delete to show error - single', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <IpsecTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /ipsecProfileName1/i })
    await user.click(within(row).getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    await(within(dialog).findByText('You are unable to delete this record due to its usage in Network with Venue,AP LAN Port with Venue,Venue LAN Port'))
    await user.click(screen.getByRole('button', { name: 'OK' }))
  })

  describe('VxLAN IPSec supported', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_IPSEC_VXLAN_TOGGLE)

      mockUseGetIpsecViewDataListQuery.mockReturnValue(mockIpSecDetailFromListQueryWithVxlan)
      mockUseGetTunnelProfileViewDataListQuery.mockReturnValue({
        tunnelProfileNameMap: mockedTunnelProfileViewData.data.map(tp => ({
          key: tp.id,
          value: tp.name
        }))
      })
    })

    it('should display `Tunnel Usage Type` correctly', async () => {
      render(
        <Provider>
          <IpsecTable />
        </Provider>, {
          route: { params, path: tablePath }
        })

      await screen.findByText('Tunnel Usage Type')
      const vxlanRow = screen.getByRole('row', { name: /For RUCKUS Devices\(VxLAN GPE\)/ })
      expect(vxlanRow).toHaveTextContent('ipsecVxlanProfileName')
      expect(within(vxlanRow).getByText('N/A')).toBeInTheDocument()

      const softGreRow = screen.getByRole('row', { name: /For 3rd Party Devices\(SoftGRE\)/ })
      expect(softGreRow).toHaveTextContent('ipsecSoftgreProfileName')
      expect(softGreRow).toHaveTextContent('7.7.7.7')
    })

    it('should display venue instances correctly', async () => {
      render(
        <Provider>
          <IpsecTable />
        </Provider>, {
          route: { params, path: tablePath }
        })
      await screen.findByText('Tunnel Usage Type')
      const softGreRow = screen.getByRole('row', { name: /For 3rd Party Devices\(SoftGRE\)/ })
      const tooltips = within(softGreRow).getAllByTestId('SimpleListTooltip')
      expect(tooltips.length).toBe(3)
      expect(within(tooltips[2]).getByTestId('SimpleListTooltip-display')).toHaveTextContent('1')
      // eslint-disable-next-line max-len
      expect(within(tooltips[2]).getByTestId('SimpleListTooltip-items')).toHaveTextContent('mockedVenueName1')
    })

    it('should display tunnel instances correctly', async () => {
      render(
        <Provider>
          <IpsecTable />
        </Provider>, {
          route: { params, path: tablePath }
        })
      await screen.findByText('Tunnel Usage Type')
      const vxlanRow = screen.getByRole('row', { name: /For RUCKUS Devices\(VxLAN GPE\)/ })
      expect(within(vxlanRow).getByTestId('SimpleListTooltip-display')).toHaveTextContent('1')
      // eslint-disable-next-line max-len
      expect(within(vxlanRow).getByTestId('SimpleListTooltip-items')).toHaveTextContent('tunnelProfile1')
    })

    it('should display 0 venue/tunnel instance correctly', async () => {
      const mockZeroActivations = cloneDeep(mockIpSecDetailFromListQueryWithVxlan)
      mockZeroActivations.data.data[0].tunnelActivations = []
      mockZeroActivations.data.data[1].activations = []
      mockUseGetIpsecViewDataListQuery.mockReturnValue(mockZeroActivations)

      render(
        <Provider>
          <IpsecTable />
        </Provider>, {
          route: { params, path: tablePath }
        })
      await screen.findByText('Tunnel Usage Type')
      const vxlanRow = screen.getByRole('row', { name: /For RUCKUS Devices\(VxLAN GPE\)/ })
      expect(vxlanRow).toHaveTextContent(/0$/)
      expect(within(vxlanRow).queryByTestId('SimpleListTooltip-display')).toBeNull()
      // eslint-disable-next-line max-len
      const softGreRow = screen.getByRole('row', { name: /For 3rd Party Devices\(SoftGRE\)/ })
      expect(softGreRow).toHaveTextContent(/0$/)
    })

    it('should display ike proposal and esp proposal correctly', async () => {
      const mockGetVxlanIkeProposalText = jest.fn()
      const mockGetVxlanEspProposalText = jest.fn()
      jest.mocked(getVxlanIkeProposalText).mockImplementation(mockGetVxlanIkeProposalText)
      jest.mocked(getVxlanEspProposalText).mockImplementation(mockGetVxlanEspProposalText)

      render(
        <Provider>
          <IpsecTable />
        </Provider>, {
          route: { params, path: tablePath }
        })
      await screen.findByText('Tunnel Usage Type')
      screen.getByRole('row', { name: /For RUCKUS Devices\(VxLAN GPE\)/ })
      // eslint-disable-next-line max-len
      expect(mockGetVxlanIkeProposalText).toHaveBeenCalledWith(mockIpSecDetailFromListQueryWithVxlan.data.data[0])
      // eslint-disable-next-line max-len
      expect(mockGetVxlanEspProposalText).toHaveBeenCalledWith(mockIpSecDetailFromListQueryWithVxlan.data.data[0])
    })
  })
})