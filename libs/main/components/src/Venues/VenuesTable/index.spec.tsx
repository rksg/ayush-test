import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsTierAllowed, useIsSplitOn } from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiUrlsInfo }   from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  within,
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


describe('Venues Table', () => {
  let params: { tenantId: string }
  const mockedDeleteReq = jest.fn()
  beforeEach(async () => {
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
        (req, res, ctx) => res(ctx.json(venuesApCompatibilitiesData))
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
    const row1 = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(row1).getByRole('checkbox'))

    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)
    expect(mockedUsedNavigate).toHaveBeenCalledWith(
      `${venuelist?.data?.[0].id}/edit/details`,
      { replace: false }
    )
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(row).getByRole('checkbox'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    const dialog = await screen.findByRole('dialog')
    const confirmInput
      = await within(dialog).findByRole('textbox', { name: 'Type the word "Delete" to confirm:' })
    expect(await within(dialog).findByText('Delete "My-Venue"?')).toBeVisible()
    fireEvent.change(confirmInput, { target: { value: 'Delete' } })
    await userEvent.click(await within(dialog).findByRole('button', { name: /Delete Venue/i }))
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it('should have edge column when feature flag on', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('My-Venue')).toBeVisible()
    expect(await screen.findByRole('columnheader', { name: 'SmartEdges' })).toBeVisible()
  })

  it('should not have edge column when feature flag off', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(false)

    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('My-Venue')).toBeVisible()
    expect(screen.queryByRole('columnheader', { name: 'SmartEdges' })).toBeFalsy()
  })

  it('should have correct edge device quantity', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

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
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    const icon = await within(row).findByTestId('InformationSolid')
    expect(icon).toBeVisible()
  })
})
