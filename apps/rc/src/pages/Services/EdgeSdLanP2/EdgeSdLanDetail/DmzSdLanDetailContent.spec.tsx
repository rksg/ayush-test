import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeSdLanFixtures }                             from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockedNetworkViewData } from '../__tests__/fixtures'

import { DmzSdLanDetailContent } from './DmzSdLanDetailContent'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const mockedSdLanData = mockedSdLanDataListP2[0]
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge SD-LAN Detail - DMZ', () => {
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
        <DmzSdLanDetailContent data={mockedSdLanData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.queryByText('Instances')).toBeVisible()
    expect(screen.queryByText('Forward Guest Traffic to DMZ')).toBeVisible()
    expect(await screen.findByRole('row',
      { name: 'dpskNetwork Dynamic Pre-Shared Key (DPSK)' })).toBeVisible()
    const row = await screen.findByRole('row',
      { name: 'guestNetwork1 Captive Portal - Captive Portal' })
    expect(row).toBeVisible()
    expect(within(row).queryByTestId('CheckMark')).toBeValid()
  })

  it('should display SmartEdges tab correctly', async () => {
    render(
      <Provider>
        <DmzSdLanDetailContent data={mockedSdLanData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    expect(await screen.findByText('Instances')).toBeVisible()
    const seTab = await screen.findByRole('tab', { name: /SmartEdges/i })
    await userEvent.click(seTab)
    expect(await screen.findByRole('row',
      { name: 'SE_Cluster 0 12 37' })).toBeVisible()
    expect(await screen.findByRole('row',
      { name: /SE_Cluster 3/i })).toBeVisible()
  })
  it('should handle with empty venueId', async () => {
    const dataWoVenueId = _.cloneDeep(mockedSdLanData)
    dataWoVenueId.venueId = ''

    render(
      <Provider>
        <DmzSdLanDetailContent data={dataWoVenueId}/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    expect(await screen.findByText('Instances')).toBeVisible()
    await screen.findByRole('tab', { name: 'Networks(2)' })
    await screen.findByRole('tab', { name: 'SmartEdges(2)' })
    expect(screen.getAllByText('--').length).toBe(1)
  })
})
