import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi }                      from '@acx-ui/rc/services'
import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { apDetailData } from './__tests__/fixtures'

import ApDetails from '.'

jest.mock(
  'analytics/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`analytics-${name}`} title={name} />,
  { virtual: true })

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })


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
