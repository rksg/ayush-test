import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { apDetailData }       from './__tests__/fixtures'
import { events, eventsMeta } from './ApTimelineTab/__tests__/fixtures'

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

describe('ApDetails', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.get(CommonUrlsInfo.getApDetailHeader.url,
        (_, res, ctx) => res(ctx.json(apDetailData))),
      rest.post(CommonUrlsInfo.getEventList.url,
        (_, res, ctx) => res(ctx.json(events))),
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventsMeta)))
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'overview'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
    })

    expect(await screen.findByText('Overview')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(7)
  })

  it('should navigate to analytic tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'analytics'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('AI Analytics')
  })

  it('should navigate to troubleshooting tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'troubleshooting'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
    })
    expect((await screen.findAllByRole('tab', { selected: true })).at(0)?.textContent)
      .toEqual('Ping')
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'reports'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Reports')
  })

  it('should navigate to networks tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'networks'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Networks ()')
  })

  it('should navigate to clients tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'clients'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Clients ()')
  })

  it('should navigate to services tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'services'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Services (0)')
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'timeline'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Timeline')
    await screen.findByTestId('rc-EventTable')
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      serialNumber: 'ap-serialNumber',
      activeTab: 'not-exist'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
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
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/details/:activeTab' }
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Configure' }))
  })
})
