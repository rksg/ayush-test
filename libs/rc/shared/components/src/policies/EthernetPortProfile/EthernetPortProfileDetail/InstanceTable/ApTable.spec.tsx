import { rest } from 'msw'

import { ethernetPortProfileApi }                                          from '@acx-ui/rc/services'
import { CommonUrlsInfo, PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider, store }                                                 from '@acx-ui/store'
import { mockServer, render, screen }                                      from '@acx-ui/test-utils'

import { mockApSerialNumber, mockVenueName, mockedVenueApsList, mockedVenuesResult } from '../../__tests__/fixtures'

import { ApTable } from './ApTable'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
let params: { tenantId: string, policyId: string }

const detailPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.ETHERNET_PORT_PROFILE,
  oper: PolicyOperation.DETAIL
})
describe('EthernetPortProfileInstanceTable', () => {
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

  it('Should render ApTable successfully', async () => {
    render(
      <Provider>
        <ApTable
          apSerialNumbers={[mockApSerialNumber]}
        />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    await screen.findByText(mockVenueName)
    await screen.findByText('R550')
    await screen.findByText('AP1')
  })

  it('Should render ApTable with empty content successfully', async () => {
    render(
      <Provider>
        <ApTable
          apSerialNumbers={[]}
        />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    expect(screen.queryByText(mockVenueName)).not.toBeInTheDocument()
  })

})