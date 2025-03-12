import { rest } from 'msw'

import { Features, useIsSplitOn }                                                                               from '@acx-ui/feature-toggle'
import { softGreApi }                                                                                           from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, CommonUrlsInfo, PolicyOperation, PolicyType, SoftGreViewData, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Path }                                                                                                 from '@acx-ui/react-router-dom'
import { Provider, store }                                                                                      from '@acx-ui/store'
import { mockServer, render, within, screen }                                                                   from '@acx-ui/test-utils'

import {  mockedApQueryData, mockedNetworkQueryData, mockedVenueId2, mockedVenueName2, mockedVenueName3, mockedVenueQueryData, mockSoftGreDetail } from '../__tests__/fixtures'

import SoftGreVenueDetail from './SoftGreVenueDetail'

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
  { type: PolicyType.SOFTGRE,
    oper: PolicyOperation.DETAIL
  })

const params = {
  tenantId: '15320bc221d94d2cb537fa0189fee742',
  policyId: '4b76b1952c80401b8500b00d68106576'
}

describe('SoftGreVenueDetail', () => {
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
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

  it('should show data correctly and navigate to VenuePage after clicking venue name', async () => {
    render(
      <Provider>
        <SoftGreVenueDetail data={mockSoftGreDetail} />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    const venueId = mockedVenueId2
    const row = await screen.findByRole('row', { name: new RegExp(mockedVenueName2, 'i') })
    expect(await within(row).findByText('2')).toBeVisible()

    const smartEdgeLink = await screen.findByRole('link',
      { name: mockedVenueName2 })
    expect(smartEdgeLink).toHaveAttribute(
      'href', `/${params.tenantId}/t/venues/${venueId}/venue-details/overview`
    )
  })

  it('should show No Data on empty list when activations is empty', async () => {
    render(
      <Provider>
        <SoftGreVenueDetail data={{} as SoftGreViewData} />
      </Provider>,
      { route: { params, path: detailPath } }
    )

    expect(await screen.findByText('Instances (0)')).toBeVisible()
  })

  it('should show data correctly when SofrtGRE FF enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)

    render(
      <Provider>
        <SoftGreVenueDetail data={mockSoftGreDetail} />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    const row = await screen.findByRole('row', { name: new RegExp(mockedVenueName3, 'i') })
    expect(within(row).getByText('1')).toBeVisible()

    const row2 = await screen.findByRole('row', { name: new RegExp(mockedVenueName2, 'i') })
    expect(within(row2).getByText('2')).toBeVisible()

  })
})
