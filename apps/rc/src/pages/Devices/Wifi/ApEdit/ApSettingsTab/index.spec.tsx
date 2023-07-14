import '@testing-library/jest-dom'

import { rest } from 'msw'

import { useIsSplitOn, useIsTierAllowed }             from '@acx-ui/feature-toggle'
import { apApi, venueApi }                            from '@acx-ui/rc/services'
import { ApRadioBands, CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                            from '@acx-ui/store'
import { fireEvent, mockServer, render, screen }      from '@acx-ui/test-utils'
import { getUrlForTest }                              from '@acx-ui/utils'

import { r760Ap, triBandApCap, validRadioChannels } from '../../../__tests__/fixtures'
import { apRadio }                                  from '../../ApDetails/__tests__/fixtures'

import { ApSettingsTab } from './'

const apLanPort = {
  lanPorts: [
    {
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '1',
      enabled: true
    },
    {
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '2',
      enabled: true
    }
  ],
  useVenueSettings: false
}


const apViewModel = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: 'serial-number',
      lastUpdTime: '2022-11-14T07:37:21.976Z',
      lastSeenTime: '2022-11-14T09:55:55.495Z',
      name: 'UI team ONLY',
      model: '',
      fwVersion: '',
      venueId: '16b11938ee934928a796534e2ee47661',
      venueName: 'venue-dhcp-ui',
      deviceStatus: '2_00_Operational',
      deviceStatusSeverity: '2_Operational',
      IP: '',
      extIp: '',
      apMac: '',
      rootAP: {
        name: 'test'
      },
      apDownRssi: 1,
      apUpRssi: 1,
      apStatusData: {
        APRadio: [
          {
            channel: 0,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            channel: 0,
            band: '5G',
            Rssi: null,
            radioId: 1
          },
          {
            channel: 0,
            band: ApRadioBands.band50,
            Rssi: null,
            radioId: 2
          },
          {
            channel: 0,
            band: ApRadioBands.band50,
            Rssi: null,
            radioId: 1
          }
        ],
        APSystem: {
          uptime: 93308
        },
        cellularInfo: {
          cellular3G4GChannel: 0,
          cellularActiveSim: '',
          cellularBand: 'string',
          cellularCardRemovalCountSIM0: '',
          cellularCardRemovalCountSIM1: '',
          cellularConnectionStatus: '',
          cellularCountry: 'string',
          cellularDHCPTimeoutCountSIM0: '',
          cellularDHCPTimeoutCountSIM1: '',
          cellularDefaultGateway: 'string',
          cellularDownlinkBandwidth: 'string',
          cellularECIO: 0,
          cellularICCIDSIM0: '',
          cellularICCIDSIM1: '',
          cellularIMEI: '',
          cellularIMSISIM0: '',
          cellularIMSISIM1: '',
          cellularIPaddress: '',
          cellularIsSIM0Present: 'YES',
          cellularIsSIM1Present: 'YES',
          cellularLTEFirmware: 'string',
          cellularNWLostCountSIM0: '',
          cellularNWLostCountSIM1: '',
          cellularOperator: 'string',
          cellularRSCP: 0,
          cellularRSRP: 0,
          cellularRSRQ: 0,
          cellularRadioUptime: 0,
          cellularRoamingStatus: 'string',
          cellularRxBytesSIM0: '',
          cellularRxBytesSIM1: '',
          cellularSINR: 0,
          cellularSignalStrength: '',
          cellularSubnetMask: 'string',
          cellularSwitchCountSIM0: '',
          cellularSwitchCountSIM1: '',
          cellularTxBytesSIM0: '',
          cellularTxBytesSIM1: '',
          cellularUplinkBandwidth: 'string',
          cellularWanInterface: 'string'
        },
        lanPortStatus: [
          {
            port: '0',
            phyLink: 'Down  '
          },
          {
            port: '1',
            phyLink: 'Up 1000Mbps full'
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: 'be41e3513eb7446bbdebf461dec67ed3',
      tags: '',
      deviceGroupName: '',
      deviceModelType: '',
      password: 'admin!234',
      isMeshEnable: true
    }
  ]
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number'
}

describe('ApSettingsTab', () => {
  beforeEach (() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(
        getUrlForTest(WifiUrlsInfo.getAp).replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(r760Ap))),
      rest.get(
        WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(triBandApCap))),
      rest.get(
        WifiUrlsInfo.getApNetworkSettings.url,
        (_, res, ctx) => res(ctx.json(null))),
      rest.get(
        WifiUrlsInfo.getApValidChannel.url,
        (_, res, ctx) => res(ctx.json(validRadioChannels))),
      rest.get(
        WifiUrlsInfo.getApRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(apRadio))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(apViewModel))),
      rest.get(
        WifiUrlsInfo.getApLanPorts.url,
        (_, res, ctx) => res(ctx.json(apLanPort))
      )
    )
  })

  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(<Provider><ApSettingsTab /></Provider>, {
      route: { params }
    })

    await screen.findByRole('tab', { name: 'Mesh' })
    fireEvent.click(await screen.findByRole('tab', { name: 'Radio' }))
  })

  it('should render correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
    render(<Provider><ApSettingsTab /></Provider>, {
      route: {
        params
      }
    })
    fireEvent.click(await screen.findByRole('tab', { name: 'LAN Port' }))
  })
})
