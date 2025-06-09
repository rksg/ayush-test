import { rest } from 'msw'

import { ethernetPortProfileApi }                                                                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, PolicyOperation, PolicyType, getPolicyRoutePath, ProfileLanVenueActivations } from '@acx-ui/rc/utils'
import { Provider, store }                                                                             from '@acx-ui/store'
import { mockServer, render, screen }                                                                  from '@acx-ui/test-utils'

import { mockVenueActivations, mockVenueName, mockedVenueApsList, mockedVenuesResult } from '../../__tests__/fixtures'

import { VenueTable } from './VenueTable'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
let params: { tenantId: string, policyId: string }

const detailPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.ETHERNET_PORT_PROFILE,
  oper: PolicyOperation.DETAIL
})
describe('EthernetPortProfile Venue Instance Table', () => {
  beforeEach(() => {
    params = {
      tenantId: tenantId,
      policyId: 'testPolicyId'
    }
    store.dispatch(ethernetPortProfileApi.util.resetApiState())
    mockServer.use(

      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(mockedVenuesResult))
      ),

      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(mockedVenueApsList))
      )
    )
  })

  it('Should render VenueTable successfully', async () => {
    render(
      <Provider>
        <VenueTable
          venueActivations={mockVenueActivations}
        />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    await screen.findByText(mockVenueName)
    await screen.findByText('R550')
  })

  it('Should render VenueTable with empty content successfully', async () => {
    render(
      <Provider>
        <VenueTable
          venueActivations={[] as ProfileLanVenueActivations[]}
        />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    expect(screen.queryByText(mockVenueName)).not.toBeInTheDocument()
  })

  it('Should remove duplicate AP models', async () => {
    const duplicateVenueActivations = [
      { venueId: 'venue1', apModel: 'R550' },
      { venueId: 'venue1', apModel: 'R550' },
      { venueId: 'venue1', apModel: 'R650' },
      { venueId: 'venue1', apModel: 'R650' }
    ] as ProfileLanVenueActivations[]

    render(
      <Provider>
        <VenueTable
          venueActivations={duplicateVenueActivations}
        />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    const apModelCell = await screen.findByText('R550, R650')
    expect(apModelCell).toBeInTheDocument()
  })
})