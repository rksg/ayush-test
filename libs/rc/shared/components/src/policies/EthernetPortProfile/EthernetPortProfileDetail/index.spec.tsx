import { rest } from 'msw'

import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { ethernetPortProfileApi, venueApi } from '@acx-ui/rc/services'
import {
  AaaUrls,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  EthernetPortProfile,
  EthernetPortProfileUrls,
  PolicyOperation,
  PolicyType,
  TableResult,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  dummyRadiusServiceList,
  dummyAccounting,
  dummyAuthRadius,
  mockAccuntingRadiusName,
  mockAuthRadiusId,
  mockAuthRadiusName,
  mockEthernetPortProfileId3,
  mockedVenuesResult,
  dummyEthernetPortProfileDVlan,
  dummyTableResultWithSingle,
  mockedVenueApsList,
  dummyEthernetPortProfileAccessPortBased,
  mockEthernetPortProfileId7 } from '../__tests__/fixtures'

import { EthernetPortProfileDetail } from '.'


const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
}))

jest.mocked(useIsSplitOn).mockReturnValue(true)

jest.mock('./InstanceTable/ApTable', () => ({
  ...jest.requireActual('./InstanceTable/ApTable'),
  ApTable: () => <div data-testid='ApTable' />
}))


jest.mock('./InstanceTable/VenueTable', () => ({
  ...jest.requireActual('./InstanceTable/VenueTable'),
  VenueTable: () => <div data-testid='VenueTable' />
}))

let params: { tenantId: string, policyId: string }
const detailPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.ETHERNET_PORT_PROFILE,
  oper: PolicyOperation.DETAIL
})
describe('EthernetPortProfileDetail', () => {
  beforeEach(async () => {
    params = {
      tenantId: tenantId,
      policyId: 'testPolicyId'
    }

    store.dispatch(ethernetPortProfileApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(

      rest.get(
        EthernetPortProfileUrls.getEthernetPortProfile.url,
        (req, res, ctx) => res(ctx.json(dummyEthernetPortProfileAccessPortBased))
      ),

      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(dummyTableResultWithSingle))
      ),

      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(dummyRadiusServiceList))
      ),

      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          if (req.params.policyId === mockAuthRadiusId) {
            return res(ctx.json(dummyAuthRadius))
          } else {
            return res(ctx.json(dummyAccounting))
          }
        }
      ),

      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(mockedVenuesResult))
      ),

      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(mockedVenueApsList))
      )

    )
  })

  it('Should render EthernetPortProfileDetail successfully', async () => {
    render(
      <Provider>
        <EthernetPortProfileDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })

    await screen.findByText(mockEthernetPortProfileId3)
    screen.getByText('On (Port-based Authenticator)')

    await screen.findByText(mockAuthRadiusName)
    await screen.findAllByText(mockAccuntingRadiusName)
    expect(screen.queryByText('Dynamic VLAN')).not.toBeInTheDocument()

  })

  it('Should render EthernetPortProfileDetail with Dynamic VLAN when MAC-based auth', async () => {
    const dummyQueryResult: TableResult<EthernetPortProfile> = {
      totalCount: 1,
      page: 1,
      data: [{
        ...dummyEthernetPortProfileDVlan
      }]
    }

    mockServer.use(
      rest.get(
        EthernetPortProfileUrls.getEthernetPortProfile.url,
        (_, res, ctx) => res(ctx.json(dummyEthernetPortProfileDVlan))
      ),
      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(dummyQueryResult))
      )
    )

    render(
      <Provider>
        <EthernetPortProfileDetail />
      </Provider>, {
        route: { params, path: detailPath }
      })
    expect(await screen.findByText(mockEthernetPortProfileId7)).toBeVisible()
    expect(screen.getByText('On (MAC-based Authenticator)')).toBeVisible()
    expect(screen.getByText('Dynamic VLAN')).toBeVisible()

  })
})