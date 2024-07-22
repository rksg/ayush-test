import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeSdLanFixtures, VenueFixtures } from '@acx-ui/rc/utils'
import { Provider }                                         from '@acx-ui/store'
import { mockServer, render, screen }                       from '@acx-ui/test-utils'

import { VenueTable } from './VenueTable'

import { getVenueTableData } from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockVenueList } = VenueFixtures
const mockedSdLanData = mockedMvSdLanDataList[0]

describe('Edge SD-LAN Detail - VenueTable', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueList))
      )
    )
  })

  it('should render correctly', async () => {
    const venueTableData = getVenueTableData(mockedSdLanData)
    render(
      <Provider>
        <VenueTable sdLanVenueData={venueTableData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/:serviceId/detail' }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: 'Mocked-Venue-1 TestCountry1, TestCity1 0 2' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect((screen.getByRole('link', { name: 'Mocked-Venue-1' }) as HTMLAnchorElement).href).toContain(`/venues/${venueTableData[0].venueId}/venue-details/overview`)
    // eslint-disable-next-line max-len
    expect((screen.getByRole('link', { name: '0' }) as HTMLAnchorElement).href).toContain(`/venues/${venueTableData[0].venueId}/venue-details/devices`)
    await userEvent.hover(screen.getByText('3'))
    expect(await screen.findByText('Mocked_network')).toBeInTheDocument()
    expect((await screen.findAllByText('Mocked_network_4')).length).toBe(2)
  })
})