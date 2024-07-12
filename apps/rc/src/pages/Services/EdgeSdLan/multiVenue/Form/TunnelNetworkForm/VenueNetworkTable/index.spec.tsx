/* eslint-disable max-len */
import {
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }        from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockedVenueList } from '../../../__tests__/fixtures'

import { EdgeSdLanVenueNetworksTable, VenueNetworksTableProps } from '.'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue('ecc2d7cf9d2342fdb31ae0e24958fcac')
}))

jest.mock('./NetworksDrawer.tsx', () => ({
  ...jest.requireActual('./NetworksDrawer.tsx'),
  NetworksDrawer: (props: {
    venueId: string, venueName?: string, onClose: () => void
  }) => <div data-testid='NetworksDrawer'>
    <span>venueId={props.venueId}</span>
    <span>venueName={props.venueName}</span>
    <button onClick={props.onClose}>Close</button>
  </div>
}))

const { click, hover } = userEvent

const MockedTargetComponent = (props: VenueNetworksTableProps) => {
  return <Provider>
    <EdgeSdLanVenueNetworksTable
      {...props}
    />
  </Provider>
}

describe('Tunneled Venue Networks Table', () => {

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(mockedVenueList))
      )
    )
  })

  it('should correctly render', async () => {
    render(<MockedTargetComponent
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBe(5)
  })

  it('should open networks selection drawer', async () => {
    render(<MockedTargetComponent
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const row = screen.getByRole('row', { name: /airport/i })
    await click(within(row).getByRole('radio'))
    await click(screen.getByRole('button', { name: 'Select Networks' }))
    const drawerDiv = screen.getByTestId('NetworksDrawer')
    within(drawerDiv).getByText('venueId=venue_00002')
  })

  it('should close networks selection drawer', async () => {
    render(<MockedTargetComponent
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const row = screen.getByRole('row', { name: /airport/i })
    await click(within(row).getByRole('radio'))
    await click(screen.getByRole('button', { name: 'Select Networks' }))
    const drawerDiv = screen.getByTestId('NetworksDrawer')
    within(drawerDiv).getByText('venueId=venue_00002')
    await click(within(drawerDiv).getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('NetworksDrawer')).toBe(null)
  })

  it('should display networks name as tooltip when hover', async () => {
    const venueId = 'venue_00002'
    const venueName = mockedVenueList.data.find(i => i.id === venueId)?.name
    render(<MockedTargetComponent
      activated={{
        [venueId]: [{
          id: 'network_1',
          name: 'Network1'
        }]
      }}
    />, { route: { params: { tenantId: 't-id' } } })

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(venueName!) })
    await hover(within(within(row).getByRole('cell', { name: '1' })).getByText('1'))
    expect(await screen.findByRole('tooltip', { hidden: true })).toHaveTextContent('Network1')
  })
})

const basicCheck = async () => {
  const rows = await screen.findAllByRole('row', { name: /MockedVenue/i })
  expect(rows.length).toBe(2)
}
