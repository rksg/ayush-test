import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, screen, render } from '@acx-ui/test-utils'

import { mockVenueOptions } from './__tests__/fixtures'

import { VenueSelector } from '.'

describe('VenueSelector', () => {
  it('should render the selector', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ ...mockVenueOptions }))
      )
    )

    render(<Provider><VenueSelector /></Provider>, {
      route: { params: { tenantId: 'tenantId' } }
    })

    const targetVenue = mockVenueOptions.data[0]
    await userEvent.click(await screen.findByRole('combobox'))
    await screen.findByText(targetVenue.name)
  })
})
