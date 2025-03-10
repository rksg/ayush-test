import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { useIsSplitOn, Features }                                                from '@acx-ui/feature-toggle'
import { venueApi, networkApi }                                                  from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeCompatibilityFixtures, EdgeUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'


import {
  venuelist,
  venuesApCompatibilitiesData
} from '../__tests__/fixtures'

import { VenuesTable } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const { mockEdgeCompatibilitiesVenue, mockEdgeCompatibilitiesVenueV1_1 } = EdgeCompatibilityFixtures

describe('Venues Table', () => {
  let params: { tenantId: string }
  const mockedDeleteReq = jest.fn()
  const mockedApCompReq = jest.fn()
  beforeEach(async () => {
    mockedApCompReq.mockClear()
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      ),
      rest.post(
        CommonUrlsInfo.getVenueCityList.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesVenue.url,
        (req, res, ctx) => {
          mockedApCompReq()
          return res(ctx.json(venuesApCompatibilitiesData))
        }
      ),
      rest.delete(
        CommonUrlsInfo.deleteVenue.url,
        (req, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.json({ requestId: 'f638e92c-9d6f-45b2-a680-20047741ef2c' }))
        }
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedApCompReq).toBeCalledTimes(2))
    expect(await screen.findByText('My-Venue')).toBeVisible()
    expect(await screen.findByText('Add Venue')).toBeVisible()
  })

  it('should navigate to edit page', async () => {
    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedApCompReq).toBeCalledTimes(2))
    const row1 = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(row1).getByRole('checkbox'))

    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)
    expect(mockedUsedNavigate).toHaveBeenCalledWith(
      `${venuelist?.data?.[0].id}/edit/`,
      { replace: false }
    )
  })

  it('should delete selected row', async () => {

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilities.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeCompatibilitiesVenue))
      )
    )
    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await waitFor(() => expect(mockedApCompReq).toBeCalledTimes(2))

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(row).getByRole('checkbox'))

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    await userEvent.click(deleteButton)

    const dialog = await screen.findByRole('dialog')
    const confirmInput
      = await within(dialog).findByRole('textbox', { name: 'Type the word "Delete" to confirm:' })
    expect(await within(dialog).findByText('Delete "My-Venue"?')).toBeVisible()
    fireEvent.change(confirmInput, { target: { value: 'Delete' } })
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Delete Venue' }))
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it('should have edge column when feature flag on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_TOGGLE)

    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('My-Venue')).toBeVisible()
    expect(await screen.findByRole('columnheader', { name: 'RUCKUS Edges' })).toBeVisible()
  })

  it('should not have edge column when feature flag off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('My-Venue')).toBeVisible()
    expect(screen.queryByRole('columnheader', { name: 'RUCKUS Edges' })).toBeFalsy()
  })

  it('should have correct edge device quantity', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_TOGGLE)

    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    const row = await screen.findByRole('row', { name: /^test/ })
    expect(within(row).getByRole('cell', { name: '3' })).toBeTruthy()
  })

  it('should render correct title', async () => {
    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('My-Venue')).toBeVisible()
    await screen.findByText('Venues (2)')
    expect(screen.getByRole('heading', {
      name: /venues \(2\)/i
    })).toBeTruthy()
  })

  it('should have ap compatibilies correct', async () => {
    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    const icon = await within(row).findByTestId('WarningTriangleSolid')
    expect(icon).toBeVisible()
  })

  it('should have edge compatibilies correct', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      [Features.EDGES_TOGGLE, Features.EDGE_COMPATIBILITY_CHECK_TOGGLE].includes(ff as Features))
    const mockVenuelist = cloneDeep(venuelist)
    mockVenuelist.data[0].id = mockEdgeCompatibilitiesVenue.compatibilities![0].id
    mockVenuelist.data[0].name = 'Test-Edge-Compatibility'

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(mockVenuelist))
      ),
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilities.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeCompatibilitiesVenue))
      )
    )

    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /Test-Edge-Compatibility/i })
    const icon = await within(row).findByTestId('WarningTriangleSolid')
    expect(icon).toBeVisible()
  })

  it('should have edge compatibilies correct - V1_1', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      [Features.EDGES_TOGGLE, Features.EDGE_COMPATIBILITY_CHECK_TOGGLE,
        Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE].includes(ff as Features))
    const mockVenuelist = cloneDeep(venuelist)
    mockVenuelist.data[0].id = mockEdgeCompatibilitiesVenueV1_1.compatibilities![0].id
    mockVenuelist.data[0].name = 'Test-Edge-Compatibility'

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(mockVenuelist))
      ),
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilitiesV1_1.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeCompatibilitiesVenueV1_1))
      )
    )

    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /Test-Edge-Compatibility/i })
    const icon = await within(row).findByTestId('WarningTriangleSolid')
    expect(icon).toBeVisible()
  })
})
