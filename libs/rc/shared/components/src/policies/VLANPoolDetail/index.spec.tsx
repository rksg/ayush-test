import { rest } from 'msw'

import { VlanPoolUrls }                                from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { vlanPoolVenueList, vlanPoolDetail } from './__tests__/fixtures'

import { VLANPoolDetail } from '.'


describe('VLAN Pool Detail Page', () => {
  let params: { tenantId: string, policyId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      policyId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }
    mockServer.use(
      rest.post(
        VlanPoolUrls.getVLANPoolVenues.url,
        (req, res, ctx) => res(ctx.json(vlanPoolVenueList))
      ),
      rest.get(
        VlanPoolUrls.getVLANPoolPolicy.url,
        (req, res, ctx) => res(ctx.json(vlanPoolDetail))
      )
    )
  })

  it('should render VLAN Pool Detail page correctly', async () => {
    render(<Provider><VLANPoolDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/policies/vlanPool/:policyId/detail' }
    })
    expect(await screen.findByText('test')).toBeVisible()
    expect(await screen.findByText((`Instances (${vlanPoolVenueList.data.length})`))).toBeVisible()
    const body = await screen.findByRole('rowgroup', {
      name: (_, element) => element.classList.contains('ant-table-tbody')
    })
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(2))
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><VLANPoolDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/policies/vlanPool/:policyId/detail' }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'VLAN Pools'
    })).toBeVisible()
  })
})
