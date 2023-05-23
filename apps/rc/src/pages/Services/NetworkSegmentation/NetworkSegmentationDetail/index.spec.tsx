import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeDhcpUrls, EdgeUrlsInfo, getServiceRoutePath, NetworkSegmentationUrls, PersonaUrls, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                             from '@acx-ui/store'
import { mockServer, render, screen }                                                                                                           from '@acx-ui/test-utils'

import { mockApList, mockEdgeData, mockEdgeDhcpDataList, mockNsgData, mockNsgStatsList, mockNsgSwitchInfoData, mockPersonaGroup, mockPersonaList, mockVenueData, replacePagination } from '../__tests__/fixtures'

import NetworkSegmentationDetail from '.'

jest.mock('./Table/ApsTable', () => ({
  ApsTable: () => <div data-testid='ApsTable' />
}))
jest.mock('./Table/AssignedSegmentsTable', () => ({
  AssignedSegmentsTable: () => <div data-testid='AssignedSegmentsTable' />
}))
jest.mock('./Table/DistSwitchesTable', () => ({
  DistSwitchesTable: () => <div data-testid='DistSwitchesTable' />
}))
jest.mock('../NetworkSegmentationForm/AccessSwitchForm/AccessSwitchTable', () => ({
  AccessSwitchTable: () => <div data-testid='AccessSwitchTable' />
}))

describe('NsgDetail', () => {
  let params: { tenantId: string, serviceId: string }
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({
    type: ServiceType.NETWORK_SEGMENTATION,
    oper: ServiceOperation.DETAIL
  })
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
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(mockApList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockNsgStatsList))
      ),
      rest.get(
        NetworkSegmentationUrls.getNetworkSegmentationGroupById.url,
        (req, res, ctx) => res(ctx.json(mockNsgData))
      ),
      rest.get(
        NetworkSegmentationUrls.getSwitchInfoByNSGId.url,
        (req, res, ctx) => res(ctx.json(mockNsgSwitchInfoData))
      ),
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaList))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      )
    )
  })

  it('Should render detail page successfully', async () => {
    render(
      <Provider>
        <NetworkSegmentationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    await screen.findByText(/TestDhcp-1/i)
  })

  it('Switch tab', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegmentationDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })

    await screen.findByTestId('ApsTable')
    await user.click(await screen.findByRole('tab', { name: /Dist. Switches/i }))
    await screen.findByTestId('DistSwitchesTable')
    await user.click(await screen.findByRole('tab', { name: /Access Switches/i }))
    await screen.findByTestId('AccessSwitchTable')
    await user.click(await screen.findByRole('tab', { name: /Assigned Segments/i }))
    await screen.findByTestId('AssignedSegmentsTable')
  })
})
