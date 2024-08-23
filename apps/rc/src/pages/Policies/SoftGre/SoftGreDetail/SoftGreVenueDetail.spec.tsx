import { rest } from 'msw'

import { softGreApi }                                                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Path }                                                            from '@acx-ui/react-router-dom'
import { Provider, store }                                                 from '@acx-ui/store'
import { mockServer, render, within, screen }                              from '@acx-ui/test-utils'

import {  mockedNetworkQueryData, mockedVenueQueryData, mockSoftGreDetail } from '../__tests__/fixtures'

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
      )
    )
  })

  it('should show data correctly and navigate to VenuePage after clicking venue name', async () => {
    render(
      <Provider>
        <SoftGreVenueDetail activations={mockSoftGreDetail?.activations} />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    const venueId = 'eef3d9913bcc4deea43300804281c2c6'
    const row = await screen.findByRole('row', { name: /TestVenue0529/i })
    expect(await within(row).findByText('2')).toBeVisible()

    const smartEdgeLink = await screen.findByRole('link',
      { name: 'TestVenue0529' })
    expect(smartEdgeLink).toHaveAttribute(
      'href', `/${params.tenantId}/t/venues/${venueId}/venue-details/overview`
    )
  })

  it('should show No Data on empty list when activations is empty', async () => {
    render(
      <Provider>
        <SoftGreVenueDetail activations={[]} />
      </Provider>,
      { route: { params, path: detailPath } }
    )

    expect(await screen.findByText('Instances (0)')).toBeVisible()
  })
})
