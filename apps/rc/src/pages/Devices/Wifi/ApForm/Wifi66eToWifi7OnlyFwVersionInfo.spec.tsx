import { rest } from 'msw'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { FirmwareUrlsInfo }           from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { Wifi66eToWifi7OnlyFwVersionInfo } from './Wifi66eToWifi7OnlyFwVersionInfo'


const mockedApModelFamilies = [
  {
    name: 'AC_WAVE1',
    apModels: ['R600', 'R500']
  },
  {
    name: 'AC_WAVE2',
    apModels: ['R720', 'R710']
  },
  {
    name: 'WIFI_6',
    apModels: ['R550', 'R750']
  },
  {
    name: 'WIFI_6E',
    apModels: ['R560', 'R760']
  },
  {
    name: 'WIFI_7',
    apModels: ['R770', 'R670']
  }
]

describe('Wifi66eToWifi7OnlyFwVersionInfo', () => {
  const params = { tenantId: 'tenant-id', action: 'edit' }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (req, res, ctx) => res(ctx.json(mockedApModelFamilies))
      )
    )
  })

  afterEach(() => {
    jest.mocked(useIsSplitOn).mockRestore()
  })

  it('renders nothing when the feature flag is disabled', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(<Provider>
      <Wifi66eToWifi7OnlyFwVersionInfo
        targetVenueVersion={'7.0.0.104.1'}
        apModel={'R550'}
        apFirmwareVersion={'7.0.0.103.1'}
      />
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/wifi/:action' }
    })

    expect(screen.queryByText('R500 may not be compatible with the venue\'s version.')).toBeNull()
  })

  it('renders nothing when apModel does not belong to WIFI_6 or WIFI_6E family', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <Wifi66eToWifi7OnlyFwVersionInfo
        targetVenueVersion={'7.0.0.104.1'}
        apModel={'R500'}
        apFirmwareVersion={'7.0.0.103.1'}
      />
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/wifi/:action' }
    })

    expect(screen.queryByText('R500 may not be compatible with the venue\'s version.')).toBeNull()
  })

  it('renders nothing when AP firmware and target Venue firmware do not meet the condition', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <Wifi66eToWifi7OnlyFwVersionInfo
        targetVenueVersion={'7.0.0.103.1'}
        apModel={'R550'}
        apFirmwareVersion={'7.0.0.103.1'}
      />
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/wifi/:action' }
    })

    expect(screen.queryByText('R500 may not be compatible with the venue\'s version.')).toBeNull()
  })

  it('renders the correct message when all conditions are met', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <Wifi66eToWifi7OnlyFwVersionInfo
        targetVenueVersion={'7.0.0.103.1'}
        apModel={'R550'}
        apFirmwareVersion={'7.0.0.104.1'}
      />
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/wifi/:action' }
    })

    // eslint-disable-next-line max-len
    expect(await screen.findByText('R550 may not be compatible with the venue\'s version.')).toBeInTheDocument()
  })
})
