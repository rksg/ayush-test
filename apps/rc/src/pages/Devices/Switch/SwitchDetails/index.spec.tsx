import '@testing-library/jest-dom'
import { rest } from 'msw'

import { apApi }                                        from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider, store }                              from '@acx-ui/store'
import { mockRestApiQuery, mockServer, render, screen } from '@acx-ui/test-utils'
import { RolesEnum }                                    from '@acx-ui/types'
import { getUserProfile, setUserProfile }               from '@acx-ui/user'

import { switchDetailData } from './__tests__/fixtures'
import { activities }       from './SwitchTimelineTab/__tests__/fixtures'

import SwitchDetails from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  RangePicker: () => <div data-testid={'analytics-RangePicker'} title='RangePicker' />
}))
jest.mock('@acx-ui/rc/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/rc/components'))
    .map(key => [key, () => <div data-testid={`rc-${key}`} title={key} />])
  return Object.fromEntries(sets)
})

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))

const jwtToken = {
  access_token: 'access_token',
  expires_in: '604800',
  id_token: 'id_token',
  type: 'JWT'
}

const switchOnlineData = {
  data: [
    {
      cliApplied: false,
      configReady: true,
      deviceStatus: 'ONLINE',
      id: '58:fb:96:0e:bc:f8',
      serialNumber: 'FEK3230S0C5',
      syncDataEndTime: '2023-01-23T07:53:36Z',
      syncDataId: '',
      syncedSwitchConfig: true
    }
  ]
}

export const switchResponse = {
  id: 'dc:ae:eb:2d:ff:8a',
  venueId: '561c8f43714647e2a4aecaba4c4b658b',
  name: 'ICX7150-C12 Router',
  enableStack: false,
  igmpSnooping: 'active',
  jumboMode: false,
  ipAddressInterfaceType: 'VE',
  ipAddressInterface: '1',
  ipAddressType: 'static',
  ipAddress: '192.168.1.73',
  subnetMask: '255.255.255.0',
  firmwareVersion: 'SPR09010e.bin',
  dhcpClientEnabled: false,
  dhcpServerEnabled: false,
  specifiedType: 'AUTO',
  rearModule: 'none'
}

const configBackupsList = {
  data: [
    {
      id: '93999bfb05d34a438ff5ff40b8648967',
      createdDate: '2023-01-11T10:12:48.880+00:00',
      name: 'Manual_20230111181247',
      backupType: 'MANUAL',
      backupName: 'c0:c5:20:aa:32:79-1673431968878',
      status: 'SUCCESS',
      config: 'ver 09.0.10eT213\n!\nstack unit 1',
      switchId: 'c0:c5:20:aa:32:79'
    },
    {
      id: 'f89fee4468d2405cbfc7fb012d0632c8',
      createdDate: '2023-01-10T05:00:00.408+00:00',
      name: 'SCHEDULED_1',
      backupType: 'SCHEDULED',
      backupName: 'c0:c5:20:aa:32:79-1673326800403',
      status: 'SUCCESS',
      restoreStatus: 'SUCCESS',
      config: 'ver 09.0.10eT213\n!\nstack unit 2',
      switchId: 'c0:c5:20:aa:32:79'
    }
  ],
  page: 1,
  totalCount: 2,
  totalPages: 1
}

export const troubleshootingResult_ping_emptyResult = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'EMPTY_RESULT',
    pingIp: '1.1.1.1',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'ping'
  }
}

jest.mock('./SwitchOverviewTab', () => () => {
  return <div data-testid={'rc-SwitchOverviewTab'} title='SwitchOverviewTab' />
})


describe('SwitchDetails', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailData))),
      rest.get(SwitchUrlsInfo.getJwtToken.url,
        (_, res, ctx) => res(ctx.json(jwtToken))),
      rest.post(SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json(switchOnlineData))),
      rest.get(SwitchUrlsInfo.getSwitch.url,
        (_, res, ctx) => res(ctx.json(switchResponse))),
      rest.post(SwitchUrlsInfo.getDhcpPools.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(SwitchUrlsInfo.getSwitchConfigBackupList.url,
        (req, res, ctx) => res(ctx.json(configBackupsList))),
      rest.get(SwitchUrlsInfo.getTroubleshooting.url,
        (req, res, ctx) => res(ctx.json(troubleshootingResult_ping_emptyResult)))
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(await screen.findByText('Overview')).toBeVisible()
  })

  it('should navigate to incidents tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'incidents'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(await screen.findByText('Incidents')).toBeVisible()
  })

  it('should navigate to troubleshooting tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'troubleshooting'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Troubleshooting')
  })

  it('should navigate to clients tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'clients'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Clients (1)')
  })

  it('should navigate to configuration tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'configuration'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Configuration')
  })

  it('should navigate to DHCP tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'dhcp'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('DHCP')
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'timeline'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Timeline')
    await screen.findByTestId('rc-ActivityTable')
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'not-exist'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })

    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })

  it('should hide incidents when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'incidents'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(screen.queryByTestId('rc-SwitchIncidentsTab')).toBeNull()
  })
})
