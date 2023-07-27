import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { VlanPoolUrls } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import VLANPoolDetail from '.'

const list = {
  totalCount: 2,
  totalPages: 1,
  page: 1,
  data: [{
    venueId: 'ebcccef6b366415dbb85073e5aa7248c',
    venueName: 'tVenue1',
    apGroupData: [{
      apGroupId: '33e6a901d4a8492eb4a1f2b75de75af3',
      apGroupName: 'apg1',
      apCount: 0
    },
    {
      apGroupId: '81134687bde947cb86a0426995fdd442',
      apGroupName: 'apg2',
      apCount: 0
    }]
  },
  {
    venueId: '2df3c129c00e4686b11cf70dac845367',
    venueName: 'My-Venue',
    apGroupData: [
      {
        apGroupId: '8dfa1ac3147542df82f7f86fd0c2d8bc',
        apGroupName: 'ALL_APS',
        apCount: 0
      }
    ]
  }]
}
const detailResult = {
  tenantId: '4217246d0e5344b7b1e9d66d4ec4d105',
  name: 'test',
  vlanMembers: ['2-6','7-9'],
  id: '9461e5412c1b424f975cd4aee2b1eca2'
}

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
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        VlanPoolUrls.getVLANPoolPolicy.url,
        (req, res, ctx) => res(ctx.json(detailResult))
      )
    )
  })

  it('should render VLAN Pool Detail page correctly', async () => {
    render(<Provider><VLANPoolDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/policies/vlanPool/:policyId/detail' }
    })
    expect(await screen.findByText('test')).toBeVisible()
    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeVisible()
    const body = await screen.findByRole('rowgroup', {
      name: (_, element) => element.classList.contains('ant-table-tbody')
    })
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(2))
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><VLANPoolDetail /></Provider>, {
      route: { params, path: '/:tenantId/t/policies/vlanPool/:policyId/detail' }
    })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('Policies & Profiles')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'VLAN Pools'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
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
