import { rest } from 'msw'

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
  fields: [
    'id',
    'network'
  ],
  totalCount: 4,
  page: 1,
  data: [
    {
      id: '1',
      name: 'Network A',
      aps: 40,
      scope: 'all'
    },
    {
      id: '11',
      name: 'Network B',
      aps: 40,
      scope: 'all'
    },
    {
      id: '12',
      name: 'Network C',
      aps: 40,
      scope: 'all'
    },
    {
      id: '1111',
      name: 'Network D',
      aps: 40,
      scope: 'all'
    }
  ]
}
const detailResult = {
  id: 1,
  policyName: 'test',
  vlans: 40,
  tags: ['123','345']
}
describe('VLAN Pool Detail Page', () => {
  let params: { tenantId: string, policyId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      policyId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }
    mockServer.use(
      rest.get(
        VlanPoolUrls.getVLANPoolNetworkInstances.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        VlanPoolUrls.getVLANPoolProfileDetail.url,
        (req, res, ctx) => res(ctx.json(detailResult))
      )
    )
  })

  it('should render aaa detail page', async () => {
    render(<Provider><VLANPoolDetail /></Provider>, {
      route: { params, path: '/:tenantId/policies/vlanPool/:policyId/detail' }
    })
    expect(await screen.findByText('test')).toBeVisible()
    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeVisible()
    const body = await screen.findByRole('rowgroup', {
      name: (_, element) => element.classList.contains('ant-table-tbody')
    })
    await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(4))
  })
})
