/* eslint-disable max-len */
import { ServiceType }    from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  getSelectServiceRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation
} from './pages/Services/serviceRouteUtils'
import RcRoutes from './Routes'

jest.mock('./pages/Devices/Wifi/ApsTable', () => () => {
  return <div data-testid='ApsTable' />
})

jest.mock('./pages/Devices/Wifi/ApDetails', () => () => {
  return <div data-testid='ApDetails' />
})

jest.mock('./pages/Devices/Switch/SwitchesTable', () => () => {
  return <div data-testid='SwitchesTable' />
})

jest.mock('./pages/Networks/NetworksTable', () => () => {
  return <div data-testid='NetworksTable' />
})

jest.mock('./pages/Networks/NetworkForm/NetworkForm', () => () => {
  return <div data-testid='NetworkForm' />
})

jest.mock('./pages/Networks/NetworkDetails/NetworkDetails', () => () => {
  return <div data-testid='NetworkDetails' />
})

jest.mock('./pages/Services/ServicesTable', () => () => {
  return <div data-testid='ServicesTable' />
})

jest.mock('./pages/Services/SelectServiceForm', () => () => {
  return <div data-testid='SelectServiceForm' />
})

jest.mock('./pages/Services/MdnsProxy/MdnsProxyForm/MdnsProxyForm', () => () => {
  return <div data-testid='MdnsProxyForm' />
})

jest.mock('./pages/Services/DHCPForm/DHCPForm', () => () => {
  return <div data-testid='DHCPForm' />
})

describe('RcRoutes: Devices', () => {
  test('should redirect devices to devices/aps', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ApsTable')).toBeVisible()
  })

  test('should navigate to devices/aps', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/aps',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ApsTable')).toBeVisible()
  })

  test('should navigate to devices ap-details', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/aps/apId/details/some-tab',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ApDetails')).toBeVisible()
  })

  test('should navigate to devices/switches', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/switches',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('SwitchesTable')).toBeVisible()
  })

})

describe('RcRoutes: Networks', () => {
  test('should navigate to networks', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/networks',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('NetworksTable')).toBeVisible()
  })

  test('should navigate to networks/add', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/networks/add',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('NetworkForm')).toBeVisible()
  })

  test('should navigate to network-details', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/networks/networkId/network-details/some-tab',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('NetworkDetails')).toBeVisible()
  })

  test('should navigate to network-action', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/networks/networkId/edit',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('NetworkForm')).toBeVisible()
  })

})

describe('RcRoutes: Services', () => {
  test('should navigate to service list', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + getServiceListRoutePath(),
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ServicesTable')).toBeVisible()
  })

  test('should navigate to select service page', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + getSelectServiceRoutePath(),
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('SelectServiceForm')).toBeVisible()
  })

  test('should navigate to create MdnsProxy page', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE }),
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('MdnsProxyForm')).toBeVisible()
  })

  test('should navigate to edit MdnsProxy page', async () => {
    let path = getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT })
    path = path.replace(':serviceId', 'serviceId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('MdnsProxyForm')).toBeVisible()
  })

  test('should navigate to MdnsProxy details page', async () => {
    let path = getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL })
    path = path.replace(':serviceId', 'serviceId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByText('mDNS Proxy details page')).toBeVisible()
  })

  test('should navigate to create WIFI_CALLING page', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE }),
        wrapRoutes: false
      }
    })
    expect(screen.getByText('WIFI_CALLING create page')).toBeVisible()
  })

  test('should navigate to edit WIFI_CALLING page', async () => {
    let path = getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT })
    path = path.replace(':serviceId', 'serviceId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByText('WIFI_CALLING edit page')).toBeVisible()
  })

  test('should navigate to WIFI_CALLING details page', async () => {
    let path = getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL })
    path = path.replace(':serviceId', 'serviceId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByText('WIFI_CALLING details page')).toBeVisible()
  })

  test('should navigate to create DHCP page', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE }),
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('DHCPForm')).toBeVisible()
  })

  test('should navigate to edit DHCP page', async () => {
    let path = getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.EDIT })
    path = path.replace(':serviceId', 'serviceId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('DHCPForm')).toBeVisible()
  })

  test('should navigate to DHCP details page', async () => {
    let path = getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.DETAIL })
    path = path.replace(':serviceId', 'serviceId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByText('DHCP details page')).toBeVisible()
  })

})
