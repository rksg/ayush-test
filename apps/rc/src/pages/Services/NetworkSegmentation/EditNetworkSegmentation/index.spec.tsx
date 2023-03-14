/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeDhcpUrls, EdgeUrlsInfo, NetworkSegmentationUrls } from '@acx-ui/rc/utils'
import { Provider }                                                            from '@acx-ui/store'
import {
  mockServer, render,
  screen
} from '@acx-ui/test-utils'

import { mockEdgeData, mockEdgeDhcpDataList, mockNetworkGroup, mockNsgData, mockNsgSwitchInfoData, mockVenueData, mockVenueNetworkData } from '../__tests__/fixtures'

import EditNetworkSegmentation from '.'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const updateNsgPath = '/:tenantId/services/networkSegmentation/:serviceId/edit'

describe('Update NetworkSegmentation', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpByEdgeId.url,
        (req, res, ctx) => res(ctx.status(404))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList))
      ),
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(mockVenueNetworkData))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(mockNetworkGroup))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.status(200))
      ),
      rest.get(
        NetworkSegmentationUrls.getNetworkSegmentationGroupById.url,
        (req, res, ctx) => res(ctx.json(mockNsgData))
      ),
      rest.get(
        NetworkSegmentationUrls.getSwitchInfoByNSGId.url,
        (req, res, ctx) => res(ctx.json(mockNsgSwitchInfoData))
      ),
      rest.put(
        NetworkSegmentationUrls.updateNetworkSegmentationGroup.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should update networkSegmentation successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditNetworkSegmentation />
      </Provider>, {
        route: { params, path: updateNsgPath }
      })
    // step 1
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 4
    await screen.findByRole('row', { name: /FMN4221R00H---DS---3/i })
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 5
    await screen.findByRole('row', { name: /FEK3224R09N---AS---3/i })
    await user.click(await screen.findByRole('button', { name: 'Apply' }))
  })


  it('cancel and go back to device list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditNetworkSegmentation />
      </Provider>, {
        route: { params, path: updateNsgPath }
      })
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/services`,
      hash: '',
      search: ''
    })
  })
})
