import { rest } from 'msw'

import { ipSecApi }                                                                                           from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, CommonUrlsInfo, PolicyOperation, PolicyType, IpsecViewData, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Path }                                                                                               from '@acx-ui/react-router-dom'
import { Provider, store }                                                                                    from '@acx-ui/store'
import { mockServer, render, within, screen }                                                                 from '@acx-ui/test-utils'

import {  mockedApQueryData, mockedNetworkQueryData, mockedVenueId1, mockedVenueName1, mockedVenueQueryData, mockIpSecDetail } from '../__tests__/fixtures'

import IpsecVenueDetail from './IpsecVenueDetail'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

const detailPath = '/:tenantId/t/' + getPolicyRoutePath(
  { type: PolicyType.IPSEC,
    oper: PolicyOperation.DETAIL
  })

const params = {
  tenantId: '15320bc221d94d2cb537fa0189fee742',
  policyId: '4b76b1952c80401b8500b00d68106576'
}

describe('IpsecVenueDetail', () => {
  beforeEach(() => {
    store.dispatch(ipSecApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json(mockedVenueQueryData))
      ),
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockedNetworkQueryData))
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(mockedApQueryData))
      )

    )
  })

  it('should show No Data on empty list when activations is empty', async () => {
    render(
      <Provider>
        <IpsecVenueDetail data={{} as IpsecViewData} />
      </Provider>,
      { route: { params, path: detailPath } }
    )

    expect(await screen.findByText('Instances (0)')).toBeVisible()
  })

  it('should show data correctly and navigate to VenuePage after clicking venue name', async () => {
    render(
      <Provider>
        <IpsecVenueDetail
          data={mockIpSecDetail as unknown as IpsecViewData} />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    const venueId = mockedVenueId1
    const row = await screen.findByRole('row', { name: new RegExp(mockedVenueName1, 'i') })
    expect(await within(row).findByText('1')).toBeVisible()

    const smartEdgeLink = await screen.findByRole('link',
      { name: mockedVenueName1 })
    expect(smartEdgeLink).toHaveAttribute(
      'href', `/${params.tenantId}/t/venues/${venueId}/venue-details/overview`
    )
  })

})
