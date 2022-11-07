import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { apDetailData } from './__tests__/fixtures'

import ApDetails from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  ConnectedClientsOverTime: () => <div data-testid={'analytics-ConnectedClientsOverTime'} title='ConnectedClientsOverTime' />,
  IncidentBySeverity: () => <div data-testid={'analytics-IncidentBySeverity'} title='IncidentBySeverity' />,
  NetworkHistory: () => <div data-testid={'analytics-NetworkHistory'} title='NetworkHistory' />,
  SwitchesTrafficByVolume: () => <div data-testid={'analytics-SwitchesTrafficByVolume'} title='SwitchesTrafficByVolume' />,
  TopSwitchModels: () => <div data-testid={'analytics-TopSwitchModels'} title='TopSwitchModels' />,
  TopApplicationsByTraffic: () => <div data-testid={'analytics-TopApplicationsByTraffic'} title='TopApplicationsByTraffic' />,
  TopSSIDsByClient: () => <div data-testid={'analytics-TopSSIDsByClient'} title='TopSSIDsByClient' />,
  TopSSIDsByTraffic: () => <div data-testid={'analytics-TopSSIDsByTraffic'} title='TopSSIDsByTraffic' />,
  TopSwitchesByError: () => <div data-testid={'analytics-TopSwitchesByError'} title='TopSwitchesByError' />,
  TopSwitchesByPoEUsage: () => <div data-testid={'analytics-TopSwitchesByPoEUsage'} title='TopSwitchesByPoEUsage' />,
  TopSwitchesByTraffic: () => <div data-testid={'analytics-TopSwitchesByTraffic'} title='TopSwitchesByTraffic' />,
  TrafficByVolume: () => <div data-testid={'analytics-TrafficByVolume'} title='TrafficByVolume' />,
  VenueHealth: () => <div data-testid={'analytics-VenueHealth'} title='VenueHealth' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  TopologyFloorPlanWidget: () => <div data-testid={'rc-TopologyFloorPlanWidget'} title='TopologyFloorPlanWidget' />,
  VenueAlarmWidget: () => <div data-testid={'rc-VenueAlarmWidget'} title='VenueAlarmWidget' />,
  VenueDevicesWidget: () => <div data-testid={'rc-VenueDevicesWidget'} title='VenueDevicesWidget' />
}))
/* eslint-enable */

describe('ApDetails', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getApDetailHeader.url,
        (req, res, ctx) => res(ctx.json(apDetailData))
      )
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })

    expect(await screen.findByText('test-ap')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(8)

    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to analytic tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'analytics'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to troubleshooting tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'troubleshooting'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'reports'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to networks tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'networks'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to clients tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'clients'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to services tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'services'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'timeline'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'not-exist'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })

    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })
  it('should go to edit page', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'overview'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/aps/:serialNumber/details/:activeTab' }
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Configure' }))
  })
})
