/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeDhcpUrls, EdgeUrlsInfo, NetworkSegmentationUrls } from '@acx-ui/rc/utils'
import { Provider }                                                            from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockEdgeData, mockEdgeDhcpDataList, mockNetworkGroup, mockVenueData, mockVenueNetworkData } from '../__tests__/fixtures'

import AddNetworkSegmentation from '.'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const createNsgPath = '/:tenantId/services/networkSegmentation/create'

describe('Create NetworkSegmentation', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
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
      rest.post(
        NetworkSegmentationUrls.createNetworkSegmentationGroup.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should create networkSegmentation successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddNetworkSegmentation />
      </Provider>, {
        route: { params, path: createNsgPath }
      })
    // step 1
    const serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    fireEvent.change(serviceNameInput, { target: { value: 'TestService' } })
    const venueSelect = await screen.findByRole('combobox', { name: 'Venue with the property management enabled' })
    user.click(venueSelect)
    user.click(await screen.findByText('Mock Venue 1'))
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    const edgeSelect = await screen.findByRole('combobox', { name: 'SmartEdge' })
    user.click(edgeSelect)
    user.click(await screen.findByText('Smart Edge 1'))
    const segmentsInput = await screen.findByRole('spinbutton', { name: 'Number of Segments' })
    fireEvent.change(segmentsInput, { target: { value: 10 } })
    const devicesInput = await screen.findByRole('spinbutton', { name: 'Number of devices per Segment' })
    fireEvent.change(devicesInput, { target: { value: 10 } })
    const dhcpSelect = await screen.findByRole('combobox', { name: 'DHCP Service' })
    await waitFor(() => expect(dhcpSelect).not.toBeDisabled())
    user.click(dhcpSelect)
    user.click(await screen.findByText('TestDhcp-1'))
    user.click(await screen.findByRole('button', { name: 'Select Pool' }))
    user.click(await screen.findByText('PoolTest1'))
    user.click(await screen.findByRole('button', { name: 'Select' }))
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    const tunnelSelect = await screen.findByRole('combobox', { name: 'Tunnel Profile' })
    user.click(tunnelSelect)
    user.click(await screen.findByText('Default'))
    user.click(await screen.findByRole('checkbox', { name: 'Network 1' }))
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step4
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
  })


  it('cancel and go back to device list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddNetworkSegmentation />
      </Provider>, {
        route: { params, path: createNsgPath }
      })
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/services`,
      hash: '',
      search: ''
    })
  })
})
