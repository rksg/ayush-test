import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuelist
} from '../__tests__/fixtures'

import { VenuesTable } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Add Venue')
    await screen.findByText('My-Venue')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })

  it('should navigate to edit page', async () => {
    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row1 = await screen.findByRole('row', { name: /My-Venue/i })
    fireEvent.click(within(row1).getByRole('checkbox'))

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)
    expect(mockedUsedNavigate).toHaveBeenCalledWith(
      `${venuelist?.data?.[0].id}/edit/details/details`,
      { replace: false }
    )
  })
})