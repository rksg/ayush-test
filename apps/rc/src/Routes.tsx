import { ConfigProvider }    from '@acx-ui/components'
import { ServiceType }       from '@acx-ui/rc/utils'
import { rootRoutes, Route } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'

import { NetworkDetails }                        from './pages/NetworkDetails/NetworkDetails'
import { NetworkForm }                           from './pages/NetworkForm/NetworkForm'
import { NetworksTable }                         from './pages/NetworksTable'
import { DHCPForm }                              from './pages/services/DHCPForm/DHCPForm'
import { SelectServiceForm }                     from './pages/Services/SelectServiceForm'
import { getServiceRoutePath, ServiceOperation } from './pages/Services/serviceRouteUtils'
import { ServicesTable }                         from './pages/Services/ServicesTable'

export default function RcRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='networks' element={<NetworksTable />} />
      <Route path='networks/create' element={<NetworkForm />} />
      <Route
        path='networks/:networkId/network-details/:activeTab'
        element={<NetworkDetails />}
      />
      <Route
        path='networks/:networkId/:action'
        element={<NetworkForm />}
      />
      <Route path='services/*' element={<ServiceRoutes />} />
    </Route>
  )
  return (
    <ConfigProvider>
      <Provider children={routes} />
    </ConfigProvider>
  )
}


function ServiceRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='services' element={<ServicesTable />} />
      <Route path='services/select' element={<SelectServiceForm />} />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })}
        element={<h1>mDNS Proxy create page</h1>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT })}
        element={<h1>mDNS Proxy edit page</h1>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL })}
        element={<h1>mDNS Proxy details page</h1>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE })}
        element={<h1>WIFI_CALLING create page</h1>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT })}
        element={<h1>WIFI_CALLING edit page</h1>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL })}
        element={<h1>WIFI_CALLING details page</h1>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })}
        element={<DHCPForm/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.EDIT })}
        element={<DHCPForm/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.DETAIL })}
        element={<h1>DHCP details page</h1>}
      />
    </Route>
  )
}
