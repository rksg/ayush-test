/* eslint-disable max-len */
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { networkApi }                   from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  venueNetworkList,
  networkDeepList,
  venueNetworkApGroup,
  venueData
} from '../../__tests__/fixtures'

import { VenueNetworksTab } from './index'

type MockDialogProps = React.PropsWithChildren<{
  visible: boolean
  onOk?: () => void
  onCancel?: () => void
}>
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  NetworkApGroupDialog: ({ onOk = ()=>{}, onCancel = ()=>{}, visible }: MockDialogProps) =>
    visible && <div data-testid={'NetworkApGroupDialog'}>
      <button onClick={(e)=>{e.preventDefault();onOk()}}>Apply</button>
      <button onClick={(e)=>{e.preventDefault();onCancel()}}>Cancel</button>
    </div>,
  NetworkVenueScheduleDialog: ({ onOk = ()=>{}, onCancel = ()=>{}, visible }: MockDialogProps) =>
    visible && <div data-testid={'NetworkVenueScheduleDialog'}>
      <button onClick={(e)=>{e.preventDefault();onOk()}}>Apply</button>
      <button onClick={(e)=>{e.preventDefault();onCancel()}}>Cancel</button>
    </div>
}))

const params = {
  tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
  venueId: '3b2ffa31093f41648ed38ed122510029'
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('VenueNetworksTab', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json(networkDeepList))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(venueNetworkApGroup))
      ),
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json({ venue: venueData }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })

    const row = await screen.findByRole('row', { name: /test_1/i })
    expect(row).toHaveTextContent('Pre-Shared Key (PSK) - WPA2')
    expect(row).toHaveTextContent('VLAN-1 (Default)')
  })

  it('should clicks add network correctly', async () => {
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })

    expect(await screen.findByText('Add Network')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add Network' }))
  })

  it('activate Network', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })
    const row = await screen.findByRole('row', { name: /test_2/i })

    const requestSpy = jest.fn()
    const newApGroup = JSON.parse(JSON.stringify(venueNetworkApGroup))
    newApGroup.response[1].apGroups[0].id = 'test2'
    mockServer.use(
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(newApGroup))
      ),
      rest.post(
        WifiUrlsInfo.addNetworkVenue.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json({ requestId: '123' }))
        }
      )
    )

    const toogleButton = await within(row).findByRole('switch', { checked: false })
    fireEvent.click(toogleButton)

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).toBeChecked()))
  })

  it('deactivate Network', async () => {
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })
    const row = await screen.findByRole('row', { name: /test_1/i })

    const requestSpy = jest.fn()
    const newApGroup = JSON.parse(JSON.stringify(venueNetworkApGroup))
    newApGroup.response[0].apGroups[0].id = ''
    mockServer.use(
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(newApGroup))
      ),
      rest.delete(
        WifiUrlsInfo.deleteNetworkVenue.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json({ requestId: '456' }))
        }
      )
    )

    const toogleButton = await within(row).findByRole('switch', { checked: true })
    fireEvent.click(toogleButton)

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(1))

    const rows = await screen.findAllByRole('switch')
    expect(rows).toHaveLength(2)
    await waitFor(() => rows.forEach(row => expect(row).not.toBeChecked()))
  })

  it('click VLAN, APs, Radios, Scheduling', async () => {
    render(<Provider><VenueNetworksTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/networks' }
    })

    const row = await screen.findByRole('row', { name: /test_1/i })

    fireEvent.click(within(row).getByText('VLAN-1 (Default)'))
    fireEvent.click(within(row).getByText('2.4 GHz, 5 GHz'))
    fireEvent.click(within(row).getByText('All APs'))
    fireEvent.click(within(row).getByText('24/7'))

    const dialog = await screen.findByTestId('NetworkApGroupDialog')
    const dialog2 = await screen.findByTestId('NetworkVenueScheduleDialog')

    expect(dialog).toBeVisible()
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
    await waitFor(() => expect(dialog2).not.toBeVisible())
  })
})
