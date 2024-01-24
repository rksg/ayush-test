import { rest } from 'msw'

import { CommonUrlsInfo, EdgeSdLanFixtures, EdgeSdLanUrls }      from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockedNetworkViewData } from '../__tests__/fixtures'

import EdgeSdLanDetail from '.'

const { mockedSdLanDataList } = EdgeSdLanFixtures

const mockedUsedNavigate = jest.fn()
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
        (req, res, ctx) => res(ctx.json(mockedNetworkViewData))
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

    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row', { name: /amyNetwork/i })
    expect(row.length).toBe(1)
    expect(await screen.findByText('Instances (1)')).toBeVisible()
    // expect(await screen.findByText('Total Tunnels: 12')).toBeVisible()
    // expect(await screen.findByText('Total VLANs: 37')).toBeVisible()
    expect(await screen.findByRole('row',
      { name: 'amyNetwork Dynamic Pre-Shared Key (DPSK)' })).toBeVisible()
  })

  // TODO: hide this temporarily and wait for furthur enhancement
  // it('should dispaly SD-LAN stats data default by 0', async () => {
  //   mockServer.use(
  //     rest.post(
  //       EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
  //       (_, res, ctx) => res(ctx.json({ data: [mockedSdLanDataList[1]] }))
  //     ))

  //   render(
  //     <Provider>
  //       <EdgeSdLanDetail />
  //     </Provider>, {
  //       route: { params, path: '/:tenantId/services/edgeSdLan/:serviceId/detail' }
  //     }
  //   )

  //   await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
  //   expect(await screen.findByText('Total Tunnels: 0')).toBeVisible()
  //   expect(await screen.findByText('Total VLANs: 0')).toBeVisible()
  // })

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
