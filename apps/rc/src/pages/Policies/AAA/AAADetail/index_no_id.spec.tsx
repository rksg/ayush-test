import { rest } from 'msw'

import { AaaUrls }  from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import AAAPolicyDetail from '.'

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
      network: {
        id: '6',
        name: 'Network A',
        captiveType: 'Open'
      }
    },
    {
      id: '7',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8d',
        name: 'Network B',
        captiveType: 'Captive Portal - 3rd Party Captive Portal (WiSPr)'
      }
    },
    {
      id: '8',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8f',
        name: 'Network C',
        captiveType: 'AAA (802.1x)'
      }
    },
    {
      id: '4',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8g',
        name: 'Network E',
        captiveType: 'Captive Portal - Self Sign In'
      }
    }
  ]
}
const detailResult = {
  id: 1,
  networkIds: [] as string[],
  name: 'test',
  type: 'AUTHENTICATION',
  primary: {
    ip: '2.2.2.2',
    port: 101,
    sharedSecret: 'xxxxxxxx'
  },
  secondary: {
    ip: '2.2.2.2',
    port: 102,
    sharedSecret: 'xxxxxxxx'
  },
  tags: ['123','345']
}
let params: { tenantId: string, policyId: string }
params = {
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  policyId: '373377b0cb6e46ea8982b1c80aabe1fa'
}
describe('AAA Detail Page', () => {
  it('should render aaa authentication page', async () => {
    await aaaAuth()
  })
})
async function aaaAuth () {
  mockServer.use(
    rest.get(
      AaaUrls.getAAANetworkInstances.url,
      (req, res, ctx) => res(ctx.json(list))
    ),
    rest.get(
      AaaUrls.getAAAProfileDetail.url,
      (req, res, ctx) => res(ctx.json(detailResult))
    )
  )
  render(<Provider><AAAPolicyDetail /></Provider>, {
    route: { params, path: '/:tenantId/policies/aaa/:policyId/detail' }
  })
  expect(await screen.findByText('test')).toBeVisible()
  expect(await screen.findByText((`Instances (${list.data.length})`))).toBeVisible()
  const body = await screen.findByRole('rowgroup', {
    name: (_, element) => element.classList.contains('ant-table-tbody')
  })
  await waitFor(() => expect(within(body).getAllByRole('row')).toHaveLength(4))
}
