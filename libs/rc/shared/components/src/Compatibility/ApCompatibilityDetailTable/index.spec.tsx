import { rest } from 'msw'

import { useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { CompatibilitySelectedApInfo, FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { mockServer, render, screen }                    from '@acx-ui/test-utils'

import {
  mockApModelFamilies,
  mockedFirmwareVenuesPerApModel,
  mockNetworkApCompatibilities,
  mockVenueApCompatibilities
} from '../ApCompatibilityDrawer/__test__/fixtures'

import { ApCompatibilityDetailTable } from '.'


describe('ApCompatibilityDetailTable', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(() => {
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (_, res, ctx) => res(ctx.json(mockApModelFamilies))
      ),
      rest.post(
        FirmwareUrlsInfo.getVenueApModelFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedFirmwareVenuesPerApModel))
      )
    )
  })
  it('should render correctly with Venue compatibility data', async () => {
    const compatibility = mockVenueApCompatibilities.compatibilities[0]
    const { id: venueId, incompatibleFeatures: data } = compatibility
    render(
      <Provider>
        <ApCompatibilityDetailTable
          data={data!}
          venueId={venueId}
        />
      </Provider>
    )

    // table title
    expect(await screen.findByText('Incompatible Feature')).toBeInTheDocument()
    expect(await screen.findByText('Incompatible APs')).toBeInTheDocument()
    expect(await screen.findByText('Min. Required Versions')).toBeInTheDocument()
    // table body
    expect(await screen.findByText('EXAMPLE-FEATURE-1')).toBeInTheDocument()
    expect(await screen.findByText('Wi-Fi')).toBeInTheDocument()
    expect(await screen.findByText('1')).toBeInTheDocument()
    expect(await screen.findByText('7.0.0.0.123')).toBeInTheDocument()

    // only one entry and two checkboxes (selec All & first entry)
    expect(await screen.findAllByRole('checkbox')).toHaveLength(2)
  })

  it('should render correctly with AP compatibility data', async () => {
    const compatibility = mockNetworkApCompatibilities.compatibilities[0]
    const { incompatibleFeatures: data } = compatibility
    const apInfo: CompatibilitySelectedApInfo = {
      name: 'fake AP',
      serialNumber: '__moke_sn',
      model: 'R770',
      firmwareVersion: '6.0.0.0.0'
    }

    render(
      <Provider>
        <ApCompatibilityDetailTable
          requirementOnly={true}
          data={data!}
          apInfo={apInfo} />
      </Provider>
    )

    // ap info
    expect(await screen.findByText(apInfo.model)).toBeInTheDocument()
    expect(await screen.findByText(apInfo.firmwareVersion)).toBeInTheDocument()

    // table title
    expect(await screen.findByText('Incompatible Feature')).toBeInTheDocument()
    expect(await screen.findByText('Min. Required Versions')).toBeInTheDocument()
    // table body
    expect(await screen.findByText('EXAMPLE-FEATURE-3')).toBeInTheDocument()
    expect(await screen.findByText('Wi-Fi')).toBeInTheDocument()
    expect(await screen.findByText('6.2.3.103.251')).toBeInTheDocument()

    // read-only mode, without checkboxes
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)

  })
})