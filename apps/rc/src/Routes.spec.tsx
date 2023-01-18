/* eslint-disable max-len */
import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ServiceType,
  getSelectServiceRoutePath,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation
}    from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

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

jest.mock('./pages/Services/MdnsProxy/MdnsProxyDetail/MdnsProxyDetail', () => () => {
  return <div data-testid='MdnsProxyDetail' />
})

jest.mock('./pages/Services/DHCP/DHCPForm/DHCPForm', () => () => {
  return <div data-testid='DHCPForm' />
})

jest.mock('./pages/Services/Portal/PortalForm/PortalForm', () => () => {
  return <div data-testid='PortalForm' />
})

jest.mock('./pages/Services/DHCP/DHCPDetail', () => () => {
  return <div data-testid='DHCPDetail' />
})

jest.mock('./pages/Services/Dpsk/DpskForm/DpskForm', () => () => {
  return <div data-testid='DpskForm' />
})

jest.mock('./pages/Services/Dpsk/DpskTable/DpskTable', () => () => {
  return <div data-testid='DpskTable' />
})

jest.mock('./pages/Services/Portal/PortalDetail', () => () => {
  return <div data-testid='PortalServiceDetail' />
})

jest.mock('./pages/Users/Wifi/ClientList', () => () => {
  return <div data-testid='UserClientList' />
})

jest.mock('./pages/Users/Wifi/ClientDetails', () => () => {
  return <div data-testid='UserClientDetails' />
})

jest.mock('./pages/Devices/Edge/AddEdge', () => () => {
  return <div data-testid='AddEdge' />
})

jest.mock('./pages/Devices/Edge/EdgeDetails/EditEdge', () => () => {
  return <div data-testid='EditEdge' />
})

jest.mock('./pages/Timeline', () => () => {
  return <div data-testid='Timeline' />
})

jest.mock('./pages/Users/Persona', () => () => {
  return <div data-testid='PersonaPortal' />
})

jest.mock('./pages/Users/Persona/PersonaDetails', () => () => {
  return <div data-testid='PersonaDetails' />
})

jest.mock('./pages/Users/Persona/PersonaGroupDetails', () => () => {
  return <div data-testid='PersonaGroupDetails' />
})

describe('RcRoutes: Devices', () => {
  test('should redirect devices to devices/wifi', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ApsTable')).toBeVisible()
  })

  test('should navigate to devices/wifi', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/wifi',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ApsTable')).toBeVisible()
  })

  test('should navigate to devices ap-details', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/wifi/serialNumber/details/some-tab',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ApDetails')).toBeVisible()
  })

  test('should navigate to devices/switch', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/switch',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('SwitchesTable')).toBeVisible()
  })

  test('should navigate to devices AddEdge', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/edge/add',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('AddEdge')).toBeVisible()
  })

  test('should navigate to devices EditEdge', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/edge/serialNumber/edit/activeTab',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('EditEdge')).toBeVisible()
  })

  test('should navigate to devices EditEdge with subTab', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/edge/serialNumber/edit/activeTab/activeSubTab',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('EditEdge')).toBeVisible()
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
    const path = getServiceDetailsLink({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('MdnsProxyForm')).toBeVisible()
  })

  test('should navigate to MdnsProxy details page', async () => {
    const path = getServiceDetailsLink({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL, serviceId: 'SERVICE_ID' })
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('MdnsProxyDetail')).toBeVisible()
  })

  test('should navigate to create DPSK page', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE }),
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('DpskForm')).toBeVisible()
  })

  test('should navigate to edit DPSK page', async () => {
    const path = getServiceDetailsLink({ type: ServiceType.DPSK, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('DpskForm')).toBeVisible()
  })

  test('should navigate to DPSK table page', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST }),
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('DpskTable')).toBeVisible()
  })

  test('should navigate to create WIFI_CALLING page', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE }),
        wrapRoutes: false
      }
    })
    expect(screen.getByText(/add wi\-fi calling service/i)).toBeVisible()
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
    expect(screen.getByText(/configure wi\-fi calling service/i)).toBeVisible()
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
    expect(screen.getByText(/instance/i)).toBeVisible()
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
    expect(screen.getByTestId('DHCPDetail')).toBeVisible()
  })

  test('should navigate to create Portal page', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE }),
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('PortalForm')).toBeVisible()
  })

  test('should navigate to edit Portal page', async () => {
    let path = getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.EDIT })
    path = path.replace(':serviceId', 'serviceId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('PortalForm')).toBeVisible()
  })

  test('should navigate to Portal details page', async () => {
    let path = getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.DETAIL })
    path = path.replace(':serviceId', 'serviceId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('PortalServiceDetail')).toBeVisible()
  })

})

describe('RcRoutes: User', () => {
  test('should redirect user to user/wifi/clients', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('UserClientList')).toBeVisible()
  })
  test('should redirect user/wifi to user/wifi/clients', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/wifi',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('UserClientList')).toBeVisible()
  })
  test('should redirect to user/wifi/clients correctly', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/wifi/clients',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('UserClientList')).toBeVisible()
  })
  test('should redirect details to details/overview', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/wifi/clients/clientId/details/',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('UserClientDetails')).toBeVisible()
  })
  test('should redirect to details/overview correctly', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/wifi/clients/clientId/details/overview',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('UserClientDetails')).toBeVisible()
  })
  test('should redirect details/timeline to details/timeline/events', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/wifi/clients/clientId/details/timeline',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('UserClientDetails')).toBeVisible()
  })
  test('should redirect to details/timeline/events correctly', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/wifi/clients/clientId/details/timeline/events',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('UserClientDetails')).toBeVisible()
  })
  test('should redirect to Persona Portal', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/persona-management',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('PersonaPortal')).toBeVisible()
  })
  test('should redirect to Persona detail', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/persona-management/persona-group/personGroupId/persona/personaId',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('PersonaDetails')).toBeVisible()
  })
  test('should redirect to Persona Group detail', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/users/persona-management/persona-group/personGroupId',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('PersonaGroupDetails')).toBeVisible()
  })
})

describe('RcRoutes: Timeline', () => {
  test('should redirect timeline to timeline/activities', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/timeline',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('Timeline')).toBeVisible()
  })

  test('should navigate to timeline/activities', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/timeline/activities',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('Timeline')).toBeVisible()
  })
})
