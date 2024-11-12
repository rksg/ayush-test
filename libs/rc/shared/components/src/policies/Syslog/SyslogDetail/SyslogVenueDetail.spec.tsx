import { ReactNode } from 'react'

import { rest } from 'msw'

import { ConfigTemplateContext, ConfigTemplateType, ConfigTemplateUrlsInfo, PoliciesConfigTemplateUrlsInfo, SyslogUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                      from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                                           from '@acx-ui/test-utils'

import SyslogVenueDetail from './SyslogVenueDetail'

const mockedRenderConfigTemplateDetailsComponent = jest.fn()
jest.mock('../../../configTemplates', () => ({
  ...jest.requireActual('../../../configTemplates'),
  renderConfigTemplateDetailsComponent: (type: ConfigTemplateType, id: string, name: ReactNode) => {
    mockedRenderConfigTemplateDetailsComponent({ type, id, name })
    return <div>{name}</div>
  }
}))

const venueDetailContent = {
  fields: [
    'country',
    'city',
    'name',
    'id',
    'status'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue',
      city: 'Toronto, Ontario',
      country: 'Canada',
      status: '1_InSetupPhase'
    }
  ]
}

const detailContent = {
  venues: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue'
    }
  ],
  name: 'Default profile',
  id: 'policyId1'
}

const params: { tenantId: string, policyId: string } = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  policyId: 'policy-id'
}

describe('SyslogVenueDetail', () => {
  it('should render SyslogVenueDetail successfully', async () => {
    mockServer.use(
      rest.get(
        SyslogUrls.getSyslogPolicy.url,
        (_, res, ctx) => res(ctx.json(detailContent))
      ),
      rest.post(
        SyslogUrls.getVenueSyslogList.url,
        (_, res, ctx) => res(ctx.json(venueDetailContent))
      )
    )

    render(<Provider><SyslogVenueDetail /></Provider>, { route: { params } })

    const targetVenue = venueDetailContent.data[0]
    const targetRow = await screen.findByRole('link', { name: targetVenue.name })
    const venueLink = `/${params.tenantId}/t/venues/${targetVenue.id}/venue-details/overview`

    expect(targetRow).toHaveAttribute('href', venueLink)

    expect(await screen.findByText(/Instance \(1\)/)).toBeVisible()
  })

  it('should render Venue link for Config Template successfully', async () => {
    mockServer.use(
      rest.get(
        PoliciesConfigTemplateUrlsInfo.getSyslogPolicy.url,
        (_, res, ctx) => res(ctx.json(detailContent))
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getVenuesTemplateList.url,
        (_, res, ctx) => res(ctx.json(venueDetailContent))
      )
    )

    render(
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <Provider><SyslogVenueDetail /></Provider>
      </ConfigTemplateContext.Provider>, { route: { params } }
    )

    const targetVenue = venueDetailContent.data[0]

    await waitFor(() => {
      expect(mockedRenderConfigTemplateDetailsComponent).toHaveBeenCalledWith({
        type: ConfigTemplateType.VENUE,
        name: targetVenue.name,
        id: targetVenue.id
      })
    })
  })
})
