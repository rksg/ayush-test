import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { EdgeCompatibilityFixtures, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within }             from '@acx-ui/test-utils'

import { EdgeSdLanDetail } from '.'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const { mockEdgeSdLanCompatibilities, mockEdgeSdLanApCompatibilites } = EdgeCompatibilityFixtures
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

  it('should have compatible warning', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getSdLanEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getSdLanApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanApCompatibilites)))
    )

    render(
      <Provider>
        <EdgeSdLanDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'SD-LAN' })).toBeVisible()

    const sdlanWarning = await screen.findByText(/SD-LAN is not able to be brought up on/)
    // eslint-disable-next-line testing-library/no-node-access
    const detailBtn = within(sdlanWarning.closest('.ant-space') as HTMLElement)
      .getByRole('button', { name: 'See details' })
    await screen.findByText(/Tunnel Profile is not able to be brought up on/)

    await userEvent.click(detailBtn)
    const compatibleInfoDrawer = await screen.findByRole('dialog')

    // eslint-disable-next-line max-len
    expect(await within(compatibleInfoDrawer).findByText(/RUCKUS Edge Firmware/)).toBeInTheDocument()
    expect(within(compatibleInfoDrawer).getByText('2.1.0.200')).toBeValid()
    expect(within(compatibleInfoDrawer).getByText('5 / 14')).toBeValid()

    expect(await within(compatibleInfoDrawer).findByText(/AP Firmware/)).toBeInTheDocument()
    expect(within(compatibleInfoDrawer).getByText('7.0.0.0.234')).toBeValid()
    expect(within(compatibleInfoDrawer).getByText('WIFI_7')).toBeValid()
    expect(within(compatibleInfoDrawer).getByText('4 / 16')).toBeValid()
  })
})