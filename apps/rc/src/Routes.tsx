import { ServiceType }                       from '@acx-ui/rc/utils'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import SwitchesTable     from './pages/Devices/Switch/SwitchesTable'
import ApsTable          from './pages/Devices/Wifi/ApsTable'
import NetworkDetails    from './pages/Networks/NetworkDetails/NetworkDetails'
import NetworkForm       from './pages/Networks/NetworkForm/NetworkForm'
import NetworksTable     from './pages/Networks/NetworksTable'
import DHCPForm          from './pages/Services/DHCPForm/DHCPForm'
import MdnsProxyForm     from './pages/Services/MdnsProxy/MdnsProxyForm/MdnsProxyForm'
import SelectServiceForm from './pages/Services/SelectServiceForm'
import {
  getSelectServiceRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation
} from './pages/Services/serviceRouteUtils'
import ServicesTable            from './pages/Services/ServicesTable'
import WifiCallingDetailView    from './pages/Services/WifiCalling/WifiCallingDetail/WifiCallingDetailView'
import WifiCallingConfigureForm from './pages/Services/WifiCalling/WifiCallingForm/WifiCallingConfigureForm'
import WifiCallingForm          from './pages/Services/WifiCalling/WifiCallingForm/WifiCallingForm'

export default function RcRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='devices/*' element={<DeviceRoutes />} />
      <Route path='networks/*' element={<NetworkRoutes />} />
      <Route path='services/*' element={<ServiceRoutes />} />
    </Route>
  )
  return (
    <Provider children={routes} />
  )
}

function DeviceRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='devices' element={<TenantNavigate replace to='/devices/aps' />} />
      <Route path='devices/aps' element={<ApsTable />} />
      <Route path='devices/switches' element={<SwitchesTable />} />
    </Route>
  )
}

function NetworkRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='networks' element={<NetworksTable />} />
      <Route path='networks/add' element={<NetworkForm />} />
      <Route
        path='networks/:networkId/network-details/:activeTab'
        element={<NetworkDetails />}
      />
      <Route
        path='networks/:networkId/:action'
        element={<NetworkForm />}
      />
    </Route>
  )
}

function ServiceRoutes () {
  return rootRoutes(
    <Route path='t/:tenantId'>
      <Route path={getServiceListRoutePath()} element={<ServicesTable />} />
      <Route path={getSelectServiceRoutePath()} element={<SelectServiceForm />} />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })}
        element={<MdnsProxyForm />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT })}
        element={<MdnsProxyForm editMode={true} />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL })}
        element={<h1>mDNS Proxy details page</h1>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE })}
        element={<WifiCallingForm />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT })}
        element={<WifiCallingConfigureForm />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL })}
        element={<WifiCallingDetailView />}
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
