import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { apApi }                                        from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }                 from '@acx-ui/rc/utils'
import { Provider, store }                              from '@acx-ui/store'
import { mockRestApiQuery, mockServer, render, screen } from '@acx-ui/test-utils'
import { RolesEnum }                                    from '@acx-ui/types'
import { getUserProfile, setUserProfile }               from '@acx-ui/user'

import { apDetailData } from './__tests__/fixtures'
import { activities }   from './ApTimelineTab/__tests__/fixtures'

import ApDetails from '.'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  RangePicker: () => <div data-testid={'analytics-RangePicker'} title='RangePicker' />
}))
jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={`analytics-${key}`} title={key} />])
  return Object.fromEntries(sets)
})
jest.mock('@acx-ui/rc/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/rc/components'))
    .map(key => [key, () => <div data-testid={`rc-${key}`} title={key} />])
  return Object.fromEntries(sets)
})
jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))

jest.mock('./ApOverviewTab/ApPhoto', () => ({
  ...jest.requireActual('./ApOverviewTab/ApPhoto'),
  ApPhoto: () => <div data-testid='ApPhoto' />
}))

jest.mock('./ApOverviewTab/ApProperties', () => ({
  ...jest.requireActual('./ApOverviewTab/ApProperties'),
  ApProperties: () => <div data-testid='ApProperties' />
}))

jest.mock('./ApNeighbors', () => ({
  ApNeighborsTab: () => <div data-testid='ApNeighborsTab' />
}))

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '000000000001',
      name: 'mock-ap-1',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '2_00_Operational',
      IP: '10.00.000.101',
      apMac: '00:00:00:00:00:01',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }
  ]
}

describe('ApDetails', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
    mockServer.use(
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(list))
      ),
      rest.get(CommonUrlsInfo.getApDetailHeader.url,
        (_, res, ctx) => res(ctx.json(apDetailData))),
      rest.patch(
        WifiUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123456789' }))
      )
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'overview'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })

    expect(await screen.findByText('Overview')).toBeVisible()
    expect(await screen.findAllByRole('tab')).toHaveLength(6)
  })

  it('should navigate to analytic tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'analytics'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('AI Analytics')
  })

  it('should navigate to troubleshooting tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'troubleshooting'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Ping')
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'reports'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Reports')
  })

  it('should navigate to networks tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'networks'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApNetworkList.url,
        (req, res, ctx) => res(ctx.json([]))
      )
    )

    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Networks ()')
  })

  it('should navigate to clients tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'clients'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Clients ()')
  })

  it.skip('should navigate to services tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'services'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Services (0)')
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'timeline'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Timeline')
    await screen.findByTestId('rc-ActivityTable')
  })

  it('should navigate to neighbors tab correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => ff === Features.WIFI_EDA_NEIGHBORS_TOGGLE)

    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'neighbors'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Neighbors')
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'not-exist'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })

    const tabs = await screen.findAllByRole('tab')
    expect(tabs.filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })

  it('should go to edit page', async () => {
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'overview'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Configure' }))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      `/${params.tenantId}/t/devices/wifi/${list?.data?.[0].serialNumber}/edit/general`
    )
  })

  it('should hide analytics when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    const params = {
      tenantId: 'tenant-id',
      apId: 'ap-id',
      activeTab: 'analytics'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:apId/details/:activeTab' }
    })
    expect(screen.queryByTestId('rc-ApAnalyticsTab')).toBeNull()
  })
})
