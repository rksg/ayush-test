import { rest } from 'msw'

import { apApi, venueApi }            from '@acx-ui/rc/services'
import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { getUrlForTest }              from '@acx-ui/utils'

import { ApDataContext }     from '../..'
import { r760Ap, venueData } from '../../../../__tests__/fixtures'

import { BssColoring } from '.'

const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

describe('AP Bss Coloring', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenue),
        (_, res, ctx) => res(ctx.json(venueData)))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{ apData: r760Ap }}>
          <BssColoring />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    // Remove it after the feature is implemented
    expect(await screen.findByText('Bss Coloring is implementing')).toBeVisible()

    /*
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable BSS Coloring'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ApBssColoring-text')).toBeVisible()
    */
  })
})
