/* eslint-disable max-len */
import { Features, useIsSplitOn, useIsTierAllowed }        from '@acx-ui/feature-toggle'
import {
  ServiceType,
  getSelectServiceRoutePath,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  getPolicyListRoutePath,
  PolicyType,
  getPolicyRoutePath,
  PolicyOperation,
  getServiceCatalogRoutePath,
  getPolicyDetailsLink, getAdaptivePolicyDetailRoutePath
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import useEdgeNokiaOltTable from './pages/Devices/Edge/Olt/OltTable'
import { WirelessTabsEnum } from './pages/Users/Wifi/ClientList'
import { WiredTabsEnum }    from './pages/Users/Wired'
import RcRoutes             from './Routes'

jest.mock('./pages/Devices/Wifi/ApsTable', () => ({
  ...jest.requireActual('./pages/Devices/Wifi/ApsTable'),
  __esModule: true,
  default: () => ({
    title: 'ApsTable',
    headerExtra: [],
    component: <div data-testid='ApsTable' />
  })
}))

jest.mock('./pages/Devices/Wifi/ApGroupsTable', () => ({
  ...jest.requireActual('./pages/Devices/Wifi/ApGroupsTable'),
  __esModule: true,
  default: () => ({
    title: 'ApGroupsTable',
    headerExtra: [],
    component: <div data-testid='ApGroupsTable' />
  })
}))

jest.mock('./pages/Devices/Wifi/ApDetails', () => () => {
  return <div data-testid='ApDetails' />
})

jest.mock('./pages/Devices/Switch/SwitchesTable', () => ({
  ...jest.requireActual('./pages/Devices/Switch/SwitchesTable'),
  __esModule: true,
  default: () => ({
    title: 'SwitchesTable',
    headerExtra: [],
    component: <div data-testid='SwitchesTable' />
  })
}))

jest.mock('./pages/Networks/wireless/NetworksTable', () => ({
  ...jest.requireActual('./pages/Networks/wireless/NetworksTable'),
  __esModule: true,
  default: () => ({
    title: 'NetworksTable',
    headerExtra: [],
    component: <div data-testid='NetworksTable' />
  })
}))

jest.mock('./pages/Services/MyServices', () => () => {
  return <div data-testid='MyServices' />
})

jest.mock('./pages/Services/ServiceCatalog', () => () => {
  return <div data-testid='ServiceCatalog' />
})

jest.mock('./pages/Policies/MyPolicies', () => () => {
  return <div data-testid='MyPolicies' />
})

jest.mock('./pages/Services/SelectServiceForm', () => () => {
  return <div data-testid='SelectServiceForm' />
})

jest.mock('./pages/Services/MdnsProxy/MdnsProxyForm/MdnsProxyForm', () => () => {
  return <div data-testid='MdnsProxyForm' />
})

jest.mock('./pages/Services/MdnsProxy/MdnsProxyTable/MdnsProxyTable', () => () => {
  return <div data-testid='MdnsProxyTable' />
})

jest.mock('./pages/Services/MdnsProxy/MdnsProxyDetail/MdnsProxyDetail', () => () => {
  return <div data-testid='MdnsProxyDetail' />
})

jest.mock('./pages/Services/WifiCalling/WifiCallingTable/WifiCallingTable', () => () => {
  return <div data-testid='WifiCallingTable' />
})

jest.mock('./pages/Services/Dpsk/DpskTable/DpskTable', () => () => {
  return <div data-testid='DpskTable' />
})

jest.mock('./pages/Services/Dpsk/DpskDetail/DpskDetails', () => () => {
  return <div data-testid='DpskDetails' />
})

jest.mock('./pages/Services/Portal/PortalDetail', () => () => {
  return <div data-testid='PortalServiceDetail' />
})

jest.mock('./pages/Services/Portal/PortalTable', () => () => {
  return <div data-testid='PortalTable' />
})

jest.mock('./pages/Services/NetworkSegWebAuth/NetworkSegAuthTable', () => () => {
  return <div data-testid='NetworkSegAuthTable' />
})

jest.mock('./pages/Services/NetworkSegWebAuth/NetworkSegAuthForm', () => () => {
  return <div data-testid='NetworkSegAuthForm' />
})

jest.mock('./pages/Services/NetworkSegWebAuth/NetworkSegAuthDetail', () => () => {
  return <div data-testid='NetworkSegAuthDetail' />
})

jest.mock('./pages/Services/DHCP/Edge/AddDHCP', () => () => {
  return <div data-testid='AddEdgeDhcp' />
})

jest.mock('./pages/Services/DHCP/DHCPTable/DHCPTable', () => () => {
  return <div data-testid='DHCPTable' />
})

jest.mock('./pages/Services/DHCP/Edge/DHCPTable', () => () => {
  return <div data-testid='EdgeDhcpTable' />
})

jest.mock('./pages/Services/DHCP/Edge/DHCPDetail', () => () => {
  return <div data-testid='EdgeDHCPDetail' />
})

jest.mock('./pages/Services/DHCP/Edge/EditDHCP', () => () => {
  return <div data-testid='EdgeEditDhcp' />
})

jest.mock('./pages/Users/Switch/ClientList', () => () => {
  return <div data-testid='SwitchClientList' />
})

jest.mock('./pages/Users/Wired', () => ({
  ...jest.requireActual('./pages/Users/Wired'),
  WiredClientList: (props: { tab: WiredTabsEnum }) => <div data-testid={props.tab} />
}))

jest.mock('./pages/Users/Wifi/ClientList', () => ({
  ...jest.requireActual('./pages/Users/Wifi/ClientList'),
  WifiClientList: (props: { tab: WirelessTabsEnum }) => <div data-testid={props.tab} />
}))

jest.mock('./pages/Users/Wifi/ClientDetails', () => () => {
  return <div data-testid='UserClientDetails' />
})

jest.mock('./pages/Users/Wifi/GuestManagerPage', () => () => {
  return <div data-testid='GuestManagerPage' />
})

jest.mock('./pages/Devices/Edge/AddEdge', () => () => {
  return <div data-testid='AddEdge' />
})

jest.mock('./pages/Devices/Edge/EdgeDetails/EditEdge', () => () => {
  return <div data-testid='EditEdge' />
})

jest.mock('./pages/Devices/Edge/Olt/OltDetails', () => ({
  EdgeNokiaOltDetails: () => <div data-testid='EdgeNokiaOltDetails' />
}))

jest.mock('./pages/Devices/Edge/Olt/OltTable', () => ({
  ...jest.requireActual('./pages/Devices/Edge/Olt/OltTable'),
  __esModule: true,
  default: jest.fn().mockReturnValue(undefined)
}))

jest.mock('./pages/Timeline', () => () => {
  return <div data-testid='Timeline' />
})

jest.mock('./pages/Policies/ClientIsolation/ClientIsolationDetail/ClientIsolationDetail', () => () => {
  return <div data-testid='ClientIsolationDetail' />
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

jest.mock('./pages/Policies/MacRegistrationList/MacRegistrarionListTable', () => () => {
  return <div data-testid='MacRegistrationListsTable' />
})

jest.mock('./pages/Policies/PortProfile/create', () => () => {
  return <div data-testid='CreatePortProfile' />
})

jest.mock('./pages/Policies/PortProfile', () => () => {
  return <div data-testid='PortProfile' />
})

jest.mock('./pages/Policies/PortProfile/PortProfileForm/SwitchPortProfileForm', () => () => {
  return <div data-testid='AddEditPortProfile' />
})

jest.mock('./pages/Policies/PortProfile/PortProfileDetail/SwitchPortProfileDetail', () => () => {
  return <div data-testid='PortProfileDetail' />
})

jest.mock('./pages/Policies/AccessControl', () => () => {
  return <div data-testid='AccessControl' />
})

jest.mock('./pages/Policies/AccessControl/create', () => () => {
  return <div data-testid='CreateAccessControl' />
})

jest.mock('./pages/Policies/SwitchAccessControl/SwitchAccessControlSetForm', () => ({
  SwitchAccessControlSetForm: () => <div data-testid='SwitchAccessControlSetForm' />
}))

jest.mock('./pages/Policies/SwitchAccessControl/SwitchAccessControlSetDetail', () => ({
  SwitchAccessControlSetDetail: () => <div data-testid='SwitchAccessControlSetDetail' />
}))

jest.mock('./pages/Policies/SwitchAccessControl/SwitchLayer2/SwitchLayer2ACLForm', () => ({
  SwitchLayer2ACLForm: () => <div data-testid='SwitchLayer2ACLForm' />
}))

jest.mock('./pages/Policies/SwitchAccessControl/SwitchLayer2/SwitchLayer2Detail', () => ({
  SwitchLayer2Detail: () => <div data-testid='SwitchLayer2Detail' />
}))

const mockUseIsEdgeFeatureReady = jest.fn().mockReturnValue(true)

jest.mock('@acx-ui/rc/components', () => ({
  AAAForm: () => <div data-testid='AAAPolicyForm' />,
  AAAPolicyDetail: () => <div data-testid='AAAPolicyDetail' />,
  AccessControlDetail: () => <div data-testid='AccessControlDetail' />,
  AccessControlForm: () => <div data-testid='AccessControlForm' />,
  AccessControlTable: () => <div data-testid='AccessControlTable' />,
  AdaptivePolicySetForm: () => <div data-testid='AdaptivePolicySetForm' />,
  AddEthernetPortProfile: () => <div data-testid='AddEthernetPortProfile' />,
  ApGroupDetails: () => <div data-testid='ApGroupDetails' />,
  ApGroupEdit: () => <div data-testid='ApGroupEdit' />,
  CertificateAuthorityForm: () => <div data-testid='CertificateAuthorityForm' />,
  CertificateForm: () => <div data-testid='CertificateForm' />,
  CertificateTemplateForm: () => <div data-testid='CertificateTemplateForm' />,
  ClientIsolationForm: () => <div data-testid='ClientIsolationForm' />,
  CliProfileForm: () => <div data-testid='CliProfileForm' />,
  CliTemplateForm: () => <div data-testid='CliTemplateForm' />,
  ConfigurationProfileForm: () => <div data-testid='ConfigurationProfileForm' />,
  DHCPDetail: () => <div data-testid='DHCPDetail' />,
  DHCPForm: () => <div data-testid='DHCPForm' />,
  DpskForm: () => <div data-testid='DpskForm' />,
  EditEthernetPortProfile: () => <div data-testid='EditEthernetPortProfile' />,
  EthernetPortProfileDetail: () => <div data-testid='EthernetPortProfileDetail' />,
  IdentityProviderForm: () => <div data-testid='IdentityProviderForm' />,
  LbsServerProfileForm: () => <div data-testid='LbsServerProfileForm' />,
  MacRegistrationListForm: () => <div data-testid='MacRegistrationListForm' />,
  NetworkForm: () => <div data-testid='NetworkForm' />,
  PortalForm: () => <div data-testid='PortalForm' />,
  ResidentPortalForm: () => <div data-testid='ResidentPortalForm' />,
  RogueAPDetectionDetailView: () => <div data-testid='RogueAPDetectionDetailView' />,
  RogueAPDetectionForm: () => <div data-testid='RogueAPDetectionForm' />,
  RogueAPDetectionTable: () => <div data-testid='RogueAPDetectionTable' />,
  ServerClientCertificateForm: () => <div data-testid='ServerClientCertificateForm' />,
  SoftGreForm: () => <div data-testid='SoftGreForm' />,
  SyslogDetailView: () => <div data-testid='SyslogDetailView' />,
  SyslogForm: () => <div data-testid='SyslogForm' />,
  VLANPoolDetail: () => <div data-testid='VLANPoolDetail' />,
  VLANPoolForm: () => <div data-testid='VLANPoolForm' />,
  WifiCallingConfigureForm: () => <div data-testid='WifiCallingConfigureForm' />,
  WifiCallingDetailView: () => <div data-testid='WifiCallingDetailView' />,
  WifiCallingForm: () => <div data-testid='WifiCallingForm' />,
  WifiOperatorForm: () => <div data-testid='WifiOperatorForm' />,
  DirectoryServerForm: () => <div data-testid='DirectoryServerForm' />,
  AddSamlIdp: () => <div data-testid='AddSamlIdp' />,
  EditSamlIdp: () => <div data-testid='EditSamlIdp' />,
  SamlIdpDetail: () => <div data-testid='SamlIdpDetail' />,
  IpsecForm: () => <div data-testid='IpsecForm' />,
  ConnectionMeteringFormMode: {},
  useIsEdgeFeatureReady: (ff: Features) => mockUseIsEdgeFeatureReady(ff),
  IdentityForm: () => <div data-testid='IdentityForm' />,
  IdentityGroupForm: () => <div data-testid='IdentityGroupForm' />
}))

jest.mock('./pages/Networks/wireless/NetworkDetails', () => () => {
  return <div data-testid='NetworkDetails' />
})

jest.mock('./pages/Policies/AdaptivePolicy/RadiusAttributeGroup/RadiusAttributeGroupForm/RadiusAttributeGroupForm', () => () => {
  return <div data-testid='RadiusAttributeGroupForm' />
})

jest.mock('./pages/Policies/AdaptivePolicy/RadiusAttributeGroup/RadiusAttributeGroupTable', () => () => {
  return <div data-testid='RadiusAttributeGroupList' />
})

jest.mock('./pages/Policies/AdaptivePolicy/RadiusAttributeGroup/RadiusAttributeGroupDetail/RadiusAttributeGroupDetail', () => () => {
  return <div data-testid='RadiusAttributeGroupDetail' />
})

jest.mock('./pages/Policies/AdaptivePolicy/AdaptivePolicy/AdaptivePolicyForm/AdaptivePolicyForm', () => () => {
  return <div data-testid='AdaptivePolicyForm' />
})

jest.mock('./pages/Policies/AdaptivePolicy/AdaptivePolicy/AdaptivePolicyTable', () => () => {
  return <div data-testid='AdaptivePolicyList' />
})

jest.mock('./pages/Policies/AdaptivePolicy/AdaptivePolicy/AdaptivePolicyDetail/AdaptivePolicyDetail', () => () => {
  return <div data-testid='AdaptivePolicyDetail' />
})

jest.mock('./pages/Policies/AdaptivePolicy/AdaptivePolicySet/AdaptivePolicySetTable', () => () => {
  return <div data-testid='AdaptivePolicySetList' />
})

jest.mock('./pages/Policies/AdaptivePolicy/AdaptivePolicySet/AdaptivePolicySetDetail/AdaptivePolicySetDetail', () => () => {
  return <div data-testid='AdaptivePolicySetDetail' />
})

jest.mock('./pages/Services/EdgeFirewall/AddFirewall', () => () => {
  return <div data-testid='AddEdgeFirewall' />
})

jest.mock('./pages/Services/EdgeFirewall/EditFirewall', () => () => {
  return <div data-testid='EditEdgeFirewall' />
})

jest.mock('./pages/Policies/ConnectionMetering/ConnectionMeteringTable', () => () => {
  return <div data-testid='ConnectionMeteringTable' />
})

jest.mock('./pages/Policies/ConnectionMetering/ConnectionMeteringDetail', () => () => {
  return <div data-testid='ConnectionMeteringDetail' />
})

jest.mock('./pages/Policies/ConnectionMetering/ConnectionMeteringPageForm', () => () => {
  return <div data-testid='ConnectionMeteringPageForm' />
})

jest.mock('./pages/Services/EdgeSdLan', () => ({
  AddEdgeSdLan: () => <div data-testid='AddEdgeSdLan' />,
  EditEdgeSdLan: () => <div data-testid='EditEdgeSdLan' />,
  EdgeSdLanTable: () => <div data-testid='EdgeSdLanTable' />,
  EdgeSdLanDetail: () => <div data-testid='EdgeSdLanDetail' />
}))

// Edge PIN service
jest.mock('./pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkDetail', () => () => {
  return <div data-testid='PersonalIdentityNetworkDetail' />
})
jest.mock('./pages/Services/PersonalIdentityNetwork/AddPersonalIdentityNetwork', () => () => {
  return <div data-testid='AddPersonalIdentityNetwork' />
})
jest.mock('./pages/Services/PersonalIdentityNetwork/EditPersonalIdentityNetwork', () => () => {
  return <div data-testid='EditPersonalIdentityNetwork' />
})
jest.mock('./pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkTable', () => () => {
  return <div data-testid='PersonalIdentityNetworkTable' />
})
jest.mock('./pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkDetailEnhanced', () => () => {
  return <div data-testid='PersonalIdentityNetworkDetailEnhanced' />
})

// Edge mDNS Proxy service
jest.mock('./pages/Services/MdnsProxy/Edge/AddEdgeMdnsProxy', () => () => {
  return <div data-testid='AddEdgeMdnsProxy' />
})
jest.mock('./pages/Services/MdnsProxy/Edge/EdgeMdnsProxyDetails', () => () => {
  return <div data-testid='EdgeMdnsProxyDetails' />
})
jest.mock('./pages/Services/MdnsProxy/Edge/EdgeMdnsProxyTable', () => ({
  EdgeMdnsProxyTable: () => <div data-testid='EdgeMdnsProxyTable' />
}))
jest.mock('./pages/Services/MdnsProxy/Edge/EditEdgeMdnsProxy', () => () => {
  return <div data-testid='EditEdgeMdnsProxy' />
})

describe('RcRoutes: Devices', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
  test('should redirect devices to devices/wifi', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/devices',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ApsTable')).toBeVisible()
  })

  test('should navigate to devices/wifi', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/devices/wifi',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ApsTable')).toBeVisible()
  })

  test('should navigate to devices ap-details', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/devices/wifi/serialNumber/details/some-tab',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ApDetails')).toBeVisible()
  })

  test('should navigate to devices/switch', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/devices/switch',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('SwitchesTable')).toBeVisible()
  })

  test('should navigate to devices AddEdge', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/devices/edge/add',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('AddEdge')).toBeVisible()
  })

  test('should navigate to devices EditEdge', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/devices/edge/serialNumber/edit/activeTab',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('EditEdge')).toBeVisible()
  })

  test('should navigate to devices EditEdge with subTab', async () => {
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/devices/edge/serialNumber/edit/activeTab/activeSubTab',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('EditEdge')).toBeVisible()
  })

  describe('RcRoutes: Devices > Edge Optical', () => {
    jest.mocked(useEdgeNokiaOltTable).mockReturnValue({
      title: 'EdgeOltTab',
      headerExtra: [],
      component: <div data-testid='EdgeNokiaOltTable' />
    })

    test('should navigate to devices edge optical list', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/devices/optical',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('EdgeNokiaOltTable')).toBeVisible()
    })

    test('should navigate to devices edge optical details', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/devices/optical/mockOltId/details',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('EdgeNokiaOltDetails')).toBeVisible()
    })

    describe('FF is off', () => {
      beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(false))
      afterEach(() => jest.mocked(useIsSplitOn).mockReset())

      test('should be not found when navigate to devices edge optical list', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/devices/optical',
            wrapRoutes: false
          }
        })
        expect(screen.queryByTestId('EdgeNokiaOltTable')).toBeNull()
        expect(screen.getByText(/Something is going wrong/)).toBeVisible()
      })

      test('should be not found when navigate to devices edge optical details', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/devices/optical/mockOltId/details',
            wrapRoutes: false
          }
        })
        expect(screen.queryByTestId('EdgeNokiaOltDetails')).toBeNull()
        expect(screen.getByText(/Something is going wrong/)).toBeVisible()
      })
    })
  })

  describe('RcRoutes: Networks', () => {
    test('should navigate to networks', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/networks',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('NetworksTable')).toBeVisible()
    })

    test('should navigate to networks/add', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/networks/wireless/add',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('NetworkForm')).toBeVisible()
    })

    test('should navigate to network-details', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/networks/wireless/networkId/network-details/some-tab',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('NetworkDetails')).toBeVisible()
    })

    test('should navigate to network-action', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/networks/wireless/networkId/edit',
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
          path: '/tenantId/t/' + getServiceListRoutePath(),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('MyServices')).toBeVisible()
    })

    test('should navigate to service catalog', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceCatalogRoutePath(),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('ServiceCatalog')).toBeVisible()
    })

    test('should navigate to select service page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getSelectServiceRoutePath(),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('SelectServiceForm')).toBeVisible()
    })

    test('should navigate to create MdnsProxy page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('MdnsProxyForm')).toBeVisible()
    })

    test('should navigate to edit MdnsProxy page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('MdnsProxyForm')).toBeVisible()
    })

    test('should navigate to MdnsProxy details page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('MdnsProxyDetail')).toBeVisible()
    })

    test('should navigate to create DPSK page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('DpskForm')).toBeVisible()
    })

    test('should navigate to edit DPSK page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.DPSK, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('DpskForm')).toBeVisible()
    })

    test('should navigate to DPSK table page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('DpskTable')).toBeVisible()
    })

    test('should navigate to create WIFI_CALLING page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('WifiCallingForm')).toBeVisible()
    })

    test('should navigate to edit WIFI_CALLING page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('WifiCallingConfigureForm')).toBeVisible()
    })

    test('should navigate to WIFI_CALLING details page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('WifiCallingDetailView')).toBeVisible()
    })

    test('should navigate to create DHCP page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('DHCPForm')).toBeVisible()
    })

    test('should navigate to edit DHCP page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.DHCP, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('DHCPForm')).toBeVisible()
    })

    test('should navigate to DHCP details page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.DHCP, oper: ServiceOperation.DETAIL, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('DHCPDetail')).toBeVisible()
    })

    test('should navigate to create Portal page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('PortalForm')).toBeVisible()
    })

    test('should navigate to edit Portal page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.PORTAL, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('PortalForm')).toBeVisible()
    })

    test('should navigate to Portal details page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.PORTAL, oper: ServiceOperation.DETAIL, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('PortalServiceDetail')).toBeVisible()
    })

    test('should navigate to create Edge firewall page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceRoutePath({ type: ServiceType.EDGE_FIREWALL, oper: ServiceOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AddEdgeFirewall')).toBeVisible()
    })

    test('should navigate to edit Edge firewall page', async () => {
      const path = getServiceDetailsLink({ type: ServiceType.EDGE_FIREWALL, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('EditEdgeFirewall')).toBeVisible()
    })

    test('should not navigate to create Edge DHCP page', async () => {
      jest.mocked(mockUseIsEdgeFeatureReady).mockImplementation(ff => ff !== Features.EDGE_HA_TOGGLE)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceRoutePath({ type: ServiceType.EDGE_DHCP, oper: ServiceOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.queryByTestId('AddEdgeDhcp')).toBeNull()
    })

    test('should not navigate to create Edge firewall page', async () => {
      jest.mocked(mockUseIsEdgeFeatureReady).mockImplementation(ff => ff !== Features.EDGE_FIREWALL_HA_TOGGLE)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getServiceRoutePath({ type: ServiceType.EDGE_FIREWALL, oper: ServiceOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.queryByTestId('AddEdgeFirewall')).toBeNull()
    })

    describe('RcRoutes: Services > Edge SD-LAN service', () => {
      const addFormPath = getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.CREATE })
      const editFormPath = getServiceDetailsLink({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
      const listPagePath = getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.LIST })
      const detailPagePath = getServiceDetailsLink({ type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.DETAIL, serviceId: 'SERVICE_ID' })

      const getRouteData = (tailPath: string) => ({
        route: {
          path: '/tenantId/t/' + tailPath,
          wrapRoutes: false
        }
      })

      test('should navigate to create Edge SD-LAN page', async () => {
        render(<Provider><RcRoutes /></Provider>, getRouteData(addFormPath))
        expect(screen.getByTestId('AddEdgeSdLan')).toBeVisible()
      })

      test('should navigate to edit Edge SD-LAN page', async () => {
        render(<Provider><RcRoutes /></Provider>, getRouteData(editFormPath))
        expect(screen.getByTestId('EditEdgeSdLan')).toBeVisible()
      })
      test('should navigate to Edge SD-LAN list page', async () => {
        render(<Provider><RcRoutes /></Provider>, getRouteData(listPagePath))
        expect(screen.getByTestId('EdgeSdLanTable')).toBeVisible()
      })
      test('should navigate to Edge SD-LAN detail page', async () => {
        render(<Provider><RcRoutes /></Provider>, getRouteData(detailPagePath))
        expect(screen.getByTestId('EdgeSdLanDetail')).toBeVisible()
      })

    })

    describe('RcRoutes: Services > Edge PIN service', () => {
      const addFormPath = getServiceRoutePath({ type: ServiceType.PIN, oper: ServiceOperation.CREATE })
      const editFormPath = getServiceDetailsLink({ type: ServiceType.PIN, oper: ServiceOperation.EDIT, serviceId: 'SERVICE_ID' })
      const listPagePath = getServiceRoutePath({ type: ServiceType.PIN, oper: ServiceOperation.LIST })
      const detailPagePath = getServiceDetailsLink({ type: ServiceType.PIN, oper: ServiceOperation.DETAIL, serviceId: 'SERVICE_ID' })

      beforeEach(() => {
        jest.mocked(mockUseIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_PIN_HA_TOGGLE
          || ff === Features.EDGES_TOGGLE)
      })
      afterEach(() => {
        jest.mocked(mockUseIsEdgeFeatureReady).mockReset()
      })

      const getRouteData = (tailPath: string) => ({
        route: {
          path: '/tenantId/t/' + tailPath,
          wrapRoutes: false
        }
      })

      test('should navigate to create Edge PIN page', async () => {
        render(<Provider><RcRoutes /></Provider>, getRouteData(addFormPath))
        expect(screen.getByTestId('AddPersonalIdentityNetwork')).toBeVisible()
      })

      test('should navigate to edit Edge PIN page', async () => {
        render(<Provider><RcRoutes /></Provider>, getRouteData(editFormPath))
        expect(screen.getByTestId('EditPersonalIdentityNetwork')).toBeVisible()
      })
      test('should navigate to Edge PIN list page', async () => {
        render(<Provider><RcRoutes /></Provider>, getRouteData(listPagePath))
        expect(screen.getByTestId('PersonalIdentityNetworkTable')).toBeVisible()
      })
      test('should navigate to Edge PIN detail page', async () => {
        render(<Provider><RcRoutes /></Provider>, getRouteData(detailPagePath))
        expect(screen.getByTestId('PersonalIdentityNetworkDetail')).toBeVisible()
      })

      describe('Enhance Edge PIN service', () => {
        beforeEach(() => {
          jest.mocked(mockUseIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_PIN_HA_TOGGLE
            || ff === Features.EDGE_PIN_ENHANCE_TOGGLE
            || ff === Features.EDGES_TOGGLE)
        })

        test('should navigate to Edge enhanced PIN detail page', async () => {
          render(<Provider><RcRoutes /></Provider>, getRouteData(detailPagePath))
          expect(screen.getByTestId('PersonalIdentityNetworkDetailEnhanced')).toBeVisible()
          expect(screen.queryByTestId('PersonalIdentityNetworkDetail')).toBeNull()
        })
      })
    })
  })

  describe('RcRoutes: Policies', () => {
    test('should navigate to My Policies', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyListRoutePath(),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('MyPolicies')).toBeVisible()
    })

    test('should navigate to create ROGUE_AP_DETECTION page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('RogueAPDetectionForm')).toBeVisible()
    })

    test('should navigate to edit ROGUE_AP_DETECTION page', async () => {
      let path = getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.EDIT })
      path = path.replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('RogueAPDetectionForm')).toBeVisible()
    })

    test.skip('should navigate to detail SYSLOG page', async () => {
      const path = getPolicyDetailsLink({ type: PolicyType.SYSLOG, oper: PolicyOperation.DETAIL, policyId: 'POLICY_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
    // FIXME: Please mock it with jest and use "screen.getByTestId"
    // expect(screen.getByText(/configure/i)).toBeVisible()
    })

    test('should navigate to create RADIUS ATTRIBUTE GROUP page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('RadiusAttributeGroupForm')).toBeVisible()
    })

    test('should navigate to edit RADIUS ATTRIBUTE GROUP page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      let path = getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.EDIT })
      path = path.replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('RadiusAttributeGroupForm')).toBeVisible()
    })

    test('should navigate to detail RADIUS ATTRIBUTE GROUP page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      let path = getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.DETAIL })
      path = path.replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('RadiusAttributeGroupDetail')).toBeVisible()
    })

    test.skip('should navigate to RADIUS ATTRIBUTE GROUP table', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST }),
          wrapRoutes: false
        }
      })

    // FIXME: Please mock it with jest and use "screen.getByTestId"
    // expect(await screen.findByRole('heading', { level: 1, name: 'RADIUS Attribute Groups' })).toBeVisible()
    })

    test('should navigate to create MAC_REGISTRATION_LIST page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('MacRegistrationListForm')).toBeVisible()
    })

    test('should navigate to edit MAC_REGISTRATION_LIST page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      let path = getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.EDIT })
      path = path.replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })

      expect(screen.getByTestId('MacRegistrationListForm')).toBeVisible()
    })

    test('should navigate to create ACCESS_CONTROL page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE }),
          wrapRoutes: false
        }
      })

      expect(screen.getByTestId('AccessControlForm')).toBeVisible()
    })

    test('should navigate to Client Isolation details page', async () => {
      const path = getPolicyDetailsLink({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.DETAIL, policyId: 'POLICY_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('ClientIsolationDetail')).toBeVisible()
    })

    test('should navigate to edit ACCESS_CONTROL page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      const path = getPolicyDetailsLink({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.EDIT, policyId: 'POLICY_ID' })
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AccessControlForm')).toBeVisible()
    })
    test('should navigate to create AAA Policy page', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AAAPolicyForm')).toBeVisible()
    })

    test('should navigate to edit AAA Policy page', async () => {
      let path = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.EDIT })
      path = path.replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AAAPolicyForm')).toBeVisible()
    })
    test('should navigate to AAA Policy details page', async () => {
      let path = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.DETAIL })
      path = path.replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AAAPolicyDetail')).toBeVisible()
    })

    test.skip('should navigate to AAA table', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST }),
          wrapRoutes: false
        }
      })
    // FIXME: Please mock it with jest and use "screen.getByTestId"
    // expect(await screen.findByRole('heading', { level: 1, name: /RADIUS Server/ })).toBeVisible()
    })

    test.skip('should navigate to Access Control table', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST }),
          wrapRoutes: false
        }
      })
    // FIXME: Please mock it with jest and use "screen.getByTestId"
    // expect(await screen.findByRole('heading', { level: 1, name: 'Access Control' })).toBeVisible()
    })

    test.skip('should navigate to Client Isolation table', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST }),
          wrapRoutes: false
        }
      })
    // FIXME: Please mock it with jest and use "screen.getByTestId"
    // expect(await screen.findByRole('heading', { level: 1, name: 'Client Isolation' })).toBeVisible()
    })

    test('should navigate to Rogue AP Detection table', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('RogueAPDetectionTable')).toBeVisible()
    })

    test.skip('should navigate to Syslog Server table', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST }),
          wrapRoutes: false
        }
      })
    // FIXME: Please mock it with jest and use "screen.getByTestId"
    // expect(await screen.findByRole('heading', { level: 1, name: 'Syslog Server' })).toBeVisible()
    })

    test.skip('should navigate to VLAN Pools table', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST }),
          wrapRoutes: false
        }
      })
    // FIXME: Please mock it with jest and use "screen.getByTestId"
    // expect(await screen.findByRole('heading', { level: 1, name: /VLAN Pools/ })).toBeVisible()
    })
  })

  describe('RcRoutes: User', () => {
    test('should redirect user to users/wifi/clients', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId(WirelessTabsEnum.CLIENTS)).toBeVisible()
    })
    test('should redirect users/wifi to users/wifi/clients', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/wifi',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId(WirelessTabsEnum.CLIENTS)).toBeVisible()
    })
    test('should redirect to users/wifi/clients correctly', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/wifi/clients',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId(WirelessTabsEnum.CLIENTS)).toBeVisible()
    })
    test('should redirect details to details/overview', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/wifi/clients/clientId/details/',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('UserClientDetails')).toBeVisible()
    })
    test('should redirect to details/overview correctly', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/wifi/clients/clientId/details/overview',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('UserClientDetails')).toBeVisible()
    })
    test('should redirect details/timeline to details/timeline/events', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/wifi/clients/clientId/details/timeline',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('UserClientDetails')).toBeVisible()
    })
    test('should redirect to details/timeline/events correctly', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/wifi/clients/clientId/details/timeline/events',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('UserClientDetails')).toBeVisible()
    })
    test('should redirect to Persona Portal', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)

      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/identity-management',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('PersonaPortal')).toBeVisible()
    })
    test('should redirect to Persona detail', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)

      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/identity-management/identity-group/personGroupId/identity/personaId',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('PersonaDetails')).toBeVisible()
    })
    test('should redirect to Persona Group detail', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)

      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/identity-management/identity-group/personGroupId',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('PersonaGroupDetails')).toBeVisible()
    })

    /* Wired Client */
    test('should redirect users/wired to users/wired/switch/clients', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_WIRED_CLIENT_VISIBILITY_TOOGLE)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/wired',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId(WiredTabsEnum.SWITCH_CLIENTS)).toBeVisible()
    })
    test('should redirect to users/wired/switch/clients correctly', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_WIRED_CLIENT_VISIBILITY_TOOGLE)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/wired/switch/clients',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId(WiredTabsEnum.SWITCH_CLIENTS)).toBeVisible()
    })
    test('should redirect to users/wired/wifi/clients correctly', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_WIRED_CLIENT_VISIBILITY_TOOGLE)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/users/wired/wifi/clients',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId(WiredTabsEnum.AP_CLIENTS)).toBeVisible()
    })
  })

  describe('RcRoutes: Timeline', () => {
    test('should redirect timeline to timeline/activities', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/timeline',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('Timeline')).toBeVisible()
    })

    test('should navigate to timeline/activities', async () => {
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/timeline/activities',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('Timeline')).toBeVisible()
    })

    test('should navigate to create Adaptive Policy page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AdaptivePolicyForm')).toBeVisible()
    })

    test('should navigate to edit Adaptive Policy page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      let path = getAdaptivePolicyDetailRoutePath(PolicyOperation.EDIT)
      path = path.replace(':templateId', 'templateId').replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AdaptivePolicyForm')).toBeVisible()
    })

    test('should navigate to detail Adaptive Policy page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      let path = getAdaptivePolicyDetailRoutePath(PolicyOperation.DETAIL)
      path = path.replace(':templateId', 'templateId').replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AdaptivePolicyDetail')).toBeVisible()
    })

    test.skip('should navigate to Adaptive Policy table', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST }),
          wrapRoutes: false
        }
      })
    // FIXME: Please mock it with jest and use "screen.getByTestId"
    // expect(await screen.findByRole('heading', { level: 1, name: 'Adaptive Policy' })).toBeVisible()
    })

    test('should navigate to create Adaptive Policy Set page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.CREATE }),
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AdaptivePolicySetForm')).toBeVisible()
    })

    test('should navigate to edit Adaptive Policy Set page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      let path = getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.EDIT })
      path = path.replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AdaptivePolicySetForm')).toBeVisible()
    })

    test('should navigate to detail Adaptive Policy Set page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      let path = getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.DETAIL })
      path = path.replace(':policyId', 'policyId')
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + path,
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AdaptivePolicySetDetail')).toBeVisible()
    })

    test.skip('should navigate to Adaptive Policy Set table', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST }),
          wrapRoutes: false
        }
      })
    // FIXME: Please mock it with jest and use "screen.getByTestId"
    // expect(await screen.findByRole('heading', { level: 1, name: 'Adaptive Policy Sets' })).toBeVisible()
    })
  })

  test('should navigate to Data Usage Metering table', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.LIST }),
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ConnectionMeteringTable')).toBeVisible()
  })

  test('should navigate to Data Usage Metering Detail', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    let path = getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.DETAIL })
    path = path.replace(':policyId', 'policyId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ConnectionMeteringDetail')).toBeVisible()
  })

  test('should navigate to Data Usage Metering Page create form', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.CREATE }),
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ConnectionMeteringPageForm')).toBeVisible()
  })

  test('should navigate to Data Usage Metering Page edit form', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    let path = getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.EDIT })
    path = path.replace(':policyId', 'policyId')
    render(<Provider><RcRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/' + path,
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ConnectionMeteringPageForm')).toBeVisible()
  })

  describe('RcRoutes: Port Profile', () => {
    test('should redirect to port profile create page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)

      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/policies/portProfile/create',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('CreatePortProfile')).toBeVisible()
    })
    test('should redirect to port profile page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)

      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/policies/portProfile/switch/profiles',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('PortProfile')).toBeVisible()
    })
    test('should redirect to add port profile page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)

      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/policies/portProfile/switch/profiles/add',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AddEditPortProfile')).toBeVisible()
    })
    test('should redirect to edit port profile page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)

      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/policies/portProfile/switch/profiles/portProfileId/edit',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('AddEditPortProfile')).toBeVisible()
    })
    test('should redirect to port profile detail page', async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)

      render(<Provider><RcRoutes /></Provider>, {
        route: {
          path: '/tenantId/t/policies/portProfile/switch/profiles/portProfileId/detail',
          wrapRoutes: false
        }
      })
      expect(screen.getByTestId('PortProfileDetail')).toBeVisible()
    })
  })

  describe('RcRoutes: Access Control', () => {
    describe('when Switch MAC ACL is disabled', () => {
      beforeEach(() => {
        jest.mocked(useIsTierAllowed).mockReturnValue(true)
        jest.mocked(useIsSplitOn).mockReturnValue(false) // Disable Switch MAC ACL feature
      })

      test('should navigate to ACCESS_CONTROL create form when feature flag is off', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE }),
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('AccessControlForm')).toBeVisible()
      })

      test('should navigate to ACCESS_CONTROL edit form when feature flag is off', async () => {
        let path = getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.EDIT })
        path = path.replace(':policyId', 'policyId')
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/' + path,
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('AccessControlForm')).toBeVisible()
      })

      test('should navigate to ACCESS_CONTROL detail page when feature flag is off', async () => {
        let path = getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.DETAIL })
        path = path.replace(':policyId', 'policyId')
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/' + path,
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('AccessControlDetail')).toBeVisible()
      })

      test('should navigate to ACCESS_CONTROL table when feature flag is off', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST }),
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('AccessControlTable')).toBeVisible()
      })
    })

    describe('when Switch MAC ACL is enabled', () => {
      beforeEach(() => {
        jest.mocked(useIsTierAllowed).mockReturnValue(true)
        jest.mocked(useIsSplitOn).mockReturnValue(true) // Enable Switch MAC ACL feature
      })

      test('should navigate to ACCESS_CONTROL create selection page', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/policies/accessControls/create',
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('CreateAccessControl')).toBeVisible()
      })

      test('should navigate to ACCESS_CONTROL main page with tabs', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/policies/accessControl/wifi',
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('AccessControl')).toBeVisible()
      })

      test('should navigate to ACCESS_CONTROL wifi create form', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/policies/accessControl/create',
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('AccessControlForm')).toBeVisible()
      })

      test('should navigate to ACCESS_CONTROL switch add form', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/policies/accessControl/switch/add',
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('SwitchAccessControlSetForm')).toBeVisible()
      })

      test('should navigate to ACCESS_CONTROL switch edit form', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/policies/accessControl/switch/accessControlId/edit',
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('SwitchAccessControlSetForm')).toBeVisible()
      })

      test('should navigate to ACCESS_CONTROL switch detail page', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/policies/accessControl/switch/accessControlId/overview',
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('SwitchAccessControlSetDetail')).toBeVisible()
      })

      test('should navigate to Layer2 ACL add form', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/policies/accessControl/switch/layer2/add',
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('SwitchLayer2ACLForm')).toBeVisible()
      })

      test('should navigate to Layer2 ACL edit form', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/policies/accessControl/switch/layer2/accessControlId123/edit',
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('SwitchLayer2ACLForm')).toBeVisible()
      })

      test('should navigate to Layer2 ACL detail page', async () => {
        render(<Provider><RcRoutes /></Provider>, {
          route: {
            path: '/tenantId/t/policies/accessControl/switch/layer2/accessControlId123/overview',
            wrapRoutes: false
          }
        })
        expect(screen.getByTestId('SwitchLayer2Detail')).toBeVisible()
      })
    })
  })
})
