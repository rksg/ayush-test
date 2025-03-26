import { initialize } from '@googlemaps/jest-mocks'
import userEvent      from '@testing-library/user-event'
import { rest }       from 'msw'

import { useIsSplitOn }                                                       from '@acx-ui/feature-toggle'
import {
  AdministrationUrlsInfo, CommonUrlsInfo,
  ConfigTemplateUrlsInfo,
  VenueConfigTemplateUrlsInfo,
  useConfigTemplateLazyQueryFnSwitcher, useConfigTemplateMutationFnSwitcher
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'

import {
  venuelist,
  autocompleteResult,
  timezoneResult,
  successResponse,
  mockVenueConfigTemplates
} from '../__tests__/fixtures'

import { VenuesForm, addressParser } from '.'

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
const mockedUseLocation = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => mockedUseLocation()
}))


type MutationFnSwitcherTypes = Parameters<typeof useConfigTemplateMutationFnSwitcher>
type LazyQueryFnSwitcherTypes = Parameters<typeof useConfigTemplateLazyQueryFnSwitcher>
const mockedMutationFnSwitcher = jest.fn()
const mockedLazyQueryFnSwitcher = jest.fn()
const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  // eslint-disable-next-line max-len
  useConfigTemplateMutationFnSwitcher: (props: MutationFnSwitcherTypes) => mockedMutationFnSwitcher(props),
  // eslint-disable-next-line max-len
  useConfigTemplateLazyQueryFnSwitcher: (props: LazyQueryFnSwitcherTypes) => mockedLazyQueryFnSwitcher(props),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

const mockedGetTimezone = jest.fn().mockResolvedValue({ data: timezoneResult })

describe('Venues Form', () => {
  let params: { tenantId: string }
  const mockedAddVenue = jest.fn()
  const mockedUpdateVenue = jest.fn()
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    mockServer.use(
      rest.post(CommonUrlsInfo.addVenue.url,
        (req, res, ctx) => {
          mockedAddVenue()
          return res(ctx.json(successResponse))
        }
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      ),
      rest.get(CommonUrlsInfo.getVenue.url,
        (req, res, ctx) => res(ctx.json(venueResponse))
      ),
      rest.put(CommonUrlsInfo.updateVenue.url,
        (req, res, ctx) => {
          mockedUpdateVenue()
          return res(ctx.json(successResponse))
        }
      ),
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: {
          mapRegion: 'TW'
        } }))
      )
    )

    initialize()
  })

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockedAddVenue.mockClear()
    mockedUpdateVenue.mockClear()
    mockedMutationFnSwitcher.mockImplementation(({ useMutationFn }) => useMutationFn())
    mockedLazyQueryFnSwitcher.mockImplementation(({ useLazyQueryFn }) => useLazyQueryFn())
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    mockedUseLocation.mockReturnValue({ pathname: '', search: '', hash: '', state: {}, key: '' })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should render venues form', async () => {
    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/add' }
      })

    const venueInput = await screen.findByLabelText('Venue Name')
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

    await userEvent.click(await screen.findByText('Add'))
  })

  it('venue name not allow white space only', async () => {
    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/add' }
      })

    const venueInput = await screen.findByLabelText('Venue Name')
    fireEvent.change(venueInput, { target: { value: '  ' } })

    expect(await screen.findByText('Whitespace chars only are not allowed')).toBeVisible()
  })

  it('should call address parser', async () => {
    const { address } = await addressParser(autocompleteResult, mockedGetTimezone)

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
    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/add' }
      })

    const addressInput = await screen.findByTestId('address-input')
    expect(addressInput).toBeEnabled()
  })
  it('google map is not enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/add' }
      })

    expect(await screen.findByText('Map is not enabled')).toBeVisible()
  })
  it('should back to venues list', async () => {
    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/add' }
      })

    await userEvent.click(await screen.findByText('Cancel'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues`,
      hash: '',
      search: ''
    })
  })
  it('should edit venue successfully', async () => {
    const params = {
      venueId: '2c16284692364ab6a01f4c60f5941836',
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params }
      })

    const venueInput = await screen.findByLabelText('Venue Name')
    fireEvent.change(venueInput, { target: { value: 'Ruckus Network' } })
    fireEvent.blur(venueInput)
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    const saveButton = screen.getByText('Save')
    await userEvent.click(saveButton)
    await waitFor(() => expect(mockedUpdateVenue).toHaveBeenCalled())
  })

  it('should create venue config template successfully', async () => {
    const mockedPreviousPath = '/configTemplates'
    mockedUseLocation.mockReturnValue({ state: { from: { pathname: mockedPreviousPath } } })

    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const mockedSaveEnforcementConfig = jest.fn()
    mockedUseConfigTemplate.mockReturnValue({
      isTemplate: true,
      saveEnforcementConfig: mockedSaveEnforcementConfig
    })
    // eslint-disable-next-line max-len
    mockedMutationFnSwitcher.mockImplementation(({ useTemplateMutationFn }) => useTemplateMutationFn())
    // eslint-disable-next-line max-len
    mockedLazyQueryFnSwitcher.mockImplementation(({ useLazyTemplateQueryFn }) => useLazyTemplateQueryFn())

    const addTemplateFn = jest.fn()
    const addVenueTemplateResponseId = 'venue123456'
    mockServer.use(
      rest.post(
        VenueConfigTemplateUrlsInfo.addVenueTemplate.url,
        (_, res, ctx) => {
          addTemplateFn()
          return res(ctx.json({
            ...successResponse,
            response: { id: addVenueTemplateResponseId }
          }))
        }
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getVenuesTemplateList.url,
        (_, res, ctx) => res(ctx.json(mockVenueConfigTemplates))
      )
    )

    render(
      <Provider>
        <VenuesForm />
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/add' }
      }
    )

    const venueInput = await screen.findByLabelText('Venue Name')
    await userEvent.type(venueInput, 'test-venue-template')
    fireEvent.blur(venueInput)

    // Field validation indicator
    await waitForElementToBeRemoved(await screen.findByRole('img', { name: 'loading' }))

    const descriptionInput = screen.getByLabelText('Description')
    await userEvent.type(descriptionInput, 'My First Venue Template')

    await userEvent.click(screen.getByRole('button', { name: /Add/ }))

    await waitFor(() => expect(addTemplateFn).toHaveBeenCalled())
    // eslint-disable-next-line max-len
    await waitFor(() => expect(mockedSaveEnforcementConfig).toHaveBeenCalledWith(addVenueTemplateResponseId))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(mockedPreviousPath))
  })

  it('should override venue config template successfully', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const mockedModalCallBackFn = jest.fn()

    render(
      <Provider>
        <VenuesForm
          modalMode={true}
          modalCallBack={mockedModalCallBackFn}
          specifiedAction={'override'}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/t/' }
      }
    )

    const venueInput = await screen.findByLabelText('Venue Name')
    await userEvent.type(venueInput, 'overridden-venue-template')
    fireEvent.blur(venueInput)

    // Field validation indicator
    await waitForElementToBeRemoved(await screen.findByRole('img', { name: 'loading' }))

    await userEvent.click(screen.getByRole('button', { name: /Add/ }))

    await waitFor(() => {
      expect(mockedModalCallBackFn).toHaveBeenCalledWith(expect.objectContaining({
        name: 'overridden-venue-template'
      }))
    })
  })
})
