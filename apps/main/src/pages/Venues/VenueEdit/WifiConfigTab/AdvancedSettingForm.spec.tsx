import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                                   from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { AdvancedSettingForm } from './AdvancedSettingForm'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockVenueCaps = {
  apModels: [{
    allowDfsCountry: ['US', 'SG'],
    canSupportCellular: false,
    canSupportLacp: false,
    canSupportPoeMode: false,
    canSupportPoeOut: false,
    externalAntenna: {
      enable24G: false,
      enable50G: false,
      gain24G: 3,
      gain50G: 3,
      supportDisable: true,
      coupled: false
    },
    has160MHzChannelBandwidth: false,
    isOutdoor: true,
    lanPortPictureDownloadUrl: '',
    lanPorts: [{
      defaultType: 'TRUNK',
      id: '1',
      isPoeOutPort: false,
      isPoePort: true,
      supportDisable: false,
      trunkPortOnly: true,
      untagId: 1,
      vlanMembers: '1-4094'
    }],
    ledOn: true,
    lldpAdInterval: 30,
    lldpEnable: true,
    lldpHoldTime: 120,
    lldpMgmtEnable: true,
    model: 'E510',
    pictureDownloadUrl: '',
    requireOneEnabledTrunkPort: true,
    simCardPrimaryEnabled: true,
    simCardPrimaryRoaming: true,
    simCardSecondaryEnabled: true,
    simCardSecondaryRoaming: true
  }, {
    allowDfsCountry: ['US', 'SG'],
    canSupportCellular: false,
    canSupportLacp: false,
    canSupportPoeMode: false,
    canSupportPoeOut: false,
    externalAntenna: {
      enable24G: false,
      enable50G: false,
      gain24G: 3,
      gain50G: 3,
      supportDisable: true,
      coupled: false
    },
    has160MHzChannelBandwidth: false,
    isOutdoor: true,
    lanPortPictureDownloadUrl: '',
    lanPorts: [{
      defaultType: 'TRUNK',
      id: '1',
      isPoeOutPort: false,
      isPoePort: true,
      supportDisable: false,
      trunkPortOnly: true,
      untagId: 1,
      vlanMembers: '1-4094'
    }],
    ledOn: true,
    lldpAdInterval: 30,
    lldpEnable: true,
    lldpHoldTime: 120,
    lldpMgmtEnable: true,
    model: 'H320',
    pictureDownloadUrl: '',
    requireOneEnabledTrunkPort: true,
    simCardPrimaryEnabled: true,
    simCardPrimaryRoaming: true,
    simCardSecondaryEnabled: true,
    simCardSecondaryRoaming: true
  }, {
    allowDfsCountry: ['US', 'SG'],
    canSupportCellular: false,
    canSupportLacp: false,
    canSupportPoeMode: false,
    canSupportPoeOut: false,
    externalAntenna: {
      enable24G: false,
      enable50G: false,
      gain24G: 3,
      gain50G: 3,
      supportDisable: true,
      coupled: false
    },
    has160MHzChannelBandwidth: false,
    isOutdoor: true,
    lanPortPictureDownloadUrl: '',
    lanPorts: [{
      defaultType: 'TRUNK',
      id: '1',
      isPoeOutPort: false,
      isPoePort: true,
      supportDisable: false,
      trunkPortOnly: true,
      untagId: 1,
      vlanMembers: '1-4094'
    }],
    ledOn: true,
    lldpAdInterval: 30,
    lldpEnable: true,
    lldpHoldTime: 120,
    lldpMgmtEnable: true,
    model: 'H350',
    pictureDownloadUrl: '',
    requireOneEnabledTrunkPort: true,
    simCardPrimaryEnabled: true,
    simCardPrimaryRoaming: true,
    simCardSecondaryEnabled: true,
    simCardSecondaryRoaming: true
  }],
  version: '6.0.0.x.xxx'
}
const mockVenueLed = [{
  ledEnabled: true,
  model: 'E510'
}]

describe('AdvancedSettingForm', () => {
  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueCapabilities.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.get(CommonUrlsInfo.getVenueLedOn.url,
        (_, res, ctx) => res(ctx.json([])))
    )

    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi'
    }
    render(<Provider><AdvancedSettingForm /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab' }
    })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByText('LEDs Status')
    await screen.findByRole('button', { name: 'Add Model' })

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }))
  })

  it('should handle add/edit/delete action', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueCapabilities.url,
        (_, res, ctx) => res(ctx.json(mockVenueCaps))
      ),
      rest.get(CommonUrlsInfo.getVenueLedOn.url,
        (_, res, ctx) => res(ctx.json(mockVenueLed)))
    )

    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi'
    }
    render(<Provider><AdvancedSettingForm /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab' }
    })
    await screen.findByText('E510')
    fireEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    expect(screen.getByRole('button', { name: 'Add Model' })).toBeDisabled()

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('option')
    expect(allOptions).toHaveLength(mockVenueCaps.apModels.length - 1)
    fireEvent.click(allOptions[0])

    const toggle = screen.getAllByRole('switch')
    fireEvent.click(toggle[0])
    const deleteBtns = screen.getAllByRole('deleteBtn')
    fireEvent.click(deleteBtns[deleteBtns.length - 1])
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }))
  })

  it('should navigate to venue details page when clicking cancel button', async () => {
    const params = {
      tenantId: 'tenant-id',
      venueId: 'venue-id',
      activeTab: 'wifi'
    }
    render(<Provider><AdvancedSettingForm /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab' }
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/venues/${params.venueId}/venue-details/overview`,
      hash: '',
      search: ''
    })
  })
})


