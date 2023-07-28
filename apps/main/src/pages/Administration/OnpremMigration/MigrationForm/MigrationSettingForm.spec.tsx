import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { Form }       from 'antd'
import { rest }       from 'msw'

import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, getUrlForTest, AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
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
  timezoneResult
} from '../__tests__/fixtures'

import { MigrationSettingForm, addressParser } from './MigrationSettingForm'

const venueResponse = {
  id: '2c16284692364ab6a01f4c60f5941836',
  createdDate: '2022-09-06T09:41:27.550+00:00',
  updatedDate: '2022-09-22T10:36:28.113+00:00',
  name: 'My-Venue',
  description: 'My-Venue',
  address: {
    country: 'New York',
    city: 'United States',
    addressLine: 'New York, NY, USA',
    latitude: 40.7127753,
    longitude: -74.0059728,
    timezone: 'America/New_York'
  }
}

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
        getUrlForTest(CommonUrlsInfo.getVenuesList),
        (req, res, ctx) => res(ctx.json(venuelist))
      ),
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenue),
        (req, res, ctx) => res(ctx.json(venueResponse))
      ),
      rest.get(
        'https://maps.googleapis.com/maps/api/timezone/*',
        (req, res, ctx) => res(ctx.json(timezoneResult))
      ),
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({
          global: {
            mapRegion: 'US'
          }
        }))
      )
    )

    initialize()
  })

  it('should render migration setting form', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <Form>
          <MigrationSettingForm />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/onpremMigration/add' }
      })

    const venueInput = screen.getByLabelText('New Venue Name')
    fireEvent.change(venueInput, { target: { value: 'Ruckus Network' } })
    fireEvent.blur(venueInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    const descriptionInput = screen.getByLabelText('Description')
    await userEvent.type(descriptionInput, 'Ruckus Network Info' )

    const addressInput = screen.getByTestId('address-input')
    await userEvent.type(addressInput, '350 W Java Dr, Sunnyvale, CA 94089, USA' )

    // fireEvent.click(screen.getByText('Add'))
  })
  it('should call address parser', async () => {
    const { address } = await addressParser(autocompleteResult)

    const addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: 'United States',
      country: 'United States',
      latitude: 37.4112751,
      longitude: -122.0191908,
      timezone: 'America/Los_Angeles'
    }

    expect(address).toEqual(addressResult)
  })
  it('google map is enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <Form>
          <MigrationSettingForm />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/onpremMigration/add' }
      })

    const addressInput = screen.getByTestId('address-input')
    expect(addressInput).toBeEnabled()
  })
  it('google map is not enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <Form>
          <MigrationSettingForm />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/onpremMigration/add' }
      })

    await screen.findByText('Map is not enabled')
  })
})
