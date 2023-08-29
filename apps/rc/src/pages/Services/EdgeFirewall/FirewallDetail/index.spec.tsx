import { rest } from 'msw'

import { EdgeFirewallUrls, EdgeUrlsInfo }      from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockEdgeList }           from '../../../Devices/Edge/__tests__/fixtures'
import { mockedFirewallDataList } from '../__tests__/fixtures'

import FirewallDetail from '.'


const mockedUsedNavigate = jest.fn()
const mockedEdgeListReq = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Firewall Detail', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        EdgeFirewallUrls.getEdgeFirewallViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockedFirewallDataList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => {
          mockedEdgeListReq()
          return res(ctx.json(mockEdgeList))
        }
      )
    )
  })

  it('should create FirewallDetail successfully', async () => {
    render(
      <Provider>
        <FirewallDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/:serviceId/detail' }
      }
    )

    await waitFor(() => {
      expect(mockedEdgeListReq).toBeCalled()
    })
    const row = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(row.length).toBe(5)
    expect(await screen.findByText('ON (2 rules)')).toBeVisible()
    expect(await screen.findByText('ON (IN: 2 rules, OUT: 2 rules)')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <FirewallDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/firewall/:serviceId/detail' }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Firewall'
    })).toBeVisible()
  })
})
