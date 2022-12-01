import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import ApDetails from '.'

describe('ApDetails', () => {
  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(asFragment()).toMatchSnapshot()
    fireEvent.click(await screen.findByRole('tab', { name: 'Troubleshooting' }))
  })

  it('should navigate to troubleshooting tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'reports'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'timeline'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'not-exist'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })

})
