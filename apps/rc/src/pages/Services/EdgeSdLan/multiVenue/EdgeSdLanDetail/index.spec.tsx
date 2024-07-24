import { rest } from 'msw'

import { EdgeSdLanFixtures, EdgeSdLanUrls }                      from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import EdgeSdLanDetail from '.'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./DcSdLanDetailContent', () => ({
  DcSdLanDetailContent: () => <div data-testid='DcSdLanDetailContent' />
}))
jest.mock('./DmzSdLanDetailContent', () => ({
  DmzSdLanDetailContent: () => <div data-testid='DmzSdLanDetailContent' />
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
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2 }))
      )
    )
  })

  it('should display DMZ EdgeSdLanDetail correctly', async () => {
    render(
      <Provider>
        <EdgeSdLanDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('DmzSdLanDetailContent')).toBeVisible()
  })

  it('should display DC EdgeSdLanDetail correctly', async () => {
    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2.slice(1) }))
      )
    )

    render(
      <Provider>
        <EdgeSdLanDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByTestId('DcSdLanDetailContent')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EdgeSdLanDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'My Services' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'SD-LAN' })).toBeVisible()
  })
})
