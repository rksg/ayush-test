import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'

import { useSplitTreatment }  from '@acx-ui/feature-toggle'
import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  venuelist,
  autocompleteResult,
  timezoneResult,
  successResponse
} from '../__tests__/fixtures'

import { EdgesForm, addressParser } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Venues Form', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    mockServer.use(
      rest.post(
        CommonUrlsInfo.addVenue.url,
        (req, res, ctx) => res(ctx.json(successResponse))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      ),
      rest.get(
        'https://maps.googleapis.com/maps/api/timezone/*',
        (req, res, ctx) => res(ctx.json(timezoneResult))
      )
    )

    initialize()
  })

  it('should render venues form', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)

    const { asFragment } = render(
      <Provider>
        <EdgesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/venues/add' }
      })

    expect(asFragment()).toMatchSnapshot()

    const venueInput = screen.getByLabelText('Venue Name')
    fireEvent.change(venueInput, { target: { value: 'Ruckus Network' } })
    fireEvent.blur(venueInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    const descriptionInput = screen.getByLabelText('Description')
    fireEvent.change(descriptionInput, { target: { value: 'Ruckus Network Info' } })

    const addressInput = screen.getByTestId('address-input')
    fireEvent.change(addressInput, { target:
      { value: '350 W Java Dr, Sunnyvale, CA 94089, USA' }
    })

    fireEvent.click(screen.getByText('Add'))
  })
  it('should call address parser', async () => {
    const { address } = await addressParser(autocompleteResult)

    const addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: 37.4112751,
      longitude: -122.0191908,
      timezone: 'America/Los_Angeles'
    }

    expect(address).toEqual(addressResult)
  })
  it('google map is enabled', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)
    render(
      <Provider>
        <EdgesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/edges/add' }
      })

    const addressInput = screen.getByTestId('address-input')
    expect(addressInput).toBeEnabled()
  })
  it('google map is not enabled', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(false)
    const { asFragment } = render(
      <Provider>
        <EdgesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/edges/add' }
      })

    expect(asFragment()).toMatchSnapshot()

    await screen.findByText('Map is not enabled')
  })
  it('should back to edge list', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)
    render(
      <Provider>
        <EdgesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/edges/add' }
      })

    await userEvent.click(screen.getByText('Cancel'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/edges`,
      hash: '',
      search: ''
    })
  })
})
