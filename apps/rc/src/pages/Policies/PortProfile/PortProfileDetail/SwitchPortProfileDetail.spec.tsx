import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo, SwitchUrlsInfo }      from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { render, screen, waitFor, mockServer } from '@acx-ui/test-utils'

import SwitchPortProfileDetail from './SwitchPortProfileDetail'

const mockedTableResult = {
  id: 'profile1',
  name: 'Profile One',
  type: 'Standard',
  untaggedVlan: '10',
  taggedVlans: ['20', '30'],
  macOuis: [{ oui: 'AA:BB:CC' }, { oui: 'BB:CC:DD' }, { oui: 'CC:DD:EE' }],
  lldpTlvs: [{ systemName: 'Switch1' }],
  dot1x: true,
  macAuth: false,
  appliedSwitchesInfo: []
}

const mockAppliedListResult = {
  totalCount: 1,
  page: 1,
  data: [
    {
      switchId: 'switch1',
      switchName: 'Switch 1',
      serialNumber: 'SN001',
      model: 'Model A',
      venueId: 'venue1',
      venueName: 'Venue 1'
    }
  ]
}

const mockVenuesResult = {
  totalCount: 1,
  page: 1,
  data: [
    { id: 'venue1', name: 'Venue 1' }
  ]
}

describe('SwitchPortProfileDetail', () => {
  const params = {
    tenantId: 'test-tenant-id',
    portProfileId: 'test-profile-id'
  }

  const detailPath = '/:tenantId/t/policies/portProfile/switch/profiles/:portProfileId/detail'

  beforeEach(() => {

    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchPortProfileDetail.url, (req, res, ctx) => {
        return res(ctx.json(mockedTableResult))
      }),
      rest.post(
        SwitchUrlsInfo.getSwitchPortProfileAppliedList.url,
        (req, res, ctx) => res(ctx.json(mockAppliedListResult))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenuesResult))
      )
    )
  })

  it('renders the component correctly', async () => {
    render(
      <Provider>
        <SwitchPortProfileDetail />
      </Provider>,
      {
        route: { params, path: detailPath }
      }
    )

    expect(await screen.findByRole('heading', { name: 'Profile One' })).toBeVisible()
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('displays the correct data in the table', async () => {
    render(
      <Provider>
        <SwitchPortProfileDetail />
      </Provider>,
      {
        route: { params, path: detailPath }
      }
    )

    await waitFor(async () => {
      expect(await screen.findByText('Switch 1')).toBeInTheDocument()
    })
    await waitFor(async () => {
      expect(await screen.findByText('Model A')).toBeInTheDocument()
    })
    await waitFor(async () => {
      expect(await screen.findByText('Venue 1')).toBeInTheDocument()
    })
  })

  it('navigates to the correct page when clicking on a switch', async () => {
    render(
      <Provider>
        <SwitchPortProfileDetail />
      </Provider>,
      {
        route: { params, path: detailPath }
      }
    )

    await waitFor(async () => {
      const switchLink = await screen.findByText('Switch 1')
      expect(switchLink).toHaveAttribute('href',
        '/test-tenant-id/t/devices/switch/switch1/SN001/details/overview')
    })
  })

  it('navigates to the correct page when clicking on a venue', async () => {
    render(
      <Provider>
        <SwitchPortProfileDetail />
      </Provider>,
      {
        route: { params, path: detailPath }
      }
    )

    await waitFor(async () => {
      const venueLink = await screen.findByText('Venue 1')
      expect(venueLink).toHaveAttribute('href',
        '/test-tenant-id/t/venues/venue1/venue-details/overview')
    })
  })

  it('displays the Configure button and navigates to the edit page', async () => {
    render(
      <Provider>
        <SwitchPortProfileDetail />
      </Provider>,
      {
        route: { params, path: detailPath }
      }
    )

    const configureButton = await screen.findByRole('button', { name: 'Configure' })
    expect(configureButton).toBeVisible()
    expect(await screen.findByRole('link', { name: 'Configure' }))
      .toHaveAttribute('href',
        '/test-tenant-id/t/policies/portProfile/switch/profiles/test-profile-id/edit')
  })
})