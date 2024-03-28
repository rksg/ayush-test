import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeSdLanFixtures }                             from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockedNetworkViewData } from '../__tests__/fixtures'

import { DcSdLanDetailContent } from './DcSdLanDetailContent'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const mockedSdLanData = mockedSdLanDataListP2[1]
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge SD-LAN Detail - DC', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockedNetworkViewData))
      )
    )
  })

  it('should display correctly', async () => {
    render(
      <Provider>
        <DcSdLanDetailContent data={mockedSdLanData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    const tbody = (await screen.findAllByRole('rowgroup'))
      .filter(item => item.nodeName === 'TBODY')[0]
    const rows = await within(tbody).findAllByRole('row', { name: /Network/i })
    expect(rows.length).toBe(2)
    expect(screen.getByText('Instances')).toBeVisible()
    expect(screen.queryByRole('row',
      { name: 'dpskNetwork Dynamic Pre-Shared Key (DPSK)' })).toBeValid()
  })

  it('should display SmartEdges tab correctly', async () => {
    render(
      <Provider>
        <DcSdLanDetailContent data={mockedSdLanData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    expect(await screen.findByText('Instances')).toBeVisible()
    const seTab = await screen.findByRole('tab', { name: 'SmartEdges(1)' })
    await userEvent.click(seTab)
    expect(await screen.findByRole('row',
      { name: 'SE_Cluster 1 20 15' })).toBeVisible()
  })

  it('should handle with empty data', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json({
          totalCount: 0,
          page: 1,
          data: []
        }))
      )
    )

    render(
      <Provider>
        <DcSdLanDetailContent data={undefined}/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    expect(await screen.findByText('Instances')).toBeVisible()
    await screen.findByRole('tab', { name: 'Networks(0)' })
    const seTab = await screen.findByRole('tab', { name: 'SmartEdges(0)' })
    await userEvent.click(seTab)
    expect(await screen.findByText('# of tunneled VLANs')).toBeVisible()
    expect(screen.getAllByText('--').length).toBe(3)
  })

  it('should correctly display stats data', async () => {

    render(
      <Provider>
        <DcSdLanDetailContent data={mockedSdLanData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    expect(await screen.findByText('Instances')).toBeVisible()
    const edgesTable = await screen.findByRole('tab', { name: 'SmartEdges(1)' })
    await userEvent.click(edgesTable)
    const row = await screen.findByRole('row', { name: /SE_Cluster 1/i })
    expect(row.textContent).toBe('SE_Cluster 12015')
    const vlanCell = await within(row).findByText('15')
    await userEvent.hover(vlanCell)
    // will not have tooltip when valns/guestVlans is undefined
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument()
  })
})
