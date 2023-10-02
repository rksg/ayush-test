import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { venueApi }                                       from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider, store }                                from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import GatewayDetailsContentSwitch from '.'

const gatewayDetails = {
  gatewayDetailsGeneral: {
    venueName: 'My-Venue',
    hostname: 'rxgS5-vpoc.ruckusdemos.net',
    username: 'inigo',
    password: 'Inigo123!',
    uptimeInSeconds: null,
    bootedAt: '2023-09-07T12:47:16.000-07:00',
    temperature: '43.38',
    created: '2023-05-09T07:11:41.976-07:00 By rxgd(InstrumentVitals)',
    updated: '2023-09-26T05:05:40.621-07:00 By rxgd(InstrumentVitals)'
  },
  gatewayDetailsHardware: {
    baseboardManufacturer: 'Supermicro',
    baseboardProductName: 'X11SDV-8C-TP8F',
    baseboardSerialNumber: 'WM18BS000021',
    baseboardVersion: '1.02',
    biosVendor: 'American Megatrends Inc.',
    biosVersion: '1.0b',
    biosReleaseDate: '2018-10-08',
    chassisManufacturer: 'Supermicro',
    chassisSerialNumber: '0123456789',
    chassisType: 'Main Server Chassis',
    chassisVersion: '0123456789',
    processorFamily: 'Xeon',
    processorFrequency: '2300 MHz',
    systemManufacturer: 'Supermicro',
    systemProductName: 'Super Server',
    systemSerialNumber: '0123456789',
    systemUuid: '00000000-0000-0000-0000-0025905faa00',
    systemVersion: '0123456789',
    systemFamily: 'To be filled by O.E.M.'
  },
  gatewayDetailsOs: {
    architecture: 'amd64',
    branch: 'RELEASE',
    kernel: 'FreeBSD 13.2-RELEASE #15 0e0d333f',
    name: 'FreeBSD',
    release: '13.2-RELEASE #15',
    version: '13.2'
  },
  gatewayDetailsDiskMemory: {
    diskDevice: 'AHCI SGPIO Enclosure 2.00 0001',
    diskTotalSpaceInGb: 1286,
    memoryTotalSpaceInMb: 65536,
    memoryUsedSpaceInMb: 14241,
    memoryFreeSpaceInMb: 51294,
    processorCount: 16
  }
}

const params = {
  tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
  gatewayId: 'bbc41563473348d29a36b76e95c50381',
  activeTab: 'overview'
}


describe('RWG Dashboard statistics', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getGatewayDetails.url,
        (req, res, ctx) => res(ctx.json(gatewayDetails))
      )
    )

    store.dispatch(venueApi.util.resetApiState())
  })

  it('should render more details', async () => {

    render(<Provider><GatewayDetailsContentSwitch /> </Provider>, {
      route: { params }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })

    expect(await screen.findByRole('radio', { name: 'General' })).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: 'Hardware' })).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: 'OS' })).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: 'Disk & Memory' })).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('radio', { name: 'Hardware' }))
    fireEvent.click(await screen.findByRole('radio', { name: 'OS' }))
    fireEvent.click(await screen.findByRole('radio', { name: 'Disk & Memory' }))
    fireEvent.click(await screen.findByRole('radio', { name: 'General' }))
  })

})
