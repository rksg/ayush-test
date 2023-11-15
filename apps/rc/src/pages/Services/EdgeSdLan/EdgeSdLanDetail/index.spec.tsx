import { rest } from 'msw'

import { CommonUrlsInfo, EdgeSdLanUrls }       from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockedNetworkViewData, mockedSdLanDataList } from '../__tests__/fixtures'

import EdgeSdLanDetail from '.'

const mockedUsedNavigate = jest.fn()
const mockedNetworkListReq = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge SD-LAN Detail', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataList }))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => {
          mockedNetworkListReq()
          return res(ctx.json(mockedNetworkViewData))
        }
      )
    )
  })

  it('should create EdgeSdLanDetail successfully', async () => {
    render(
      <Provider>
        <EdgeSdLanDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/:serviceId/detail' }
      }
    )

    await waitFor(() => {
      expect(mockedNetworkListReq).toBeCalled()
    })
    const row = await screen.findAllByRole('row', { name: /amyNetwork/i })
    expect(row.length).toBe(1)
    expect(await screen.findByText('Instances (1)')).toBeVisible()
    expect(await screen.findByRole('row',
      { name: 'amyNetwork Dynamic Pre-Shared Key (DPSK)' })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EdgeSdLanDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/:serviceId/detail' }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'SD-LAN'
    })).toBeVisible()
  })
})
