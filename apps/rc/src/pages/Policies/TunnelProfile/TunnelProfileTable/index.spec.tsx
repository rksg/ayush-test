import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  NetworkSegmentationUrls,
  PolicyOperation,
  PolicyType,
  TunnelProfileUrls
} from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockedNetworkOptions, mockedNsgOptions, mockedTunnelProfileViewData } from '../__tests__/fixtures'

import TunnelProfileTable from '.'

const mockedUsedNavigate = jest.fn()
const mockUseLocationValue = {
  pathname: getPolicyListRoutePath(),
  search: '',
  hash: '',
  state: null
}
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))
const mockedSingleDeleteApi = jest.fn()
const mockedBulkDeleteApi = jest.fn()

describe('TunnelProfileList', () => {
  let params: { tenantId: string }
  const tablePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.LIST
  })
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockedNsgOptions))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworkOptions))
      ),
      rest.delete(
        TunnelProfileUrls.batchDeleteTunnelProfile.url,
        (req, res, ctx) => {
          mockedBulkDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        TunnelProfileUrls.deleteTunnelProfile.url,
        (req, res, ctx) => {
          mockedSingleDeleteApi()
          return res(ctx.status(202))
        }
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

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <TunnelProfileTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
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
      expect(mockedBulkDeleteApi).toBeCalledTimes(1)
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
  })
})